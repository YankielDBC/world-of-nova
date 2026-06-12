// @ts-nocheck
import { getBuildSkillByKey } from '../data/skill-trees.js';
export function cloneEffects(input) {
    return {
        combatModifiers: { ...input.combatModifiers },
        travelStaminaCostMultiplier: input.travelStaminaCostMultiplier,
        travelTimeMultiplier: input.travelTimeMultiplier,
        actionEnergyCostMultiplier: { ...input.actionEnergyCostMultiplier },
        actionYieldMultiplier: { ...input.actionYieldMultiplier },
        passiveStaRegenBonus: input.passiveStaRegenBonus,
        counterAttackRatio: input.counterAttackRatio,
    };
}
export function toNumber(value, fallback = 0) {
    if (typeof value === 'number' && Number.isFinite(value))
        return value;
    if (typeof value === 'bigint')
        return Number(value);
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}
export function toDateMs(value) {
    if (!value)
        return 0;
    if (value instanceof Date)
        return value.getTime();
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
}
export function normalizeSkillKey(raw) {
    return String(raw || '').trim().toLowerCase();
}
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
export function roundTo(value, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}
export function getSpentPointsForFamily(ranksByKey, family) {
    let spent = 0;
    for (const [skillKey, rank] of Object.entries(ranksByKey)) {
        if (rank <= 0)
            continue;
        const def = getBuildSkillByKey(skillKey);
        if (!def || def.family !== family)
            continue;
        spent += rank * def.costPerRank;
    }
    return spent;
}
export function rankMap(rows) {
    const map = {};
    for (const row of rows) {
        map[normalizeSkillKey(row.skillKey)] = toNumber(row.rank);
    }
    return map;
}
//# sourceMappingURL=build-skills-utils.js.map