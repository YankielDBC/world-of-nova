export declare function getToolMeta(toolKey: any): any;
export declare function getToolWeight(toolKey: any): any;
export declare function toStrikeText(text: any): any;
export declare function getToolEquipSlot(toolKey: any): "mineToolId" | "gatherToolId" | "chopToolId";
export declare function getRarityCode(rarity: any): "U" | "R" | "E" | "L" | "C";
export declare function getEffectiveStackLimit(definition: any, resource: any): number;
export declare function getFirstFreeSlotIndexes(capacity: any, usedIndexes: any, count: any): any[];
export declare function buildCapacityReason(weightExceeded: any, slotExceeded: any, details: any): string;
