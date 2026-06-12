// @ts-nocheck
import { prisma } from '../lib/db.js';
import { RUNTIME_CONFIG } from '../lib/runtime-config.js';
import { observePerf } from '../lib/perf-metrics.js';
import { withPrismaRetry } from '../lib/prisma-retry.js';
import { buildAlertText, cacheKey, getDurationMs, getZoneBounds, getZoneCoords, pickClimateKind, pickIntensity, pickSpecialEvent, toSnapshot, } from './climate-core.js';
export { formatClimateLine, getClimateEffectsForBiome, } from './climate-core.js';
const ZONE_CACHE_TTL_MS = 15000;
const zoneCache = new Map();
async function inferZoneBiome(worldMapId, zoneX, zoneY) {
    const bounds = getZoneBounds(zoneX, zoneY);
    const tiles = await prisma.mapTile.findMany({
        where: {
            worldMapId,
            x: { gte: bounds.minX, lte: bounds.maxX },
            y: { gte: bounds.minY, lte: bounds.maxY },
            biomeId: { not: null },
        },
        select: {
            biome: {
                select: {
                    name: true,
                    displayName: true,
                },
            },
        },
        take: 200,
    });
    const scores = new Map();
    for (const tile of tiles) {
        if (!tile.biome?.name)
            continue;
        const current = scores.get(tile.biome.name);
        if (current) {
            current.score += 1;
        }
        else {
            scores.set(tile.biome.name, {
                score: 1,
                label: tile.biome.displayName || tile.biome.name,
            });
        }
    }
    let best = null;
    for (const [hint, value] of scores.entries()) {
        if (!best || value.score > best.score) {
            best = { hint, label: value.label, score: value.score };
        }
    }
    return best ? { hint: best.hint, label: best.label } : null;
}
async function rotateZoneClimate(params) {
    const inferred = params.biomeHint ? null : await inferZoneBiome(params.worldMapId, params.zoneX, params.zoneY);
    const biomeHint = params.biomeHint || inferred?.hint || null;
    const biomeLabel = params.biomeLabel || inferred?.label || null;
    const nextKind = pickClimateKind(params.previousKind, biomeHint);
    const nextIntensity = pickIntensity(nextKind);
    const nextEvent = pickSpecialEvent(biomeHint, nextKind, nextIntensity);
    const nextChangeAt = new Date(Date.now() + getDurationMs());
    const updated = await withPrismaRetry('climate.rotateZone.update', () => prisma.climateZone.update({
        where: { id: params.zoneId },
        data: {
            climateKind: nextKind,
            intensity: nextIntensity,
            specialEvent: nextEvent,
            nextChangeAt,
            biomeHint,
            biomeLabel,
        },
    }));
    const snapshot = toSnapshot(updated);
    zoneCache.set(cacheKey(snapshot.worldMapId, snapshot.zoneX, snapshot.zoneY), {
        snapshot,
        expiresAt: Date.now() + ZONE_CACHE_TTL_MS,
    });
    return snapshot;
}
async function sendClimateAlert(bot, snapshot) {
    if (!RUNTIME_CONFIG.climateAlertsEnabled) {
        return;
    }
    if (RUNTIME_CONFIG.communityProgressOnly) {
        return;
    }
    if (!RUNTIME_CONFIG.climateAlertsChannel) {
        return;
    }
    try {
        await bot.api.sendMessage(RUNTIME_CONFIG.climateAlertsChannel, buildAlertText(snapshot));
    }
    catch (error) {
        console.error('❌ Climate alert send error:', error);
    }
}
export async function getClimateForTile(params) {
    const startedAt = Date.now();
    try {
        const { zoneX, zoneY } = getZoneCoords(params.x, params.y);
        const key = cacheKey(params.worldMapId, zoneX, zoneY);
        const cached = zoneCache.get(key);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.snapshot;
        }
        const initialKind = pickClimateKind(null, params.biomeName || null);
        let zone = await withPrismaRetry('climate.getTile.upsert', () => prisma.climateZone.upsert({
            where: {
                worldMapId_zoneX_zoneY: {
                    worldMapId: params.worldMapId,
                    zoneX,
                    zoneY,
                },
            },
            create: {
                worldMapId: params.worldMapId,
                zoneX,
                zoneY,
                climateKind: initialKind,
                intensity: pickIntensity(initialKind),
                specialEvent: null,
                biomeHint: params.biomeName || null,
                biomeLabel: params.biomeDisplayName || null,
                nextChangeAt: new Date(Date.now() + getDurationMs()),
            },
            update: {},
        }));
        if (zone.nextChangeAt.getTime() <= Date.now()) {
            const nextKind = pickClimateKind(zone.climateKind, zone.biomeHint);
            const nextIntensity = pickIntensity(nextKind);
            zone = await withPrismaRetry('climate.getTile.rotate-expired', () => prisma.climateZone.update({
                where: { id: zone.id },
                data: {
                    climateKind: nextKind,
                    intensity: nextIntensity,
                    specialEvent: pickSpecialEvent(zone.biomeHint, nextKind, nextIntensity),
                    nextChangeAt: new Date(Date.now() + getDurationMs()),
                },
            }));
        }
        if (zone.intensity < 1 || zone.intensity > 3) {
            zone = await withPrismaRetry('climate.getTile.fix-intensity', () => prisma.climateZone.update({
                where: { id: zone.id },
                data: {
                    intensity: pickIntensity(zone.climateKind),
                },
            }));
        }
        if (params.biomeName && (!zone.biomeHint || zone.biomeHint !== params.biomeName)) {
            zone = await withPrismaRetry('climate.getTile.refresh-biome', () => prisma.climateZone.update({
                where: { id: zone.id },
                data: {
                    biomeHint: params.biomeName,
                    biomeLabel: params.biomeDisplayName || zone.biomeLabel,
                },
            }));
        }
        const snapshot = toSnapshot(zone);
        zoneCache.set(key, {
            snapshot,
            expiresAt: Date.now() + ZONE_CACHE_TTL_MS,
        });
        return snapshot;
    }
    finally {
        observePerf('climate.get_tile', Date.now() - startedAt);
    }
}
let climateTimer = null;
let climateSweepInFlight = false;
async function processDueClimatesOnce(bot) {
    if (climateSweepInFlight) {
        return;
    }
    const startedAt = Date.now();
    climateSweepInFlight = true;
    try {
        const due = await withPrismaRetry('climate.sweep.find-due', () => prisma.climateZone.findMany({
            where: {
                nextChangeAt: { lte: new Date() },
            },
            orderBy: [{ nextChangeAt: 'asc' }, { id: 'asc' }],
            take: RUNTIME_CONFIG.climateTransitionBatchSize,
        }));
        if (due.length === 0) {
            return;
        }
        const queue = [...due];
        const configuredConcurrency = Math.max(1, RUNTIME_CONFIG.climateUpdateConcurrency);
        const maxConcurrency = Math.max(1, Math.min(configuredConcurrency, queue.length, 2));
        let alertBudget = RUNTIME_CONFIG.communityProgressOnly
            ? 0
            : Math.max(0, RUNTIME_CONFIG.climateAlertsMaxPerSweep);
        const worker = async () => {
            while (queue.length > 0) {
                const zone = queue.shift();
                if (!zone) {
                    return;
                }
                try {
                    const snapshot = await rotateZoneClimate({
                        zoneId: zone.id,
                        worldMapId: zone.worldMapId,
                        zoneX: zone.zoneX,
                        zoneY: zone.zoneY,
                        previousKind: zone.climateKind,
                        biomeHint: zone.biomeHint,
                        biomeLabel: zone.biomeLabel,
                    });
                    if (alertBudget > 0) {
                        alertBudget -= 1;
                        await sendClimateAlert(bot, snapshot);
                    }
                }
                catch (zoneError) {
                    console.error('Climate zone update error:', zoneError);
                }
            }
        };
        await Promise.all(Array.from({ length: maxConcurrency }, () => worker()));
    }
    catch (error) {
        console.error('Climate sweep error:', error);
    }
    finally {
        observePerf('climate.sweep', Date.now() - startedAt);
        climateSweepInFlight = false;
    }
}
export function startClimateWorker(bot) {
    if (climateTimer) {
        return;
    }
    climateTimer = setInterval(() => {
        void processDueClimatesOnce(bot);
    }, RUNTIME_CONFIG.climateSweepIntervalMs);
    void processDueClimatesOnce(bot);
}
//# sourceMappingURL=climate.js.map