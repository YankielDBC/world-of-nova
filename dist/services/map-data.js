import { prisma } from '../lib/db.js';
import { observePerf } from '../lib/perf-metrics.js';
import { ensureDynamicPlaceAtCoords } from './dynamic-places.js';
import { pickBiomeNameForCoords } from './world-biomes.js';
import { getCanonicalWorldMapId } from './world-map.js';
import { generateTileLoreName } from './map-utils.js';
const DB_BATCH_SIZE = 200;
let biomeCache = null;
async function loadBiomes() {
    if (!biomeCache) {
        biomeCache = await prisma.biome.findMany({
            select: { id: true, name: true, emoji: true, displayName: true, movementFactor: true },
        });
        console.log(`Biome cache loaded: ${biomeCache.length} biomes from DB`);
    }
    return biomeCache;
}
export function invalidateBiomeCache() {
    biomeCache = null;
}
function pickBiomeForTile(x, y, biomes) {
    if (biomes.length === 0) {
        throw new Error('No biomes found in DB. Run seed-world first.');
    }
    const targetBiomeName = pickBiomeNameForCoords(x, y);
    const directMatch = biomes.find((biome) => biome.name === targetBiomeName);
    if (directMatch)
        return directMatch;
    const fallbackForest = biomes.find((biome) => biome.name === 'forest');
    return fallbackForest || biomes[0];
}
function coordsKey(x, y) {
    return `${x},${y}`;
}
function dedupeCoords(coords) {
    const dedup = new Map();
    for (const coord of coords)
        dedup.set(coordsKey(coord.x, coord.y), coord);
    return Array.from(dedup.values());
}
export async function isTileExplored(playerId, x, y) {
    const explored = await prisma.playerExploredTile.findUnique({
        where: { playerId_tileX_tileY: { playerId, tileX: x, tileY: y } },
    });
    return !!explored;
}
export async function markTileExplored(playerId, playerTgId, x, y) {
    await markTilesExploredBatch(playerId, playerTgId, [{ x, y }]);
}
export async function markTilesExploredBatch(playerId, playerTgId, coords) {
    const startedAt = Date.now();
    try {
        if (coords.length === 0)
            return;
        const uniqueCoords = dedupeCoords(coords);
        for (let i = 0; i < uniqueCoords.length; i += DB_BATCH_SIZE) {
            const chunk = uniqueCoords.slice(i, i + DB_BATCH_SIZE);
            const existing = await prisma.playerExploredTile.findMany({
                where: {
                    playerId,
                    OR: chunk.map((coord) => ({ tileX: coord.x, tileY: coord.y })),
                },
                select: { tileX: true, tileY: true },
            });
            const existingSet = new Set(existing.map((coord) => coordsKey(coord.tileX, coord.tileY)));
            const missingRows = chunk
                .filter((coord) => !existingSet.has(coordsKey(coord.x, coord.y)))
                .map((coord) => ({
                playerId,
                tileX: coord.x,
                tileY: coord.y,
            }));
            if (missingRows.length > 0) {
                try {
                    await prisma.playerExploredTile.createMany({ data: missingRows });
                }
                catch {
                    // Concurrent requests can race on the same unique key.
                }
            }
        }
        const worldMapId = await getCanonicalWorldMapId();
        const discoveredAt = new Date();
        for (let i = 0; i < uniqueCoords.length; i += DB_BATCH_SIZE) {
            const chunk = uniqueCoords.slice(i, i + DB_BATCH_SIZE);
            await prisma.mapTile.updateMany({
                where: {
                    worldMapId,
                    firstDiscoveredById: null,
                    OR: chunk.map((coord) => ({ x: coord.x, y: coord.y })),
                },
                data: {
                    firstDiscoveredById: playerTgId,
                    firstDiscoveredAt: discoveredAt,
                },
            });
        }
    }
    finally {
        observePerf('map.mark_explored_batch', Date.now() - startedAt);
    }
}
export async function getOrCreateTile(worldMapId, x, y, forceBiome) {
    let tile = await prisma.mapTile.findUnique({
        where: { worldMapId_x_y: { worldMapId, x, y } },
        include: { biome: true },
    });
    if (!tile) {
        const biomes = await loadBiomes();
        const biome = forceBiome ? biomes.find((item) => item.name === forceBiome) || biomes[0] : pickBiomeForTile(x, y, biomes);
        const waterNames = ['river', 'lake'];
        const mountainNames = ['mountain'];
        try {
            tile = await prisma.mapTile.create({
                data: {
                    worldMapId,
                    x,
                    y,
                    biomeId: biome.id,
                    loreName: generateTileLoreName(biome.name, x, y),
                    isWater: waterNames.includes(biome.name),
                    elevation: mountainNames.includes(biome.name) ? 2 : 0,
                    isGenerated: true,
                },
                include: { biome: true },
            });
        }
        catch {
            tile = await prisma.mapTile.findUnique({
                where: { worldMapId_x_y: { worldMapId, x, y } },
                include: { biome: true },
            });
            if (!tile)
                throw new Error(`Failed to create or load tile at (${x}, ${y})`);
        }
    }
    else if (!tile.loreName) {
        tile = await prisma.mapTile.update({
            where: { id: tile.id },
            data: { loreName: generateTileLoreName(tile.biome?.name || forceBiome || 'forest', x, y) },
            include: { biome: true },
        });
    }
    return tile;
}
export async function getPlaceAtCoords(x, y, worldMapId) {
    const existingPlaces = await prisma.place.findMany({
        where: {
            type: { in: ['FIXED', 'DYNAMIC'] },
            coordX: x,
            coordY: y,
            isActive: true,
        },
        include: { interactions: { orderBy: { sortOrder: 'asc' } } },
        take: 5,
    });
    const fixed = existingPlaces.find((place) => place.type === 'FIXED');
    if (fixed)
        return fixed;
    if (existingPlaces.length > 0) {
        const resolvedWorldMapId = worldMapId || (await getCanonicalWorldMapId());
        return ensureDynamicPlaceAtCoords({ worldMapId: resolvedWorldMapId, x, y });
    }
    const resolvedWorldMapId = worldMapId || (await getCanonicalWorldMapId());
    return ensureDynamicPlaceAtCoords({ worldMapId: resolvedWorldMapId, x, y });
}
export async function ensureTilesGeneratedForCoords(worldMapId, coords) {
    const startedAt = Date.now();
    try {
        const uniqueCoords = dedupeCoords(coords);
        if (uniqueCoords.length === 0)
            return;
        const biomes = await loadBiomes();
        const waterNames = new Set(['river', 'lake']);
        const mountainNames = new Set(['mountain']);
        for (let i = 0; i < uniqueCoords.length; i += DB_BATCH_SIZE) {
            const chunk = uniqueCoords.slice(i, i + DB_BATCH_SIZE);
            const existing = await prisma.mapTile.findMany({
                where: {
                    worldMapId,
                    OR: chunk.map((coord) => ({ x: coord.x, y: coord.y })),
                },
                select: { x: true, y: true },
            });
            const existingSet = new Set(existing.map((tile) => coordsKey(tile.x, tile.y)));
            const missingRows = chunk
                .filter((coord) => !existingSet.has(coordsKey(coord.x, coord.y)))
                .map((coord) => {
                const biome = pickBiomeForTile(coord.x, coord.y, biomes);
                const biomeName = biome.name || 'forest';
                return {
                    worldMapId,
                    x: coord.x,
                    y: coord.y,
                    biomeId: biome.id,
                    loreName: generateTileLoreName(biomeName, coord.x, coord.y),
                    isWater: waterNames.has(biomeName),
                    elevation: mountainNames.has(biomeName) ? 2 : 0,
                    isGenerated: true,
                };
            });
            if (missingRows.length > 0) {
                try {
                    await prisma.mapTile.createMany({ data: missingRows });
                }
                catch {
                    // Concurrent tile generation can race on worldMapId+x+y.
                }
            }
        }
    }
    finally {
        observePerf('map.ensure_tiles_for_coords', Date.now() - startedAt);
    }
}
export { loadBiomes };
