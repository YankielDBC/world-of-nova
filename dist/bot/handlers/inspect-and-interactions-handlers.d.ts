import { InlineKeyboard } from 'grammy';
import type { AnyCtx, CreatureId, PlayerTgId } from '../../types/runtime-contracts.js';
interface InspectAndInteractionsDeps {
    t: (lang: string, key: string, params?: Record<string, unknown>) => string;
    t3: (lang: string, es: string, en: string, ru: string) => string;
    getPlayerByTelegramId: (tgId: string) => Promise<any>;
    getPlayerLanguage: (player?: {
        language?: string | null;
    }) => string;
    renderInspectForPlayer: (tgId: string) => Promise<any>;
    getActivePlaceRecoveryByTgId: (tgId: string) => Promise<any>;
    getRecoveryRemainingSeconds: (active: any) => number;
    formatRemainingTime: (seconds: number) => string;
    getRecoveryFocusLabel: (slug: string, lang: string) => string;
    clearInspectState: (playerTgId: PlayerTgId) => Promise<void>;
    setInspectState: (playerTgId: PlayerTgId, state: unknown) => Promise<void>;
    clearCallbackKeyboard: (ctx: AnyCtx) => Promise<void>;
    getCanonicalWorldMap: () => Promise<{
        id: number;
    }>;
    getOrCreateTile: (worldMapId: number, x: number, y: number) => Promise<any>;
    getMerchantSnapshotAtCoords: (params: {
        worldMapId: number;
        x: number;
        y: number;
    }) => Promise<any>;
    getTilePopulationAtCoords: (params: {
        currentPlayerId: number;
        x: number;
        y: number;
    }) => Promise<{
        active: number;
        afk: number;
    }>;
    getCreatureSnapshotsAtCoords: (params: {
        worldMapId: number;
        x: number;
        y: number;
        biomeName: string;
        biomeId: number | null;
        includeDead: boolean;
    }) => Promise<any[]>;
    openMysteryMerchantByCallback: (ctx: AnyCtx) => Promise<any>;
    openMysteryMerchantByCommand: (ctx: AnyCtx) => Promise<any>;
    openPveScout: (ctx: AnyCtx, creature: any, mode: 'reply' | 'edit') => Promise<any>;
    safeAnswerCallbackQuery: (ctx: AnyCtx, text?: string) => Promise<void>;
    openMapInCurrentMessage: (ctx: AnyCtx, tgId: string) => Promise<void>;
    getInspectNodesForPlayer: (tgId: string) => Promise<{
        nodes: any[];
    } | null>;
    playerActionQueue: {
        enqueueForKey: <T>(key: string, op: string, fn: () => Promise<T>) => Promise<T>;
    };
    executeInspectAction: (params: {
        playerTgId: string;
        action: any;
        listIndex: number;
        quantity: number;
    }) => Promise<any>;
    notifyLowVitalsIfNeeded: (ctx: AnyCtx, tgId: string) => Promise<void>;
}
export declare function createInspectAndInteractionsHandlers(deps: InspectAndInteractionsDeps): {
    renderInspectResponse: (ctx: AnyCtx, mode?: "reply" | "edit") => Promise<void>;
    handleInspectFromMap: (ctx: AnyCtx) => Promise<void>;
    buildInspectResultKeyboard: (lang?: string) => InlineKeyboard;
    renderCoordinateInteractions: (ctx: AnyCtx, mode: "reply" | "edit") => Promise<void>;
    openCoordinateInteractionByIndex: (ctx: AnyCtx, listIndex: number, mode: "reply" | "edit") => Promise<any>;
    handleCreatureDefeat: (ctx: AnyCtx, creatureId: CreatureId) => Promise<void>;
    showResultMapDecision: (ctx: AnyCtx, tgId: string) => Promise<void>;
    startInspectActionFlow: (ctx: AnyCtx, action: string) => Promise<void>;
    handleInspectNodePick: (ctx: AnyCtx, action: string, nodeIndex: number) => Promise<void>;
    handleInspectQtyPick: (ctx: AnyCtx, action: string, nodeIndex: number, quantity: number) => Promise<void>;
};
export {};
