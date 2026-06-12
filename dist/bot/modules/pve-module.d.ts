export declare function createPveModule(): {
    openScout: (ctx: any, snapshot: any, mode: any) => Promise<void>;
    openByCommand: (ctx: any) => Promise<void>;
    openCombatForPlayer: (ctx: any, playerId: any, mode: any, infoLine: any) => Promise<void>;
    handleCallback: (ctx: any, callbackData: any) => Promise<boolean>;
    renderBlockedPrompt: (ctx: any) => Promise<boolean>;
};
