import { prisma } from '../lib/db.js';
import { t } from '../lib/i18n.js';
const DEFAULT_AFK_THRESHOLD_MS = 5 * 60 * 1000;
const POPULATION_CACHE_TTL_MS = 3_000;
const POPULATION_CACHE_MAX = 2_000;
const populationCache = new Map();
function populationKey(x, y, afkThresholdMs) {
    return `${x}:${y}:${afkThresholdMs}`;
}
function evictPopulationCacheIfNeeded() {
    if (populationCache.size <= POPULATION_CACHE_MAX) {
        return;
    }
    const now = Date.now();
    for (const [key, row] of populationCache.entries()) {
        if (row.expiresAt <= now) {
            populationCache.delete(key);
        }
    }
    if (populationCache.size <= POPULATION_CACHE_MAX) {
        return;
    }
    const overflow = populationCache.size - POPULATION_CACHE_MAX;
    let dropped = 0;
    for (const key of populationCache.keys()) {
        populationCache.delete(key);
        dropped += 1;
        if (dropped >= overflow) {
            break;
        }
    }
}
export async function getTilePopulationAtCoords(params) {
    const afkThresholdMs = params.afkThresholdMs ?? DEFAULT_AFK_THRESHOLD_MS;
    const key = populationKey(params.x, params.y, afkThresholdMs);
    const cached = populationCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
    }
    const activeCutoff = new Date(Date.now() - afkThresholdMs);
    const [total, active] = await prisma.$transaction([
        prisma.player.count({
            where: {
                mapX: params.x,
                mapY: params.y,
            },
        }),
        prisma.player.count({
            where: {
                mapX: params.x,
                mapY: params.y,
                lastActiveAt: { gt: activeCutoff },
            },
        }),
    ]);
    const afk = Math.max(0, total - active);
    const value = {
        afk,
        active,
        total,
    };
    populationCache.set(key, {
        expiresAt: Date.now() + POPULATION_CACHE_TTL_MS,
        value,
    });
    evictPopulationCacheIfNeeded();
    return value;
}
export function formatPopulationLine(lang, population) {
    // Only render when there is at least one other player besides yourself.
    if (population.total <= 1) {
        return null;
    }
    return `🔍 ${t(lang, 'populationLabel')}: 🧍‍♂️${population.active}   💤 ${population.afk}`;
}
