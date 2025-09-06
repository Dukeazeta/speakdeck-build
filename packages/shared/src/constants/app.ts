export const APP_CONFIG = {
  PRESENTATION: {
    MIN_SLIDES: 3,
    MAX_SLIDES: 5,
    MAX_TITLE_LENGTH: 100,
    MAX_CONTENT_LENGTH: 500,
  },
  GENERATION: {
    TIMEOUT_MS: 60000, // 60 seconds
    PROGRESS_UPDATE_INTERVAL_MS: 1000,
  },
  API: {
    RATE_LIMIT_PER_MINUTE: 10,
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000,
  },
  STORAGE: {
    MAX_IMAGE_SIZE_MB: 10,
    MAX_AUDIO_SIZE_MB: 50,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/m4a'],
  },
} as const;

export const FALLBACK_TOPICS = [
  'Technology',
  'Business',
  'Education',
  'Science',
  'Health',
  'Environment',
  'Arts',
  'History',
] as const;

export const AI_SERVICES = {
  GEMINI: 'gemini',
  NANO_BANANA: 'nano_banana',
  ELEVEN_LABS: 'eleven_labs',
} as const;

export const PRESENTATION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  GENERATING_TEXT: 'generating_text',
  GENERATING_VISUALS: 'generating_visuals',
  GENERATING_AUDIO: 'generating_audio',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;
