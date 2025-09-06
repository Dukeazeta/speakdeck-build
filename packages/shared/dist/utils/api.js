"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatApiError = exports.isApiError = exports.retryWithBackoff = exports.sleep = exports.generateRequestId = exports.createErrorResponse = exports.createSuccessResponse = void 0;
const app_1 = require("../constants/app");
const createSuccessResponse = (data) => ({
    data,
    success: true,
});
exports.createSuccessResponse = createSuccessResponse;
const createErrorResponse = (code, message, details) => ({
    data: null,
    success: false,
    error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
        requestId: (0, exports.generateRequestId)(),
    },
});
exports.createErrorResponse = createErrorResponse;
const generateRequestId = () => {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2)}`;
};
exports.generateRequestId = generateRequestId;
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
const retryWithBackoff = async (fn, maxRetries = app_1.APP_CONFIG.API.MAX_RETRIES, baseDelay = app_1.APP_CONFIG.API.RETRY_DELAY_MS) => {
    let lastError = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');
            if (attempt === maxRetries) {
                throw lastError;
            }
            // Exponential backoff with jitter
            const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
            await (0, exports.sleep)(delay);
        }
    }
    throw lastError;
};
exports.retryWithBackoff = retryWithBackoff;
const isApiError = (error) => {
    return error && typeof error.error === 'object' && 'code' in error.error;
};
exports.isApiError = isApiError;
const formatApiError = (error) => {
    if ((0, exports.isApiError)(error)) {
        return error.error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred';
};
exports.formatApiError = formatApiError;
