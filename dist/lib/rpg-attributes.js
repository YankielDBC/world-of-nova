const BASE_PRIMARY = {
    str: 5,
    dex: 5,
    int: 5,
    vit: 5,
    agi: 5,
    eng: 5,
};
export const CLASS_BONUS_TABLE = {
    curse_hunter: { str: 8, dex: 6, int: 4, vit: 6, agi: 5, eng: 3 },
    alchemist_rogue: { str: 4, dex: 9, int: 6, vit: 3, agi: 9, eng: 8 },
    dark_druid: { str: 7, dex: 3, int: 5, vit: 9, agi: 4, eng: 5 },
    arcane: { str: 1, dex: 5, int: 11, vit: 3, agi: 6, eng: 9 },
};
const RACE_CLASS_MAP = {
    zolk: ['curse_hunter', 'alchemist_rogue'],
    uren: ['dark_druid', 'arcane'],
};
const GROWTH_PRIORITY = {
    curse_hunter: ['str', 'vit', 'dex', 'agi', 'eng', 'int'],
    alchemist_rogue: ['dex', 'agi', 'eng', 'int', 'dex', 'agi', 'vit', 'str'],
    dark_druid: ['vit', 'str', 'eng', 'int', 'agi', 'vit', 'dex'],
    arcane: ['int', 'eng', 'agi', 'dex', 'int', 'eng', 'vit', 'str'],
};
function isRaceKey(value) {
    return value === 'zolk' || value === 'uren';
}
function isClassKey(value) {
    return value === 'curse_hunter' || value === 'alchemist_rogue' || value === 'dark_druid' || value === 'arcane';
}
function isValidRaceClassCombo(race, classKey) {
    return RACE_CLASS_MAP[race].includes(classKey);
}
function cloneAttributes(value) {
    return {
        str: value.str,
        dex: value.dex,
        int: value.int,
        vit: value.vit,
        agi: value.agi,
        eng: value.eng,
    };
}
function applyAttributes(base, delta) {
    return {
        str: base.str + delta.str,
        dex: base.dex + delta.dex,
        int: base.int + delta.int,
        vit: base.vit + delta.vit,
        agi: base.agi + delta.agi,
        eng: base.eng + delta.eng,
    };
}
function getGrowthAllocation(classKey, level) {
    const growthPoints = Math.max(0, Math.floor(level) - 1);
    const growthCounter = {
        str: 0,
        dex: 0,
        int: 0,
        vit: 0,
        agi: 0,
        eng: 0,
    };
    if (growthPoints <= 0) {
        return growthCounter;
    }
    const rotation = GROWTH_PRIORITY[classKey];
    for (let i = 0; i < growthPoints; i += 1) {
        const key = rotation[i % rotation.length];
        growthCounter[key] += 1;
    }
    return growthCounter;
}
function applyLevelGrowth(base, classKey, level) {
    const attrs = cloneAttributes(base);
    const growth = getGrowthAllocation(classKey, level);
    attrs.str += growth.str;
    attrs.dex += growth.dex;
    attrs.int += growth.int;
    attrs.vit += growth.vit;
    attrs.agi += growth.agi;
    attrs.eng += growth.eng;
    return attrs;
}
export function getClassAttributesAtLevel(params) {
    if (!isRaceKey(params.race) || !isClassKey(params.classKey)) {
        return null;
    }
    if (!isValidRaceClassCombo(params.race, params.classKey)) {
        return null;
    }
    const withClassBonus = applyAttributes(BASE_PRIMARY, CLASS_BONUS_TABLE[params.classKey]);
    return applyLevelGrowth(withClassBonus, params.classKey, params.level);
}
export function getClassGrowthDebug(params) {
    if (!isRaceKey(params.race) || !isClassKey(params.classKey)) {
        return {
            attrs: null,
            lines: ['No class preset matched. Using stored player attributes.'],
        };
    }
    if (!isValidRaceClassCombo(params.race, params.classKey)) {
        return {
            attrs: null,
            lines: [`Invalid race/class combo: ${params.race}/${params.classKey}`],
        };
    }
    const level = Math.max(0, Math.floor(params.level));
    const bonus = CLASS_BONUS_TABLE[params.classKey];
    const basePlusBonus = applyAttributes(BASE_PRIMARY, bonus);
    const growth = getGrowthAllocation(params.classKey, level);
    const grown = {
        str: basePlusBonus.str + growth.str,
        dex: basePlusBonus.dex + growth.dex,
        int: basePlusBonus.int + growth.int,
        vit: basePlusBonus.vit + growth.vit,
        agi: basePlusBonus.agi + growth.agi,
        eng: basePlusBonus.eng + growth.eng,
    };
    const lines = [
        `BASE: STR ${BASE_PRIMARY.str} DEX ${BASE_PRIMARY.dex} INT ${BASE_PRIMARY.int} VIT ${BASE_PRIMARY.vit} AGI ${BASE_PRIMARY.agi} ENG ${BASE_PRIMARY.eng}`,
        `BONUS (${params.race}/${params.classKey}): +STR ${bonus.str} +DEX ${bonus.dex} +INT ${bonus.int} +VIT ${bonus.vit} +AGI ${bonus.agi} +ENG ${bonus.eng}`,
        `AT LEVEL 1: STR ${basePlusBonus.str} DEX ${basePlusBonus.dex} INT ${basePlusBonus.int} VIT ${basePlusBonus.vit} AGI ${basePlusBonus.agi} ENG ${basePlusBonus.eng}`,
        `GROWTH: +${Math.max(0, level - 1)} points => STR +${growth.str}, DEX +${growth.dex}, INT +${growth.int}, VIT +${growth.vit}, AGI +${growth.agi}, ENG +${growth.eng}`,
        `FINAL (Lv ${level}): STR ${grown.str} DEX ${grown.dex} INT ${grown.int} VIT ${grown.vit} AGI ${grown.agi} ENG ${grown.eng}`,
    ];
    return { lines, attrs: grown };
}
