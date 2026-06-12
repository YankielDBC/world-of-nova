export declare function createPlaceModule(deps: any): {
    handlePlaceEntry: (ctx: any) => Promise<void>;
    handlePlaceBuilding: (ctx: any, placeId: any, buildingKey: any) => Promise<void>;
    handlePlaceExit: (ctx: any) => Promise<void>;
};
