export interface FallbackDeck {
  id: string;
  topic: string; // e.g., "Technology", "Business", "Education"
  title: string;
  slides: FallbackSlide[];
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
}

export interface FallbackSlide {
  slideNumber: number;
  title: string;
  content: string;
  imageUrl: string; // Pre-stored in Supabase Storage
  audioUrl: string; // Pre-stored in Supabase Storage
}
