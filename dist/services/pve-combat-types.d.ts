import type { CombatContextModifiers } from '../lib/db.js';
import type { CreatureSnapshot } from './creatures.js';
import type { CreatureDefeatSuccess } from './creature-defeat.js';
export type EnemyIntentKey = 'strike' | 'heavy' | 'arcane' | 'guarded' | 'rush';
export interface EncounterRow {
    playerId: number | bigint;
    creatureId: number | bigint;
    worldMapId: number | bigint;
    tileX: number | bigint;
    tileY: number | bigint;
    creatureJson: string;
    creatureCurrentHp: number | bigint;
    turnNumber: number | bigint;
    enemyIntentJson: string;
    playerEffectsJson: string;
    enemyEffectsJson: string;
    cooldownsJson: string;
    logJson: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}
export interface EncounterPlayerEffect {
    key: string;
    label: string;
    source: 'build_active' | 'build_reaction' | 'racial_active' | 'guard';
    remainingTurns: number;
    modifiers?: CombatContextModifiers;
    counterAttackRatio?: number;
    damageReductionPct?: number;
}
export interface EncounterEnemyEffect {
    key: string;
    label: string;
    remainingTurns: number;
    modifiers?: CombatContextModifiers;
}
export type EncounterCooldownMap = Record<string, number>;
export interface EncounterEnemyIntent {
    key: EnemyIntentKey;
    label: string;
    hint: string;
}
export interface PveEncounterState {
    playerId: number;
    creatureId: number;
    worldMapId: number;
    x: number;
    y: number;
    creature: CreatureSnapshot;
    creatureCurrentHp: number;
    turnNumber: number;
    enemyIntent: EncounterEnemyIntent;
    playerEffects: EncounterPlayerEffect[];
    enemyEffects: EncounterEnemyEffect[];
    cooldowns: EncounterCooldownMap;
    log: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface EnemyCombatSnapshot {
    attack: number;
    arcanePower: number;
    defense: number;
    critChance: number;
    evasion: number;
    moveSpeed: number;
}
export interface PlayerCombatView {
    currentHp: number;
    currentSta: number;
    maxHp: number;
    maxSta: number;
    attack: number;
    arcanePower: number;
    defense: number;
    critChance: number;
    evasion: number;
    moveSpeed: number;
    baseDamage: number;
    resistPhysical: number;
    resistArcane: number;
}
export interface CombatAbilityChoice {
    key: string;
    label: string;
    shortSummary: string;
    cooldownTurns: number;
    staminaCost: number;
    ready: boolean;
    kind: 'build' | 'racial';
    slotLabel: string;
}
export interface PveEncounterView {
    state: PveEncounterState;
    playerName: string;
    playerClass: string | null;
    playerRace: string | null;
    player: PlayerCombatView;
    enemy: EnemyCombatSnapshot & {
        displayName: string;
        category: string;
        level: number;
        currentHp: number;
        maxHp: number;
        biomeName: string;
    };
    buildChoices: CombatAbilityChoice[];
    racialChoices: CombatAbilityChoice[];
    reactionLines: string[];
    playerEffectLabels: string[];
    enemyEffectLabels: string[];
}
export type PveActionRequest = {
    kind: 'attack';
} | {
    kind: 'guard';
} | {
    kind: 'flee';
} | {
    kind: 'build_skill';
    key: string;
} | {
    kind: 'racial_skill';
    key: string;
};
export type PveActionResult = {
    success: false;
    message: string;
} | {
    success: true;
    outcome: 'active';
    notice?: string;
} | {
    success: true;
    outcome: 'victory';
    text: string;
    reward: CreatureDefeatSuccess;
} | {
    success: true;
    outcome: 'defeat';
    text: string;
} | {
    success: true;
    outcome: 'fled';
    text: string;
};
