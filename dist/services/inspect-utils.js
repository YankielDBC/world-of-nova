import { TOOLS } from '../types/tools.js';
import { isResourceAvailableByPeriod } from '../data/day-cycle.js';
const RARITY_PRIORITY = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
};
const BASE_ENERGY_BY_ACTION = {
    gather: 1,
    chop: 2,
    mine: 2,
};
const RARITY_ENERGY_MULTIPLIER = {
    common: 1,
    uncommon: 1.2,
    rare: 1.6,
    epic: 2.1,
    legendary: 2.8,
};
const RARITY_DURABILITY_BONUS = {
    common: 0,
    uncommon: 1,
    rare: 1,
    epic: 2,
    legendary: 3,
};
export function toRarityCode(rarity) {
    switch (rarity.toLowerCase()) {
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
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function deterministicRandom(seed) {
    let hash = 2166136261;
    for (let i = 0; i < seed.length; i += 1) {
        hash ^= seed.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return ((hash >>> 0) % 100000) / 100000;
}
export function parseYields(rawJson) {
    try {
        const parsed = JSON.parse(rawJson || '[]');
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed
            .map((entry) => ({
            resource: String(entry.resource || ''),
            emoji: String(entry.emoji || ''),
            minQty: Number.isFinite(entry.minQty) ? Number(entry.minQty) : 1,
            maxQty: Number.isFinite(entry.maxQty) ? Number(entry.maxQty) : 1,
            chance: Number.isFinite(entry.chance) ? Number(entry.chance) : 100,
            rarity: String(entry.rarity || 'common').toLowerCase() || 'common',
        }))
            .filter((entry) => !!entry.resource && !!entry.emoji);
    }
    catch {
        return [];
    }
}
export function filterYieldsByPeriod(yields, biomeName, period) {
    return yields.filter((entry) => isResourceAvailableByPeriod(biomeName, entry.resource, period));
}
export function getNodeDominantRarity(yields) {
    let selected = 'common';
    for (const item of yields) {
        if ((RARITY_PRIORITY[item.rarity] ?? 1) > (RARITY_PRIORITY[selected] ?? 1)) {
            selected = item.rarity;
        }
    }
    return selected;
}
export function getVisibleCountRange(spawnChance) {
    if (spawnChance >= 35) {
        return { min: 2, max: 5 };
    }
    if (spawnChance >= 25) {
        return { min: 1, max: 4 };
    }
    if (spawnChance >= 15) {
        return { min: 1, max: 3 };
    }
    return { min: 1, max: 2 };
}
export function detectActionFromTool(requiredTool, nodeType) {
    if (requiredTool) {
        const tool = TOOLS[requiredTool];
        if (tool?.type === 'mining') {
            return 'mine';
        }
        if (tool?.type === 'woodcutting' || tool?.type === 'harvesting') {
            return 'chop';
        }
    }
    const lowered = nodeType.toLowerCase();
    if (lowered.includes('rock') || lowered.includes('lava') || lowered.includes('ash') || lowered.includes('mine')) {
        return 'mine';
    }
    if (lowered.includes('tree') || lowered.includes('pine') || lowered.includes('bamboo') || lowered.includes('wood')) {
        return 'chop';
    }
    return 'gather';
}
export function getDayActionKey(action, nodeType) {
    if (action !== 'gather') {
        return action;
    }
    const lowered = (nodeType || '').toLowerCase();
    if (lowered.includes('fish') ||
        lowered.includes('water') ||
        lowered.includes('river') ||
        lowered.includes('brook') ||
        lowered.includes('rill') ||
        lowered.includes('wash')) {
        return 'fish';
    }
    return 'gather';
}
export function isFishingNodeType(nodeType) {
    const lowered = (nodeType || '').toLowerCase();
    return (lowered.includes('fish') ||
        lowered.includes('water') ||
        lowered.includes('river') ||
        lowered.includes('brook') ||
        lowered.includes('rill') ||
        lowered.includes('wash'));
}
export function getRecoveryHint(recoveredInMs) {
    if (recoveredInMs <= 0) {
        return '';
    }
    const seconds = Math.max(1, Math.ceil(recoveredInMs / 1000));
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const minutes = Math.ceil(seconds / 60);
    return `${minutes}m`;
}
export function normalizeRejectedReason(reason) {
    const weightMatch = reason.match(/\(([\d.]+)\/([\d.]+)\s*kg\)/i);
    if (weightMatch) {
        return `No cabe, supera el peso: ${weightMatch[1]}/${weightMatch[2]} kg`;
    }
    const slotMatch = reason.match(/\((\d+)\/(\d+)\)/);
    if (slotMatch) {
        return `No cabe, supera slots: ${slotMatch[1]}/${slotMatch[2]}`;
    }
    return reason;
}
export function canRefreshNodesOnPeriodShift(nodes) {
    return nodes.every((node) => {
        return node.pendingRestore <= 0 && !node.cooldownUntilMs && node.available >= node.baseAvailable;
    });
}
export function getEnergyCostPerAction(action, rarity, requiredLevel) {
    const base = BASE_ENERGY_BY_ACTION[action];
    const rarityMultiplier = RARITY_ENERGY_MULTIPLIER[rarity] ?? 1;
    const levelFactor = 1 + Math.max(0, requiredLevel - 1) * 0.03;
    return Math.max(1, Math.ceil(base * rarityMultiplier * levelFactor));
}
export function getDurabilityDamage(requiredLevel, rarity) {
    const levelPenalty = Math.floor(Math.max(0, requiredLevel - 1) / 20);
    return Math.max(1, 1 + levelPenalty + (RARITY_DURABILITY_BONUS[rarity] ?? 0));
}
