export declare function createMysteryMerchantModule(): {
    handleCallback: (ctx: any, callbackData: any) => Promise<boolean>;
    handleMessage: (ctx: any, text: any) => Promise<boolean>;
    openByCommand: (ctx: any) => Promise<void>;
};
