import { ApiError, ApiErrorResponse, ApiSuccessResponse } from '../types/api';
export declare const createSuccessResponse: <T>(data: T) => ApiSuccessResponse<T>;
export declare const createErrorResponse: (code: string, message: string, details?: Record<string, any>) => ApiErrorResponse;
export declare const generateRequestId: () => string;
export declare const sleep: (ms: number) => Promise<void>;
export declare const retryWithBackoff: <T>(fn: () => Promise<T>, maxRetries?: number, baseDelay?: number) => Promise<T>;
export declare const isApiError: (error: any) => error is ApiError;
export declare const formatApiError: (error: unknown) => string;
