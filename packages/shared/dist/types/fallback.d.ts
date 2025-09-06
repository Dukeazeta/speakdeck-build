export interface FallbackDeck {
    id: string;
    topic: string;
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
    imageUrl: string;
    audioUrl: string;
}
