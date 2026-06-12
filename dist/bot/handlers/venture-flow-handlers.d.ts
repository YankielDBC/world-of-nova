import { type Bot } from 'grammy';
type AnyCtx = any;
interface Coord {
    x: number;
    y: number;
}
interface VenturePlan {
    targetX: number;
    targetY: number;
    totalEnergy: number;
    totalSeconds: number;
}
interface VentureFlowHandlersDeps {
    bot: Bot;
    dbBatchSize: number;
    travelArrivalBufferSeconds: number;
    setVentureState: (playerTgId: string, state: any) => Promise<void>;
    clearVentureState: (playerTgId: string) => Promise<void>;
    getPlayerByTelegramId: (tgId: string) => Promise<any>;
    getPlayerLanguage: (player?: {
        language?: string | null;
    }) => string;
    getCanonicalWorldMap: () => Promise<{
        id: number;
    }>;
    getGameplayEffectsForPlayer: (playerId: number) => Promise<{
        travelStaminaCostMultiplier: number;
        travelTimeMultiplier: number;
    }>;
    ensureTilesGeneratedForCoords: (worldMapId: number, coords: Coord[]) => Promise<void>;
    getOrCreateTile: (worldMapId: number, x: number, y: number) => Promise<any>;
    hasPendingTravelJob: (tgId: string) => Promise<boolean>;
    enqueueVentureArrivalJob: (params: any, delaySeconds: number) => Promise<void>;
    startTravelCountdownAnimation: (bot: Bot, params: {
        chatId: number;
        messageId: number;
        baseText: string;
        totalSeconds: number;
        etaLabel: string;
    }) => void;
    t3: (lang: string, es: string, en: string, ru: string) => string;
}
export declare function createVentureFlowHandlers(deps: VentureFlowHandlersDeps): {
    startVentureFlow: (ctx: AnyCtx) => Promise<void>;
    handleVentureCoords: (ctx: AnyCtx, coordsText: string) => Promise<void>;
    executeVenture: (ctx: AnyCtx, plan: VenturePlan) => Promise<void>;
};
export {};
