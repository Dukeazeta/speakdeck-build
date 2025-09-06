import { NanoBananaResponse } from '@speakdeck/shared';
import { retryWithBackoff } from '@speakdeck/shared';
import { GoogleGenAI } from '@google/genai';

export class NanoBananaService {
  private apiKey: string;
  private ai: GoogleGenAI;
  private modelName = 'gemini-2.5-flash-image-preview';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NANO_BANANA_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('Nano Banana (Google AI) API key is required');
    }
    
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  async generateImage(prompt: string, slideNumber: number): Promise<NanoBananaResponse> {
    const enhancedPrompt = this.enhancePrompt(prompt, slideNumber);
    
    return retryWithBackoff(async () => {
      try {
        console.log(`Generating image with Gemini ${this.modelName} for slide ${slideNumber}:`, enhancedPrompt);
        
        // Use the correct Google GenAI SDK approach
        const response = await this.ai.models.generateContent({
          model: this.modelName,
          contents: enhancedPrompt,
        });

        console.log('Gemini API response:', response);

        // Check if we have candidates with image data
        const candidates = response.candidates || [];
        
        for (const candidate of candidates) {
          const parts = candidate.content?.parts || [];
          
          for (const part of parts) {
            // Check for text response first (in case of error messages)
            if (part.text) {
              console.log('Gemini response text:', part.text);
            }
            
            // Look for inline image data
            if (part.inlineData?.data) {
              const mimeType = part.inlineData.mimeType || 'image/png';
              const dataUrl = `data:${mimeType};base64,${part.inlineData.data}`;
              
              console.log(`Successfully generated image for slide ${slideNumber} (${mimeType})`);
              console.log('Image data length:', part.inlineData.data.length);
              
              return {
                imageUrl: dataUrl,
                callsUsed: 1,
              };
            }
          }
        }

        // If we reach here, no image was generated
        console.warn('No image data returned from Gemini API');
        console.warn('Full response:', JSON.stringify(response, null, 2));
        
        return {
          imageUrl: await this.generatePlaceholderImage(prompt, slideNumber),
          callsUsed: 0,
        };

      } catch (error) {
        console.error(`Failed to generate image for slide ${slideNumber}:`, error);
        
        // Fallback to placeholder image
        return {
          imageUrl: await this.generatePlaceholderImage(prompt, slideNumber),
          callsUsed: 0,
        };
      }
    });
  }

  private enhancePrompt(originalPrompt: string, slideNumber: number): string {
    // Create a more detailed prompt for better image generation
    const styleModifiers = [
      'high-quality digital art',
      'professional presentation style', 
      'clean modern design',
      'well-composed',
      '4K resolution',
      'bright and clear',
      'business-appropriate',
      'vector illustration style',
      'minimalist design'
    ];

    const contextModifier = slideNumber === 1 
      ? 'title slide, introductory visual, eye-catching header image'
      : `content slide ${slideNumber}, supporting visual element`;

    // Build a comprehensive prompt
    const fullPrompt = `Create a ${contextModifier}: ${originalPrompt}. 
Style: ${styleModifiers.join(', ')}. 
Requirements: The image should be suitable for a professional presentation slide, 
with clear visual hierarchy, appropriate typography space, and engaging visual elements.
Avoid cluttered designs and ensure high contrast for readability.`;

    return fullPrompt;
  }

  private async generatePlaceholderImage(prompt: string, slideNumber: number): Promise<string> {
    console.log(`Generating placeholder image for slide ${slideNumber}`);
    
    const seed = this.hashString(prompt);
    const colors = [
      '4F46E5', // Indigo
      '059669', // Emerald  
      'DC2626', // Red
      'D97706', // Amber
      '7C3AED', // Violet
      '0EA5E9', // Sky Blue
      'EF4444', // Rose
      '10B981', // Emerald
    ];
    
    const color = colors[seed % colors.length];
    const width = 1200; // Higher resolution
    const height = 800;
    
    // Using a placeholder service that generates images with text
    const placeholderText = encodeURIComponent(`Slide ${slideNumber}`);
    return `https://via.placeholder.com/${width}x${height}/${color}/FFFFFF?text=${placeholderText}`;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  async uploadImageToStorage(imageUrl: string, fileName: string): Promise<string> {
    // This would typically download the image and upload to Supabase Storage
    // For now, we'll return the direct URL
    return imageUrl;
  }

  async checkQuota(): Promise<{ remaining: number; total: number }> {
    // For MVP, implement simple quota tracking
    const dailyQuota = parseInt(process.env.NANO_BANANA_DAILY_QUOTA || '100');
    return { remaining: dailyQuota, total: dailyQuota };
  }

  // Batch generation for multiple slides
  async generateMultipleImages(prompts: string[]): Promise<NanoBananaResponse[]> {
    const results = await Promise.allSettled(
      prompts.map((prompt, index) => this.generateImage(prompt, index + 1))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Failed to generate image for slide ${index + 1}:`, result.reason);
        return {
          imageUrl: `https://via.placeholder.com/1200x800/4F46E5/FFFFFF?text=Slide+${index + 1}`,
          callsUsed: 0, // No API call was successful
        };
      }
    });
  }
}
