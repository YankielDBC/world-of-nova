// @ts-nocheck
import { TOOLS } from '../types/tools.js';
export function getToolMeta(toolKey) {
    if (!toolKey) {
        return null;
    }
    return TOOLS[toolKey] || null;
}
export function getToolWeight(toolKey) {
    return getToolMeta(toolKey)?.weightKg ?? 0;
}
export function toStrikeText(text) {
    return text
        .split('')
        .map((char) => `${char}\u0336`)
        .join('');
}
export function getToolEquipSlot(toolKey) {
    const tool = getToolMeta(toolKey);
    if (!tool) {
        return null;
    }
    if (tool.type === 'mining') {
        return 'mineToolId';
    }
    if (tool.type === 'fishing' || tool.type === 'gathering') {
        return 'gatherToolId';
    }
    if (tool.type === 'woodcutting' || tool.type === 'harvesting') {
        return 'chopToolId';
    }
    return null;
}
export function getRarityCode(rarity) {
    switch ((rarity || 'common').toLowerCase()) {
        case 'uncommon':
            return 'U';
        case 'rare':
            return 'R';
        case 'epic':
            return 'E';
        case 'legendary':
            return 'L';
        default:
            return 'C';
    }
}
export function getEffectiveStackLimit(definition, resource) {
    if (!definition.allowResourceStack || !resource.stackable) {
        return 1;
    }
    return Math.max(1, Math.min(definition.maxResourceStack, resource.maxStack));
}
export function getFirstFreeSlotIndexes(capacity, usedIndexes, count) {
    const used = new Set(usedIndexes);
    const indexes = [];
    for (let i = 1; i <= capacity && indexes.length < count; i += 1) {
        if (!used.has(i)) {
            indexes.push(i);
        }
    }
    return indexes;
}
export function buildCapacityReason(weightExceeded, slotExceeded, details) {
    if (weightExceeded && slotExceeded) {
        return `No cabe: superarías el peso (${details.weightNeeded.toFixed(1)}/${details.weightCapacity.toFixed(1)} kg) y los slots (${details.slotsNeeded}/${details.slotCapacity}).`;
    }
    if (weightExceeded) {
        return `No cabe: superarías el peso (${details.weightNeeded.toFixed(1)}/${details.weightCapacity.toFixed(1)} kg).`;
    }
    return `No cabe: superarías los slots (${details.slotsNeeded}/${details.slotCapacity}).`;
}
//# sourceMappingURL=bags-utils.js.map