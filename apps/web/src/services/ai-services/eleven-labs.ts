import { ElevenLabsResponse } from '@speakdeck/shared';
import { retryWithBackoff } from '@speakdeck/shared';

export class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private defaultVoiceId = 'pNInz6obpgDQGcFmaJgB'; // Default voice ID (Adam)

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required');
    }
  }

  async generateNarration(
    text: string, 
    slideNumber: number, 
    voiceId?: string
  ): Promise<ElevenLabsResponse> {
    const cleanText = this.prepareTextForSpeech(text, slideNumber);
    const selectedVoiceId = voiceId || this.defaultVoiceId;
    
    return retryWithBackoff(async () => {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${selectedVoiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.warn(`ElevenLabs API error: ${response.status} - ${error}`);
        
        // For suspended accounts or rate limits, return silent audio instead of failing
        if (response.status === 401 || response.status === 429) {
          console.log('ElevenLabs account suspended or rate limited, returning silent audio');
          return {
            audioUrl: this.generateSilentAudio(),
            charactersUsed: 0,
          };
        }
        
        throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
      }

      // Get the audio blob
      const audioBlob = await response.blob();
      
      // For MVP, we'll create a data URL
      // In production, you'd upload this to Supabase Storage
      const audioUrl = await this.blobToDataUrl(audioBlob);

      return {
        audioUrl,
        charactersUsed: cleanText.length,
      };
    });
  }

  private prepareTextForSpeech(text: string, slideNumber: number): string {
    // Clean and prepare text for better speech synthesis
    let cleanText = text.trim();
    
    // Add slide context for better flow
    if (slideNumber === 1) {
      cleanText = `Welcome to our presentation. ${cleanText}`;
    }
    
    // Replace problematic characters and formatting
    cleanText = cleanText
      .replace(/[""]/g, '"')    // Normalize quotes
      .replace(/['']/g, "'")    // Normalize apostrophes
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
      .replace(/#{1,6}\s/g, '')        // Remove headers
      .replace(/\n+/g, '. ')           // Replace line breaks with periods
      .replace(/\s+/g, ' ')            // Normalize whitespace
      .replace(/\.\./g, '.')           // Fix double periods
      .replace(/([.!?])\s*([.!?])/g, '$1 ') // Fix multiple punctuation
      .trim();

    // Ensure text ends with proper punctuation
    if (!/[.!?]$/.test(cleanText)) {
      cleanText += '.';
    }

    // Add natural pauses
    cleanText = cleanText.replace(/[.!?]/g, '$& ');

    return cleanText;
  }

  private async blobToDataUrl(blob: Blob): Promise<string> {
    try {
      // Convert blob to buffer in Node.js environment
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      return `data:audio/mpeg;base64,${base64}`;
    } catch (error) {
      console.error('Failed to convert blob to data URL:', error);
      // Return a placeholder or empty audio URL
      return this.generateSilentAudio();
    }
  }

  async generateMultipleNarrations(
    texts: string[], 
    voiceId?: string
  ): Promise<ElevenLabsResponse[]> {
    const results = await Promise.allSettled(
      texts.map((text, index) => 
        this.generateNarration(text, index + 1, voiceId)
      )
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Failed to generate narration for slide ${index + 1}:`, result.reason);
        return {
          audioUrl: this.generateSilentAudio(),
          charactersUsed: 0,
        };
      }
    });
  }

  private generateSilentAudio(): string {
    // Generate a longer silent audio data URL as fallback
    // This is a minimal WAV file with silence - longer duration prevents auto-advance
    const sampleRate = 22050;
    const duration = 30; // 30 seconds to give users time to read
    const numSamples = sampleRate * duration;
    
    const arrayBuffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    
    // Fill with silence (zeros)
    for (let i = 0; i < numSamples; i++) {
      view.setInt16(44 + i * 2, 0, true);
    }
    
    // Convert to base64 data URL for Node.js environment
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    return `data:audio/wav;base64,${base64}`;
  }

  async getAvailableVoices(): Promise<Array<{ id: string; name: string; category: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      
      return data.voices?.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category || 'general',
      })) || [];
    } catch (error) {
      console.error('Failed to fetch available voices:', error);
      
      // Return default voices as fallback
      return [
        { id: this.defaultVoiceId, name: 'Adam', category: 'premade' },
        { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', category: 'premade' },
        { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', category: 'premade' },
      ];
    }
  }

  async checkQuota(): Promise<{ remaining: number; total: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        remaining: data.subscription?.character_limit - data.subscription?.character_count || 0,
        total: data.subscription?.character_limit || 10000,
      };
    } catch (error) {
      console.error('Failed to check ElevenLabs quota:', error);
      
      // Return default quota as fallback
      const monthlyQuota = parseInt(process.env.ELEVENLABS_MONTHLY_QUOTA || '10000');
      return { remaining: monthlyQuota, total: monthlyQuota };
    }
  }

  async uploadAudioToStorage(audioBlob: Blob, fileName: string): Promise<string> {
    // This would upload the audio to Supabase Storage
    // For now, we'll return a data URL
    return this.blobToDataUrl(audioBlob);
  }
}
