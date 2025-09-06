import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@speakdeck/shared';
import { DatabaseService } from '../../../../../src/services/database';

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;

    if (!id) {
      return NextResponse.json(
        createErrorResponse('INVALID_INPUT', 'Presentation ID is required'),
        { status: 400 }
      );
    }

    const db = new DatabaseService();
    const presentation = await db.getPresentation(id);

    if (!presentation) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'Presentation not found'),
        { status: 404 }
      );
    }

    // Calculate progress based on status
    let progress = 0;
    let currentStep = 'Unknown';

    switch (presentation.status) {
      case 'pending':
        progress = 0;
        currentStep = 'Waiting to start...';
        break;
      case 'processing':
        progress = 10;
        currentStep = 'Initializing...';
        break;
      case 'generating_text':
        progress = 30;
        currentStep = 'Generating slide content...';
        break;
      case 'generating_visuals':
        progress = 60;
        currentStep = 'Creating visuals...';
        break;
      case 'generating_audio':
        progress = 80;
        currentStep = 'Generating narration...';
        break;
      case 'completed':
        progress = 100;
        currentStep = 'Completed!';
        break;
      case 'failed':
        progress = 100;
        currentStep = presentation.errorMessage || 'Generation failed';
        break;
      default:
        progress = 0;
        currentStep = 'Unknown status';
    }

    // Calculate more detailed progress for individual slides
    if (presentation.slides.length > 0) {
      const slideProgress = presentation.slides.map(slide => {
        let slideCompletion = 0;
        
        // Text is always completed first
        if (slide.generationStatus.text === 'completed') slideCompletion += 33;
        
        // Image progress
        if (slide.generationStatus.image === 'completed') slideCompletion += 33;
        else if (slide.generationStatus.image === 'processing') slideCompletion += 16;
        
        // Audio progress
        if (slide.generationStatus.audio === 'completed') slideCompletion += 34;
        else if (slide.generationStatus.audio === 'processing') slideCompletion += 17;
        
        return slideCompletion;
      });

      if (presentation.status === 'generating_visuals' || presentation.status === 'generating_audio') {
        const avgSlideProgress = slideProgress.reduce((sum, p) => sum + p, 0) / slideProgress.length;
        
        if (presentation.status === 'generating_visuals') {
          progress = 40 + (avgSlideProgress / 100) * 30; // 40-70% range
        } else if (presentation.status === 'generating_audio') {
          progress = 70 + (avgSlideProgress / 100) * 25; // 70-95% range
        }
      }
    }

    const statusData = {
      presentationId: presentation.id,
      status: presentation.status,
      progress: Math.round(progress),
      currentStep,
      totalSlides: presentation.totalSlides,
      slidesProgress: presentation.slides.map(slide => ({
        slideNumber: slide.slideNumber,
        title: slide.title,
        textStatus: slide.generationStatus.text,
        imageStatus: slide.generationStatus.image,
        audioStatus: slide.generationStatus.audio,
      })),
      estimatedTimeRemaining: calculateEstimatedTime(presentation.status, progress),
      createdAt: presentation.createdAt,
      updatedAt: presentation.updatedAt,
    };

    return NextResponse.json(
      createSuccessResponse(statusData)
    );

  } catch (error) {
    console.error('Get status error:', error);
    
    return NextResponse.json(
      createErrorResponse(
        'INTERNAL_ERROR',
        'Failed to get presentation status',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      ),
      { status: 500 }
    );
  }
}

function calculateEstimatedTime(status: string, progress: number): number {
  if (status === 'completed' || status === 'failed') {
    return 0;
  }

  // Rough time estimates based on status and progress
  const remainingProgress = 100 - progress;
  
  switch (status) {
    case 'pending':
      return 60; // 60 seconds for full generation
    case 'processing':
      return 50;
    case 'generating_text':
      return 40;
    case 'generating_visuals':
      return 30;
    case 'generating_audio':
      return 15;
    default:
      return Math.max(5, remainingProgress / 2); // Fallback calculation
  }
}
