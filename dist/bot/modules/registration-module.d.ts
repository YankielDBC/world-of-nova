export declare function createRegistrationModule(): {
    handleStartCommand: (ctx: any) => Promise<void>;
    handleCallback: (ctx: any, callbackData: any) => Promise<boolean>;
    handleMessage: (ctx: any) => Promise<boolean>;
};
