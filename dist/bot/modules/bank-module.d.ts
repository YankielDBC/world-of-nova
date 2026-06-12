export declare function createBankModule(): {
    openHub: (ctx: any, params: any) => Promise<void>;
    handleCallback: (ctx: any, callbackData: any) => Promise<boolean>;
    handleMessage: (ctx: any, text: any) => Promise<boolean>;
};
