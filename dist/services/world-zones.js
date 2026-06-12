export const WORLD_CENTER = { x: 0, y: 0 };
const ZONE_BANDS = [
    {
        id: 'core',
        minDistance: 0,
        maxDistance: 10,
        recommendedLevelMin: 1,
        recommendedLevelMax: 3,
        villageSpawnChance: 0,
        caveSpawnChance: 0,
        ruinSpawnChance: 0,
        villageExclusionRadius: 28,
        caveExclusionRadius: 38,
        ruinExclusionRadius: 42,
    },
    {
        id: 'inner',
        minDistance: 10,
        maxDistance: 35,
        recommendedLevelMin: 4,
        recommendedLevelMax: 8,
        villageSpawnChance: 0.03,
        caveSpawnChance: 0.016,
        ruinSpawnChance: 0.008,
        villageExclusionRadius: 20,
        caveExclusionRadius: 20,
        ruinExclusionRadius: 18,
    },
    {
        id: 'middle',
        minDistance: 35,
        maxDistance: 60,
        recommendedLevelMin: 9,
        recommendedLevelMax: 14,
        villageSpawnChance: 0.024,
        caveSpawnChance: 0.02,
        ruinSpawnChance: 0.012,
        villageExclusionRadius: 18,
        caveExclusionRadius: 20,
        ruinExclusionRadius: 18,
    },
    {
        id: 'outer',
        minDistance: 60,
        maxDistance: 90,
        recommendedLevelMin: 15,
        recommendedLevelMax: 22,
        villageSpawnChance: 0.02,
        caveSpawnChance: 0.024,
        ruinSpawnChance: 0.016,
        villageExclusionRadius: 16,
        caveExclusionRadius: 18,
        ruinExclusionRadius: 16,
    },
    {
        id: 'frontier',
        minDistance: 90,
        maxDistance: Number.POSITIVE_INFINITY,
        recommendedLevelMin: 23,
        recommendedLevelMax: 40,
        villageSpawnChance: 0.018,
        caveSpawnChance: 0.03,
        ruinSpawnChance: 0.02,
        villageExclusionRadius: 15,
        caveExclusionRadius: 16,
        ruinExclusionRadius: 16,
    },
];
export function getRadialDistance(x, y, originX = WORLD_CENTER.x, originY = WORLD_CENTER.y) {
    const dx = x - originX;
    const dy = y - originY;
    return Math.sqrt(dx * dx + dy * dy);
}
export function getZoneBandByDistance(distance) {
    for (const band of ZONE_BANDS) {
        if (distance >= band.minDistance && distance < band.maxDistance) {
            return band;
        }
    }
    return ZONE_BANDS[ZONE_BANDS.length - 1];
}
export function getZoneBandAtCoords(x, y) {
    return getZoneBandByDistance(getRadialDistance(x, y));
}
