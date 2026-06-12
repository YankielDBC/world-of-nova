import { randomUUID } from 'node:crypto';
import { prisma } from '../lib/db.js';
import { RUNTIME_CONFIG } from '../lib/runtime-config.js';
import { TOOLS } from '../types/tools.js';
import { getCanonicalWorldMapId } from './world-map.js';
import { coordKey, normalizeMerchantDisplayName, parseForcedMerchantCoords, randomFloat, randomInt, sampleUnique, } from './mystery-merchant-utils.js';
import { getDefaultInitialCoords, getForcedCoordsForMerchant, getOccupiedMerchantCoords, } from './mystery-merchant-pathing.js';
import { parseOffers, serializeOffers, toSnapshot } from './mystery-merchant-serialization.js';
const MERCHANT_BASE_ID = 1;
const MERCHANT_SNAPSHOT_CACHE_TTL_MS = 3_000;
let merchantSnapshotCache = null;
function writeMerchantSnapshotCache(snapshots) {
    merchantSnapshotCache = {
        expiresAt: Date.now() + MERCHANT_SNAPSHOT_CACHE_TTL_MS,
        snapshots,
    };
}
export function clearMerchantSnapshotCache() {
    merchantSnapshotCache = null;
}
export function updateMerchantSnapshotCache(snapshot) {
    if (!merchantSnapshotCache || merchantSnapshotCache.expiresAt <= Date.now()) {
        return;
    }
    const nextSnapshots = [...merchantSnapshotCache.snapshots];
    const index = nextSnapshots.findIndex((entry) => entry.id === snapshot.id);
    if (index >= 0) {
        nextSnapshots[index] = snapshot;
    }
    else {
        nextSnapshots.push(snapshot);
    }
    merchantSnapshotCache = {
        expiresAt: merchantSnapshotCache.expiresAt,
        snapshots: nextSnapshots,
    };
}
export async function getMerchantSnapshotsForRead(tx = prisma) {
    if (merchantSnapshotCache && merchantSnapshotCache.expiresAt > Date.now()) {
        return merchantSnapshotCache.snapshots;
    }
    return ensureMerchantStates(tx);
}
export function getMerchantCount() {
    return Math.max(1, RUNTIME_CONFIG.merchantCount || 1);
}
export function getManagedMerchantIds() {
    const count = getMerchantCount();
    return Array.from({ length: count }, (_, idx) => MERCHANT_BASE_ID + idx);
}
export function getForcedMerchantCoords() {
    return parseForcedMerchantCoords(String(RUNTIME_CONFIG.merchantForceCoords || ''));
}
export async function getWorldMapId(tx = prisma) {
    return getCanonicalWorldMapId(tx);
}
export async function generateMerchantOffers(tx = prisma) {
    const resources = await tx.resource.findMany({
        where: {
            baseValue: { gt: 0 },
        },
        select: {
            id: true,
            name: true,
            emoji: true,
            baseValue: true,
            maxStack: true,
            stackable: true,
        },
        take: 200,
    });
    const selectedResourceCount = randomInt(3, 4);
    const selectedResources = sampleUnique(resources, selectedResourceCount);
    const resourceOffers = selectedResources.map((resource) => {
        const maxStock = Math.max(1, Math.min(resource.maxStack, 12));
        const stock = resource.stackable ? randomInt(1, maxStock) : 1;
        const unitPrice = Math.max(1, Math.floor(resource.baseValue * randomFloat(0.7, 1.3)));
        return {
            id: `r-${resource.id}`,
            kind: 'resource',
            resourceId: resource.id,
            emoji: resource.emoji,
            name: normalizeMerchantDisplayName(resource.name),
            priceSilver: unitPrice,
            stock,
            maxStock,
        };
    });
    const toolPool = Object.values(TOOLS).filter((tool) => tool.baseValue > 0);
    const selectedToolCount = randomInt(2, 2);
    const selectedTools = sampleUnique(toolPool, selectedToolCount);
    const toolOffers = selectedTools.map((tool) => {
        const maxStock = 1;
        const stock = 1;
        const unitPrice = Math.max(1, Math.floor(tool.baseValue * randomFloat(0.7, 1.3)));
        return {
            id: `t-${tool.id}`,
            kind: 'tool',
            toolKey: tool.id,
            emoji: tool.emoji,
            name: normalizeMerchantDisplayName(tool.name),
            priceSilver: unitPrice,
            stock,
            maxStock,
        };
    });
    return sampleUnique([...resourceOffers, ...toolOffers], randomInt(5, 6));
}
export function getRandomStaySeconds() {
    return randomInt(RUNTIME_CONFIG.merchantStayMinSeconds, RUNTIME_CONFIG.merchantStayMaxSeconds);
}
export async function ensureMerchantState(merchantId, tx = prisma) {
    const worldMapId = await getWorldMapId(tx);
    if (!worldMapId) {
        return null;
    }
    const forcedCoords = getForcedMerchantCoords();
    const desiredForcedCoords = forcedCoords
        ? getForcedCoordsForMerchant(merchantId, forcedCoords, MERCHANT_BASE_ID)
        : null;
    const existing = await tx.mysteryMerchant.findUnique({ where: { id: merchantId } });
    if (existing) {
        const now = Date.now();
        const maxExpectedStayMs = Math.max(RUNTIME_CONFIG.merchantStayMaxSeconds * 1000 * 2, 10 * 60 * 1000);
        const stayWindowMs = existing.departsAt.getTime() - existing.arrivedAt.getTime();
        const hasInvalidWindow = existing.arrivedAt.getTime() > now + 10 * 60 * 1000 ||
            stayWindowMs <= 0 ||
            stayWindowMs > maxExpectedStayMs;
        if (hasInvalidWindow) {
            const repaired = await tx.mysteryMerchant.update({
                where: { id: merchantId },
                data: {
                    arrivedAt: new Date(now),
                    departsAt: new Date(now + getRandomStaySeconds() * 1000),
                    rumorSentAt: null,
                    confirmedAt: null,
                },
            });
            clearMerchantSnapshotCache();
            return toSnapshot(repaired);
        }
        if (desiredForcedCoords &&
            (existing.mapX !== desiredForcedCoords.x || existing.mapY !== desiredForcedCoords.y)) {
            const staySeconds = getRandomStaySeconds();
            const moved = await tx.mysteryMerchant.update({
                where: { id: merchantId },
                data: {
                    prevX: existing.mapX,
                    prevY: existing.mapY,
                    mapX: desiredForcedCoords.x,
                    mapY: desiredForcedCoords.y,
                    arrivedAt: new Date(now),
                    departsAt: new Date(now + staySeconds * 1000),
                    rumorSentAt: null,
                    confirmedAt: null,
                },
            });
            clearMerchantSnapshotCache();
            return toSnapshot(moved);
        }
        return toSnapshot(existing);
    }
    const offers = await generateMerchantOffers(tx);
    const now = Date.now();
    const staySeconds = getRandomStaySeconds();
    const occupied = await getOccupiedMerchantCoords({ worldMapId, excludeId: merchantId, tx });
    let initialCoords = desiredForcedCoords || getDefaultInitialCoords(merchantId, MERCHANT_BASE_ID);
    if (!desiredForcedCoords && occupied.has(coordKey(initialCoords.x, initialCoords.y))) {
        for (let i = 0; i < 12; i += 1) {
            const candidate = {
                x: initialCoords.x + randomInt(-4, 4),
                y: initialCoords.y + randomInt(-4, 4),
            };
            if (!occupied.has(coordKey(candidate.x, candidate.y))) {
                initialCoords = candidate;
                break;
            }
        }
    }
    const created = await tx.mysteryMerchant.create({
        data: {
            id: merchantId,
            worldMapId,
            mapX: initialCoords.x,
            mapY: initialCoords.y,
            prevX: null,
            prevY: null,
            arrivedAt: new Date(now),
            departsAt: new Date(now + staySeconds * 1000),
            stayToken: randomUUID(),
            buybackMultiplier: randomInt(2, 20),
            offersJson: serializeOffers(offers),
            rumorSentAt: null,
            confirmedAt: null,
        },
    });
    clearMerchantSnapshotCache();
    return toSnapshot(created);
}
export async function ensureMerchantStates(tx = prisma) {
    const snapshots = [];
    const ids = getManagedMerchantIds();
    for (const merchantId of ids) {
        const snapshot = await ensureMerchantState(merchantId, tx);
        if (snapshot) {
            snapshots.push(snapshot);
        }
    }
    writeMerchantSnapshotCache(snapshots);
    return snapshots;
}
export { parseOffers, serializeOffers, toSnapshot };
