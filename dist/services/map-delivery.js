// @ts-nocheck
import { CUSTOM_EMOJI_TOKENS_SORTED } from '../data/custom-emojis.js';
import { buildCustomEmojiHtmlFromEntities, buildCustomEmojiEntitiesForText, clampCustomEmojiEntitiesForMessage, SKIP_CUSTOM_EMOJI_TRANSFORMER_FLAG, } from '../lib/telegram-custom-emojis.js';
import { debugTextPreview, logMapDebug, summarizeTextTokens } from '../lib/map-debug.js';
function isEntityTextInvalidError(error) {
    if (!error || typeof error !== 'object') {
        return false;
    }
    const description = error.description;
    const message = error.message;
    return ((typeof description === 'string' && description.includes('ENTITY_TEXT_INVALID')) ||
        (typeof message === 'string' && message.includes('ENTITY_TEXT_INVALID')));
}
function isMessageNotModifiedError(error) {
    if (!error || typeof error !== 'object') {
        return false;
    }
    const description = error.description;
    const message = error.message;
    return ((typeof description === 'string' && description.includes('message is not modified')) ||
        (typeof message === 'string' && message.includes('message is not modified')));
}
function collectCustomEmojiIdsFromEntities(entities) {
    const ids = new Set();
    for (const entity of entities) {
        if (entity.type !== 'custom_emoji') {
            continue;
        }
        const id = String(entity.custom_emoji_id || '').trim();
        if (id) {
            ids.add(id);
        }
    }
    return Array.from(ids);
}
function collectCustomEmojiIdCounts(entities) {
    const counts = {};
    for (const entity of entities) {
        if (entity.type !== 'custom_emoji') {
            continue;
        }
        const id = String(entity.custom_emoji_id || '').trim();
        if (!id) {
            continue;
        }
        counts[id] = (counts[id] || 0) + 1;
    }
    return counts;
}
function stripCustomEmojiIdFromEntities(entities, customEmojiId) {
    return entities.filter((entity) => entity.type !== 'custom_emoji' || entity.custom_emoji_id !== customEmojiId);
}
function sortCustomEmojiIdsForRetry(ids, counts) {
    return [...ids].sort((a, b) => {
        const countDelta = (counts[a] || 0) - (counts[b] || 0);
        if (countDelta !== 0) {
            return countDelta;
        }
        return a.localeCompare(b);
    });
}
function summarizeEntities(text, entities) {
    const ids = {};
    const tokens = {};
    for (const entity of entities) {
        if (entity.type !== 'custom_emoji') {
            continue;
        }
        const id = String(entity.custom_emoji_id || '').trim();
        if (id) {
            ids[id] = (ids[id] || 0) + 1;
        }
        const token = text.slice(entity.offset, entity.offset + entity.length);
        if (token) {
            tokens[token] = (tokens[token] || 0) + 1;
        }
    }
    return {
        total: entities.length,
        uniqueIds: Object.keys(ids).length,
        ids,
        tokens,
    };
}
async function deliverMapText(params) {
    const { source, text, keyboard, send } = params;
    const fullEntities = buildCustomEmojiEntitiesForText(text);
    const fallbackEntities = clampCustomEmojiEntitiesForMessage(fullEntities);
    const hasCustomEntities = fullEntities.length > 0;
    const canUseEntityPrimary = hasCustomEntities && fallbackEntities.length === fullEntities.length;
    const idCounts = collectCustomEmojiIdCounts(fullEntities);
    const ids = sortCustomEmojiIdsForRetry(collectCustomEmojiIdsFromEntities(fullEntities), idCounts);
    logMapDebug(`${source}.start`, {
        textLength: text.length,
        lineCount: text.split('\n').length,
        preview: debugTextPreview(text, 260),
        tokenSummary: summarizeTextTokens(text, CUSTOM_EMOJI_TOKENS_SORTED),
        entitySummary: summarizeEntities(text, fullEntities),
        fallbackEntitySummary: summarizeEntities(text, fallbackEntities),
        primaryMode: canUseEntityPrimary ? 'entities' : hasCustomEntities ? 'html' : 'plain',
    });
    const sendWithEntities = async (customEntities, attempt) => {
        logMapDebug(`${source}.attempt`, {
            attempt,
            textLength: text.length,
            entitySummary: summarizeEntities(text, customEntities),
        });
        return send(text, {
            reply_markup: keyboard,
            entities: customEntities,
            [SKIP_CUSTOM_EMOJI_TRANSFORMER_FLAG]: true,
        });
    };
    const sendWithHtml = async (customEntities, attempt) => {
        const html = buildCustomEmojiHtmlFromEntities(text, customEntities);
        logMapDebug(`${source}.attempt`, {
            attempt,
            htmlLength: html.length,
            tgEmojiTags: customEntities.filter((entity) => entity.type === 'custom_emoji').length,
            entitySummary: summarizeEntities(text, customEntities),
        });
        return send(html, {
            reply_markup: keyboard,
            parse_mode: 'HTML',
            [SKIP_CUSTOM_EMOJI_TRANSFORMER_FLAG]: true,
        });
    };
    if (!hasCustomEntities) {
        logMapDebug(`${source}.fallback`, {
            mode: 'plain-text-no-custom-entities',
            preview: debugTextPreview(text, 260),
        });
        try {
            await send(text, {
                reply_markup: keyboard,
                [SKIP_CUSTOM_EMOJI_TRANSFORMER_FLAG]: true,
            });
            return;
        }
        catch (error) {
            if (isMessageNotModifiedError(error)) {
                logMapDebug(`${source}.success`, {
                    mode: 'plain-no-custom-not-modified',
                });
                return;
            }
            throw error;
        }
    }
    try {
        if (canUseEntityPrimary) {
            await sendWithEntities(fullEntities, 'entities-initial');
        }
        else {
            await sendWithHtml(fullEntities, 'html-initial');
        }
        logMapDebug(`${source}.success`, {
            mode: canUseEntityPrimary ? 'entities-initial' : 'html-initial',
            entityCount: fullEntities.length,
        });
        return;
    }
    catch (error) {
        logMapDebug(`${source}.error`, {
            attempt: canUseEntityPrimary ? 'entities-initial' : 'html-initial',
            message: error?.message || String(error),
            isEntityTextInvalid: isEntityTextInvalidError(error),
        });
        if (isMessageNotModifiedError(error)) {
            logMapDebug(`${source}.success`, {
                mode: canUseEntityPrimary ? 'entities-initial-not-modified' : 'html-initial-not-modified',
                entityCount: fullEntities.length,
            });
            return;
        }
        if (canUseEntityPrimary && !isEntityTextInvalidError(error)) {
            try {
                await sendWithHtml(fullEntities, 'html-fallback-after-entities-error');
                logMapDebug(`${source}.success`, {
                    mode: 'html-fallback-after-entities-error',
                    entityCount: fullEntities.length,
                });
                return;
            }
            catch (htmlError) {
                if (isMessageNotModifiedError(htmlError)) {
                    logMapDebug(`${source}.success`, {
                        mode: 'html-fallback-after-entities-error-not-modified',
                        entityCount: fullEntities.length,
                    });
                    return;
                }
                if (!isEntityTextInvalidError(htmlError)) {
                    throw htmlError;
                }
            }
        }
        if (!canUseEntityPrimary && !isEntityTextInvalidError(error) && fallbackEntities.length > 0) {
            try {
                await sendWithEntities(fallbackEntities, 'entities-fallback-after-html-error');
                logMapDebug(`${source}.success`, {
                    mode: 'entities-fallback-after-html-error',
                    entityCount: fallbackEntities.length,
                });
                return;
            }
            catch (entityError) {
                if (isMessageNotModifiedError(entityError)) {
                    logMapDebug(`${source}.success`, {
                        mode: 'entities-fallback-after-html-error-not-modified',
                        entityCount: fallbackEntities.length,
                    });
                    return;
                }
                if (!isEntityTextInvalidError(entityError) || fallbackEntities.length === 0) {
                    throw entityError;
                }
            }
        }
    }
    for (const customEmojiId of ids) {
        const filteredEntities = stripCustomEmojiIdFromEntities(fullEntities, customEmojiId);
        if (filteredEntities.length === fullEntities.length) {
            continue;
        }
        logMapDebug(`${source}.strip`, {
            strippedId: customEmojiId,
            remaining: filteredEntities.length,
        });
        try {
            if (canUseEntityPrimary) {
                await sendWithEntities(filteredEntities, `entities-strip:${customEmojiId}`);
            }
            else {
                await sendWithHtml(filteredEntities, `html-strip:${customEmojiId}`);
            }
            logMapDebug(`${source}.success`, {
                mode: canUseEntityPrimary ? 'entities-strip' : 'html-strip',
                strippedId: customEmojiId,
                remaining: filteredEntities.length,
            });
            return;
        }
        catch (error) {
            if (isMessageNotModifiedError(error)) {
                logMapDebug(`${source}.success`, {
                    mode: canUseEntityPrimary ? 'entities-strip-not-modified' : 'html-strip-not-modified',
                    strippedId: customEmojiId,
                    remaining: filteredEntities.length,
                });
                return;
            }
            logMapDebug(`${source}.error`, {
                attempt: `${canUseEntityPrimary ? 'entities-strip' : 'html-strip'}:${customEmojiId}`,
                message: error?.message || String(error),
                isEntityTextInvalid: isEntityTextInvalidError(error),
            });
            if (canUseEntityPrimary && !isEntityTextInvalidError(error)) {
                try {
                    await sendWithHtml(filteredEntities, `html-strip-fallback:${customEmojiId}`);
                    logMapDebug(`${source}.success`, {
                        mode: 'html-strip-fallback',
                        strippedId: customEmojiId,
                        remaining: filteredEntities.length,
                    });
                    return;
                }
                catch (htmlError) {
                    if (isMessageNotModifiedError(htmlError)) {
                        logMapDebug(`${source}.success`, {
                            mode: 'html-strip-fallback-not-modified',
                            strippedId: customEmojiId,
                            remaining: filteredEntities.length,
                        });
                        return;
                    }
                    if (!isEntityTextInvalidError(htmlError)) {
                        throw htmlError;
                    }
                }
            }
            if (!canUseEntityPrimary && !isEntityTextInvalidError(error)) {
                try {
                    await sendWithEntities(clampCustomEmojiEntitiesForMessage(filteredEntities), `entities-strip:${customEmojiId}`);
                    logMapDebug(`${source}.success`, {
                        mode: 'entities-strip',
                        strippedId: customEmojiId,
                        remaining: filteredEntities.length,
                    });
                    return;
                }
                catch (entityError) {
                    if (isMessageNotModifiedError(entityError)) {
                        logMapDebug(`${source}.success`, {
                            mode: 'entities-strip-not-modified',
                            strippedId: customEmojiId,
                            remaining: filteredEntities.length,
                        });
                        return;
                    }
                    if (!isEntityTextInvalidError(entityError)) {
                        throw entityError;
                    }
                }
            }
        }
    }
    logMapDebug(`${source}.fallback`, {
        mode: 'plain-text',
        preview: debugTextPreview(text, 260),
    });
    try {
        await send(text, {
            reply_markup: keyboard,
            [SKIP_CUSTOM_EMOJI_TRANSFORMER_FLAG]: true,
        });
    }
    catch (error) {
        if (isMessageNotModifiedError(error)) {
            logMapDebug(`${source}.success`, {
                mode: 'plain-not-modified',
            });
            return;
        }
        throw error;
    }
}
export async function sendMapCardSafeViaContext(params) {
    const send = params.mode === 'edit'
        ? (messageText, options) => params.ctx.editMessageText(messageText, options)
        : (messageText, options) => params.ctx.reply(messageText, options);
    await deliverMapText({
        source: params.source,
        text: params.text,
        keyboard: params.keyboard,
        send,
    });
}
export async function sendMapCardSafeViaBot(params) {
    const send = (messageText, options) => params.bot.api.sendMessage(params.chatId, messageText, options);
    await deliverMapText({
        source: params.source,
        text: params.text,
        keyboard: params.keyboard,
        send,
    });
}
//# sourceMappingURL=map-delivery.js.map