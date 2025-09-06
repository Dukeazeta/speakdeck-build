import { Slide } from './slide';
export interface Presentation {
    id: string;
    title: string;
    status: 'pending' | 'processing' | 'generating_text' | 'generating_visuals' | 'generating_audio' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
    userId?: string;
    slides: Slide[];
    totalSlides: number;
    generationTimeMs?: number;
    errorMessage?: string;
    metadata: {
        geminiTokensUsed?: number;
        nanoBananaCallsUsed?: number;
        elevenLabsCharactersUsed?: number;
        isFallback?: boolean;
        fallbackDeckId?: string;
        fallbackReason?: string;
    };
}
export interface PresentationInput {
    title: string;
    userId?: string;
}
export interface PresentationProgress {
    presentationId: string;
    status: Presentation['status'];
    progress: number;
    currentStep: string;
    estimatedTimeRemaining?: number;
}
