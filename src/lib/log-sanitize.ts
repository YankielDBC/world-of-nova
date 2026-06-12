// @ts-nocheck
function maskTelegramTokenInText(text) {
    if (!text) {
        return text;
    }
    const envToken = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
    let sanitized = text;
    if (envToken) {
        sanitized = sanitized.split(envToken).join('[REDACTED_BOT_TOKEN]');
    }
    // Generic fallback mask for accidental token-shaped strings in URLs.
    sanitized = sanitized.replace(/bot\d{5,}:[A-Za-z0-9_-]{20,}/g, 'bot[REDACTED_BOT_TOKEN]');
    return sanitized;
}
export function formatErrorForLog(error) {
    if (error instanceof Error) {
        const stack = maskTelegramTokenInText(error.stack || '');
        if (stack) {
            return stack;
        }
        return maskTelegramTokenInText(error.message || String(error));
    }
    return maskTelegramTokenInText(String(error));
}
