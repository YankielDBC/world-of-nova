import { prisma } from '../lib/db.js';
import { RUNTIME_CONFIG } from '../lib/runtime-config.js';
import { coordKey, randomInt } from './mystery-merchant-utils.js';
const DIRECTIONS = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
];
export async function getExploredBounds(worldMapId, tx = prisma) {
    const aggregate = await tx.mapTile.aggregate({
        where: {
            worldMapId,
            firstDiscoveredById: { not: null },
        },
        _min: { x: true, y: true },
        _max: { x: true, y: true },
        _count: { _all: true },
    });
    if (!aggregate._count._all ||
        aggregate._min.x == null ||
        aggregate._max.x == null ||
        aggregate._min.y == null ||
        aggregate._max.y == null) {
        return null;
    }
    return {
        minX: aggregate._min.x,
        maxX: aggregate._max.x,
        minY: aggregate._min.y,
        maxY: aggregate._max.y,
        discoveredCount: aggregate._count._all,
    };
}
export function isInsideMerchantPerimeter(x, y, bounds) {
    if (!bounds) {
        const fallback = Math.max(3, RUNTIME_CONFIG.merchantFallbackRadius);
        const radial = Math.sqrt(x * x + y * y);
        return radial <= fallback;
    }
    const margin = Math.max(0, RUNTIME_CONFIG.merchantPerimeterMargin);
    return x >= bounds.minX - margin && x <= bounds.maxX + margin && y >= bounds.minY - margin && y <= bounds.maxY + margin;
}
export async function hasDiscoveredTileNearby(params) {
    const tx = params.tx || prisma;
    const radius = Math.max(1, params.radius);
    const rows = await tx.mapTile.findMany({
        where: {
            worldMapId: params.worldMapId,
            firstDiscoveredById: { not: null },
            x: { gte: params.x - radius, lte: params.x + radius },
            y: { gte: params.y - radius, lte: params.y + radius },
        },
        select: { x: true, y: true },
        take: 64,
    });
    return rows.some((row) => Math.abs(row.x - params.x) + Math.abs(row.y - params.y) <= radius);
}
export function distanceOutsidePerimeter(x, y, bounds) {
    if (!bounds) {
        const fallback = Math.max(3, RUNTIME_CONFIG.merchantFallbackRadius);
        const radial = Math.sqrt(x * x + y * y);
        return Math.max(0, radial - fallback);
    }
    const margin = Math.max(0, RUNTIME_CONFIG.merchantPerimeterMargin);
    const minX = bounds.minX - margin;
    const maxX = bounds.maxX + margin;
    const minY = bounds.minY - margin;
    const maxY = bounds.maxY + margin;
    const dx = x < minX ? minX - x : x > maxX ? x - maxX : 0;
    const dy = y < minY ? minY - y : y > maxY ? y - maxY : 0;
    return dx + dy;
}
export async function pickNextCoords(params) {
    const baseCandidates = DIRECTIONS.map((dir) => ({ x: params.currentX + dir.dx, y: params.currentY + dir.dy }));
    const nonBacktrack = baseCandidates.filter((entry) => !(entry.x === params.prevX && entry.y === params.prevY));
    const directionalCandidates = nonBacktrack.length > 0 ? nonBacktrack : baseCandidates;
    const blocked = params.blockedCoords || new Set();
    const candidates = directionalCandidates.filter((entry) => !blocked.has(coordKey(entry.x, entry.y)));
    const movableCandidates = candidates.length > 0 ? candidates : directionalCandidates;
    const exploredBounds = await getExploredBounds(params.worldMapId);
    const inPerimeter = movableCandidates.filter((entry) => isInsideMerchantPerimeter(entry.x, entry.y, exploredBounds));
    let perimeterPool = inPerimeter;
    if (perimeterPool.length === 0) {
        let bestDistance = Number.POSITIVE_INFINITY;
        for (const candidate of movableCandidates) {
            const dist = distanceOutsidePerimeter(candidate.x, candidate.y, exploredBounds);
            if (dist < bestDistance)
                bestDistance = dist;
        }
        perimeterPool = movableCandidates.filter((candidate) => distanceOutsidePerimeter(candidate.x, candidate.y, exploredBounds) === bestDistance);
        if (perimeterPool.length === 0)
            perimeterPool = movableCandidates;
    }
    const maxDistToDiscovered = Math.max(1, RUNTIME_CONFIG.merchantMaxDistanceToDiscovered);
    const proximityPool = [];
    for (const candidate of perimeterPool) {
        if (await hasDiscoveredTileNearby({
            worldMapId: params.worldMapId,
            x: candidate.x,
            y: candidate.y,
            radius: maxDistToDiscovered,
        })) {
            proximityPool.push(candidate);
        }
    }
    const finalPool = proximityPool.length > 0 ? proximityPool : perimeterPool;
    return finalPool[randomInt(0, finalPool.length - 1)];
}
export async function getOccupiedMerchantCoords(params) {
    const tx = params.tx || prisma;
    const rows = await tx.mysteryMerchant.findMany({
        where: {
            worldMapId: params.worldMapId,
            ...(typeof params.excludeId === 'number' ? { id: { not: params.excludeId } } : {}),
        },
        select: {
            mapX: true,
            mapY: true,
        },
    });
    return new Set(rows.map((row) => coordKey(row.mapX, row.mapY)));
}
export async function findNearestDiscoveredTile(params) {
    const rows = await prisma.mapTile.findMany({
        where: {
            worldMapId: params.worldMapId,
            firstDiscoveredById: { not: null },
            x: { gte: params.x - params.radius, lte: params.x + params.radius },
            y: { gte: params.y - params.radius, lte: params.y + params.radius },
        },
        select: {
            x: true,
            y: true,
        },
        take: 400,
    });
    let nearest = null;
    for (const row of rows) {
        const distance = Math.abs(row.x - params.x) + Math.abs(row.y - params.y);
        if (!nearest || distance < nearest.distance) {
            nearest = { x: row.x, y: row.y, distance };
        }
    }
    return nearest;
}
export function getDefaultInitialCoords(merchantId, merchantBaseId) {
    const presets = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: -2, y: 0 },
        { x: 0, y: 2 },
        { x: 0, y: -2 },
    ];
    const idx = Math.max(0, merchantId - merchantBaseId);
    return presets[idx] || { x: (idx % 5) * 2, y: Math.floor(idx / 5) * 2 };
}
export function getForcedCoordsForMerchant(merchantId, forced, merchantBaseId) {
    const idx = Math.max(0, merchantId - merchantBaseId);
    if (idx === 0)
        return forced;
    const offsets = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: 1, y: 1 },
        { x: -1, y: 1 },
        { x: 1, y: -1 },
        { x: -1, y: -1 },
    ];
    const off = offsets[(idx - 1) % offsets.length];
    return { x: forced.x + off.x, y: forced.y + off.y };
}
