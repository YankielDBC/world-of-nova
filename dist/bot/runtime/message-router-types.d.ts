import type { AnyCtx, PlayerTgId } from '../../types/runtime-contracts.js';
export interface MessageRouterDeps {
    getVentureState: (playerTgId: PlayerTgId) => Promise<any>;
    clearVentureState: (playerTgId: PlayerTgId) => Promise<void>;
    handleVentureCoords: (ctx: AnyCtx, coordsText: string) => Promise<void>;
    executeVenture: (ctx: AnyCtx, plan: any) => Promise<void>;
    getInspectState: (playerTgId: PlayerTgId) => Promise<any>;
    clearInspectState: (playerTgId: PlayerTgId) => Promise<void>;
    getPlayerByTelegramId: (tgId: string) => Promise<any>;
    parseNodeIndex: (text: string) => number | null;
    getInspectNodesForPlayer: (playerTgId: string) => Promise<any>;
    setInspectState: (playerTgId: PlayerTgId, state: any) => Promise<void>;
    parsePositiveInt: (text: string) => number | null;
    sleep: (ms: number) => Promise<any>;
    playerActionQueue: {
        enqueueForKey: <T>(key: string, taskId: string, fn: () => Promise<T>) => Promise<T>;
    };
    executeInspectAction: (params: {
        playerTgId: string;
        action: any;
        listIndex: number;
        quantity: number;
    }) => Promise<{
        message: string;
    }>;
    t3: (lang: string, es: string, en: string, ru: string) => string;
    getPlayerLanguage: (player?: {
        language?: string | null;
    }) => any;
    buildInspectResultKeyboard: (lang: any) => any;
    notifyLowVitalsIfNeeded: (ctx: AnyCtx, tgId: string) => Promise<void>;
    getBagState: (playerTgId: PlayerTgId) => Promise<any>;
    clearBagState: (playerTgId: PlayerTgId) => Promise<void>;
    getActiveBagView: (playerId: number, lang: any) => Promise<any>;
    setBagState: (playerTgId: PlayerTgId, state: any) => Promise<void>;
    EMOJIS: any;
    useBagSlot: (playerId: number, slotIndex: number, qty: number) => Promise<{
        success: boolean;
        message: string;
    }>;
    dropBagSlot: (playerId: number, slotIndex: number, qty: number) => Promise<{
        success: boolean;
        message: string;
    }>;
    renderBagResponse: (ctx: AnyCtx, mode?: 'reply' | 'edit') => Promise<void>;
    executeBagSwitch: (playerId: number, targetBagId: number | 'pockets') => Promise<{
        success: boolean;
        message: string;
    }>;
    openCoordinateInteractionByIndex: (ctx: AnyCtx, index: number, mode: 'reply' | 'edit') => Promise<boolean>;
    bankModule: {
        handleMessage: (ctx: AnyCtx, text: string) => Promise<boolean>;
    };
    marketModule: {
        handleMessage: (ctx: AnyCtx, text: string) => Promise<boolean>;
    };
    mysteryMerchantModule: {
        handleMessage: (ctx: AnyCtx, text: string) => Promise<boolean>;
    };
    forgeModule: {
        handleMessage: (ctx: AnyCtx, text: string) => Promise<boolean>;
    };
    equipToolByAlias: (playerId: number, alias: string) => Promise<{
        success: boolean;
        message: string;
    }>;
    openBagItemInfoByUid: (ctx: AnyCtx, playerId: number, slotUid: number, mode?: 'reply' | 'edit') => Promise<any>;
    unequipToolByAlias: (playerId: number, alias: string) => Promise<{
        success: boolean;
        message: string;
    }>;
    unequipEquipmentByAlias: (playerId: number, alias: string) => Promise<{
        success: boolean;
        message: string;
    }>;
    registrationModule: {
        handleMessage: (ctx: AnyCtx) => Promise<boolean>;
    };
}
export type MessageHandler = (ctx: AnyCtx, text: string, deps: MessageRouterDeps) => Promise<boolean>;
