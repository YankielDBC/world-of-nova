export { ensureBuildSkillSchema, invalidateBuildGameplayEffectsCache, } from './build-skills-state.js';
export declare function getPlayerBuildSkillState(playerId: any): Promise<any>;
export declare function canLearnBuildSkill(state: any, skill: any): {
    ok: boolean;
    reason: string;
} | {
    ok: boolean;
    reason?: undefined;
};
export declare function learnBuildSkillRank(playerId: any, skillKeyRaw: any): Promise<{
    success: boolean;
    message: string;
    state?: undefined;
} | {
    success: boolean;
    message: string;
    state: any;
}>;
export declare function equipBuildSkill(playerId: any, skillKeyRaw: any, slotRaw: any): Promise<{
    success: boolean;
    message: string;
    state?: undefined;
} | {
    success: boolean;
    message: string;
    state: any;
}>;
export declare function unequipBuildSkill(playerId: any, slotRaw: any): Promise<{
    success: boolean;
    message: string;
    state?: undefined;
} | {
    success: boolean;
    message: string;
    state: any;
}>;
export declare function getBuildResetCost(spentClassPoints: any, spentGeneralPoints: any): number;
export declare function resetBuildSkills(playerId: any): Promise<{
    success: boolean;
    message: string;
    state?: undefined;
} | {
    success: boolean;
    message: string;
    state: any;
}>;
export declare function getBuildRuntimeStatus(playerId: any, skillKeyRaw: any): Promise<{
    cooldownSeconds: number;
    castSeconds: number;
    activeSeconds: number;
}>;
export declare function getBuildGameplayEffectsForPlayer(playerId: any, conditionOverride: any): Promise<{
    combatModifiers: any;
    travelStaminaCostMultiplier: any;
    travelTimeMultiplier: any;
    actionEnergyCostMultiplier: any;
    actionYieldMultiplier: any;
    passiveStaRegenBonus: any;
    counterAttackRatio: any;
}>;
export declare function activateBuildSkill(playerId: any, skillKeyRaw: any): Promise<{
    success: boolean;
    message: string;
    runtime?: undefined;
} | {
    success: boolean;
    message: string;
    runtime: {
        cooldownSeconds: number;
        castSeconds: number;
        activeSeconds: number;
    };
}>;
export declare function triggerBuildReactions(params: any): Promise<any[]>;
export declare function getBuildTelemetrySummary(sinceHours: any): Promise<{
    topEvents: unknown;
}>;
export declare function renderBuildTelemetrySummary(lang: any): Promise<string>;
export declare function listBuildActiveEffects(playerId: any): Promise<any>;
