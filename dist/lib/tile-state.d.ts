export declare function readTileResourceState(rawJson: any): {
    version: number;
    nodes: any[];
    groundLoot: any[];
    generatedPeriodKey: any;
};
export declare function serializeTileResourceState(state: any): string;
export declare function applyNodeCooldownRecovery(nodes: any, nowMs?: number): {
    nodes: any;
    changed: boolean;
};
export declare function applyHarvestCooldown(node: any, quantityUsed: any, nowMs?: number): {
    updatedNode: any;
    recoveredInMs: number;
};
export declare function addGroundLootEntry(state: any, entry: any): {
    state: any;
    created: any;
};
export declare function takeGroundLootQuantity(state: any, lootId: any, quantity: any): {
    state: any;
    taken: any;
};
