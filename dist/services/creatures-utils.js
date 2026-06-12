// @ts-nocheck
import { deterministicRandom } from './map-utils.js';
import { CATEGORY_ORDER, CATEGORY_WEIGHTS_BY_ZONE } from './creatures-config.js';
export function toNumber(value, fallback = 0) {
    if (typeof value === 'number' && Number.isFinite(value))
        return value;
    if (typeof value === 'bigint')
        return Number(value);
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
export function floorInt(value, min = 0) {
    return Math.max(min, Math.floor(value));
}
export function round1(value) {
    return Math.round(value * 10) / 10;
}
export function round3(value) {
    return Math.round(value * 1000) / 1000;
}
export function safeJsonParse(raw, fallback) {
    try {
        const parsed = JSON.parse(raw);
        return parsed ?? fallback;
    }
    catch {
        return fallback;
    }
}
export function tileKey(worldMapId, x, y) {
    return `${worldMapId}:${x},${y}`;
}
export function pickSeededIndex(length, seed) {
    if (length <= 1)
        return 0;
    const roll = deterministicRandom(seed);
    return Math.min(length - 1, Math.floor(roll * length));
}
export function randomIntSeeded(min, max, seed) {
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    const roll = deterministicRandom(seed);
    return low + Math.floor(roll * (high - low + 1));
}
export function weightedPickCategory(zoneId, seed) {
    const weights = CATEGORY_WEIGHTS_BY_ZONE[zoneId];
    const total = CATEGORY_ORDER.reduce((sum, category) => sum + (weights[category] || 0), 0);
    const roll = deterministicRandom(seed) * Math.max(1, total);
    let acc = 0;
    for (const category of ['basic', 'veteran', 'elite', 'boss']) {
        acc += weights[category] || 0;
        if (roll <= acc)
            return category;
    }
    return 'basic';
}
export function getCategoryLabel(category, lang) {
    const labels = {
        basic: ['Basico', 'Basic', 'Baza'],
        veteran: ['Veterano', 'Veteran', 'Veteran'],
        elite: ['Elite', 'Elite', 'Elita'],
        boss: ['Boss', 'Boss', 'Boss'],
    };
    const [es, en, ru] = labels[category] || labels.basic;
    if (lang === 'en')
        return en;
    if (lang === 'ru')
        return ru;
    return es;
}
export function getCreatureCategoryBadge(category, lang) {
    const label = getCategoryLabel(category, lang);
    const icon = category === 'boss' ? '👑' :
        category === 'elite' ? '⚔️' :
            category === 'veteran' ? '🛡️' :
                '🪶';
    return `${icon} ${label}`;
}
export function normalizeCategory(raw) {
    const key = String(raw || '').trim().toLowerCase();
    if (key === 'boss' || key === 'elite' || key === 'veteran')
        return key;
    return 'basic';
}
export function parseDrops(raw) {
    const parsed = safeJsonParse(raw, []);
    const drops = [];
    for (const entry of parsed) {
        if (!entry || typeof entry !== 'object')
            continue;
        const item = entry;
        const resourceId = toNumber(item.resourceId);
        if (resourceId <= 0)
            continue;
        drops.push({
            resourceId,
            emoji: String(item.emoji || ''),
            name: String(item.name || ''),
            minQty: floorInt(toNumber(item.minQty, 1), 1),
            maxQty: floorInt(toNumber(item.maxQty, 1), 1),
            chancePct: clamp(toNumber(item.chancePct, 0), 0, 100),
        });
    }
    return drops;
}
export function serializeDrops(drops) {
    return JSON.stringify(drops);
}
//# sourceMappingURL=creatures-utils.js.map