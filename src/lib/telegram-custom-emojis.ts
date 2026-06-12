// @ts-nocheck
import { CUSTOM_EMOJI_FIXED_BY_TEXT, CUSTOM_EMOJI_TOKENS_SORTED, CUSTOM_EMOJI_VARIANTS_BY_TEXT, } from '../data/custom-emojis.js';
import { debugLooksLikeMapText, debugTextPreview, logEmojiDebug, summarizeTextTokens, } from './map-debug.js';
export const SKIP_CUSTOM_EMOJI_TRANSFORMER_FLAG = '__skip_custom_emoji_transformer';
const MAX_CUSTOM_EMOJI_ENTITIES_PER_MESSAGE = 60;
const runtimeBlockedCustomEmojiIds = new Set();
function overlaps(aOffset, aLength, bOffset, bLength) {
    const aEnd = aOffset + aLength;
    const bEnd = bOffset + bLength;
    return aOffset < bEnd && bOffset < aEnd;
}
function fnv1aHash(input) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
}
function buildLineStartOffsets(lines) {
    const starts = [];
    let offset = 0;
    for (let i = 0; i < lines.length; i++) {
        starts.push(offset);
        offset += lines[i]?.length ?? 0;
        if (i < lines.length - 1) {
            offset += 1;
        }
    }
    return starts;
}
function buildMapCellCoordByOffset(text) {
    const centerMatch = /\((-?\d+),\s*(-?\d+)\)/u.exec(text);
    if (!centerMatch) {
        return null;
    }
    const centerX = Number.parseInt(centerMatch[1] ?? '', 10);
    const centerY = Number.parseInt(centerMatch[2] ?? '', 10);
    if (!Number.isFinite(centerX) || !Number.isFinite(centerY)) {
        return null;
    }
    const lines = text.split('\n');
    if (lines.length === 0) {
        return null;
    }
    const lineStarts = buildLineStartOffsets(lines);
    const dividerIndexes = [];
    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i]?.trim();
        if (trimmed && /^-+$/.test(trimmed) && trimmed.length >= 10) {
            dividerIndexes.push(i);
        }
    }
    if (dividerIndexes.length < 2) {
        return null;
    }
    const topDivider = dividerIndexes[0];
    const bottomDivider = dividerIndexes.find((idx) => idx > topDivider + 1);
    if (bottomDivider == null) {
        return null;
    }
    const gridLineIndexes = [];
    for (let i = topDivider + 1; i < bottomDivider; i++) {
        if ((lines[i]?.length ?? 0) > 0) {
            gridLineIndexes.push(i);
        }
    }
    if (gridLineIndexes.length === 0) {
        return null;
    }
    const centerRow = Math.floor(gridLineIndexes.length / 2);
    const coordByOffset = new Map();
    for (let row = 0; row < gridLineIndexes.length; row++) {
        const lineIndex = gridLineIndexes[row];
        const line = lines[lineIndex] ?? '';
        const rowChars = Array.from(line);
        if (rowChars.length === 0) {
            continue;
        }
        const centerCol = Math.floor(rowChars.length / 2);
        let colOffset = 0;
        for (let col = 0; col < rowChars.length; col++) {
            const ch = rowChars[col] ?? '';
            const absoluteOffset = (lineStarts[lineIndex] ?? 0) + colOffset;
            coordByOffset.set(absoluteOffset, {
                x: centerX + (col - centerCol),
                y: centerY + (centerRow - row),
            });
            colOffset += ch.length;
        }
    }
    return coordByOffset.size > 0 ? coordByOffset : null;
}
function pickVariantId(token, text, offset, mapCellCoordByOffset) {
    const fixed = CUSTOM_EMOJI_FIXED_BY_TEXT[token];
    if (fixed) {
        if (runtimeBlockedCustomEmojiIds.has(fixed)) {
            return null;
        }
        return fixed;
    }
    const variants = (CUSTOM_EMOJI_VARIANTS_BY_TEXT[token] || []).filter((id) => !runtimeBlockedCustomEmojiIds.has(id));
    if (!variants || variants.length === 0) {
        return null;
    }
    const mapCoord = mapCellCoordByOffset?.get(offset);
    if (mapCoord) {
        const idx = fnv1aHash(`${token}|${mapCoord.x}|${mapCoord.y}`) % variants.length;
        return variants[idx] || variants[0] || null;
    }
    // Deterministic by local neighborhood only (not by global offset/text length),
    // so map tile variants stay stable across re-renders.
    const from = Math.max(0, offset - 4);
    const to = Math.min(text.length, offset + token.length + 4);
    const neighborhood = text.slice(from, to);
    const seed = `${token}|${neighborhood}`;
    const idx = fnv1aHash(seed) % variants.length;
    return variants[idx] || variants[0] || null;
}
function buildCustomEmojiEntities(text, existingEntities = []) {
    const additions = [];
    const mapCellCoordByOffset = buildMapCellCoordByOffset(text);
    let index = 0;
    while (index < text.length) {
        let matchedKey = null;
        for (const key of CUSTOM_EMOJI_TOKENS_SORTED) {
            if (text.startsWith(key, index)) {
                matchedKey = key;
                break;
            }
        }
        if (!matchedKey) {
            const cp = text.codePointAt(index);
            index += cp != null && cp > 0xffff ? 2 : 1;
            continue;
        }
        const length = matchedKey.length;
        const alreadyCovered = existingEntities.some((entity) => overlaps(index, length, entity.offset, entity.length));
        if (!alreadyCovered) {
            const customEmojiId = pickVariantId(matchedKey, text, index, mapCellCoordByOffset);
            if (customEmojiId) {
                additions.push({
                    offset: index,
                    length,
                    type: 'custom_emoji',
                    custom_emoji_id: customEmojiId,
                });
            }
        }
        index += length;
    }
    if (additions.length === 0) {
        return existingEntities;
    }
    return [...existingEntities, ...additions].sort((a, b) => a.offset - b.offset);
}
export function buildCustomEmojiEntitiesForText(text, existingEntities = []) {
    const entities = buildCustomEmojiEntities(text, existingEntities);
    if (debugLooksLikeMapText(text)) {
        logEmojiDebug('build.entities.map-text', {
            preview: debugTextPreview(text, 260),
            existingEntities: existingEntities.length,
            finalEntities: entities.length,
            tokenSummary: summarizeTextTokens(text, CUSTOM_EMOJI_TOKENS_SORTED),
        });
    }
    return entities;
}
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
export function buildCustomEmojiHtmlFromEntities(text, entities) {
    if (entities.length === 0) {
        return escapeHtml(text);
    }
    const ordered = [...entities]
        .filter((entity) => entity.type === 'custom_emoji' && entity.custom_emoji_id)
        .sort((a, b) => a.offset - b.offset);
    if (ordered.length === 0) {
        return escapeHtml(text);
    }
    let html = '';
    let cursor = 0;
    for (const entity of ordered) {
        if (entity.offset < cursor) {
            continue;
        }
        html += escapeHtml(text.slice(cursor, entity.offset));
        const token = text.slice(entity.offset, entity.offset + entity.length);
        html += `<tg-emoji emoji-id="${escapeHtml(String(entity.custom_emoji_id || ''))}">${escapeHtml(token)}</tg-emoji>`;
        cursor = entity.offset + entity.length;
    }
    html += escapeHtml(text.slice(cursor));
    return html;
}
export function buildCustomEmojiHtmlForText(text) {
    return buildCustomEmojiHtmlFromEntities(text, buildCustomEmojiEntitiesForText(text));
}
export function clampCustomEmojiEntitiesForMessage(entities) {
    return clampCustomEmojiEntities(entities);
}
export function registerBlockedCustomEmojiId(customEmojiId) {
    const id = String(customEmojiId || '').trim();
    if (!id) {
        return;
    }
    runtimeBlockedCustomEmojiIds.add(id);
}
function collectAllKnownCustomEmojiIds() {
    const ids = new Set();
    for (const id of Object.values(CUSTOM_EMOJI_FIXED_BY_TEXT)) {
        const normalized = String(id || '').trim();
        if (normalized) {
            ids.add(normalized);
        }
    }
    for (const variants of Object.values(CUSTOM_EMOJI_VARIANTS_BY_TEXT)) {
        for (const id of variants || []) {
            const normalized = String(id || '').trim();
            if (normalized) {
                ids.add(normalized);
            }
        }
    }
    return Array.from(ids);
}
export async function primeCustomEmojiAvailability(bot) {
    const ids = collectAllKnownCustomEmojiIds();
    logEmojiDebug('prime.start', {
        knownIds: ids.length,
        fixedTokens: Object.keys(CUSTOM_EMOJI_FIXED_BY_TEXT).length,
        variantTokens: Object.keys(CUSTOM_EMOJI_VARIANTS_BY_TEXT).length,
    });
    if (ids.length === 0) {
        return;
    }
    try {
        const stickers = (await bot.api.getCustomEmojiStickers(ids));
        const validIds = new Set();
        for (const sticker of stickers || []) {
            const id = String(sticker?.custom_emoji_id || '').trim();
            if (id) {
                validIds.add(id);
            }
        }
        const invalidIds = ids.filter((id) => !validIds.has(id));
        for (const invalidId of invalidIds) {
            runtimeBlockedCustomEmojiIds.add(invalidId);
        }
        logEmojiDebug('prime.result', {
            validCount: validIds.size,
            invalidCount: invalidIds.length,
            invalidIds,
        });
        if (invalidIds.length > 0) {
            console.warn(`⚠️ Custom emojis blocked (not resolvable by bot): ${invalidIds.join(',')}`);
        }
    }
    catch (error) {
        logEmojiDebug('prime.error', {
            message: error?.message || String(error),
        });
        console.warn('⚠️ Could not prime custom emoji availability. Using runtime fallback only.', error);
    }
}
function patchTextEntities(payload, textField, entitiesField) {
    const rawText = payload[textField];
    if (typeof rawText !== 'string' || rawText.length === 0) {
        return;
    }
    // If parse_mode is used and explicit entities are not provided, keep current behavior
    // to avoid markdown/HTML offset mismatches.
    if (payload.parse_mode && !Array.isArray(payload[entitiesField])) {
        logEmojiDebug('patch.skip-parse-mode', {
            textField,
            entitiesField,
            parseMode: payload.parse_mode,
            preview: debugTextPreview(rawText, 180),
        });
        return;
    }
    const existing = Array.isArray(payload[entitiesField]) ? payload[entitiesField] : [];
    const merged = buildCustomEmojiEntities(rawText, existing);
    if (merged.length > 0) {
        const limited = clampCustomEmojiEntities(merged);
        if (limited.length !== merged.length) {
            console.warn(`WARN custom emoji cap applied: ${merged.length} -> ${limited.length} entities (method payload)`);
            logEmojiDebug('patch.cap-applied', {
                original: merged.length,
                limited: limited.length,
            });
        }
        payload[entitiesField] = limited;
    }
    else {
        logEmojiDebug('patch.no-entities', {
            textField,
            entitiesField,
            preview: debugTextPreview(rawText, 180),
        });
    }
}
function getEntityFieldsForMethod(method) {
    if (method === 'sendMessage' || method === 'editMessageText') {
        return { textField: 'text', entitiesField: 'entities' };
    }
    if (method === 'sendPhoto' ||
        method === 'sendVideo' ||
        method === 'sendAnimation' ||
        method === 'sendDocument' ||
        method === 'sendAudio' ||
        method === 'sendVoice' ||
        method === 'editMessageCaption') {
        return { textField: 'caption', entitiesField: 'caption_entities' };
    }
    return null;
}
function isEntityTextInvalidError(error) {
    if (!error || typeof error !== 'object') {
        return false;
    }
    const description = error.description;
    if (typeof description === 'string' && description.includes('ENTITY_TEXT_INVALID')) {
        return true;
    }
    const message = error.message;
    return typeof message === 'string' && message.includes('ENTITY_TEXT_INVALID');
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
function collectCustomEmojiIdCountsFromEntities(entities) {
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
    return entities.filter((entity) => {
        if (entity.type !== 'custom_emoji') {
            return true;
        }
        return entity.custom_emoji_id !== customEmojiId;
    });
}
function stripAllCustomEmojiEntities(entities) {
    return entities.filter((entity) => entity.type !== 'custom_emoji');
}
function clampCustomEmojiEntities(entities) {
    const customEntities = entities.filter((entity) => entity.type === 'custom_emoji');
    if (customEntities.length <= MAX_CUSTOM_EMOJI_ENTITIES_PER_MESSAGE) {
        return entities;
    }
    const nonCustomEntities = entities.filter((entity) => entity.type !== 'custom_emoji');
    const selectedCustom = [];
    const step = customEntities.length / MAX_CUSTOM_EMOJI_ENTITIES_PER_MESSAGE;
    let cursor = 0;
    for (let i = 0; i < MAX_CUSTOM_EMOJI_ENTITIES_PER_MESSAGE; i++) {
        const index = Math.min(customEntities.length - 1, Math.floor(cursor));
        const candidate = customEntities[index];
        if (!candidate) {
            break;
        }
        const last = selectedCustom[selectedCustom.length - 1];
        if (!last ||
            last.offset !== candidate.offset ||
            last.length !== candidate.length ||
            last.custom_emoji_id !== candidate.custom_emoji_id) {
            selectedCustom.push(candidate);
        }
        cursor += step;
    }
    if (selectedCustom.length < MAX_CUSTOM_EMOJI_ENTITIES_PER_MESSAGE) {
        for (const candidate of customEntities) {
            if (selectedCustom.length >= MAX_CUSTOM_EMOJI_ENTITIES_PER_MESSAGE) {
                break;
            }
            const exists = selectedCustom.some((entity) => entity.offset === candidate.offset &&
                entity.length === candidate.length &&
                entity.custom_emoji_id === candidate.custom_emoji_id);
            if (!exists) {
                selectedCustom.push(candidate);
            }
        }
    }
    return [...nonCustomEntities, ...selectedCustom].sort((a, b) => a.offset - b.offset);
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
export function installCustomEmojiTransformer(bot) {
    bot.api.config.use(async (prev, method, payload, signal) => {
        let entityFields = null;
        let skipEntityInjection = false;
        if (typeof payload === 'object' && payload != null) {
            const mutablePayload = payload;
            if (mutablePayload[SKIP_CUSTOM_EMOJI_TRANSFORMER_FLAG]) {
                delete mutablePayload[SKIP_CUSTOM_EMOJI_TRANSFORMER_FLAG];
                skipEntityInjection = true;
            }
            entityFields = getEntityFieldsForMethod(method);
            if (entityFields) {
                const rawText = mutablePayload[entityFields.textField];
                if (typeof rawText === 'string') {
                    logEmojiDebug('transform.enter', {
                        method,
                        textField: entityFields.textField,
                        skipEntityInjection,
                        parseMode: mutablePayload.parse_mode || null,
                        preview: debugTextPreview(rawText, 220),
                        looksLikeMap: debugLooksLikeMapText(rawText),
                        existingEntities: Array.isArray(mutablePayload[entityFields.entitiesField])
                            ? mutablePayload[entityFields.entitiesField].length
                            : 0,
                        tokenSummary: debugLooksLikeMapText(rawText) || rawText.includes('👜') || rawText.includes('📊')
                            ? summarizeTextTokens(rawText, CUSTOM_EMOJI_TOKENS_SORTED)
                            : undefined,
                    });
                }
            }
            if (entityFields && !skipEntityInjection) {
                patchTextEntities(mutablePayload, entityFields.textField, entityFields.entitiesField);
                if (typeof mutablePayload[entityFields.textField] === 'string') {
                    logEmojiDebug('transform.after-patch', {
                        method,
                        entitiesField: entityFields.entitiesField,
                        entityCount: Array.isArray(mutablePayload[entityFields.entitiesField])
                            ? mutablePayload[entityFields.entitiesField].length
                            : 0,
                    });
                }
            }
        }
        try {
            return await prev(method, payload, signal);
        }
        catch (error) {
            if (!entityFields || !isEntityTextInvalidError(error) || typeof payload !== 'object' || payload == null) {
                throw error;
            }
            const mutablePayload = payload;
            const currentEntities = Array.isArray(mutablePayload[entityFields.entitiesField])
                ? mutablePayload[entityFields.entitiesField]
                : [];
            console.warn(`WARN ENTITY_TEXT_INVALID intercepted: method=${method} entityField=${entityFields.entitiesField} entities=${currentEntities.length}`);
            logEmojiDebug('transform.entity-text-invalid', {
                method,
                entityField: entityFields.entitiesField,
                currentEntities: currentEntities.length,
            });
            if (currentEntities.length === 0) {
                throw error;
            }
            const customEmojiIdCounts = collectCustomEmojiIdCountsFromEntities(currentEntities);
            const customEmojiIds = sortCustomEmojiIdsForRetry(collectCustomEmojiIdsFromEntities(currentEntities), customEmojiIdCounts);
            for (const customEmojiId of customEmojiIds) {
                const candidateEntities = stripCustomEmojiIdFromEntities(currentEntities, customEmojiId);
                if (candidateEntities.length === currentEntities.length) {
                    continue;
                }
                mutablePayload[entityFields.entitiesField] = candidateEntities;
                try {
                    const response = await prev(method, payload, signal);
                    logEmojiDebug('transform.recovered-after-strip', {
                        method,
                        removedEmojiIds: [customEmojiId],
                        remainingEntities: candidateEntities.length,
                    });
                    console.warn(`WARN custom emoji stripped for one request after ENTITY_TEXT_INVALID: ${customEmojiId}`);
                    return response;
                }
                catch (retryError) {
                    if (!isEntityTextInvalidError(retryError)) {
                        throw retryError;
                    }
                }
            }
            let filteredEntities = currentEntities;
            for (const customEmojiId of customEmojiIds) {
                const nextEntities = stripCustomEmojiIdFromEntities(filteredEntities, customEmojiId);
                if (nextEntities.length === filteredEntities.length) {
                    continue;
                }
                filteredEntities = nextEntities;
                mutablePayload[entityFields.entitiesField] = filteredEntities;
                try {
                    const response = await prev(method, payload, signal);
                    logEmojiDebug('transform.recovered-after-cumulative-strip', {
                        method,
                        strippedUpTo: customEmojiId,
                        remainingEntities: filteredEntities.length,
                    });
                    return response;
                }
                catch (retryError) {
                    if (!isEntityTextInvalidError(retryError)) {
                        throw retryError;
                    }
                }
            }
            const withoutCustomEntities = stripAllCustomEmojiEntities(filteredEntities);
            if (withoutCustomEntities.length !== filteredEntities.length) {
                mutablePayload[entityFields.entitiesField] = withoutCustomEntities;
                try {
                    logEmojiDebug('transform.retry-without-custom', {
                        method,
                        remainingEntities: withoutCustomEntities.length,
                    });
                    return await prev(method, payload, signal);
                }
                catch (noCustomError) {
                    if (!isEntityTextInvalidError(noCustomError)) {
                        throw noCustomError;
                    }
                    console.warn('WARN custom emoji fallback: retrying request without entities field');
                    delete mutablePayload[entityFields.entitiesField];
                    return prev(method, payload, signal);
                }
            }
            console.warn('WARN custom emoji fallback: request retried without entities field');
            delete mutablePayload[entityFields.entitiesField];
            return prev(method, payload, signal);
        }
    });
}
