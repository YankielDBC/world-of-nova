import { type BagDefinition, type Resource } from '@prisma/client';
export declare function getToolMeta(toolKey?: string | null): import("../types/tools.js").Tool | null;
export declare function getToolWeight(toolKey?: string | null): number;
export declare function toStrikeText(text: string): string;
export declare function getToolEquipSlot(toolKey?: string | null): 'chopToolId' | 'mineToolId' | 'gatherToolId' | null;
export declare function getRarityCode(rarity?: string | null): string;
export declare function getEffectiveStackLimit(definition: BagDefinition, resource: Resource): number;
export declare function getFirstFreeSlotIndexes(capacity: number, usedIndexes: number[], count: number): number[];
export declare function buildCapacityReason(weightExceeded: boolean, slotExceeded: boolean, details: {
    weightNeeded: number;
    weightCapacity: number;
    slotsNeeded: number;
    slotCapacity: number;
}): string;
