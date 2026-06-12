// @ts-nocheck
export function t3(lang, es, en, ru) {
    if (lang === 'en')
        return en;
    if (lang === 'ru')
        return ru;
    return es;
}
export function toNumber(value, fallback = 0) {
    if (typeof value === 'number' && Number.isFinite(value))
        return value;
    if (typeof value === 'bigint')
        return Number(value);
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}
export function toMillis(value) {
    if (!value)
        return 0;
    if (value instanceof Date)
        return value.getTime();
    return new Date(value).getTime();
}
export function hashSeed(input) {
    let hash = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}
export function pickOffset(min, max, seed) {
    const span = Math.max(1, max - min + 1);
    return min + (hashSeed(seed) % span);
}
export function getCellCoords(x, y, cellSize = 24) {
    return {
        cellX: Math.floor(x / cellSize),
        cellY: Math.floor(y / cellSize),
    };
}
//# sourceMappingURL=death-system-utils.js.map