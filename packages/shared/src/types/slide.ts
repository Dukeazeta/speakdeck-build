export interface Slide {
  id: string;
  presentationId: string;
  slideNumber: number;
  title: string;
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  generationStatus: {
    text: 'pending' | 'completed' | 'failed';
    image: 'pending' | 'processing' | 'completed' | 'failed';
    audio: 'pending' | 'processing' | 'completed' | 'failed';
  };
  aiPrompts: {
    imagePrompt?: string;
    audioScript?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SlideInput {
  presentationId: string;
  slideNumber: number;
  title: string;
  content: string;
}
