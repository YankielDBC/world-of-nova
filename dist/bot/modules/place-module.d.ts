export declare function createPlaceModule(deps: {
    openBankHub: (ctx: any, params: {
        mode: 'reply' | 'edit';
        placeId: number;
        buildingKey: string;
        infoLine?: string;
    }) => Promise<void>;
    openMarketHub: (ctx: any, params: {
        mode: 'reply' | 'edit';
        placeId: number;
        buildingKey: string;
        infoLine?: string;
    }) => Promise<void>;
}): {
    handlePlaceEntry: (ctx: any) => Promise<void>;
    handlePlaceBuilding: (ctx: any, placeId: number, buildingKey: string) => Promise<void>;
    handlePlaceExit: (ctx: any) => Promise<void>;
};
