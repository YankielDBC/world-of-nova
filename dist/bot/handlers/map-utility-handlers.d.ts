import { type Bot } from 'grammy';
import type { Language } from '../../lib/i18n.js';
type AnyCtx = any;
interface OpenMapDeps {
    renderMap: (tgId: string) => Promise<any>;
    getPlayerByTelegramId: (tgId: string) => Promise<any>;
    getPlayerLanguage: (player?: {
        language?: string | null;
    }) => Language;
    renderMapCardText: (mapResult: any, lang: Language) => string;
    sendMapCardSafeViaContext: (params: {
        ctx: AnyCtx;
        mode: 'reply' | 'edit';
        text: string;
        keyboard: any;
        source: string;
    }) => Promise<void>;
}
interface GhostHandlerDeps {
    getGhostHintText: (tgId: string) => Promise<string | null>;
    recoverOwnCorpse: (tgId: string) => Promise<{
        success: boolean;
        message: string;
    }>;
    getPlayerByTelegramId: (tgId: string) => Promise<any>;
    getPlayerLanguage: (player?: {
        language?: string | null;
    }) => Language;
    t: (lang: Language, key: any) => string;
    safeAnswerCallbackQuery: (ctx: AnyCtx, text?: string) => Promise<void>;
}
interface MapMoveResult {
    success: boolean;
    message: string;
    travelTime: number;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    energyCost: number;
    isNewDiscovery: boolean;
    arrivalMessage?: string;
    placeArrival?: {
        name: string;
        emoji: string;
        buildings: string[];
    };
}
interface MapMoveDeps {
    getPlayerByTelegramId: (tgId: string) => Promise<any>;
    getPlayerLanguage: (player?: {
        language?: string | null;
    }) => Language;
    t: (lang: Language, key: any) => string;
    isPlayerGhostByTgId: (tgId: string) => Promise<boolean>;
    moveGhostPlayer: (tgId: string, direction: 'up' | 'down' | 'left' | 'right') => Promise<{
        success: boolean;
        message?: string;
    }>;
    openMapInCurrentMessage: (ctx: AnyCtx, tgId: string) => Promise<void>;
    getActiveCaveContextByTgId: (tgId: string) => Promise<unknown | null>;
    movePlayerInCave: (tgId: string, direction: 'up' | 'down' | 'left' | 'right') => Promise<{
        success: boolean;
        message: string;
    }>;
    hasPendingTravelJob: (tgId: string) => Promise<boolean>;
    safeAnswerCallbackQuery: (ctx: AnyCtx, text?: string) => Promise<void>;
    movePlayer: (tgId: string, direction: 'up' | 'down' | 'left' | 'right') => Promise<MapMoveResult>;
    buildCountdownMessage: (params: {
        baseText: string;
        remainingSeconds: number;
        totalSeconds: number;
        etaLabel: string;
    }) => string;
    enqueueMoveArrivalJob: (payload: {
        tgId: string;
        playerId: number;
        chatId: number;
        fromX: number;
        fromY: number;
        toX: number;
        toY: number;
        energyCost: number;
        isNewDiscovery: boolean;
        arrivalMessage?: string;
        placeArrival?: {
            name: string;
            emoji: string;
            buildings: string[];
        };
    }, delaySeconds: number) => Promise<void>;
    startTravelCountdownAnimation: (params: {
        chatId: number;
        messageId: number;
        baseText: string;
        totalSeconds: number;
        etaLabel: string;
    }) => void;
    travelArrivalBufferSeconds: number;
}
export declare function isExpiredCallbackQueryError(error: unknown): boolean;
export declare function createSafeAnswerCallbackQuery(logMapDebug: (event: string, payload?: unknown) => void): (ctx: AnyCtx, text?: string) => Promise<void>;
export declare function installSafeCallbackAnswerMiddleware(bot: Bot, logMapDebug: (event: string, payload?: unknown) => void): void;
export declare function createOpenMapInCurrentMessage(deps: OpenMapDeps): (ctx: AnyCtx, tgId: string) => Promise<void>;
export declare function createGhostHandlers(deps: GhostHandlerDeps): {
    handleGhostHint: (ctx: AnyCtx) => Promise<void>;
    handleGhostRecover: (ctx: AnyCtx) => Promise<void>;
};
export declare function createMapMoveHandler(deps: MapMoveDeps): (ctx: AnyCtx, direction: "up" | "down" | "left" | "right") => Promise<void>;
export {};
