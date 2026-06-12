type NodeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
type GroundLootKind = 'resource' | 'tool' | 'equipment' | 'bag';
export interface TileInspectNodeState {
    nodeId: number;
    nodeType: string;
    emoji: string;
    displayName: string;
    available: number;
    requiredTool: string | null;
    requiredLevel: number;
    rarity: NodeRarity;
    baseAvailable: number;
    pendingRestore: number;
    cooldownUntilMs: number | null;
    lastHarvestedAtMs: number | null;
}
export interface GroundLootEntry {
    id: string;
    kind: GroundLootKind;
    emoji: string;
    name: string;
    quantity: number;
    resourceName?: string;
    resourceId?: number;
    toolKey?: string;
    playerToolId?: number;
    equipmentInstanceId?: number;
    templateKey?: string;
    bagSlug?: string;
    droppedByPlayerId?: number;
    droppedAtMs: number;
}
export interface TileResourceState {
    version: 1;
    nodes: TileInspectNodeState[];
    groundLoot: GroundLootEntry[];
    generatedPeriodKey: string | null;
}
interface HarvestCooldownResult {
    updatedNode: TileInspectNodeState;
    recoveredInMs: number;
}
export declare function readTileResourceState(rawJson: string | null | undefined): TileResourceState;
export declare function serializeTileResourceState(state: TileResourceState): string;
export declare function applyNodeCooldownRecovery(nodes: TileInspectNodeState[], nowMs?: number): {
    nodes: TileInspectNodeState[];
    changed: boolean;
};
export declare function applyHarvestCooldown(node: TileInspectNodeState, quantityUsed: number, nowMs?: number): HarvestCooldownResult;
export declare function addGroundLootEntry(state: TileResourceState, entry: Omit<GroundLootEntry, 'id' | 'droppedAtMs'>): {
    state: {
        groundLoot: GroundLootEntry[];
        version: 1;
        nodes: TileInspectNodeState[];
        generatedPeriodKey: string | null;
    };
    created: GroundLootEntry;
};
export declare function takeGroundLootQuantity(state: TileResourceState, lootId: string, quantity: number): {
    state: TileResourceState;
    taken: GroundLootEntry | null;
};
export {};
