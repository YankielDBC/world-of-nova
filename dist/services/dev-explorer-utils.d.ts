export declare function clamp(value: any, min: any, max: any): number;
export declare function deterministicRandom(seed: any): number;
export declare function parseYields(rawJson: any): {
    resource: string;
    emoji: string;
    minQty: number;
    maxQty: number;
    chance: number;
    rarity: string;
}[];
export declare function detectActionFromTool(requiredTool: any, nodeType: any): "gather" | "chop" | "mine";
export declare function getDayActionKey(action: any, nodeType: any): any;
export declare function getVisibleCountRange(spawnChance: any): {
    min: number;
    max: number;
};
export declare function getDominantRarity(yields: any): string;
export declare function getEnergyCostPerAction(action: any, rarity: any, requiredLevel: any): number;
export declare function getSpawnMultiplierForClimate(biomeName: any, climate: any): number;
export declare function getYieldMultiplierForClimate(biomeName: any, climate: any): number;
export declare function getDaySpawnMultiplierForAction(action: any, dayCycle: any): any;
export declare function getDayYieldMultiplierForAction(action: any, dayCycle: any): any;
export declare function getMovementStaForBiome(biomeName: any): 1 | 2;
export declare function shortNum(n: any): string;
export declare function formatMs(ms: any): string;
export declare function formatPercent(part: any, total: any): string;
export declare function increment(record: any, key: any, amount?: number): void;
