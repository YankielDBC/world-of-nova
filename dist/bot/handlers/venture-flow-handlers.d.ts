export declare function createVentureFlowHandlers(deps: any): {
    startVentureFlow: (ctx: any) => Promise<void>;
    handleVentureCoords: (ctx: any, coordsText: any) => Promise<void>;
    executeVenture: (ctx: any, plan: any) => Promise<void>;
};
