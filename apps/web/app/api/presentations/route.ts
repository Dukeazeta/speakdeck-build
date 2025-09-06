import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, validatePresentationTitle } from '@speakdeck/shared';
import { DatabaseService } from '../../../src/services/database';
import { FallbackManager } from '../../../src/services/fallback-manager';
import { GeminiService } from '../../../src/services/ai-services/gemini';
import { NanoBananaService } from '../../../src/services/ai-services/nano-banana';
import { ElevenLabsService } from '../../../src/services/ai-services/eleven-labs';
import { supabase } from '../../../src/lib/supabase';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('POST /api/presentations called');
    
    // Validate request body
    const body = await request.json();
    console.log('Request body:', body);
    
    const { title, userId } = body;

    const validation = validatePresentationTitle(title);
    if (!validation.isValid) {
      console.log('Validation failed:', validation.error);
      return NextResponse.json(
        createErrorResponse('INVALID_INPUT', validation.error!),
        { status: 400 }
      );
    }

    console.log('Creating database service...');
    const db = new DatabaseService();
    console.log('Creating fallback manager...');
    const fallbackManager = new FallbackManager();

    // Check if we should use fallback
    console.log('Checking fallback availability...');
    const fallbackCheck = await fallbackManager.shouldUseFallback(title);
    console.log('Fallback check result:', fallbackCheck);
    
    if (fallbackCheck.useFallback) {
      console.log(`Using fallback for "${title}": ${fallbackCheck.reason}`);
      
      const fallbackPresentation = await fallbackManager.getFallbackPresentation(title);
      console.log('Got fallback presentation:', fallbackPresentation?.id || 'null');
      
      return NextResponse.json(
        createSuccessResponse({
          ...fallbackPresentation,
          isFallback: true,
          fallbackReason: fallbackCheck.reason,
        }),
        { status: 201 }
      );
    }

    // Create presentation record
    console.log('Creating presentation in database...');
    const presentationId = await db.createPresentation(title, userId);
    console.log('Created presentation with ID:', presentationId);

    // Start the AI generation pipeline in the background
    console.log('Starting async generation pipeline...');
    generatePresentationAsync(presentationId, title, db)
      .catch(error => {
        console.error(`Failed to generate presentation ${presentationId}:`, error);
        db.updatePresentationStatus(presentationId, 'failed', error.message)
          .catch(dbError => console.error('Failed to update status:', dbError));
      });

    // Return initial response immediately
    console.log('Fetching initial presentation data...');
    const initialPresentation = await db.getPresentation(presentationId);
    console.log('Got initial presentation:', initialPresentation);
    
    return NextResponse.json(
      createSuccessResponse(initialPresentation),
      { status: 201 }
    );

  } catch (error) {
    console.error('Presentation creation error:', error);
    
    return NextResponse.json(
      createErrorResponse(
        'INTERNAL_ERROR',
        'Failed to create presentation',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      ),
      { status: 500 }
    );
  }
}

