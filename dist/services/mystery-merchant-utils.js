// @ts-nocheck
export function coordKey(x, y) {
    return `${x},${y}`;
}
export function randomInt(min, max) {
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    return Math.floor(Math.random() * (high - low + 1)) + low;
}
export function randomFloat(min, max) {
    return min + Math.random() * (max - min);
}
export function normalizeMerchantDisplayName(name) {
    if (name.trim().toLowerCase() === 'hojas de viento') {
        return 'H. de viento';
    }
    return name;
}
export function parseForcedMerchantCoords(raw) {
    const trimmed = String(raw || '').trim();
    if (!trimmed) {
        return null;
    }
    const match = trimmed.match(/^\s*(-?\d+)\s*,\s*(-?\d+)\s*$/);
    if (!match) {
        return null;
    }
    const x = Number.parseInt(match[1], 10);
    const y = Number.parseInt(match[2], 10);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return null;
    }
    return { x, y };
}
export function sampleUnique(items, count) {
    if (count >= items.length) {
        return [...items];
    }
    const cloned = [...items];
    for (let i = cloned.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
    }
    return cloned.slice(0, count);
}
export function formatEtaFromDistance(distance, secondsPerTile) {
    const seconds = Math.max(0, Math.floor(distance * Math.max(1, secondsPerTile)));
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const rem = seconds % 60;
    return rem === 0 ? `${mins}m` : `${mins}m ${rem}s`;
}
export function pickRandomText(options) {
    if (options.length === 0) {
        return '';
    }
    return options[Math.floor(Math.random() * options.length)] || options[0] || '';
}
export function decorateMerchantAlertText(text) {
    return [
        '🔔 <b>Susurro del Reino</b> 🧌',
        '',
        `<i>${text}</i>`,
    ].join('\n');
}
//# sourceMappingURL=mystery-merchant-utils.js.map