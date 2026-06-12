// @ts-nocheck
import { TOOLS } from '../types/tools.js';
const WATER_BIOMES = new Set(['river', 'lake']);
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
const RARITY_PRIORITY = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
};
const climateSpawnMultiplierByBiome = {
    river: { calm: 1, humid: 1.35, dry: 0.7, mist: 1.1, heat: 0.8, storm: 1.2, ash: 0.85 },
    forest: { calm: 1, humid: 1.2, dry: 0.85, mist: 1.1, heat: 0.82, storm: 1.05, ash: 0.9 },
    volcano: { calm: 1, humid: 0.8, dry: 1.0, mist: 0.9, heat: 1.15, storm: 0.88, ash: 1.25 },
    plains: { calm: 1, humid: 1.12, dry: 0.75, mist: 0.9, heat: 0.82, storm: 0.95, ash: 0.85 },
    swamp: { calm: 1, humid: 1.3, dry: 0.7, mist: 1.25, heat: 0.8, storm: 1.1, ash: 0.85 },
    lake: { calm: 1, humid: 1.28, dry: 0.76, mist: 1.2, heat: 0.8, storm: 1.14, ash: 0.82 },
    highlands: { calm: 1, humid: 1.08, dry: 0.9, mist: 1.12, heat: 0.88, storm: 0.95, ash: 0.86 },
    ashlands: { calm: 1, humid: 0.85, dry: 1.05, mist: 0.9, heat: 1.2, storm: 0.9, ash: 1.28 },
    desert: { calm: 1, humid: 1.08, dry: 0.78, mist: 0.9, heat: 0.74, storm: 0.86, ash: 0.8 },
    tundra: { calm: 1, humid: 0.95, dry: 1.02, mist: 1.15, heat: 0.94, storm: 0.88, ash: 0.9 },
};
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
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
    const lowered = (nodeType || '').toLowerCase();
    if (lowered.includes('rock') || lowered.includes('lava') || lowered.includes('ash') || lowered.includes('mine')) {
        return 'mine';
    }
    if (lowered.includes('tree') || lowered.includes('pine') || lowered.includes('bamboo') || lowered.includes('wood')) {
        return 'chop';
    }
    return 'gather';
}
export function getDayActionKey(action, nodeType) {
    if (action !== 'gather')
        return action;
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
export function getVisibleCountRange(spawnChance) {
    if (spawnChance >= 35)
        return { min: 2, max: 5 };
    if (spawnChance >= 25)
        return { min: 1, max: 4 };
    if (spawnChance >= 15)
        return { min: 1, max: 3 };
    return { min: 1, max: 2 };
}
export function getDominantRarity(yields) {
    let selected = 'common';
    for (const item of yields) {
        if ((RARITY_PRIORITY[item.rarity] ?? 1) > (RARITY_PRIORITY[selected] ?? 1)) {
            selected = item.rarity;
        }
    }
    return selected;
}
export function getEnergyCostPerAction(action, rarity, requiredLevel) {
    const base = BASE_ENERGY_BY_ACTION[action];
    const rarityMultiplier = RARITY_ENERGY_MULTIPLIER[rarity] ?? 1;
    const levelFactor = 1 + Math.max(0, requiredLevel - 1) * 0.03;
    return Math.max(1, Math.ceil(base * rarityMultiplier * levelFactor));
}
export function getSpawnMultiplierForClimate(biomeName, climate) {
    const byBiome = climateSpawnMultiplierByBiome[biomeName] || climateSpawnMultiplierByBiome.plains;
    let value = byBiome[climate.kind] ?? 1;
    if (climate.specialEvent === 'flood')
        value += 0.18;
    if (climate.specialEvent === 'wildfire')
        value -= 0.28;
    if (climate.specialEvent === 'quakes')
        value -= 0.05;
    if (climate.specialEvent === 'duststorm')
        value -= 0.2;
    if (climate.specialEvent === 'toxic_fog')
        value += 0.06;
    return clamp(value, 0.35, 1.85);
}
export function getYieldMultiplierForClimate(biomeName, climate) {
    const mapByBiome = {
        river: { calm: 1, humid: 1.2, dry: 0.8, mist: 1.0, heat: 0.85, storm: 1.1, ash: 0.9 },
        forest: { calm: 1, humid: 1.15, dry: 0.9, mist: 1.05, heat: 0.88, storm: 1.0, ash: 0.9 },
        volcano: { calm: 1, humid: 0.85, dry: 0.95, mist: 0.9, heat: 1.1, storm: 0.9, ash: 1.2 },
        plains: { calm: 1, humid: 1.1, dry: 0.82, mist: 0.9, heat: 0.88, storm: 0.95, ash: 0.85 },
        swamp: { calm: 1, humid: 1.2, dry: 0.8, mist: 1.15, heat: 0.85, storm: 1.05, ash: 0.9 },
        lake: { calm: 1, humid: 1.18, dry: 0.84, mist: 1.1, heat: 0.88, storm: 1.06, ash: 0.88 },
        highlands: { calm: 1, humid: 1.05, dry: 0.92, mist: 1.08, heat: 0.9, storm: 0.98, ash: 0.9 },
        ashlands: { calm: 1, humid: 0.88, dry: 1.04, mist: 0.92, heat: 1.14, storm: 0.95, ash: 1.2 },
        desert: { calm: 1, humid: 1.06, dry: 0.84, mist: 0.9, heat: 0.82, storm: 0.88, ash: 0.86 },
        tundra: { calm: 1, humid: 0.96, dry: 1.0, mist: 1.1, heat: 0.96, storm: 0.9, ash: 0.92 },
    };
    const byBiome = mapByBiome[biomeName] || mapByBiome.plains;
    let value = byBiome[climate.kind] ?? 1;
    if (climate.specialEvent === 'flood')
        value += 0.12;
    if (climate.specialEvent === 'wildfire')
        value -= 0.22;
    if (climate.specialEvent === 'quakes')
        value += 0.08;
    if (climate.specialEvent === 'duststorm')
        value -= 0.15;
    if (climate.specialEvent === 'toxic_fog')
        value += 0.06;
    return clamp(value, 0.5, 2.0);
}
export function getDaySpawnMultiplierForAction(action, dayCycle) {
    const table = {
        dawn: { gather: 1.08, chop: 1.02, mine: 1.0, fish: 1.1 },
        day: { gather: 1.0, chop: 1.0, mine: 1.0, fish: 1.0 },
        dusk: { gather: 1.06, chop: 1.02, mine: 1.0, fish: 1.08 },
        night: { gather: 0.92, chop: 0.94, mine: 1.03, fish: 0.95 },
    };
    return table[dayCycle.period][action] ?? 1;
}
export function getDayYieldMultiplierForAction(action, dayCycle) {
    const table = {
        dawn: { gather: 1.06, chop: 1.01, mine: 1.0, fish: 1.08 },
        day: { gather: 1.0, chop: 1.0, mine: 1.0, fish: 1.0 },
        dusk: { gather: 1.05, chop: 1.01, mine: 1.0, fish: 1.07 },
        night: { gather: 0.9, chop: 0.92, mine: 1.02, fish: 0.94 },
    };
    return table[dayCycle.period][action] ?? 1;
}
export function getMovementStaForBiome(biomeName) {
    return WATER_BIOMES.has(biomeName) ? 2 : 1;
}
export function shortNum(n) {
    if (n >= 1000000000)
        return `${(n / 1000000000).toFixed(1).replace(/\\.0$/, '')}B`;
    if (n >= 1000000)
        return `${(n / 1000000).toFixed(1).replace(/\\.0$/, '')}M`;
    if (n >= 1000)
        return `${(n / 1000).toFixed(1).replace(/\\.0$/, '')}K`;
    return `${n}`;
}
export function formatMs(ms) {
    if (ms < 1000)
        return `${ms}ms`;
    const sec = Math.round(ms / 100) / 10;
    if (sec < 60)
        return `${sec}s`;
    const min = Math.floor(sec / 60);
    const rem = Math.round(sec % 60);
    return `${min}m ${rem}s`;
}
export function formatPercent(part, total) {
    if (total <= 0)
        return '0%';
    return `${((part / total) * 100).toFixed(1)}%`;
}
export function increment(record, key, amount = 1) {
    record[key] = (record[key] || 0) + amount;
}
//# sourceMappingURL=dev-explorer-utils.js.map