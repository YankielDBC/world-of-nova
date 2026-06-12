export { ensureBuildSkillSchema, invalidateBuildGameplayEffectsCache, } from './build-skills-state.js';
export { activateBuildSkill, canLearnBuildSkill, equipBuildSkill, getBuildResetCost, getBuildRuntimeStatus, getPlayerBuildSkillState, learnBuildSkillRank, resetBuildSkills, triggerBuildReactions, unequipBuildSkill, } from './build-skills-actions.js';
export declare function getBuildGameplayEffectsForPlayer(playerId: any, conditionOverride: any): Promise<{
    combatModifiers: any;
    travelStaminaCostMultiplier: any;
    travelTimeMultiplier: any;
    actionEnergyCostMultiplier: any;
    actionYieldMultiplier: any;
    passiveStaRegenBonus: any;
    counterAttackRatio: any;
}>;
export declare function getBuildTelemetrySummary(sinceHours: any): Promise<{
    topEvents: unknown;
}>;
export declare function renderBuildTelemetrySummary(lang: any): Promise<string>;
export declare function listBuildActiveEffects(playerId: any): Promise<any>;
