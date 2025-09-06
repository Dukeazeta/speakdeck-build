import { ApiError, ApiResponse, ApiErrorResponse, ApiSuccessResponse } from '../types/api';
import { APP_CONFIG } from '../constants/app';

export const createSuccessResponse = <T>(data: T): ApiSuccessResponse<T> => ({
  data,
  success: true,
});

export const createErrorResponse = (
  code: string,
  message: string,
  details?: Record<string, any>
): ApiErrorResponse => ({
  data: null,
  success: false,
  error: {
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId(),
  },
});

export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2)}`;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = APP_CONFIG.API.MAX_RETRIES,
  baseDelay: number = APP_CONFIG.API.RETRY_DELAY_MS
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await sleep(delay);
    }
  }
  
  throw lastError;
};

export const isApiError = (error: any): error is ApiError => {
  return error && typeof error.error === 'object' && 'code' in error.error;
};

export const formatApiError = (error: unknown): string => {
  if (isApiError(error)) {
    return error.error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};
