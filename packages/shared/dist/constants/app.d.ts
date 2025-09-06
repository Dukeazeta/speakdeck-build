export declare const APP_CONFIG: {
    readonly PRESENTATION: {
        readonly MIN_SLIDES: 3;
        readonly MAX_SLIDES: 5;
        readonly MAX_TITLE_LENGTH: 100;
        readonly MAX_CONTENT_LENGTH: 500;
    };
    readonly GENERATION: {
        readonly TIMEOUT_MS: 60000;
        readonly PROGRESS_UPDATE_INTERVAL_MS: 1000;
    };
    readonly API: {
        readonly RATE_LIMIT_PER_MINUTE: 10;
        readonly MAX_RETRIES: 3;
        readonly RETRY_DELAY_MS: 1000;
    };
    readonly STORAGE: {
        readonly MAX_IMAGE_SIZE_MB: 10;
        readonly MAX_AUDIO_SIZE_MB: 50;
        readonly ALLOWED_IMAGE_TYPES: readonly ["image/jpeg", "image/png", "image/webp"];
        readonly ALLOWED_AUDIO_TYPES: readonly ["audio/mpeg", "audio/wav", "audio/m4a"];
    };
};
export declare const FALLBACK_TOPICS: readonly ["Technology", "Business", "Education", "Science", "Health", "Environment", "Arts", "History"];
export declare const AI_SERVICES: {
    readonly GEMINI: "gemini";
    readonly NANO_BANANA: "nano_banana";
    readonly ELEVEN_LABS: "eleven_labs";
};
export declare const PRESENTATION_STATUS: {
    readonly PENDING: "pending";
    readonly PROCESSING: "processing";
    readonly GENERATING_TEXT: "generating_text";
    readonly GENERATING_VISUALS: "generating_visuals";
    readonly GENERATING_AUDIO: "generating_audio";
    readonly COMPLETED: "completed";
    readonly FAILED: "failed";
};
