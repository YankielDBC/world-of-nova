export declare function createRegistrationModule(): {
    handleStartCommand: (ctx: any) => Promise<void>;
    handleCallback: (ctx: any, callbackData: string) => Promise<boolean>;
    handleMessage: (ctx: any) => Promise<boolean>;
};