// Background AI generation pipeline
async function generatePresentationAsync(
  presentationId: string,
  title: string,
  db: DatabaseService
): Promise<void> {
  const startTime = Date.now();
  let geminiService: GeminiService | null = null;
  let nanoBananaService: NanoBananaService | null = null;
  let elevenLabsService: ElevenLabsService | null = null;

  try {
    // Initialize services
    try {
      geminiService = new GeminiService();
      nanoBananaService = new NanoBananaService();
      elevenLabsService = new ElevenLabsService();
    } catch (error) {
      throw new Error(`Failed to initialize AI services: ${error}`);
    }

    // Update status to processing
    await db.updatePresentationStatus(presentationId, 'processing');
    await broadcastProgress(presentationId, 'processing', 10, 'Initializing AI services...');

    // Step 1: Generate text content with Gemini
    await db.updatePresentationStatus(presentationId, 'generating_text');
    await broadcastProgress(presentationId, 'generating_text', 20, 'Generating slide content...');

    const geminiResponse = await geminiService.generatePresentationContent(title, 4);
    
    // Create slide records
    const slideIds: string[] = [];
    for (let i = 0; i < geminiResponse.slides.length; i++) {
      const slide = geminiResponse.slides[i];
      const slideId = await db.createSlide({
        presentationId,
        slideNumber: i + 1,
        title: slide.title,
        content: slide.content,
        imagePrompt: slide.imagePrompt,
      });
      slideIds.push(slideId);
    }

    await broadcastProgress(presentationId, 'generating_text', 40, `Created ${slideIds.length} slides`);

    // Step 2: Generate images with Nano Banana
    await db.updatePresentationStatus(presentationId, 'generating_visuals');
    await broadcastProgress(presentationId, 'generating_visuals', 50, 'Generating slide visuals...');

    const imagePromises = geminiResponse.slides.map(async (slide, index) => {
      const slideId = slideIds[index];
      
      try {
        await db.updateSlideStatus(slideId, 'image', 'processing');
        
        const imageResponse = await nanoBananaService!.generateImage(slide.imagePrompt, index + 1);
        
        await db.updateSlideMedia(slideId, imageResponse.imageUrl);
        await db.updateSlideStatus(slideId, 'image', 'completed');
        
        return { slideId, imageUrl: imageResponse.imageUrl, callsUsed: imageResponse.callsUsed };
      } catch (error) {
        console.error(`Failed to generate image for slide ${index + 1}:`, error);
        await db.updateSlideStatus(slideId, 'image', 'failed');
        return { slideId, imageUrl: null, callsUsed: 0 };
      }
    });

    const imageResults = await Promise.allSettled(imagePromises);
    const successfulImages = imageResults
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    await broadcastProgress(presentationId, 'generating_visuals', 70, 
      `Generated ${successfulImages.filter(r => r.imageUrl).length} visuals`);

    // Step 3: Generate audio narration with ElevenLabs
    await db.updatePresentationStatus(presentationId, 'generating_audio');
    await broadcastProgress(presentationId, 'generating_audio', 80, 'Generating narration...');

    const audioPromises = geminiResponse.slides.map(async (slide, index) => {
      const slideId = slideIds[index];
      const fullText = `${slide.title}. ${slide.content}`;
      
      try {
        await db.updateSlideStatus(slideId, 'audio', 'processing');
        
        const audioResponse = await elevenLabsService!.generateNarration(fullText, index + 1);
        
        await db.updateSlideMedia(slideId, undefined, audioResponse.audioUrl);
        await db.updateSlideStatus(slideId, 'audio', 'completed');
        
        return { slideId, audioUrl: audioResponse.audioUrl, charactersUsed: audioResponse.charactersUsed };
      } catch (error) {
        console.error(`Failed to generate audio for slide ${index + 1}:`, error);
        await db.updateSlideStatus(slideId, 'audio', 'failed');
        return { slideId, audioUrl: null, charactersUsed: 0 };
      }
    });

    const audioResults = await Promise.allSettled(audioPromises);
    const successfulAudio = audioResults
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    await broadcastProgress(presentationId, 'generating_audio', 95, 
      `Generated ${successfulAudio.filter(r => r.audioUrl).length} narrations`);

    // Final step: Update metadata and mark as completed
    const generationTime = Date.now() - startTime;
    const totalCalls = successfulImages.reduce((sum, img) => sum + img.callsUsed, 0);
    const totalCharacters = successfulAudio.reduce((sum, audio) => sum + audio.charactersUsed, 0);

    await db.updatePresentationMetadata(presentationId, {
      geminiTokensUsed: geminiResponse.tokensUsed,
      nanoBananaCallsUsed: totalCalls,
      elevenLabsCharactersUsed: totalCharacters,
    }, generationTime);

    await db.updatePresentationStatus(presentationId, 'completed');
    await broadcastProgress(presentationId, 'completed', 100, 'Presentation completed!');

    console.log(`Successfully generated presentation ${presentationId} in ${generationTime}ms`);

  } catch (error) {
    console.error(`AI generation pipeline failed for ${presentationId}:`, error);
    
    const generationTime = Date.now() - startTime;
    await db.updatePresentationStatus(presentationId, 'failed', 
      error instanceof Error ? error.message : 'Unknown error occurred');
    
    await broadcastProgress(presentationId, 'failed', 100, 'Generation failed');
  }
}

// Real-time progress updates
async function broadcastProgress(
  presentationId: string,
  status: string,
  progress: number,
  currentStep: string
): Promise<void> {
  try {
    const channel = supabase.channel(`presentation-${presentationId}`);
    
    await channel.send({
      type: 'broadcast',
      event: 'progress_update',
      payload: {
        presentationId,
        status,
        progress,
        currentStep,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to broadcast progress:', error);
  }
}
