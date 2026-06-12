import { TOOLS } from '../types/tools.js';
export function safeInt(value) {
    if (typeof value === 'number' && Number.isFinite(value))
        return Math.floor(value);
    if (typeof value === 'bigint')
        return Number(value);
    if (typeof value === 'string') {
        const parsed = Number.parseInt(value, 10);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}
export function clampInt(value, min, max) {
    return Math.max(min, Math.min(max, Math.floor(value)));
}
export function aggregateByPrice(rows, depth) {
    const map = new Map();
    for (const row of rows) {
        map.set(row.priceSilver, (map.get(row.priceSilver) || 0) + row.qty);
    }
    return Array.from(map.entries())
        .map(([priceSilver, quantity]) => ({ priceSilver, quantity }))
        .sort((a, b) => a.priceSilver - b.priceSilver)
        .slice(0, depth);
}
export function aggregateFxByPrice(rows, depth, sortMode) {
    const map = new Map();
    for (const row of rows) {
        map.set(row.priceSilverPerGold, (map.get(row.priceSilverPerGold) || 0) + row.qty);
    }
    return Array.from(map.entries())
        .map(([price, qty]) => ({ priceSilver: price, goldAmount: qty }))
        .sort((a, b) => (sortMode === 'asc' ? a.priceSilver - b.priceSilver : b.priceSilver - a.priceSilver))
        .slice(0, depth);
}
export function getSlotWeightKg(slot) {
    if (slot.resource)
        return slot.resource.weightKg * slot.quantity;
    const toolKey = slot.playerTool?.toolKey || slot.toolKey;
    if (toolKey && TOOLS[toolKey])
        return TOOLS[toolKey].weightKg;
    if (slot.storedBag?.definition)
        return slot.storedBag.definition.itemWeightKg;
    return 0;
}
export function getFreeSlotIndexes(slots, capacity) {
    const taken = new Set(slots.map((slot) => slot.slotIndex));
    const free = [];
    for (let idx = 1; idx <= capacity; idx += 1) {
        if (!taken.has(idx))
            free.push(idx);
    }
    return free;
}
export function formatAgoMinutes(createdAt) {
    const mins = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 60000));
    if (mins < 1)
        return 'ahora';
    if (mins < 60)
        return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem === 0 ? `${hours}h` : `${hours}h ${rem}m`;
}
