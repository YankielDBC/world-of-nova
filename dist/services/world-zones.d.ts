export declare const WORLD_CENTER: {
    x: number;
    y: number;
};
export declare function getRadialDistance(x: any, y: any, originX?: number, originY?: number): number;
export declare function getZoneBandByDistance(distance: any): {
    id: string;
    minDistance: number;
    maxDistance: number;
    recommendedLevelMin: number;
    recommendedLevelMax: number;
    villageSpawnChance: number;
    caveSpawnChance: number;
    ruinSpawnChance: number;
    villageExclusionRadius: number;
    caveExclusionRadius: number;
    ruinExclusionRadius: number;
};
export declare function getZoneBandAtCoords(x: any, y: any): {
    id: string;
    minDistance: number;
    maxDistance: number;
    recommendedLevelMin: number;
    recommendedLevelMax: number;
    villageSpawnChance: number;
    caveSpawnChance: number;
    ruinSpawnChance: number;
    villageExclusionRadius: number;
    caveExclusionRadius: number;
    ruinExclusionRadius: number;
};
