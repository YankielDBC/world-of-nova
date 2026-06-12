import type { BuildSkillDefinition, SkillEventKey } from '../data/skill-trees.js';
import { type BuildConditionSnapshot, type BuildGameplayEffects, type BuildLoadoutSlot, type BuildRuntimeStatus, type BuildTelemetryRow, type PlayerBuildSkillState } from './build-skills-types.js';
export type { BuildConditionSnapshot, BuildGameplayEffects, BuildLoadoutSlot, BuildRuntimeStatus, PlayerBuildLoadout, PlayerBuildSkillState, } from './build-skills-types.js';
export { ensureBuildSkillSchema, invalidateBuildGameplayEffectsCache, } from './build-skills-state.js';
export declare function getPlayerBuildSkillState(playerId: number): Promise<PlayerBuildSkillState | null>;
export declare function canLearnBuildSkill(state: PlayerBuildSkillState, skill: BuildSkillDefinition): {
    ok: boolean;
    reason?: string;
};
export declare function learnBuildSkillRank(playerId: number, skillKeyRaw: string): Promise<{
    success: boolean;
    message: string;
    state?: PlayerBuildSkillState;
}>;
export declare function equipBuildSkill(playerId: number, skillKeyRaw: string, slotRaw: BuildLoadoutSlot): Promise<{
    success: boolean;
    message: string;
    state?: PlayerBuildSkillState;
}>;
export declare function unequipBuildSkill(playerId: number, slotRaw: BuildLoadoutSlot): Promise<{
    success: boolean;
    message: string;
    state?: PlayerBuildSkillState;
}>;
export declare function getBuildResetCost(spentClassPoints: number, spentGeneralPoints: number): number;
export declare function resetBuildSkills(playerId: number): Promise<{
    success: boolean;
    message: string;
    state?: PlayerBuildSkillState;
}>;
export declare function getBuildRuntimeStatus(playerId: number, skillKeyRaw: string): Promise<BuildRuntimeStatus>;
export declare function getBuildGameplayEffectsForPlayer(playerId: number, conditionOverride?: BuildConditionSnapshot): Promise<BuildGameplayEffects>;
export declare function activateBuildSkill(playerId: number, skillKeyRaw: string): Promise<{
    success: boolean;
    message: string;
    runtime?: BuildRuntimeStatus;
}>;
export declare function triggerBuildReactions(params: {
    playerId: number;
    event: SkillEventKey;
    condition?: BuildConditionSnapshot;
}): Promise<Array<{
    skillKey: string;
    name: string;
    durationSeconds: number;
}>>;
export declare function getBuildTelemetrySummary(sinceHours: number): Promise<{
    topEvents: BuildTelemetryRow[];
}>;
export declare function renderBuildTelemetrySummary(lang: 'es' | 'en' | 'ru'): Promise<string>;
export declare function listBuildActiveEffects(playerId: number): Promise<Array<{
    skillKey: string;
    startsInSeconds: number;
    activeSeconds: number;
}>>;
