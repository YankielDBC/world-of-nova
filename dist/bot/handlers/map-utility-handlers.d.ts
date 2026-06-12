export declare function isExpiredCallbackQueryError(error: any): boolean;
export declare function createSafeAnswerCallbackQuery(logMapDebug: any): (ctx: any, text: any) => Promise<void>;
export declare function installSafeCallbackAnswerMiddleware(bot: any, logMapDebug: any): void;
export declare function createOpenMapInCurrentMessage(deps: any): (ctx: any, tgId: any) => Promise<void>;
export declare function createGhostHandlers(deps: any): {
    handleGhostHint: (ctx: any) => Promise<void>;
    handleGhostRecover: (ctx: any) => Promise<void>;
};
export declare function createMapMoveHandler(deps: any): (ctx: any, direction: any) => Promise<void>;
