// @ts-nocheck
export function overlaps(aOffset, aLength, bOffset, bLength) {
    const aEnd = aOffset + aLength;
    const bEnd = bOffset + bLength;
    return aOffset < bEnd && bOffset < aEnd;
}
export function fnv1aHash(input) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
}
export function buildLineStartOffsets(lines) {
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
export function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
export function getEntityFieldsForMethod(method) {
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
export function isEntityTextInvalidError(error) {
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
export function collectCustomEmojiIdsFromEntities(entities) {
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
export function collectCustomEmojiIdCountsFromEntities(entities) {
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
export function stripCustomEmojiIdFromEntities(entities, customEmojiId) {
    return entities.filter((entity) => {
        if (entity.type !== 'custom_emoji') {
            return true;
        }
        return entity.custom_emoji_id !== customEmojiId;
    });
}
export function stripAllCustomEmojiEntities(entities) {
    return entities.filter((entity) => entity.type !== 'custom_emoji');
}
export function sortCustomEmojiIdsForRetry(ids, counts) {
    return [...ids].sort((a, b) => {
        const countDelta = (counts[a] || 0) - (counts[b] || 0);
        if (countDelta !== 0) {
            return countDelta;
        }
        return a.localeCompare(b);
    });
}
//# sourceMappingURL=utils.js.map