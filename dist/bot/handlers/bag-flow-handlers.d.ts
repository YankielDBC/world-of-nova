import { InlineKeyboard } from 'grammy';
declare function parsePositiveInt(text: any): number;
declare function parseNodeIndex(text: any): number;
declare function buildBagItemActionConfirmText(item: any, action: any): string;
declare function buildBagItemActionConfirmKeyboard(action: any, slotUid: any): InlineKeyboard;
export declare function createBagFlowHandlers(deps: any): {
    parsePositiveInt: typeof parsePositiveInt;
    parseNodeIndex: typeof parseNodeIndex;
    renderBagResponse: (ctx: any, mode?: string) => Promise<void>;
    buildBagItemActionConfirmText: typeof buildBagItemActionConfirmText;
    buildBagItemActionConfirmKeyboard: typeof buildBagItemActionConfirmKeyboard;
    openBagItemInfoByUid: (ctx: any, playerId: any, slotUid: any, mode?: string) => Promise<boolean>;
    startGrabFlow: (ctx: any) => Promise<void>;
    startDropFlow: (ctx: any) => Promise<void>;
    startSwitchFlow: (ctx: any) => Promise<void>;
};
export {};
