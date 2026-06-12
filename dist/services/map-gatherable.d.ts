import { type ClimateSnapshot } from './climate.js';
import { type DayCycleSnapshot } from './day-cycle.js';
export declare function getGatherableResources(biomeId: number, biomeName: string | undefined, dayCycle: DayCycleSnapshot, climate: ClimateSnapshot, tileX?: number, tileY?: number, tileResourcesJson?: string | null): Promise<{
    emoji: string;
    name: string;
}[]>;
