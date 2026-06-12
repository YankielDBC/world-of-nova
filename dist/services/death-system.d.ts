import { InlineKeyboard } from 'grammy';
import type { Language } from '../lib/i18n.js';
import type { DeathTransitionResult } from './death-system-types.js';
export type { ActiveDeathState, CorpseSnapshotEntry, DeathTransitionResult, PlayerCorpseState, } from './death-system-types.js';
export { ensureDeathSystemSchema, getActiveCorpseById, getActiveCorpseForPlayer, getActiveDeathStateByPlayerId, getActiveDeathStateByTgId, isPlayerGhostByTgId, setSoulAnchorForPlayer, } from './death-system-state.js';
export declare function getNearestCemeteryCoords(x: number, y: number): {
    x: number;
    y: number;
    label: string;
    distance: number;
};
export declare function isNearCemetery(x: number, y: number, radius?: number): boolean;
export declare function killPlayerAndCreateCorpse(params: {
    playerId: number;
    tgId: string;
    worldMapId: number;
    deathX: number;
    deathY: number;
}): Promise<DeathTransitionResult>;
export declare function recoverOwnCorpse(tgId: string): Promise<{
    success: boolean;
    message: string;
}>;
export declare function moveGhostPlayer(tgId: string, direction: 'up' | 'down' | 'left' | 'right'): Promise<{
    success: boolean;
    message?: string;
}>;
export declare function renderGhostMap(tgId: string): Promise<{
    header: string;
    biomeName: string;
    grid: string;
    footer: string;
    keyboard: InlineKeyboard;
} | null>;
export declare function getGhostHintText(tgId: string): Promise<string | null>;
export declare function buildGhostBlockedText(tgId: string): Promise<string | null>;
export declare function getDeathSummaryForProfile(tgId: string): Promise<string | null>;
export declare function buildPveDeathCard(lang: Language, outcome: DeathTransitionResult, combatLog: string[]): string;
