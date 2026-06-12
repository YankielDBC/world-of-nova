export declare function createForgeModule(): {
    handleCallback: (ctx: any, callbackData: any) => Promise<boolean>;
    handleMessage: (ctx: any, text: any) => Promise<boolean>;
};
