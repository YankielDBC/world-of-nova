import { type GroundLootEntry } from '../lib/tile-state.js';
import type { InspectActionResult, InspectNodeView, ParsedYield } from './inspect-types.js';
export declare function rollNodeLoot(yields: ParsedYield[], repeats: number): Array<{
    item: string;
    emoji: string;
    quantity: number;
}>;
export declare function applyLootMultiplier(loot: Array<{
    item: string;
    emoji: string;
    quantity: number;
}>, multiplier: number): Array<{
    item: string;
    emoji: string;
    quantity: number;
}>;
export declare function applyNodeHarvest(tileId: number, nodeId: number, quantityUsed: number): Promise<{
    recoveredInMs: number;
}>;
export declare function restoreTakenGroundLoot(tileId: number, loot: GroundLootEntry): Promise<void>;
export declare function executeGroundLootPickup(params: {
    tileId: number;
    playerId: number;
    selected: InspectNodeView;
    quantity: number;
}): Promise<InspectActionResult>;
