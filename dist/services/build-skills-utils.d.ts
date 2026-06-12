export declare function cloneEffects(input: any): {
    combatModifiers: any;
    travelStaminaCostMultiplier: any;
    travelTimeMultiplier: any;
    actionEnergyCostMultiplier: any;
    actionYieldMultiplier: any;
    passiveStaRegenBonus: any;
    counterAttackRatio: any;
};
export declare function toNumber(value: any, fallback?: number): number;
export declare function toDateMs(value: any): number;
export declare function normalizeSkillKey(raw: any): string;
export declare function clamp(value: any, min: any, max: any): number;
export declare function roundTo(value: any, decimals: any): number;
export declare function getSpentPointsForFamily(ranksByKey: any, family: any): number;
export declare function rankMap(rows: any): {};
export declare function conditionMatches(condition: any, check: any): boolean;
