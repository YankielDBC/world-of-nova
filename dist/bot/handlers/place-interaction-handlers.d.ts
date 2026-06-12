export declare function createPlaceInteractionHandlers(deps: any): {
    finalizeActiveRecovery: (params: any) => Promise<void>;
    startPlaceRecovery: (params: any) => Promise<boolean>;
    handleCustomRecoveryService: (ctx: any, placeId: any, buildingKey: any, serviceSlug: any) => Promise<void>;
    handlePlaceInteraction: (ctx: any, interactionId: any) => Promise<void>;
};
