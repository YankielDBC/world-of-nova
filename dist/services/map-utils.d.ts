export declare function getMovementMode(tile: any, playerSpeed: any): "swimming" | "climbing" | "running" | "walking";
export declare function getMovementEmoji(mode: any): any;
export declare function getDirectionLabel(lang: any, direction: any): any;
export declare function formatZoneLevelLine(lang: any, x: any, y: any, playerLevel: any): string;
export declare function isSafePlace(place: any): boolean;
export declare function getPlaceState(place: any, lang?: string): {
    stateEmoji: string;
    stateLabel: any;
    description: any;
};
export declare function generateTileLoreName(biomeName: any, x: any, y: any): string;
export declare function getTileDisplayName(tile: any, place: any): any;
export declare function getTileDisplayLabel(tile: any, place: any): string;
export declare function getLocationDisplayLabel(tile: any, place: any, lang?: string): string;
export declare function deterministicRandom(seed: any): number;
export declare function getTileMapEmoji(tile: any, x: any, y: any): any;
