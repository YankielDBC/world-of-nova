import type { InlineKeyboard } from 'grammy';
import type { Language } from '../../lib/i18n.js';
import type { InspectActionType } from '../../services/inspect-types.js';
import type { AnyCtx, BagSlotUid, CreatureId, PlayerTgId } from '../../types/runtime-contracts.js';
export interface CallbackRouterDeps {
    registrationModule: {
        handleCallback: (ctx: AnyCtx, callbackData: string) => Promise<boolean>;
    };
    placeModule: {
        handlePlaceBuilding: (ctx: AnyCtx, placeId: number, buildingKey: string) => Promise<void>;
        handlePlaceEntry: (ctx: AnyCtx) => Promise<void>;
        handlePlaceExit: (ctx: AnyCtx) => Promise<void>;
    };
    bankModule: {
        handleCallback: (ctx: AnyCtx, callbackData: string) => Promise<boolean>;
    };
    marketModule: {
        handleCallback: (ctx: AnyCtx, callbackData: string) => Promise<boolean>;
    };
    forgeModule: {
        handleCallback: (ctx: AnyCtx, callbackData: string) => Promise<boolean>;
    };
    mysteryMerchantModule: {
        handleCallback: (ctx: AnyCtx, callbackData: string) => Promise<boolean>;
    };
    pveModule: {
        handleCallback: (ctx: AnyCtx, callbackData: string) => Promise<boolean>;
    };
    buildModule: {
        handleCallback: (ctx: AnyCtx, callbackData: string) => Promise<boolean>;
    };
    racialModule: {
        handleCallback: (ctx: AnyCtx, callbackData: string) => Promise<boolean>;
    };
    updatePlayerLanguage: (tgId: string, lang: Language) => Promise<any>;
    t: (lang: any, key: any) => string;
    t3: (lang: string, es: string, en: string, ru: string) => string;
    SUPPORTED_LANGUAGES: Record<string, {
        flag: string;
    }>;
    getPlayerByTelegramId: (tgId: string) => Promise<any>;
    getPlayerLanguage: (player?: {
        language?: string | null;
    }) => Language;
    safeAnswerCallbackQuery: (ctx: AnyCtx, text?: string) => Promise<void>;
    clearCallbackKeyboard: (ctx: AnyCtx) => Promise<void>;
    getVentureState: (playerTgId: PlayerTgId) => Promise<any>;
    clearVentureState: (playerTgId: PlayerTgId) => Promise<void>;
    executeVenture: (ctx: AnyCtx, plan: any) => Promise<void>;
    handleProfile: (ctx: AnyCtx) => Promise<void>;
    handleLanguageChange: (ctx: AnyCtx) => Promise<void>;
    handleCustomRecoveryService: (ctx: AnyCtx, placeId: number, buildingKey: string, serviceSlug: string) => Promise<void>;
    handlePlaceInteraction: (ctx: AnyCtx, interactionId: number) => Promise<void>;
    handleMapMove: (ctx: AnyCtx, direction: 'up' | 'down' | 'left' | 'right') => Promise<void>;
    handleGhostHint: (ctx: AnyCtx) => Promise<void>;
    handleGhostRecover: (ctx: AnyCtx) => Promise<void>;
    renderBagResponse: (ctx: AnyCtx, mode: 'reply' | 'edit') => Promise<void>;
    startGrabFlow: (ctx: AnyCtx) => Promise<void>;
    startDropFlow: (ctx: AnyCtx) => Promise<void>;
    startSwitchFlow: (ctx: AnyCtx) => Promise<void>;
    openMapInCurrentMessage: (ctx: AnyCtx, tgId: string) => Promise<void>;
    exitActiveCaveForTgId: (tgId: string) => Promise<{
        success: boolean;
    } | {
        success: boolean;
        place?: any;
        message?: string;
    }>;
    getActiveBagItemInfoByUid: (playerId: number, slotUid: BagSlotUid) => Promise<any>;
    buildBagItemActionConfirmText: (item: any, action: 'use' | 'drop') => string;
    buildBagItemActionConfirmKeyboard: (action: 'use' | 'drop', slotUid: BagSlotUid) => InlineKeyboard;
    useBagSlot: (playerId: number, slotIndex: number, quantity: number) => Promise<{
        success: boolean;
        message: string;
    }>;
    dropBagSlot: (playerId: number, slotIndex: number, quantity: number) => Promise<{
        success: boolean;
        message: string;
    }>;
    openBagItemInfoByUid: (ctx: AnyCtx, playerId: number, slotUid: BagSlotUid, mode?: 'reply' | 'edit') => Promise<any>;
    equipToolFromBagItem: (playerId: number, slotUid: BagSlotUid) => Promise<{
        success: boolean;
        message: string;
    }>;
    previewBagSwitch: (playerId: number, targetBagId: number | 'pockets') => Promise<any>;
    setBagState: (playerTgId: PlayerTgId, state: any) => Promise<void>;
    executeBagSwitch: (playerId: number, targetBagId: number | 'pockets') => Promise<{
        success: boolean;
        message: string;
    }>;
    clearBagState: (playerTgId: PlayerTgId) => Promise<void>;
    handleInspectFromMap: (ctx: AnyCtx) => Promise<void>;
    getActivePlaceRecoveryByTgId: (tgId: string) => Promise<any>;
    hasActivePlaceRecovery: (tgId: string) => Promise<boolean>;
    finalizeActiveRecovery: (params: {
        tgId: string;
        interrupted: boolean;
        editCtx?: AnyCtx;
    }) => Promise<any>;
    startInspectActionFlow: (ctx: AnyCtx, action: InspectActionType) => Promise<void>;
    clearInspectState: (playerTgId: PlayerTgId) => Promise<void>;
    renderInspectResponse: (ctx: AnyCtx, mode: 'reply' | 'edit') => Promise<void>;
    showResultMapDecision: (ctx: AnyCtx, tgId: string) => Promise<void>;
    handleInspectNodePick: (ctx: AnyCtx, action: InspectActionType, nodeIndex: number) => Promise<void>;
    handleInspectQtyPick: (ctx: AnyCtx, action: InspectActionType, nodeIndex: number, quantity: number) => Promise<void>;
    startVentureFlow: (ctx: AnyCtx) => Promise<void>;
    renderCoordinateInteractions: (ctx: AnyCtx, mode: 'reply' | 'edit') => Promise<void>;
    openCoordinateInteractionByIndex: (ctx: AnyCtx, listIndex: number, mode: 'reply' | 'edit') => Promise<boolean>;
    handleCreatureDefeat: (ctx: AnyCtx, creatureId: CreatureId) => Promise<void>;
}
export type CallbackHandler = (ctx: AnyCtx, callbackData: string, deps: CallbackRouterDeps) => Promise<boolean>;
