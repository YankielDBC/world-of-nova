import { EQUIPMENT_COMBAT_STAT_KEYS, EQUIPMENT_UTILITY_STAT_KEYS } from '../data/equipment.js';
function isObjectRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function toFiniteNumber(value) {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}
export function parseEquipmentStatsJson(raw) {
    if (!raw)
        return {};
    try {
        const parsed = JSON.parse(raw);
        if (!isObjectRecord(parsed))
            return {};
        const stats = {};
        for (const [key, value] of Object.entries(parsed)) {
            const numeric = toFiniteNumber(value);
            if (numeric === null)
                continue;
            stats[key] = numeric;
        }
        return stats;
    }
    catch {
        return {};
    }
}
function mergeStatMaps(...maps) {
    const merged = {};
    for (const statMap of maps) {
        for (const [key, value] of Object.entries(statMap)) {
            const numeric = toFiniteNumber(value);
            if (numeric === null)
                continue;
            merged[key] = (merged[key] || 0) + numeric;
        }
    }
    return merged;
}
function emptyCombatModifiers() {
    return {};
}
function emptyUtilityModifiers() {
    return {};
}
function applyStatsToAggregate(combined, combat, utility) {
    for (const key of EQUIPMENT_COMBAT_STAT_KEYS) {
        const value = toFiniteNumber(combined[key]);
        if (value === null)
            continue;
        combat[key] = (combat[key] || 0) + value;
    }
    for (const key of EQUIPMENT_UTILITY_STAT_KEYS) {
        const value = toFiniteNumber(combined[key]);
        if (value === null)
            continue;
        utility[key] = (utility[key] || 0) + value;
    }
}
function estimateGearScore(item, combined) {
    const rarityWeight = {
        common: 1,
        uncommon: 1.15,
        rare: 1.35,
        epic: 1.65,
        legendary: 2.1,
        mythic: 2.75,
    };
    const itemLevel = Math.max(1, Number(item.itemLevel || 1));
    const rarity = String(item.rarity || 'common').toLowerCase();
    const weight = rarityWeight[rarity] || 1;
    const statsMagnitude = Object.values(combined).reduce((sum, value) => sum + Math.abs(Number(value || 0)), 0);
    return Math.round(itemLevel * weight + statsMagnitude);
}
export function buildEquipmentModifierBreakdown(item) {
    const implicit = mergeStatMaps(parseEquipmentStatsJson(item.template?.implicitStatProfileJson), parseEquipmentStatsJson(item.implicitStatsJson));
    const explicit = parseEquipmentStatsJson(item.explicitStatsJson);
    const combined = mergeStatMaps(implicit, explicit);
    return {
        itemId: typeof item.id === 'number' ? item.id : null,
        templateKey: String(item.template?.key || 'unknown_equipment'),
        slot: String(item.template?.slot || 'unknown'),
        rarity: String(item.rarity || 'common'),
        implicit,
        explicit,
        combined,
    };
}
export function collectEquipmentModifiers(items) {
    const combat = emptyCombatModifiers();
    const utility = emptyUtilityModifiers();
    const breakdown = items.map(buildEquipmentModifierBreakdown);
    for (const itemBreakdown of breakdown) {
        applyStatsToAggregate(itemBreakdown.combined, combat, utility);
    }
    const gearScore = breakdown.reduce((sum, itemBreakdown, index) => {
        const source = items[index];
        return sum + estimateGearScore(source, itemBreakdown.combined);
    }, 0);
    return {
        combat,
        utility,
        breakdown,
        gearScore,
    };
}
