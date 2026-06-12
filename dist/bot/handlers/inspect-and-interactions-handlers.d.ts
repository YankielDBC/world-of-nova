import { InlineKeyboard } from 'grammy';
export declare function createInspectAndInteractionsHandlers(deps: any): {
    renderInspectResponse: (ctx: any, mode?: string) => Promise<void>;
    handleInspectFromMap: (ctx: any) => Promise<void>;
    buildInspectResultKeyboard: (lang?: string) => InlineKeyboard;
    renderCoordinateInteractions: (ctx: any, mode: any) => Promise<void>;
    openCoordinateInteractionByIndex: (ctx: any, listIndex: any, mode: any) => Promise<any>;
    handleCreatureDefeat: (ctx: any, creatureId: any) => Promise<void>;
    showResultMapDecision: (ctx: any, tgId: any) => Promise<void>;
    startInspectActionFlow: (ctx: any, action: any) => Promise<void>;
    handleInspectNodePick: (ctx: any, action: any, nodeIndex: any) => Promise<void>;
    handleInspectQtyPick: (ctx: any, action: any, nodeIndex: any, quantity: any) => Promise<void>;
};
