import { supabase, supabaseAdmin } from '../lib/supabase';
import { Presentation, Slide, FallbackDeck } from '@speakdeck/shared';

export class DatabaseService {
  // Presentation operations
  async createPresentation(title: string, userId?: string): Promise<string> {
    console.log('DatabaseService.createPresentation called with:', { title, userId });
    const presentationId = crypto.randomUUID();
    console.log('Generated presentation ID:', presentationId);
    
    const insertData = {
      id: presentationId,
      title: title.trim(),
      user_id: userId || null,
      total_slides: 0,
      status: 'pending',
      metadata: {},
    };
    console.log('Inserting presentation data:', insertData);
    
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured - missing SUPABASE_SERVICE_ROLE_KEY');
    }
    
    const { error } = await supabaseAdmin
      .from('presentations')
      .insert(insertData);

    if (error) {
      console.error('Database insert error:', error);
      throw new Error(`Failed to create presentation: ${error.message}`);
    }

    console.log('Successfully created presentation:', presentationId);
    return presentationId;
  }

  async updatePresentationStatus(
    id: string, 
    status: Presentation['status'],
    errorMessage?: string
  ): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }
    
    const { error } = await supabaseAdmin
      .from('presentations')
      .update({ 
        status, 
        error_message: errorMessage || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update presentation status: ${error.message}`);
    }
  }

  async updatePresentationMetadata(
    id: string,
    metadata: Partial<Presentation['metadata']>,
    generationTimeMs?: number
  ): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }
    
    const { error } = await supabaseAdmin
      .from('presentations')
      .update({ 
        metadata,
        generation_time_ms: generationTimeMs,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update presentation metadata: ${error.message}`);
    }
  }

  async getPresentation(id: string): Promise<Presentation | null> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }
    
    const { data: presentationData, error: presentationError } = await supabaseAdmin
      .from('presentations')
      .select('*')
      .eq('id', id)
      .single();

    if (presentationError) {
      if (presentationError.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get presentation: ${presentationError.message}`);
    }

    const { data: slidesData, error: slidesError } = await supabaseAdmin
      .from('slides')
      .select('*')
      .eq('presentation_id', id)
      .order('slide_number');

    if (slidesError) {
      throw new Error(`Failed to get slides: ${slidesError.message}`);
    }

    return this.mapToPresentation(presentationData, slidesData || []);
  }

  // Slide operations
  async createSlide(slideData: {
    presentationId: string;
    slideNumber: number;
    title: string;
    content: string;
    imagePrompt?: string;
  }): Promise<string> {
    const slideId = crypto.randomUUID();

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    const { error } = await supabaseAdmin
      .from('slides')
      .insert({
        id: slideId,
        presentation_id: slideData.presentationId,
        slide_number: slideData.slideNumber,
        title: slideData.title,
        content: slideData.content,
        generation_status: {
          text: 'completed',
          image: 'pending',
          audio: 'pending',
        },
        ai_prompts: {
          imagePrompt: slideData.imagePrompt,
          audioScript: slideData.content,
        },
      });

    if (error) {
      throw new Error(`Failed to create slide: ${error.message}`);
    }

    // Update total slide count
    await this.updateSlideCount(slideData.presentationId);

    return slideId;
  }

  async updateSlideMedia(
    slideId: string,
    imageUrl?: string,
    audioUrl?: string
  ): Promise<void> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (imageUrl) {
      updateData.image_url = imageUrl;
    }
    if (audioUrl) {
      updateData.audio_url = audioUrl;
    }

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    const { error } = await supabaseAdmin
      .from('slides')
      .update(updateData)
      .eq('id', slideId);

    if (error) {
      throw new Error(`Failed to update slide media: ${error.message}`);
    }
  }

  async updateSlideStatus(
    slideId: string,
    statusType: 'image' | 'audio',
    status: 'pending' | 'processing' | 'completed' | 'failed'
  ): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }
    
    // Get current status
    const { data, error: fetchError } = await supabaseAdmin
      .from('slides')
      .select('generation_status')
      .eq('id', slideId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch slide status: ${fetchError.message}`);
    }

    const currentStatus = data.generation_status || {};
    currentStatus[statusType] = status;

    const { error } = await supabaseAdmin
      .from('slides')
      .update({ 
        generation_status: currentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', slideId);

    if (error) {
      throw new Error(`Failed to update slide status: ${error.message}`);
    }
  }

  // Fallback deck operations
  async getFallbackDecks(topic?: string): Promise<FallbackDeck[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }
    
    let query = supabaseAdmin
      .from('fallback_decks')
      .select('*')
      .eq('is_active', true);

    if (topic) {
      query = query.ilike('topic', `%${topic}%`);
    }

    const { data, error } = await query.order('usage_count').limit(5);

    if (error) {
      throw new Error(`Failed to get fallback decks: ${error.message}`);
    }

    return data?.map(this.mapToFallbackDeck) || [];
  }

  async incrementFallbackUsage(id: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }
    
    // First get current usage count
    const { data: currentData } = await supabaseAdmin
      .from('fallback_decks')
      .select('usage_count')
      .eq('id', id)
      .single();
      
    const currentCount = currentData?.usage_count || 0;
    
    const { error } = await supabaseAdmin
      .from('fallback_decks')
      .update({ 
        usage_count: currentCount + 1,
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to increment fallback usage: ${error.message}`);
    }
  }

  // Private helper methods
  private async updateSlideCount(presentationId: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }
    
    const { count, error } = await supabaseAdmin
      .from('slides')
      .select('*', { count: 'exact', head: true })
      .eq('presentation_id', presentationId);

    if (error) {
      throw new Error(`Failed to count slides: ${error.message}`);
    }

    const { error: updateError } = await supabaseAdmin
      .from('presentations')
      .update({ total_slides: count || 0 })
      .eq('id', presentationId);

    if (updateError) {
      throw new Error(`Failed to update slide count: ${updateError.message}`);
    }
  }

  private mapToPresentation(presentationData: any, slidesData: any[]): Presentation {
    return {
      id: presentationData.id,
      title: presentationData.title,
      status: presentationData.status,
      createdAt: new Date(presentationData.created_at),
      updatedAt: new Date(presentationData.updated_at),
      userId: presentationData.user_id,
      totalSlides: presentationData.total_slides,
      generationTimeMs: presentationData.generation_time_ms,
      errorMessage: presentationData.error_message,
      metadata: presentationData.metadata || {},
      slides: slidesData.map(this.mapToSlide),
    };
  }

  private mapToSlide(slideData: any): Slide {
    return {
      id: slideData.id,
      presentationId: slideData.presentation_id,
      slideNumber: slideData.slide_number,
      title: slideData.title,
      content: slideData.content,
      imageUrl: slideData.image_url,
      audioUrl: slideData.audio_url,
      generationStatus: slideData.generation_status || {
        text: 'pending',
        image: 'pending',
        audio: 'pending',
      },
      aiPrompts: slideData.ai_prompts || {},
      createdAt: new Date(slideData.created_at),
      updatedAt: new Date(slideData.updated_at),
    };
  }

  private mapToFallbackDeck(data: any): FallbackDeck {
    return {
      id: data.id,
      topic: data.topic,
      title: data.title,
      slides: data.slides,
      isActive: data.is_active,
      usageCount: data.usage_count,
      createdAt: new Date(data.created_at),
    };
  }
}
