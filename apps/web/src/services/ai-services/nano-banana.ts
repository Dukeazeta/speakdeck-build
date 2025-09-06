import { NanoBananaResponse } from '@speakdeck/shared';
import { retryWithBackoff } from '@speakdeck/shared';
import { GoogleGenAI } from '@google/genai';

export class NanoBananaService {
  private apiKey: string;
  private ai: GoogleGenAI;
  private modelName = 'gemini-2.5-flash-image-preview';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('Gemini API key is required - please set GEMINI_API_KEY environment variable');
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
          contents: [
            {
              parts: [{
                text: enhancedPrompt
              }]
            }
          ],
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

  async editImage(baseImageUrl: string, editPrompt: string, slideNumber: number): Promise<NanoBananaResponse> {
    return retryWithBackoff(async () => {
      try {
        console.log(`Editing image with Gemini ${this.modelName} for slide ${slideNumber}:`, editPrompt);
        
        // Convert data URL to base64 if needed
        let base64Data: string;
        let mimeType: string;
        
        if (baseImageUrl.startsWith('data:')) {
          const [header, data] = baseImageUrl.split(',');
          mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/png';
          base64Data = data;
        } else {
          // If it's a URL, you'd need to fetch and convert to base64
          // For now, throw an error as this requires additional handling
          throw new Error('URL-based images need to be converted to base64 first');
        }
        
        const response = await this.ai.models.generateContent({
          model: this.modelName,
          contents: [
            {
              parts: [
                {
                  text: editPrompt
                },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                  }
                }
              ]
            }
          ],
        });

        console.log('Gemini image edit response:', response);

        // Check if we have candidates with image data
        const candidates = response.candidates || [];
        
        for (const candidate of candidates) {
          const parts = candidate.content?.parts || [];
          
          for (const part of parts) {
            if (part.text) {
              console.log('Gemini edit response text:', part.text);
            }
            
            if (part.inlineData?.data) {
              const resultMimeType = part.inlineData.mimeType || 'image/png';
              const dataUrl = `data:${resultMimeType};base64,${part.inlineData.data}`;
              
              console.log(`Successfully edited image for slide ${slideNumber} (${resultMimeType})`);
              
              return {
                imageUrl: dataUrl,
                callsUsed: 1,
              };
            }
          }
        }

        console.warn('No edited image data returned from Gemini API');
        
        return {
          imageUrl: baseImageUrl, // Return original if edit failed
          callsUsed: 0,
        };

      } catch (error) {
        console.error(`Failed to edit image for slide ${slideNumber}:`, error);
        
        return {
          imageUrl: baseImageUrl, // Return original if edit failed
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

  // Helper function to convert image URL to base64
  async convertUrlToBase64(imageUrl: string): Promise<{ data: string; mimeType: string }> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = response.headers.get('content-type') || 'image/png';
      
      return { data: base64, mimeType };
    } catch (error) {
      console.error('Failed to convert URL to base64:', error);
      throw error;
    }
  }

  // Enhanced image editing that can handle URLs
  async editImageAdvanced(baseImageUrl: string, editPrompt: string, slideNumber: number): Promise<NanoBananaResponse> {
    return retryWithBackoff(async () => {
      try {
        let base64Data: string;
        let mimeType: string;
        
        if (baseImageUrl.startsWith('data:')) {
          // Handle data URLs
          const [header, data] = baseImageUrl.split(',');
          mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/png';
          base64Data = data;
        } else {
          // Handle regular URLs by converting to base64
          const converted = await this.convertUrlToBase64(baseImageUrl);
          base64Data = converted.data;
          mimeType = converted.mimeType;
        }
        
        const response = await this.ai.models.generateContent({
          model: this.modelName,
          contents: [
            {
              parts: [
                {
                  text: editPrompt
                },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                  }
                }
              ]
            }
          ],
        });

        // Process response same as editImage method
        const candidates = response.candidates || [];
        for (const candidate of candidates) {
          const parts = candidate.content?.parts || [];
          for (const part of parts) {
            if (part.inlineData?.data) {
              const resultMimeType = part.inlineData.mimeType || 'image/png';
              const dataUrl = `data:${resultMimeType};base64,${part.inlineData.data}`;
              return { imageUrl: dataUrl, callsUsed: 1 };
            }
          }
        }
        
        return { imageUrl: baseImageUrl, callsUsed: 0 };
      } catch (error) {
        console.error(`Failed to edit image for slide ${slideNumber}:`, error);
        return { imageUrl: baseImageUrl, callsUsed: 0 };
      }
    });
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
