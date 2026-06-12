import { type DayActionKey } from '../data/day-cycle.js';
import type { DayCycleSnapshot } from './day-cycle.js';
import type { TileInspectNodeState } from '../lib/tile-state.js';
export type InspectNodeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type InspectActionTypeLite = 'chop' | 'mine' | 'gather';
export interface ParsedYield {
    resource: string;
    emoji: string;
    minQty: number;
    maxQty: number;
    chance: number;
    rarity: InspectNodeRarity;
}
export declare function toRarityCode(rarity: string): string;
export declare function randomInt(min: number, max: number): number;
export declare function deterministicRandom(seed: string): number;
export declare function parseYields(rawJson: string): ParsedYield[];
export declare function filterYieldsByPeriod(yields: ParsedYield[], biomeName: string, period: DayCycleSnapshot['period']): ParsedYield[];
export declare function getNodeDominantRarity(yields: ParsedYield[]): InspectNodeRarity;
export declare function getVisibleCountRange(spawnChance: number): {
    min: number;
    max: number;
};
export declare function detectActionFromTool(requiredTool: string | null, nodeType: string): InspectActionTypeLite;
export declare function getDayActionKey(action: InspectActionTypeLite, nodeType: string): DayActionKey;
export declare function isFishingNodeType(nodeType: string): boolean;
export declare function getRecoveryHint(recoveredInMs: number): string;
export declare function normalizeRejectedReason(reason: string): string;
export declare function canRefreshNodesOnPeriodShift(nodes: TileInspectNodeState[]): boolean;
export declare function getEnergyCostPerAction(action: InspectActionTypeLite, rarity: InspectNodeRarity, requiredLevel: number): number;
export declare function getDurabilityDamage(requiredLevel: number, rarity: InspectNodeRarity): number;
