// @ts-nocheck
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/db.js';
const DEFAULT_WORLD_MAP_NAME = (process.env.WORLD_MAP_NAME || 'Novaria').trim() || 'Novaria';
const CANONICAL_CACHE_TTL_MS = 30000;
let canonicalCache = null;
function normalizeName(value) {
    return value.trim().toLowerCase();
}
function isUniqueConstraintError(error) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
function hasNonEmptyResources(raw) {
    if (!raw) {
        return false;
    }
    const trimmed = raw.trim();
    return trimmed.length > 2 && trimmed !== '[]';
}
function pickCanonicalMap(stats) {
    const preferred = normalizeName(DEFAULT_WORLD_MAP_NAME);
    const ranked = [...stats].sort((a, b) => {
        if (b.tileCount !== a.tileCount) {
            return b.tileCount - a.tileCount;
        }
        if (b.discoveredTileCount !== a.discoveredTileCount) {
            return b.discoveredTileCount - a.discoveredTileCount;
        }
        const aPreferred = normalizeName(a.name) === preferred ? 1 : 0;
        const bPreferred = normalizeName(b.name) === preferred ? 1 : 0;
        if (bPreferred !== aPreferred) {
            return bPreferred - aPreferred;
        }
        if (b.climateCount !== a.climateCount) {
            return b.climateCount - a.climateCount;
        }
        if (b.merchantCount !== a.merchantCount) {
            return b.merchantCount - a.merchantCount;
        }
        return a.id - b.id;
    });
    return ranked[0];
}
async function loadWorldMapStats(tx) {
    const maps = await tx.worldMap.findMany({
        orderBy: { id: 'asc' },
    });
    if (maps.length === 0) {
        return [];
    }
    const [tileRows, discoveredRows, climateRows, merchantRows] = await Promise.all([
        tx.mapTile.groupBy({
            by: ['worldMapId'],
            _count: { _all: true },
        }),
        tx.mapTile.groupBy({
            by: ['worldMapId'],
            where: { firstDiscoveredById: { not: null } },
            _count: { _all: true },
        }),
        tx.climateZone.groupBy({
            by: ['worldMapId'],
            _count: { _all: true },
        }),
        tx.mysteryMerchant.groupBy({
            by: ['worldMapId'],
            _count: { _all: true },
        }),
    ]);
    const tileCountByMap = new Map(tileRows.map((row) => [row.worldMapId, row._count._all]));
    const discoveredByMap = new Map(discoveredRows.map((row) => [row.worldMapId, row._count._all]));
    const climateByMap = new Map(climateRows.map((row) => [row.worldMapId, row._count._all]));
    const merchantByMap = new Map(merchantRows.map((row) => [row.worldMapId, row._count._all]));
    return maps.map((map) => ({
        ...map,
        tileCount: tileCountByMap.get(map.id) ?? 0,
        discoveredTileCount: discoveredByMap.get(map.id) ?? 0,
        climateCount: climateByMap.get(map.id) ?? 0,
        merchantCount: merchantByMap.get(map.id) ?? 0,
    }));
}
async function ensureCanonicalWorldMapExists(tx) {
    const stats = await loadWorldMapStats(tx);
    if (stats.length > 0) {
        return pickCanonicalMap(stats);
    }
    return tx.worldMap.create({
        data: {
            name: DEFAULT_WORLD_MAP_NAME,
            width: 100,
            height: 100,
            description: 'Canonical shared world map',
        },
    });
}
async function mergeMapTilesIntoCanonical(tx, sourceMapId, targetMapId) {
    while (true) {
        const sourceTiles = await tx.mapTile.findMany({
            where: { worldMapId: sourceMapId },
            orderBy: { id: 'asc' },
            take: 200,
        });
        if (sourceTiles.length === 0) {
            return;
        }
        for (const tile of sourceTiles) {
            try {
                await tx.mapTile.update({
                    where: { id: tile.id },
                    data: { worldMapId: targetMapId },
                });
            }
            catch (error) {
                if (!isUniqueConstraintError(error)) {
                    throw error;
                }
                const existing = await tx.mapTile.findUnique({
                    where: {
                        worldMapId_x_y: {
                            worldMapId: targetMapId,
                            x: tile.x,
                            y: tile.y,
                        },
                    },
                });
                if (existing) {
                    const patch = {};
                    if (!existing.biomeId && tile.biomeId) {
                        patch.biomeId = tile.biomeId;
                    }
                    if (!existing.loreName && tile.loreName) {
                        patch.loreName = tile.loreName;
                    }
                    if (!existing.isGenerated && tile.isGenerated) {
                        patch.isGenerated = true;
                    }
                    if (!existing.isWater && tile.isWater) {
                        patch.isWater = true;
                    }
                    if ((existing.elevation ?? 0) < (tile.elevation ?? 0)) {
                        patch.elevation = tile.elevation;
                    }
                    if (!existing.firstDiscoveredById && tile.firstDiscoveredById) {
                        patch.firstDiscoveredById = tile.firstDiscoveredById;
                        patch.firstDiscoveredAt = tile.firstDiscoveredAt;
                    }
                    if (!hasNonEmptyResources(existing.resourcesJson) && hasNonEmptyResources(tile.resourcesJson)) {
                        patch.resourcesJson = tile.resourcesJson;
                    }
                    if (Object.keys(patch).length > 0) {
                        await tx.mapTile.update({
                            where: { id: existing.id },
                            data: patch,
                        });
                    }
                }
                await tx.mapTile.delete({
                    where: { id: tile.id },
                });
            }
        }
    }
}
async function mergeClimateZonesIntoCanonical(tx, sourceMapId, targetMapId) {
    while (true) {
        const sourceZones = await tx.climateZone.findMany({
            where: { worldMapId: sourceMapId },
            orderBy: { id: 'asc' },
            take: 200,
        });
        if (sourceZones.length === 0) {
            return;
        }
        for (const zone of sourceZones) {
            try {
                await tx.climateZone.update({
                    where: { id: zone.id },
                    data: { worldMapId: targetMapId },
                });
            }
            catch (error) {
                if (!isUniqueConstraintError(error)) {
                    throw error;
                }
                const existing = await tx.climateZone.findUnique({
                    where: {
                        worldMapId_zoneX_zoneY: {
                            worldMapId: targetMapId,
                            zoneX: zone.zoneX,
                            zoneY: zone.zoneY,
                        },
                    },
                });
                if (existing) {
                    const patch = {};
                    if (!existing.specialEvent && zone.specialEvent) {
                        patch.specialEvent = zone.specialEvent;
                    }
                    if (!existing.biomeHint && zone.biomeHint) {
                        patch.biomeHint = zone.biomeHint;
                    }
                    if (!existing.biomeLabel && zone.biomeLabel) {
                        patch.biomeLabel = zone.biomeLabel;
                    }
                    if ((zone.intensity ?? 0) > (existing.intensity ?? 0)) {
                        patch.intensity = zone.intensity;
                    }
                    if (zone.nextChangeAt.getTime() > existing.nextChangeAt.getTime()) {
                        patch.nextChangeAt = zone.nextChangeAt;
                    }
                    if (Object.keys(patch).length > 0) {
                        await tx.climateZone.update({
                            where: { id: existing.id },
                            data: patch,
                        });
                    }
                }
                await tx.climateZone.delete({
                    where: { id: zone.id },
                });
            }
        }
    }
}
async function mergeWorldMapIntoCanonical(tx, sourceMapId, targetMapId) {
    await mergeMapTilesIntoCanonical(tx, sourceMapId, targetMapId);
    await mergeClimateZonesIntoCanonical(tx, sourceMapId, targetMapId);
    await tx.mysteryMerchant.updateMany({
        where: { worldMapId: sourceMapId },
        data: { worldMapId: targetMapId },
    });
    await tx.worldMap.delete({
        where: { id: sourceMapId },
    });
}
function setCanonicalCache(mapId) {
    canonicalCache = {
        id: mapId,
        expiresAt: Date.now() + CANONICAL_CACHE_TTL_MS,
    };
}
export function invalidateCanonicalWorldMapCache() {
    canonicalCache = null;
}
export async function getCanonicalWorldMap(tx = prisma) {
    if (tx === prisma && canonicalCache && canonicalCache.expiresAt > Date.now()) {
        const cached = await prisma.worldMap.findUnique({
            where: { id: canonicalCache.id },
        });
        if (cached) {
            return cached;
        }
        canonicalCache = null;
    }
    const canonical = await ensureCanonicalWorldMapExists(tx);
    if (tx === prisma) {
        setCanonicalCache(canonical.id);
    }
    return canonical;
}
export async function getCanonicalWorldMapId(tx = prisma) {
    const map = await getCanonicalWorldMap(tx);
    return map.id;
}
export async function ensureSingleCanonicalWorldMap() {
    const result = await prisma.$transaction(async (tx) => {
        const canonical = await ensureCanonicalWorldMapExists(tx);
        const allMaps = await tx.worldMap.findMany({
            orderBy: { id: 'asc' },
            select: { id: true },
        });
        const mergedMapIds = [];
        for (const map of allMaps) {
            if (map.id === canonical.id) {
                continue;
            }
            await mergeWorldMapIntoCanonical(tx, map.id, canonical.id);
            mergedMapIds.push(map.id);
        }
        const finalCanonical = await tx.worldMap.findUnique({
            where: { id: canonical.id },
        });
        if (!finalCanonical) {
            throw new Error('Canonical world map disappeared during normalization.');
        }
        return {
            canonicalMapId: finalCanonical.id,
            canonicalMapName: finalCanonical.name,
            mergedMapIds,
        };
    });
    setCanonicalCache(result.canonicalMapId);
    return result;
}
//# sourceMappingURL=world-map.js.map