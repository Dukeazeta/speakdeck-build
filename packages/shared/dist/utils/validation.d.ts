export declare const validatePresentationTitle: (title: string) => {
    isValid: boolean;
    error?: string;
};
export declare const validateSlideContent: (content: string) => {
    isValid: boolean;
    error?: string;
};
export declare const isValidUrl: (url: string) => boolean;
export declare const isValidImageType: (mimeType: string) => boolean;
export declare const isValidAudioType: (mimeType: string) => boolean;
