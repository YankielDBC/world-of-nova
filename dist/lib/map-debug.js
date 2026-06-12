// @ts-nocheck
import { RUNTIME_CONFIG } from './runtime-config.js';
function safeStringify(value) {
    try {
        return JSON.stringify(value, (_key, currentValue) => {
            if (typeof currentValue === 'bigint') {
                return currentValue.toString();
            }
            if (currentValue instanceof Error) {
                return {
                    name: currentValue.name,
                    message: currentValue.message,
                    stack: currentValue.stack,
                };
            }
            return currentValue;
        }, 2);
    }
    catch {
        return String(value);
    }
}
export function debugTextPreview(text, max = 180) {
    return text.slice(0, max).replace(/\n/g, '\\n');
}
export function debugLooksLikeMapText(text) {
    return text.includes('🗺') && text.includes('----------------------------');
}
export function summarizeTextTokens(text, tokens) {
    const summary = {};
    for (const token of tokens) {
        let index = 0;
        let count = 0;
        while (index < text.length) {
            const found = text.indexOf(token, index);
            if (found === -1) {
                break;
            }
            count += 1;
            index = found + token.length;
        }
        if (count > 0) {
            summary[token] = count;
        }
    }
    return summary;
}
export function logMapDebug(stage, payload) {
    if (!RUNTIME_CONFIG.mapDebugEnabled) {
        return;
    }
    if (payload == null) {
        console.log(`[MAP_DEBUG] ${stage}`);
        return;
    }
    if (typeof payload === 'string') {
        console.log(`[MAP_DEBUG] ${stage} ${payload}`);
        return;
    }
    console.log(`[MAP_DEBUG] ${stage} ${safeStringify(payload)}`);
}
export function logEmojiDebug(stage, payload) {
    if (!RUNTIME_CONFIG.customEmojiDebugEnabled) {
        return;
    }
    if (payload == null) {
        console.log(`[EMOJI_DEBUG] ${stage}`);
        return;
    }
    if (typeof payload === 'string') {
        console.log(`[EMOJI_DEBUG] ${stage} ${payload}`);
        return;
    }
    console.log(`[EMOJI_DEBUG] ${stage} ${safeStringify(payload)}`);
}
//# sourceMappingURL=map-debug.js.map