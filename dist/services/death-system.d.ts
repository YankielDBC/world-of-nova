import { InlineKeyboard } from 'grammy';
export { ensureDeathSystemSchema, getActiveCorpseById, getActiveCorpseForPlayer, getActiveDeathStateByPlayerId, getActiveDeathStateByTgId, isPlayerGhostByTgId, setSoulAnchorForPlayer, } from './death-system-state.js';
export declare function getNearestCemeteryCoords(x: any, y: any): {
    x: number;
    y: number;
    label: string;
    distance: number;
};
export declare function isNearCemetery(x: any, y: any, radius?: number): boolean;
export declare function killPlayerAndCreateCorpse(params: any): Promise<any>;
export declare function recoverOwnCorpse(tgId: any): Promise<any>;
export declare function moveGhostPlayer(tgId: any, direction: any): Promise<{
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
}>;
export declare function renderGhostMap(tgId: any): Promise<{
    header: any;
    biomeName: string;
    grid: string;
    footer: any;
    keyboard: InlineKeyboard;
}>;
export declare function getGhostHintText(tgId: any): Promise<any>;
export declare function buildGhostBlockedText(tgId: any): Promise<any>;
export declare function getDeathSummaryForProfile(tgId: any): Promise<string>;
export declare function buildPveDeathCard(lang: any, outcome: any, combatLog: any): string;
