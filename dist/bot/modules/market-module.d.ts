export declare function createMarketModule(): {
    openHub: (ctx: any, params: {
        mode: "reply" | "edit";
        placeId: number;
        buildingKey: string;
        infoLine?: string;
    }) => Promise<void>;
    handleCallback: (ctx: any, callbackData: string) => Promise<boolean>;
    handleMessage: (ctx: any, text: string) => Promise<boolean>;
};
