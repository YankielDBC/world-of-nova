import { type Language } from '../lib/i18n.js';
export type MovementMode = 'walking' | 'swimming' | 'climbing' | 'running' | 'riding' | 'flying';
export interface TileInfo {
    x: number;
    y: number;
    emoji: string;
    biome: string;
    displayName: string;
    isWater: boolean;
    isMountain: boolean;
    hasPlace: boolean;
    placeEmoji?: string;
    placeName?: string;
    isExplored: boolean;
}
export type PlaceLike = {
    slug?: string;
    name: string;
    displayName: string;
    emoji: string;
    pvpAllowed: boolean;
    combatAllowed: boolean;
};
export declare function getMovementMode(tile: TileInfo, playerSpeed: number): MovementMode;
export declare function getMovementEmoji(mode: MovementMode): string;
export declare function getDirectionLabel(lang: Language, direction: 'up' | 'down' | 'left' | 'right'): string;
export declare function formatZoneLevelLine(lang: Language, x: number, y: number, playerLevel: number): string;
export declare function isSafePlace(place?: Pick<PlaceLike, 'pvpAllowed' | 'combatAllowed'> | null): boolean;
export declare function getPlaceState(place?: PlaceLike | null, lang?: Language): {
    stateEmoji: string;
    stateLabel: string;
    description: string;
} | null;
export declare function generateTileLoreName(biomeName: string, x: number, y: number): string;
export declare function getTileDisplayName(tile: {
    loreName?: string | null;
    biome?: {
        displayName?: string | null;
    } | null;
}, place?: {
    displayName: string;
} | null): string;
export declare function getTileDisplayLabel(tile: {
    loreName?: string | null;
    biome?: {
        displayName?: string | null;
    } | null;
}, place?: {
    displayName: string;
} | null): string;
export declare function getLocationDisplayLabel(tile: {
    loreName?: string | null;
    biome?: {
        displayName?: string | null;
    } | null;
}, place?: PlaceLike | null, lang?: Language): string;
export declare function deterministicRandom(seed: string): number;
export declare function getTileMapEmoji(tile: {
    biome?: {
        name?: string | null;
        emoji?: string | null;
    } | null;
}, x: number, y: number): string;
