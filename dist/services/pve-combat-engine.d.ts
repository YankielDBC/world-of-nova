import type { Language } from '../lib/i18n.js';
import { type BuildSkillDefinition, type SkillEventKey } from '../data/skill-trees.js';
import type { PlayerBuildSkillState } from './build-skills.js';
import type { PlayerRacialTalentState } from './racial-talents.js';
import { type RacialTalentDefinition } from '../data/racial-talents.js';
import type { EncounterCooldownMap, EncounterEnemyEffect, EncounterPlayerEffect, EnemyCombatSnapshot, PlayerCombatView, PveEncounterState, PveEncounterView } from './pve-combat-types.js';
export declare function buildEncounterLog(existing: string[], additions: string[]): string[];
export declare function getPvePressurePct(turnNumber: number): number;
export declare function tickPlayerEffects(effects: EncounterPlayerEffect[]): EncounterPlayerEffect[];
export declare function tickEnemyEffects(effects: EncounterEnemyEffect[]): EncounterEnemyEffect[];
export declare function tickCooldowns(cooldowns: EncounterCooldownMap): EncounterCooldownMap;
export declare function buildReactionConditionOk(event: SkillEventKey, def: BuildSkillDefinition, hpPct: number, staPct: number): boolean;
export declare function getBuildReactionDefs(state: PlayerBuildSkillState): BuildSkillDefinition[];
export declare function getBuildActiveDefs(state: PlayerBuildSkillState): BuildSkillDefinition[];
export declare function getRacialActiveDefs(state: PlayerRacialTalentState): RacialTalentDefinition[];
export declare function getBuildSkillStaminaCost(def: BuildSkillDefinition): number;
export declare function rollChance(pct: number): boolean;
export declare function buildAttackDamage(attacker: {
    attack: number;
    arcanePower: number;
    baseDamage?: number;
    critChance: number;
}, target: {
    defense: number;
    evasion: number;
}, options?: {
    physicalMultiplier?: number;
    arcaneMultiplier?: number;
    critBonusPct?: number;
    resistFlat?: number;
    accuracyBonusPct?: number;
    damageReductionPct?: number;
    damageBonusPct?: number;
    forceCritBlock?: boolean;
}): {
    damage: number;
    crit: boolean;
    evaded: boolean;
    blockedCrit: boolean;
};
export declare function formatDamageOutcome(params: {
    lang: Language;
    targetLabel: string;
    damage: number;
    crit: boolean;
    evaded: boolean;
    blockedCrit?: boolean;
}): string;
export declare function triggerLocalReactions(params: {
    lang: Language;
    buildState: PlayerBuildSkillState | null;
    hpPct: number;
    staPct: number;
    event: SkillEventKey;
    cooldowns: EncounterCooldownMap;
    playerEffects: EncounterPlayerEffect[];
}): Promise<{
    log: string[];
    playerEffects: EncounterPlayerEffect[];
    cooldowns: EncounterCooldownMap;
    counterAttackRatio: number;
}>;
export declare function updateEncounterCreature(state: PveEncounterState, nextHp: number): PveEncounterState;
export declare function buildCurrentPlayerStats(view: PveEncounterView, extraEffects: EncounterPlayerEffect[]): PlayerCombatView;
export declare function buildCurrentEnemyStats(view: PveEncounterView, extraEffects: EncounterEnemyEffect[]): EnemyCombatSnapshot;
