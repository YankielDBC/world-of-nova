export declare function getActiveBagWithSlotsForUpdate(playerId: any, tx: any): Promise<any>;
export declare function reserveResourceFromActiveBag(tx: any, playerId: any, resourceId: any, quantity: any): Promise<{
    success: boolean;
    message: string;
}>;
export declare function creditResourceToActiveBag(tx: any, playerId: any, resourceId: any, quantity: any): Promise<{
    success: boolean;
    message: string;
}>;
