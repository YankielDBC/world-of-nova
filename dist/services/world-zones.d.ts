export declare const WORLD_CENTER: {
    readonly x: 0;
    readonly y: 0;
};
export type ZoneBandId = 'core' | 'inner' | 'middle' | 'outer' | 'frontier';
export interface ZoneBand {
    id: ZoneBandId;
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
}
export declare function getRadialDistance(x: number, y: number, originX?: 0, originY?: 0): number;
export declare function getZoneBandByDistance(distance: number): ZoneBand;
export declare function getZoneBandAtCoords(x: number, y: number): ZoneBand;
