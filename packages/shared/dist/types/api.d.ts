export interface ApiError {
    error: {
        code: string;
        message: string;
        details?: Record<string, any>;
        timestamp: string;
        requestId: string;
    };
}
export interface ApiSuccessResponse<T> {
    data: T;
    success: true;
}
export interface ApiErrorResponse {
    data: null;
    success: false;
    error: ApiError['error'];
}
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
export interface GeminiResponse {
    slides: Array<{
        title: string;
        content: string;
        imagePrompt: string;
    }>;
    tokensUsed: number;
}
export interface NanoBananaResponse {
    imageUrl: string;
    callsUsed: number;
}
export interface ElevenLabsResponse {
    audioUrl: string;
    charactersUsed: number;
}
export interface ApiQuotaStatus {
    service: 'gemini' | 'nano_banana' | 'eleven_labs';
    remaining: number;
    total: number;
    resetDate?: Date;
}
