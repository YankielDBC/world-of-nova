export declare function toRarityCode(rarity: any): "U" | "R" | "E" | "L" | "C";
export declare function randomInt(min: any, max: any): any;
export declare function deterministicRandom(seed: any): number;
export declare function parseYields(rawJson: any): {
    resource: string;
    emoji: string;
    minQty: number;
    maxQty: number;
    chance: number;
    rarity: string;
}[];
export declare function filterYieldsByPeriod(yields: any, biomeName: any, period: any): any;
export declare function getNodeDominantRarity(yields: any): string;
export declare function getVisibleCountRange(spawnChance: any): {
    min: number;
    max: number;
};
export declare function detectActionFromTool(requiredTool: any, nodeType: any): "gather" | "chop" | "mine";
export declare function getDayActionKey(action: any, nodeType: any): any;
export declare function isFishingNodeType(nodeType: any): any;
export declare function getRecoveryHint(recoveredInMs: any): string;
export declare function normalizeRejectedReason(reason: any): any;
export declare function canRefreshNodesOnPeriodShift(nodes: any): any;
export declare function getEnergyCostPerAction(action: any, rarity: any, requiredLevel: any): number;
export declare function getDurabilityDamage(requiredLevel: any, rarity: any): number;
