export declare function createForgeModule(): {
    handleCallback: (ctx: any, callbackData: string) => Promise<boolean>;
    handleMessage: (ctx: any, text: string) => Promise<boolean>;
};
