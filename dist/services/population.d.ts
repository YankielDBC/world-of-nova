import { type Language } from '../lib/i18n.js';
export interface TilePopulation {
    active: number;
    afk: number;
    total: number;
}
export declare function getTilePopulationAtCoords(params: {
    currentPlayerId: number;
    x: number;
    y: number;
    afkThresholdMs?: number;
}): Promise<TilePopulation>;
export declare function formatPopulationLine(lang: Language, population: TilePopulation): string | null;
