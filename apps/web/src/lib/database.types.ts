export interface Database {
  public: {
    Tables: {
      presentations: {
        Row: {
          id: string;
          title: string;
          status: 'pending' | 'processing' | 'generating_text' | 'generating_visuals' | 'generating_audio' | 'completed' | 'failed';
          created_at: string;
          updated_at: string;
          user_id: string | null;
          total_slides: number;
          generation_time_ms: number | null;
          error_message: string | null;
          metadata: {
            geminiTokensUsed?: number;
            nanoBananaCallsUsed?: number;
            elevenLabsCharactersUsed?: number;
          };
        };
        Insert: {
          id?: string;
          title: string;
          status?: 'pending' | 'processing' | 'generating_text' | 'generating_visuals' | 'generating_audio' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
          total_slides: number;
          generation_time_ms?: number | null;
          error_message?: string | null;
          metadata?: {
            geminiTokensUsed?: number;
            nanoBananaCallsUsed?: number;
            elevenLabsCharactersUsed?: number;
          };
        };
        Update: {
          id?: string;
          title?: string;
          status?: 'pending' | 'processing' | 'generating_text' | 'generating_visuals' | 'generating_audio' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
          total_slides?: number;
          generation_time_ms?: number | null;
          error_message?: string | null;
          metadata?: {
            geminiTokensUsed?: number;
            nanoBananaCallsUsed?: number;
            elevenLabsCharactersUsed?: number;
          };
        };
      };
      slides: {
        Row: {
          id: string;
          presentation_id: string;
          slide_number: number;
          title: string;
          content: string;
          image_url: string | null;
          audio_url: string | null;
          generation_status: {
            text: 'pending' | 'completed' | 'failed';
            image: 'pending' | 'processing' | 'completed' | 'failed';
            audio: 'pending' | 'processing' | 'completed' | 'failed';
          };
          ai_prompts: {
            imagePrompt?: string;
            audioScript?: string;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          presentation_id: string;
          slide_number: number;
          title: string;
          content: string;
          image_url?: string | null;
          audio_url?: string | null;
          generation_status?: {
            text: 'pending' | 'completed' | 'failed';
            image: 'pending' | 'processing' | 'completed' | 'failed';
            audio: 'pending' | 'processing' | 'completed' | 'failed';
          };
          ai_prompts?: {
            imagePrompt?: string;
            audioScript?: string;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          presentation_id?: string;
          slide_number?: number;
          title?: string;
          content?: string;
          image_url?: string | null;
          audio_url?: string | null;
          generation_status?: {
            text: 'pending' | 'completed' | 'failed';
            image: 'pending' | 'processing' | 'completed' | 'failed';
            audio: 'pending' | 'processing' | 'completed' | 'failed';
          };
          ai_prompts?: {
            imagePrompt?: string;
            audioScript?: string;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
      fallback_decks: {
        Row: {
          id: string;
          topic: string;
          title: string;
          slides: Array<{
            slideNumber: number;
            title: string;
            content: string;
            imageUrl: string;
            audioUrl: string;
          }>;
          is_active: boolean;
          usage_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          topic: string;
          title: string;
          slides: Array<{
            slideNumber: number;
            title: string;
            content: string;
            imageUrl: string;
            audioUrl: string;
          }>;
          is_active?: boolean;
          usage_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          topic?: string;
          title?: string;
          slides?: Array<{
            slideNumber: number;
            title: string;
            content: string;
            imageUrl: string;
            audioUrl: string;
          }>;
          is_active?: boolean;
          usage_count?: number;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
