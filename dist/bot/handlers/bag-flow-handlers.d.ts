import { InlineKeyboard } from 'grammy';
import type { AnyCtx, BagSlotUid, LanguageLike, PlayerTgId } from '../../types/runtime-contracts.js';
import type { BagItemInfo, BagRenderData, BagSwitchOption } from '../../services/bags-types.js';
interface BagFlowHandlersDeps {
    getPlayerByTelegramId: (tgId: string) => Promise<any>;
    ensurePlayerBagSetup: (playerId: number) => Promise<void>;
    getPlayerLanguage: (player?: {
        language?: string | null;
    }) => LanguageLike;
    getActiveBagView: (playerId: number, lang?: LanguageLike) => Promise<BagRenderData>;
    getActiveBagItemInfoByUid: (playerId: number, slotUid: BagSlotUid) => Promise<BagItemInfo | null>;
    setBagState: (playerTgId: PlayerTgId, state: unknown) => Promise<void>;
    listBagSwitchOptions: (playerId: number) => Promise<BagSwitchOption[]>;
    clearCallbackKeyboard: (ctx: AnyCtx) => Promise<void>;
    t: (lang: string, key: string, params?: Record<string, unknown>) => string;
}
declare function parsePositiveInt(text: string): number | null;
declare function parseNodeIndex(text: string): number | null;
declare function buildBagItemActionConfirmText(item: BagItemInfo, action: 'use' | 'drop'): string;
declare function buildBagItemActionConfirmKeyboard(action: 'use' | 'drop', slotUid: BagSlotUid): InlineKeyboard;
export declare function createBagFlowHandlers(deps: BagFlowHandlersDeps): {
    parsePositiveInt: typeof parsePositiveInt;
    parseNodeIndex: typeof parseNodeIndex;
    renderBagResponse: (ctx: AnyCtx, mode?: "reply" | "edit") => Promise<void>;
    buildBagItemActionConfirmText: typeof buildBagItemActionConfirmText;
    buildBagItemActionConfirmKeyboard: typeof buildBagItemActionConfirmKeyboard;
    openBagItemInfoByUid: (ctx: AnyCtx, playerId: number, slotUid: BagSlotUid, mode?: "reply" | "edit") => Promise<boolean>;
    startGrabFlow: (ctx: AnyCtx) => Promise<void>;
    startDropFlow: (ctx: AnyCtx) => Promise<void>;
    startSwitchFlow: (ctx: AnyCtx) => Promise<void>;
};
export {};
