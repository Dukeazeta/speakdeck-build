"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidAudioType = exports.isValidImageType = exports.isValidUrl = exports.validateSlideContent = exports.validatePresentationTitle = void 0;
const app_1 = require("../constants/app");
const validatePresentationTitle = (title) => {
    if (!title || typeof title !== 'string') {
        return { isValid: false, error: 'Title is required and must be a string' };
    }
    if (title.trim().length === 0) {
        return { isValid: false, error: 'Title cannot be empty' };
    }
    if (title.length > app_1.APP_CONFIG.PRESENTATION.MAX_TITLE_LENGTH) {
        return {
            isValid: false,
            error: `Title cannot exceed ${app_1.APP_CONFIG.PRESENTATION.MAX_TITLE_LENGTH} characters`
        };
    }
    return { isValid: true };
};
exports.validatePresentationTitle = validatePresentationTitle;
const validateSlideContent = (content) => {
    if (!content || typeof content !== 'string') {
        return { isValid: false, error: 'Content is required and must be a string' };
    }
    if (content.trim().length === 0) {
        return { isValid: false, error: 'Content cannot be empty' };
    }
    if (content.length > app_1.APP_CONFIG.PRESENTATION.MAX_CONTENT_LENGTH) {
        return {
            isValid: false,
            error: `Content cannot exceed ${app_1.APP_CONFIG.PRESENTATION.MAX_CONTENT_LENGTH} characters`
        };
    }
    return { isValid: true };
};
exports.validateSlideContent = validateSlideContent;
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
};
exports.isValidUrl = isValidUrl;
const isValidImageType = (mimeType) => {
    return app_1.APP_CONFIG.STORAGE.ALLOWED_IMAGE_TYPES.includes(mimeType);
};
exports.isValidImageType = isValidImageType;
const isValidAudioType = (mimeType) => {
    return app_1.APP_CONFIG.STORAGE.ALLOWED_AUDIO_TYPES.includes(mimeType);
};
exports.isValidAudioType = isValidAudioType;
