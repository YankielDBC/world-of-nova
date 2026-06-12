import type { ClimateSnapshot } from './climate.js';
import type { DayCycleSnapshot } from './day-cycle.js';
export type InspectLikeAction = 'chop' | 'mine' | 'gather';
export type DayActionKey = 'gather' | 'chop' | 'mine' | 'fish';
export type NodeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export interface ParsedYield {
    resource: string;
    emoji: string;
    minQty: number;
    maxQty: number;
    chance: number;
    rarity: NodeRarity;
}
export declare function clamp(value: number, min: number, max: number): number;
export declare function deterministicRandom(seed: string): number;
export declare function parseYields(rawJson: string): ParsedYield[];
export declare function detectActionFromTool(requiredTool: string | null, nodeType: string): InspectLikeAction;
export declare function getDayActionKey(action: InspectLikeAction, nodeType: string): DayActionKey;
export declare function getVisibleCountRange(spawnChance: number): {
    min: number;
    max: number;
};
export declare function getDominantRarity(yields: ParsedYield[]): NodeRarity;
export declare function getEnergyCostPerAction(action: InspectLikeAction, rarity: NodeRarity, requiredLevel: number): number;
export declare function getSpawnMultiplierForClimate(biomeName: string, climate: ClimateSnapshot): number;
export declare function getYieldMultiplierForClimate(biomeName: string, climate: ClimateSnapshot): number;
export declare function getDaySpawnMultiplierForAction(action: DayActionKey, dayCycle: DayCycleSnapshot): number;
export declare function getDayYieldMultiplierForAction(action: DayActionKey, dayCycle: DayCycleSnapshot): number;
export declare function getMovementStaForBiome(biomeName: string): number;
export declare function shortNum(n: number): string;
export declare function formatMs(ms: number): string;
export declare function formatPercent(part: number, total: number): string;
export declare function increment<T extends string>(record: Record<T, number>, key: T, amount?: number): void;
