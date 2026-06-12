import type { ActiveDeathState, CorpseRow, DeathStateRow, PlayerCorpseState } from './death-system-types.js';
export declare function ensureDeathSystemSchema(): Promise<void>;
export declare function setSoulAnchorForPlayer(params: {
    playerId: number;
    worldMapId: number;
    mapX: number;
    mapY: number;
    placeId?: number | null;
    placeLabel?: string | null;
    sourceSlug?: string | null;
}): Promise<void>;
export declare function mapDeathStateRow(row: DeathStateRow): ActiveDeathState;
export declare function mapCorpseRow(row: CorpseRow): PlayerCorpseState;
export declare function getActiveDeathStateByPlayerId(playerId: number): Promise<ActiveDeathState | null>;
export declare function getActiveDeathStateByTgId(tgId: string): Promise<ActiveDeathState | null>;
export declare function isPlayerGhostByTgId(tgId: string): Promise<boolean>;
export declare function getActiveCorpseById(corpseId: number): Promise<PlayerCorpseState | null>;
export declare function getActiveCorpseForPlayer(playerId: number): Promise<PlayerCorpseState | null>;
