import { APP_CONFIG } from '../constants/app';

export const validatePresentationTitle = (title: string): { isValid: boolean; error?: string } => {
  if (!title || typeof title !== 'string') {
    return { isValid: false, error: 'Title is required and must be a string' };
  }
  
  if (title.trim().length === 0) {
    return { isValid: false, error: 'Title cannot be empty' };
  }
  
  if (title.length > APP_CONFIG.PRESENTATION.MAX_TITLE_LENGTH) {
    return { 
      isValid: false, 
      error: `Title cannot exceed ${APP_CONFIG.PRESENTATION.MAX_TITLE_LENGTH} characters` 
    };
  }
  
  return { isValid: true };
};

export const validateSlideContent = (content: string): { isValid: boolean; error?: string } => {
  if (!content || typeof content !== 'string') {
    return { isValid: false, error: 'Content is required and must be a string' };
  }
  
  if (content.trim().length === 0) {
    return { isValid: false, error: 'Content cannot be empty' };
  }
  
  if (content.length > APP_CONFIG.PRESENTATION.MAX_CONTENT_LENGTH) {
    return { 
      isValid: false, 
      error: `Content cannot exceed ${APP_CONFIG.PRESENTATION.MAX_CONTENT_LENGTH} characters` 
    };
  }
  
  return { isValid: true };
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidImageType = (mimeType: string): boolean => {
  return APP_CONFIG.STORAGE.ALLOWED_IMAGE_TYPES.includes(mimeType as any);
};

export const isValidAudioType = (mimeType: string): boolean => {
  return APP_CONFIG.STORAGE.ALLOWED_AUDIO_TYPES.includes(mimeType as any);
};
