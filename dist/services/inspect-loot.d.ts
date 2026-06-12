export declare function rollNodeLoot(yields: any, repeats: any): any[];
export declare function applyLootMultiplier(loot: any, multiplier: any): any;
export declare function applyNodeHarvest(tileId: any, nodeId: any, quantityUsed: any): Promise<{
    recoveredInMs: any;
}>;
export declare function restoreTakenGroundLoot(tileId: any, loot: any): Promise<void>;
export declare function executeGroundLootPickup(params: any): Promise<{
    success: boolean;
    message: string;
    tileId?: undefined;
} | {
    success: boolean;
    message: string;
    tileId: any;
}>;
