export declare function createMysteryMerchantModule(): {
    handleCallback: (ctx: any, callbackData: string) => Promise<boolean>;
    handleMessage: (ctx: any, text: string) => Promise<boolean>;
    openByCommand: (ctx: any) => Promise<void>;
};
