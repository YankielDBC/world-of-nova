import type { BuildCombatModifierSet, BuildSkillDefinition } from '../data/skill-trees.js';
export type BuildLoadoutSlot = 'active1' | 'active2' | 'active3' | 'keystone';
export interface PlayerBuildLoadout {
    activeSlot1: string | null;
    activeSlot2: string | null;
    activeSlot3: string | null;
    keystoneKey: string | null;
}
export interface PlayerBuildSkillState {
    playerId: number;
    classKey: string | null;
    level: number;
    silver: number;
    ranksByKey: Record<string, number>;
    loadout: PlayerBuildLoadout;
    classSkills: BuildSkillDefinition[];
    generalSkills: BuildSkillDefinition[];
    totalClassPoints: number;
    totalGeneralPoints: number;
    spentClassPoints: number;
    spentGeneralPoints: number;
    freeClassPoints: number;
    freeGeneralPoints: number;
}
export interface BuildConditionSnapshot {
    hpPct: number;
    staPct: number;
}
export interface BuildGameplayEffects {
    combatModifiers: BuildCombatModifierSet;
    travelStaminaCostMultiplier: number;
    travelTimeMultiplier: number;
    actionEnergyCostMultiplier: Record<'chop' | 'mine' | 'gather' | 'fish', number>;
    actionYieldMultiplier: Record<'chop' | 'mine' | 'gather' | 'fish', number>;
    passiveStaRegenBonus: number;
    counterAttackRatio: number;
}
export interface BuildRuntimeStatus {
    cooldownSeconds: number;
    castSeconds: number;
    activeSeconds: number;
}
export interface BuildSkillRow {
    skillKey: string;
    rank: number | bigint;
}
export interface BuildLoadoutRow {
    activeSlot1: string | null;
    activeSlot2: string | null;
    activeSlot3: string | null;
    keystoneKey: string | null;
}
export interface BuildEffectRow {
    id: number;
    playerId: number;
    skillKey: string;
    effectType: string;
    sourceFamily: string;
    rank: number | bigint;
    startsAt: Date | string;
    endsAt: Date | string;
}
export interface BuildCooldownRow {
    skillKey: string;
    readyAt: Date | string;
}
export interface BuildTelemetryRow {
    eventType: string;
    skillKey: string | null;
    count: number | bigint;
}
export declare const DEFAULT_EFFECTS: BuildGameplayEffects;
