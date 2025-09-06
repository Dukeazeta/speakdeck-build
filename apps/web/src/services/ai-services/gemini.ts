import { GeminiResponse } from '@speakdeck/shared';
import { retryWithBackoff } from '@speakdeck/shared';

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('Gemini API key is required');
    }
  }

  async generatePresentationContent(topic: string, slideCount: number = 4): Promise<GeminiResponse> {
    const prompt = this.createPresentationPrompt(topic, slideCount);
    
    return retryWithBackoff(async () => {
      const response = await fetch(`${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
        throw new Error('Invalid response from Gemini API');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      return this.parseGeminiResponse(generatedText);
    });
  }

  private createPresentationPrompt(topic: string, slideCount: number): string {
    return `Create a ${slideCount}-slide presentation about "${topic}". 
    
Format your response as a JSON object with this exact structure:
{
  "slides": [
    {
      "title": "Slide title here",
      "content": "Detailed slide content here (2-3 sentences max)",
      "imagePrompt": "Detailed visual description for image generation"
    }
  ]
}

Requirements:
- Make it engaging and informative
- Keep content concise but meaningful
- Create vivid, specific image prompts that would generate compelling visuals
- Ensure logical flow between slides
- First slide should be an introduction, last slide should be a conclusion
- Make the content suitable for a ${slideCount < 4 ? 'brief' : 'comprehensive'} presentation

Topic: ${topic}
Number of slides: ${slideCount}

Please respond with valid JSON only, no additional text.`;
  }

  private parseGeminiResponse(text: string): GeminiResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.slides || !Array.isArray(parsed.slides)) {
        throw new Error('Invalid slides structure');
      }

      // Validate slide structure
      const validatedSlides = parsed.slides.map((slide: any, index: number) => {
        if (!slide.title || !slide.content) {
          throw new Error(`Invalid slide at index ${index}`);
        }

        return {
          title: slide.title.trim(),
          content: slide.content.trim(),
          imagePrompt: slide.imagePrompt?.trim() || `Professional image related to: ${slide.title}`,
        };
      });

      return {
        slides: validatedSlides,
        tokensUsed: this.estimateTokens(text),
      };
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      
      // Fallback: Create basic slides from the topic
      return this.createFallbackResponse(text);
    }
  }

  private createFallbackResponse(originalText: string): GeminiResponse {
    // Extract any usable content or create basic structure
    const lines = originalText.split('\n').filter(line => line.trim());
    const slideCount = Math.min(Math.max(lines.length, 3), 5);
    
    const fallbackSlides = [];
    for (let i = 0; i < slideCount; i++) {
      fallbackSlides.push({
        title: i === 0 ? 'Introduction' : i === slideCount - 1 ? 'Conclusion' : `Key Point ${i}`,
        content: lines[i] || 'Content generated from the presentation topic.',
        imagePrompt: `Professional illustration representing slide ${i + 1} content`,
      });
    }

    return {
      slides: fallbackSlides,
      tokensUsed: this.estimateTokens(originalText),
    };
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  async checkQuota(): Promise<{ remaining: number; total: number }> {
    // For MVP, we'll implement simple quota tracking
    // In production, this would check actual API quota
    const dailyQuota = parseInt(process.env.GEMINI_DAILY_QUOTA || '100');
    // This would need to be stored in database/cache in real implementation
    return { remaining: dailyQuota, total: dailyQuota };
  }
}
