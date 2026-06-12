import { Bot } from 'grammy';
import { type ClimateSnapshot } from './climate-core.js';
export { formatClimateLine, getClimateEffectsForBiome, } from './climate-core.js';
export type { ClimateEffectModifiers, ClimateEvent, ClimateKind, ClimateSnapshot } from './climate-core.js';
export declare function getClimateForTile(params: {
    worldMapId: number;
    x: number;
    y: number;
    biomeName?: string | null;
    biomeDisplayName?: string | null;
}): Promise<ClimateSnapshot>;
export declare function startClimateWorker(bot: Bot): void;
