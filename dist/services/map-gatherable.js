// @ts-nocheck
import { prisma } from '../lib/db.js';
import { RUNTIME_CONFIG } from '../lib/runtime-config.js';
import { observePerf } from '../lib/perf-metrics.js';
import { getClimateEffectsForBiome, } from './climate.js';
import { getDayCycleEffectsForBiome, } from './day-cycle.js';
import { isResourceAvailableByPeriod } from '../data/day-cycle.js';
import { getZoneResourcePolicyAtCoords, getZoneSpawnMultiplierForNode, } from './world-resource-rules.js';
import { applyNodeCooldownRecovery, readTileResourceState } from '../lib/tile-state.js';
import { deterministicRandom } from './map-utils.js';
const gatherableCache = new Map();
const GATHERABLE_CACHE_TTL_MS = RUNTIME_CONFIG.gatherableCacheTtlMs;
const GATHERABLE_CACHE_MAX_ENTRIES = 5000;
const RESOURCE_NODE_CACHE_TTL_MS = 60000;
const resourceNodeCacheByBiome = new Map();
function getCachedGatherable(cacheKey) {
    const cached = gatherableCache.get(cacheKey);
    if (!cached) {
        return null;
    }
    if (cached.expiresAt <= Date.now()) {
        gatherableCache.delete(cacheKey);
        return null;
    }
    return cached.data;
}
function setCachedGatherable(cacheKey, data) {
    gatherableCache.set(cacheKey, { data, expiresAt: Date.now() + GATHERABLE_CACHE_TTL_MS });
    if (gatherableCache.size <= GATHERABLE_CACHE_MAX_ENTRIES) {
        return;
    }
    const now = Date.now();
    for (const [key, value] of gatherableCache) {
        if (value.expiresAt <= now) {
            gatherableCache.delete(key);
        }
        if (gatherableCache.size <= GATHERABLE_CACHE_MAX_ENTRIES) {
            break;
        }
    }
    while (gatherableCache.size > GATHERABLE_CACHE_MAX_ENTRIES) {
        const oldestKey = gatherableCache.keys().next().value;
        if (!oldestKey) {
            break;
        }
        gatherableCache.delete(oldestKey);
    }
}
async function getResourceNodesForBiome(biomeId) {
    const now = Date.now();
    const cached = resourceNodeCacheByBiome.get(biomeId);
    if (cached && cached.expiresAt > now) {
        return cached.nodes;
    }
    const nodes = await prisma.resourceNode.findMany({
        where: { biomeId },
        select: {
            id: true,
            nodeType: true,
            requiredTool: true,
            requiredLevel: true,
            spawnChance: true,
            yieldsJson: true,
        },
        orderBy: [{ spawnChance: 'desc' }, { id: 'asc' }],
    });
    resourceNodeCacheByBiome.set(biomeId, {
        nodes,
        expiresAt: now + RESOURCE_NODE_CACHE_TTL_MS,
    });
    return nodes;
}
function gatherableCacheKey(biomeId, dayPeriod, zoneId, climate, tileX, tileY) {
    const eventTag = climate.specialEvent || 'none';
    return `${biomeId}:${dayPeriod}:${zoneId}:${climate.kind}:${climate.intensity}:${eventTag}:${tileX},${tileY}`;
}
function filterResourcesByPeriod(items, biomeName, dayPeriod) {
    return items.filter((entry) => isResourceAvailableByPeriod(biomeName, entry.name, dayPeriod));
}
function detectActionFromTool(requiredTool, nodeType) {
    if (requiredTool === 'picoPiedra') {
        return 'mine';
    }
    if (requiredTool === 'hachaPiedra' || requiredTool === 'varaMadera') {
        return 'chop';
    }
    const lowered = (nodeType || '').toLowerCase();
    if (lowered.includes('fish') ||
        lowered.includes('water') ||
        lowered.includes('river') ||
        lowered.includes('brook') ||
        lowered.includes('rill') ||
        lowered.includes('wash')) {
        return 'fish';
    }
    if (lowered.includes('rock') || lowered.includes('lava') || lowered.includes('ash') || lowered.includes('mine')) {
        return 'mine';
    }
    if (lowered.includes('tree') || lowered.includes('pine') || lowered.includes('bamboo') || lowered.includes('wood')) {
        return 'chop';
    }
    return 'gather';
}
function getDayActionKey(action, nodeType) {
    if (action !== 'gather') {
        return action;
    }
    const lowered = (nodeType || '').toLowerCase();
    if (lowered.includes('fish') ||
        lowered.includes('water') ||
        lowered.includes('river') ||
        lowered.includes('brook') ||
        lowered.includes('rill') ||
        lowered.includes('wash')) {
        return 'fish';
    }
    return 'gather';
}
function parseNodeYields(rawJson) {
    try {
        const parsed = JSON.parse(rawJson || '[]');
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed
            .map((entry) => ({
            emoji: String(entry?.emoji || ''),
            name: String(entry?.resource || ''),
        }))
            .filter((entry) => entry.emoji.length > 0 && entry.name.length > 0);
    }
    catch {
        return [];
    }
}
export async function getGatherableResources(biomeId, biomeName = 'plains', dayCycle, climate, tileX = 0, tileY = 0, tileResourcesJson) {
    const startedAt = Date.now();
    try {
        const zonePolicy = getZoneResourcePolicyAtCoords(tileX, tileY);
        const hasTileStateSnapshot = !!(tileResourcesJson &&
            tileResourcesJson.trim().length > 0 &&
            tileResourcesJson.trim() !== '[]');
        const cacheKey = gatherableCacheKey(biomeId, dayCycle.period, zonePolicy.zoneId, climate, tileX, tileY);
        if (!hasTileStateSnapshot) {
            const cached = getCachedGatherable(cacheKey);
            if (cached) {
                return cached;
            }
        }
        if (tileResourcesJson) {
            const state = readTileResourceState(tileResourcesJson);
            const recovered = applyNodeCooldownRecovery(state.nodes);
            const live = new Map();
            const nodeIds = Array.from(new Set(recovered.nodes
                .filter((node) => node.available > 0 && typeof node.nodeId === 'number')
                .map((node) => node.nodeId)));
            const nodeYieldById = new Map();
            if (nodeIds.length > 0) {
                const templates = await prisma.resourceNode.findMany({
                    where: { id: { in: nodeIds } },
                    select: { id: true, yieldsJson: true },
                });
                for (const template of templates) {
                    const yields = filterResourcesByPeriod(parseNodeYields(template.yieldsJson), biomeName, dayCycle.period);
                    if (yields.length > 0) {
                        nodeYieldById.set(template.id, yields);
                    }
                }
            }
            for (const node of recovered.nodes) {
                if (node.available <= 0) {
                    continue;
                }
                const yields = typeof node.nodeId === 'number' ? nodeYieldById.get(node.nodeId) : null;
                if (yields && yields.length > 0) {
                    for (const item of yields) {
                        live.set(item.emoji, item);
                    }
                    continue;
                }
                if (node.emoji) {
                    live.set(node.emoji, {
                        emoji: node.emoji,
                        name: node.displayName || node.nodeType || 'Loot',
                    });
                }
            }
            for (const ground of state.groundLoot) {
                if (ground.quantity > 0 && ground.emoji) {
                    live.set(ground.emoji, { emoji: ground.emoji, name: ground.name || 'Loot' });
                }
            }
            if (live.size > 0) {
                const data = Array.from(live.values());
                if (!hasTileStateSnapshot) {
                    setCachedGatherable(cacheKey, data);
                }
                return data;
            }
        }
        const nodes = (await getResourceNodesForBiome(biomeId)).filter((node) => node.requiredLevel <= zonePolicy.hardMax);
        if (nodes.length > 0) {
            const climateEffects = getClimateEffectsForBiome(biomeName, climate);
            const dayEffects = getDayCycleEffectsForBiome(biomeName, dayCycle);
            const seen = new Map();
            const fallback = new Map();
            for (const node of nodes) {
                const yields = filterResourcesByPeriod(parseNodeYields(node.yieldsJson), biomeName, dayCycle.period);
                if (yields.length === 0) {
                    continue;
                }
                for (const item of yields) {
                    if (!fallback.has(item.emoji)) {
                        fallback.set(item.emoji, item);
                    }
                }
                const action = detectActionFromTool(node.requiredTool, node.nodeType);
                const dayActionKey = getDayActionKey(action, node.nodeType);
                const actionSpawnMultiplier = dayEffects.actionSpawnMultiplier[dayActionKey] ?? 1;
                const zoneSpawnMultiplier = getZoneSpawnMultiplierForNode(node.requiredLevel, zonePolicy);
                if (zoneSpawnMultiplier <= 0) {
                    continue;
                }
                const effectiveSpawnChance = Math.max(1, Math.min(95, node.spawnChance *
                    climateEffects.spawnMultiplier *
                    dayEffects.spawnMultiplier *
                    actionSpawnMultiplier *
                    zoneSpawnMultiplier));
                const spawnRoll = deterministicRandom(`${tileX},${tileY}:${node.nodeType}:spawn`);
                if (spawnRoll > effectiveSpawnChance / 100) {
                    continue;
                }
                for (const item of yields) {
                    if (!seen.has(item.emoji)) {
                        seen.set(item.emoji, item);
                    }
                }
            }
            if (seen.size === 0) {
                for (const item of fallback.values()) {
                    seen.set(item.emoji, item);
                    if (seen.size >= 2) {
                        break;
                    }
                }
            }
            const data = Array.from(seen.values());
            setCachedGatherable(cacheKey, data);
            return data;
        }
        const biomeResources = await prisma.biomeResource.findMany({
            where: { biomeId },
            include: { resource: true },
        });
        const seen = new Map();
        for (const biomeResource of biomeResources) {
            if (!seen.has(biomeResource.resource.emoji)) {
                seen.set(biomeResource.resource.emoji, {
                    emoji: biomeResource.resource.emoji,
                    name: biomeResource.resource.name,
                });
            }
        }
        const data = filterResourcesByPeriod(Array.from(seen.values()), biomeName, dayCycle.period);
        setCachedGatherable(cacheKey, data);
        return data;
    }
    finally {
        observePerf('map.gatherable', Date.now() - startedAt);
    }
}
//# sourceMappingURL=map-gatherable.js.map