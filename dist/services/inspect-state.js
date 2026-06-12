// @ts-nocheck
import { prisma } from '../lib/db.js';
import { applyNodeCooldownRecovery, readTileResourceState, } from '../lib/tile-state.js';
import { TOOLS } from '../types/tools.js';
import { getPlaceAtCoords, getOrCreateTile } from './map.js';
import { mutateTileResourceState } from './tile-state-store.js';
import { getCanonicalWorldMap } from './world-map.js';
import { getSkillKeyForAction } from './progression.js';
import { getClimateEffectsForBiome } from './climate.js';
import { getDayCycleEffectsForBiome } from './day-cycle.js';
import { canRefreshNodesOnPeriodShift, detectActionFromTool, deterministicRandom, filterYieldsByPeriod, getDayActionKey, getNodeDominantRarity, getVisibleCountRange, isFishingNodeType, parseYields, toRarityCode, } from './inspect-utils.js';
import { getZoneResourcePolicyAtCoords, getZoneSpawnMultiplierForNode, isNodeLevelAllowedInZone, } from './world-resource-rules.js';
const RESOURCE_NODE_CACHE_TTL_MS = 60000;
const resourceNodeCache = new Map();
export function getNodeRequiredSkill(action, nodeType, requiredTool) {
    if (requiredTool) {
        const requiredMeta = TOOLS[requiredTool];
        if (requiredMeta?.type === 'fishing') {
            return 'fish';
        }
    }
    if (action === 'gather' && isFishingNodeType(nodeType)) {
        return 'fish';
    }
    return getSkillKeyForAction(action);
}
export async function getResourceNodesForBiome(biomeId) {
    const cached = resourceNodeCache.get(biomeId);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.nodes;
    }
    const nodes = await prisma.resourceNode.findMany({
        where: { biomeId },
        orderBy: [{ spawnChance: 'desc' }, { id: 'asc' }],
    });
    resourceNodeCache.set(biomeId, {
        nodes,
        expiresAt: Date.now() + RESOURCE_NODE_CACHE_TTL_MS,
    });
    return nodes;
}
export async function generateTileInspectNodes(params) {
    const resourceNodes = await getResourceNodesForBiome(params.biomeId);
    const zonePolicy = getZoneResourcePolicyAtCoords(params.tileX, params.tileY);
    const climateEffects = getClimateEffectsForBiome(params.biomeName, params.climate);
    const dayEffects = getDayCycleEffectsForBiome(params.biomeName, params.dayCycle);
    const created = [];
    for (const node of resourceNodes) {
        if (!isNodeLevelAllowedInZone(node.requiredLevel, zonePolicy)) {
            continue;
        }
        const action = detectActionFromTool(node.requiredTool, node.nodeType);
        const dayActionKey = getDayActionKey(action, node.nodeType);
        const actionSpawnMultiplier = dayEffects.actionSpawnMultiplier[dayActionKey] ?? 1;
        const actionYieldMultiplier = dayEffects.actionYieldMultiplier[dayActionKey] ?? 1;
        const zoneSpawnMultiplier = getZoneSpawnMultiplierForNode(node.requiredLevel, zonePolicy);
        if (zoneSpawnMultiplier <= 0) {
            continue;
        }
        const effectiveSpawnChance = Math.max(1, Math.min(95, node.spawnChance *
            climateEffects.spawnMultiplier *
            dayEffects.spawnMultiplier *
            actionSpawnMultiplier *
            zoneSpawnMultiplier));
        const spawnRoll = deterministicRandom(`${params.tileX},${params.tileY}:${node.nodeType}:spawn`);
        const shouldSpawn = spawnRoll <= effectiveSpawnChance / 100;
        if (!shouldSpawn) {
            continue;
        }
        const yields = parseYields(node.yieldsJson);
        const periodYields = filterYieldsByPeriod(yields, params.biomeName, params.dayCycle.period);
        if (periodYields.length === 0) {
            continue;
        }
        const range = getVisibleCountRange(node.spawnChance);
        const qtyRoll = deterministicRandom(`${params.tileX},${params.tileY}:${node.nodeType}:qty`);
        const baseCount = Math.max(range.min, Math.floor(qtyRoll * (range.max - range.min + 1)) + range.min);
        const count = Math.max(1, Math.round(baseCount * climateEffects.yieldMultiplier * dayEffects.yieldMultiplier * actionYieldMultiplier));
        const rarity = getNodeDominantRarity(periodYields);
        created.push({
            nodeId: node.id,
            nodeType: node.nodeType,
            emoji: node.emoji,
            displayName: node.displayName,
            available: count,
            requiredTool: node.requiredTool,
            requiredLevel: node.requiredLevel,
            rarity,
            baseAvailable: count,
            pendingRestore: 0,
            cooldownUntilMs: null,
            lastHarvestedAtMs: null,
        });
    }
    if (created.length < 2) {
        for (const node of resourceNodes) {
            if (created.find((entry) => entry.nodeId === node.id)) {
                continue;
            }
            if (!isNodeLevelAllowedInZone(node.requiredLevel, zonePolicy)) {
                continue;
            }
            const yields = filterYieldsByPeriod(parseYields(node.yieldsJson), params.biomeName, params.dayCycle.period);
            if (yields.length === 0) {
                continue;
            }
            created.push({
                nodeId: node.id,
                nodeType: node.nodeType,
                emoji: node.emoji,
                displayName: node.displayName,
                available: 1,
                requiredTool: node.requiredTool,
                requiredLevel: node.requiredLevel,
                rarity: getNodeDominantRarity(yields),
                baseAvailable: 1,
                pendingRestore: 0,
                cooldownUntilMs: null,
                lastHarvestedAtMs: null,
            });
            if (created.length >= 2) {
                break;
            }
        }
    }
    return created;
}
export async function getOrCreateTileInspectState(params) {
    let state = readTileResourceState(params.resourcesJson);
    let changed = false;
    const periodKey = params.dayCycle.period;
    const zonePolicy = getZoneResourcePolicyAtCoords(params.tileX, params.tileY);
    const recovered = applyNodeCooldownRecovery(state.nodes);
    if (recovered.changed) {
        state = {
            ...state,
            nodes: recovered.nodes,
        };
        changed = true;
    }
    const zoneFilteredNodes = state.nodes.filter((node) => isNodeLevelAllowedInZone(node.requiredLevel, zonePolicy));
    if (zoneFilteredNodes.length !== state.nodes.length) {
        state = {
            ...state,
            nodes: zoneFilteredNodes,
        };
        changed = true;
    }
    if (state.nodes.length === 0) {
        state = {
            ...state,
            nodes: await generateTileInspectNodes({
                tileX: params.tileX,
                tileY: params.tileY,
                biomeId: params.biomeId,
                biomeName: params.biomeName,
                climate: params.climate,
                dayCycle: params.dayCycle,
            }),
            generatedPeriodKey: periodKey,
        };
        changed = true;
    }
    else if (state.generatedPeriodKey !== periodKey && canRefreshNodesOnPeriodShift(state.nodes)) {
        state = {
            ...state,
            nodes: await generateTileInspectNodes({
                tileX: params.tileX,
                tileY: params.tileY,
                biomeId: params.biomeId,
                biomeName: params.biomeName,
                climate: params.climate,
                dayCycle: params.dayCycle,
            }),
            generatedPeriodKey: periodKey,
        };
        changed = true;
    }
    else if (!state.generatedPeriodKey) {
        state = {
            ...state,
            generatedPeriodKey: periodKey,
        };
        changed = true;
    }
    if (changed) {
        const persisted = await mutateTileResourceState(params.tileId, async (liveState) => {
            let nextState = liveState;
            let touched = false;
            const recoveredLive = applyNodeCooldownRecovery(nextState.nodes);
            if (recoveredLive.changed) {
                nextState = {
                    ...nextState,
                    nodes: recoveredLive.nodes,
                };
                touched = true;
            }
            if (nextState.nodes.length === 0) {
                nextState = {
                    ...nextState,
                    nodes: await generateTileInspectNodes({
                        tileX: params.tileX,
                        tileY: params.tileY,
                        biomeId: params.biomeId,
                        biomeName: params.biomeName,
                        climate: params.climate,
                        dayCycle: params.dayCycle,
                    }),
                    generatedPeriodKey: periodKey,
                };
                touched = true;
            }
            else if (nextState.generatedPeriodKey !== periodKey && canRefreshNodesOnPeriodShift(nextState.nodes)) {
                nextState = {
                    ...nextState,
                    nodes: await generateTileInspectNodes({
                        tileX: params.tileX,
                        tileY: params.tileY,
                        biomeId: params.biomeId,
                        biomeName: params.biomeName,
                        climate: params.climate,
                        dayCycle: params.dayCycle,
                    }),
                    generatedPeriodKey: periodKey,
                };
                touched = true;
            }
            else if (!nextState.generatedPeriodKey) {
                nextState = {
                    ...nextState,
                    generatedPeriodKey: periodKey,
                };
                touched = true;
            }
            return {
                nextState: touched ? nextState : liveState,
                result: touched ? nextState : liveState,
            };
        });
        if (persisted.ok && persisted.result) {
            state = persisted.result;
        }
    }
    return state;
}
export async function saveTileState(tileId, updater) {
    const write = await mutateTileResourceState(tileId, (state) => ({
        nextState: updater(state),
        result: true,
    }));
    if (!write.ok) {
        throw new Error(`Failed to persist tile state for tile ${tileId}`);
    }
}
export async function getPlayerBiomeContext(playerTgId) {
    const player = await prisma.player.findUnique({
        where: { tgId: playerTgId },
    });
    if (!player) {
        return null;
    }
    const worldMap = await getCanonicalWorldMap();
    const tile = await getOrCreateTile(worldMap.id, player.mapX, player.mapY);
    if (!tile.biomeId || !tile.biome) {
        return null;
    }
    const place = await getPlaceAtCoords(player.mapX, player.mapY);
    return { player, worldMap, tile, place };
}
export function buildGroundNodeView(entry, listIndex) {
    return {
        listIndex,
        kind: 'ground',
        groundLootId: entry.id,
        nodeType: 'ground_loot',
        emoji: entry.emoji,
        displayName: entry.name,
        available: entry.quantity,
        requiredLevel: 1,
        requiredSkill: 'gather',
        action: 'gather',
        rarity: 'common',
        rarityCode: toRarityCode('common'),
    };
}
//# sourceMappingURL=inspect-state.js.map