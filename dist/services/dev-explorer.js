import { prisma } from '../lib/db.js';
import { getCanonicalWorldMapId } from './world-map.js';
import { getClimateForTile } from './climate.js';
import { getDayCycleSnapshot } from './day-cycle.js';
import { isResourceAvailableByPeriod } from '../data/day-cycle.js';
import { getZoneBandAtCoords } from './world-zones.js';
import { pickBiomeNameForCoords } from './world-biomes.js';
import { getZoneResourcePolicyAtCoords, getZoneSpawnMultiplierForNode, isNodeLevelAllowedInZone } from './world-resource-rules.js';
import { clamp, deterministicRandom, detectActionFromTool, formatMs, formatPercent, getDayActionKey, getDaySpawnMultiplierForAction, getDayYieldMultiplierForAction, getDominantRarity, getEnergyCostPerAction, getMovementStaForBiome, getSpawnMultiplierForClimate, getVisibleCountRange, getYieldMultiplierForClimate, increment, parseYields, shortNum, } from './dev-explorer-utils.js';
const DEV_WIDTH = 200;
const DEV_HEIGHT = 200;
const DEV_HALF_W = Math.floor(DEV_WIDTH / 2);
const DEV_HALF_H = Math.floor(DEV_HEIGHT / 2);
const DEV_MIN_X = -DEV_HALF_W;
const DEV_MAX_X = DEV_MIN_X + DEV_WIDTH - 1;
const DEV_MIN_Y = -DEV_HALF_H;
const DEV_MAX_Y = DEV_MIN_Y + DEV_HEIGHT - 1;
let currentRunPromise = null;
const state = {
    status: 'idle',
    startedAt: null,
    processedTiles: 0,
    totalTiles: DEV_WIDTH * DEV_HEIGHT,
    report: null,
    error: null,
};
async function generateSimulationNodes(params) {
    const nodes = params.nodesByBiome.get(params.biomeId) || [];
    const zonePolicy = getZoneResourcePolicyAtCoords(params.x, params.y);
    const climateSpawnMultiplier = getSpawnMultiplierForClimate(params.biomeName, params.climate);
    const climateYieldMultiplier = getYieldMultiplierForClimate(params.biomeName, params.climate);
    const created = [];
    for (const node of nodes) {
        if (!isNodeLevelAllowedInZone(node.requiredLevel, zonePolicy))
            continue;
        const action = detectActionFromTool(node.requiredTool, node.nodeType);
        const dayAction = getDayActionKey(action, node.nodeType);
        const daySpawnMul = getDaySpawnMultiplierForAction(dayAction, params.dayCycle);
        const dayYieldMul = getDayYieldMultiplierForAction(dayAction, params.dayCycle);
        const zoneSpawnMul = getZoneSpawnMultiplierForNode(node.requiredLevel, zonePolicy);
        if (zoneSpawnMul <= 0)
            continue;
        const effectiveSpawnChance = clamp(node.spawnChance * climateSpawnMultiplier * daySpawnMul * zoneSpawnMul, 1, 95);
        const spawnRoll = deterministicRandom(`${params.x},${params.y}:${node.nodeType}:spawn`);
        if (spawnRoll > effectiveSpawnChance / 100)
            continue;
        const periodYields = node.yields.filter((entry) => isResourceAvailableByPeriod(params.biomeName, entry.resource, params.dayCycle.period));
        if (periodYields.length === 0)
            continue;
        const range = getVisibleCountRange(node.spawnChance);
        const qtyRoll = deterministicRandom(`${params.x},${params.y}:${node.nodeType}:qty`);
        const baseCount = Math.max(range.min, Math.floor(qtyRoll * (range.max - range.min + 1)) + range.min);
        const available = Math.max(1, Math.round(baseCount * climateYieldMultiplier * dayYieldMul));
        created.push({
            nodeType: node.nodeType,
            action,
            available,
            requiredLevel: node.requiredLevel,
            rarity: getDominantRarity(periodYields),
            yields: periodYields,
        });
    }
    if (created.length < 2) {
        for (const node of nodes) {
            if (created.some((entry) => entry.nodeType === node.nodeType))
                continue;
            if (!isNodeLevelAllowedInZone(node.requiredLevel, zonePolicy))
                continue;
            const periodYields = node.yields.filter((entry) => isResourceAvailableByPeriod(params.biomeName, entry.resource, params.dayCycle.period));
            if (periodYields.length === 0)
                continue;
            created.push({
                nodeType: node.nodeType,
                action: detectActionFromTool(node.requiredTool, node.nodeType),
                available: 1,
                requiredLevel: node.requiredLevel,
                rarity: getDominantRarity(periodYields),
                yields: periodYields,
            });
            if (created.length >= 2)
                break;
        }
    }
    return created;
}
async function runDevExplorationInternal() {
    const startedAt = Date.now();
    state.status = 'running';
    state.error = null;
    state.startedAt = startedAt;
    state.processedTiles = 0;
    state.totalTiles = DEV_WIDTH * DEV_HEIGHT;
    const worldMapId = await getCanonicalWorldMapId();
    const [biomes, resourceNodes, resources] = await Promise.all([
        prisma.biome.findMany({
            select: { id: true, name: true, displayName: true },
        }),
        prisma.resourceNode.findMany({
            select: {
                biomeId: true,
                nodeType: true,
                spawnChance: true,
                requiredTool: true,
                requiredLevel: true,
                yieldsJson: true,
            },
        }),
        prisma.resource.findMany({
            select: { name: true, emoji: true, baseValue: true },
        }),
    ]);
    const biomeByName = new Map();
    for (const biome of biomes) {
        biomeByName.set(biome.name, { id: biome.id, displayName: biome.displayName });
    }
    const nodesByBiome = new Map();
    for (const node of resourceNodes) {
        const list = nodesByBiome.get(node.biomeId) || [];
        list.push({
            nodeType: node.nodeType,
            spawnChance: node.spawnChance,
            requiredTool: node.requiredTool,
            requiredLevel: node.requiredLevel,
            yields: parseYields(node.yieldsJson),
        });
        nodesByBiome.set(node.biomeId, list);
    }
    const resourceValueByName = new Map();
    for (const res of resources) {
        resourceValueByName.set(res.name.toLowerCase(), {
            emoji: res.emoji,
            baseValue: res.baseValue,
        });
    }
    const dayCycle = getDayCycleSnapshot();
    const biomeCounts = {};
    const zoneBandCounts = {
        core: 0,
        inner: 0,
        middle: 0,
        outer: 0,
        frontier: 0,
    };
    const climateCounts = {};
    const climateKindCounts = {
        calm: 0,
        humid: 0,
        dry: 0,
        mist: 0,
        heat: 0,
        storm: 0,
        ash: 0,
    };
    const climateEventCounts = {};
    const resourceTotals = new Map();
    let movementSteps = 0;
    let movementStaCost = 0;
    let harvestingStaCost = 0;
    let previousCoord = null;
    for (let y = DEV_MIN_Y; y <= DEV_MAX_Y; y += 1) {
        const leftToRight = (y - DEV_MIN_Y) % 2 === 0;
        const xStart = leftToRight ? DEV_MIN_X : DEV_MAX_X;
        const xEnd = leftToRight ? DEV_MAX_X : DEV_MIN_X;
        const xStep = leftToRight ? 1 : -1;
        for (let x = xStart; leftToRight ? x <= xEnd : x >= xEnd; x += xStep) {
            state.processedTiles += 1;
            const biomeName = pickBiomeNameForCoords(x, y);
            increment(biomeCounts, biomeName);
            const zoneBand = getZoneBandAtCoords(x, y);
            increment(zoneBandCounts, zoneBand.id);
            if (previousCoord) {
                movementSteps += 1;
                movementStaCost += getMovementStaForBiome(biomeName);
            }
            previousCoord = { x, y, biome: biomeName };
            const biomeRow = biomeByName.get(biomeName);
            if (!biomeRow) {
                continue;
            }
            const climate = await getClimateForTile({
                worldMapId,
                x,
                y,
                biomeName,
                biomeDisplayName: biomeRow.displayName,
            });
            increment(climateKindCounts, climate.kind);
            increment(climateCounts, `${climate.kind.toUpperCase()} ${climate.intensity}`);
            if (climate.specialEvent) {
                increment(climateEventCounts, climate.specialEvent);
            }
            const simNodes = await generateSimulationNodes({
                x,
                y,
                biomeName,
                biomeId: biomeRow.id,
                climate,
                dayCycle,
                nodesByBiome,
            });
            for (const node of simNodes) {
                const energyPerAction = getEnergyCostPerAction(node.action, node.rarity, node.requiredLevel);
                harvestingStaCost += energyPerAction * node.available;
                for (let actionIndex = 0; actionIndex < node.available; actionIndex += 1) {
                    for (const yieldEntry of node.yields) {
                        const roll = deterministicRandom(`${x},${y}:${node.nodeType}:${yieldEntry.resource}:roll:${actionIndex}`);
                        if (roll * 100 > yieldEntry.chance)
                            continue;
                        const qtyRoll = deterministicRandom(`${x},${y}:${node.nodeType}:${yieldEntry.resource}:qty:${actionIndex}`);
                        const qty = Math.floor(qtyRoll * (yieldEntry.maxQty - yieldEntry.minQty + 1)) + yieldEntry.minQty;
                        if (qty <= 0)
                            continue;
                        const key = yieldEntry.resource.toLowerCase();
                        const market = resourceValueByName.get(key);
                        const current = resourceTotals.get(key);
                        const estSilverUnit = market?.baseValue ?? 0;
                        if (!current) {
                            resourceTotals.set(key, {
                                emoji: yieldEntry.emoji || market?.emoji || '📦',
                                name: yieldEntry.resource,
                                quantity: qty,
                                estSilver: estSilverUnit * qty,
                            });
                        }
                        else {
                            current.quantity += qty;
                            current.estSilver += estSilverUnit * qty;
                        }
                    }
                }
            }
        }
    }
    const placeRows = await prisma.place.findMany({
        where: {
            isActive: true,
            coordX: { gte: DEV_MIN_X, lte: DEV_MAX_X },
            coordY: { gte: DEV_MIN_Y, lte: DEV_MAX_Y },
        },
        select: {
            type: true,
            slug: true,
        },
    });
    let fixedPlaces = 0;
    let dynamicPlaces = 0;
    let villages = 0;
    let caves = 0;
    let ruins = 0;
    for (const place of placeRows) {
        if (place.type === 'FIXED')
            fixedPlaces += 1;
        if (place.type === 'DYNAMIC')
            dynamicPlaces += 1;
        if ((place.slug || '').startsWith('frontier-village-'))
            villages += 1;
        if ((place.slug || '').startsWith('ancient-cave-'))
            caves += 1;
        if ((place.slug || '').startsWith('ancient-ruins-'))
            ruins += 1;
    }
    const topResources = Array.from(resourceTotals.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 12);
    const totalResourceUnits = Array.from(resourceTotals.values()).reduce((sum, entry) => sum + entry.quantity, 0);
    const totalResourceKinds = resourceTotals.size;
    const estimatedMarketSilver = Array.from(resourceTotals.values()).reduce((sum, entry) => sum + entry.estSilver, 0);
    const endedAt = Date.now();
    const report = {
        generatedAt: endedAt,
        startedAt,
        endedAt,
        elapsedMs: endedAt - startedAt,
        totalTiles: DEV_WIDTH * DEV_HEIGHT,
        area: {
            width: DEV_WIDTH,
            height: DEV_HEIGHT,
            minX: DEV_MIN_X,
            maxX: DEV_MAX_X,
            minY: DEV_MIN_Y,
            maxY: DEV_MAX_Y,
        },
        dayPeriod: dayCycle.period,
        movement: {
            steps: movementSteps,
            staCost: movementStaCost,
        },
        harvesting: {
            staCost: harvestingStaCost,
            totalResourceUnits,
            totalResourceKinds,
            estimatedMarketSilver,
        },
        combinedStaCost: movementStaCost + harvestingStaCost,
        biomeCounts,
        zoneBandCounts,
        climateCounts,
        climateKindCounts,
        climateEventCounts,
        topResources,
        placeCounts: {
            fixed: fixedPlaces,
            dynamic: dynamicPlaces,
            villages,
            caves,
            ruins,
        },
    };
    state.report = report;
    state.status = 'ready';
    state.error = null;
}
function maybeStartRun(force = false) {
    if (state.status === 'running' && currentRunPromise) {
        return;
    }
    if (!force && state.status === 'ready' && state.report) {
        return;
    }
    currentRunPromise = runDevExplorationInternal()
        .catch((error) => {
        state.status = 'error';
        state.error = error instanceof Error ? error.message : String(error);
    })
        .finally(() => {
        currentRunPromise = null;
    });
}
export function triggerDevExplorer(force = false) {
    maybeStartRun(force);
}
export function getDevExplorerState() {
    return {
        status: state.status,
        startedAt: state.startedAt,
        processedTiles: state.processedTiles,
        totalTiles: state.totalTiles,
        report: state.report,
        error: state.error,
    };
}
export function renderDevExplorerReport(lang = 'es') {
    const snapshot = getDevExplorerState();
    if (snapshot.status === 'idle') {
        return lang === 'en'
            ? '🧪 Dev explorer idle. Use /devmode again to start scan.'
            : lang === 'ru'
                ? '🧪 Dev explorer ne zapushchen. Povtorite /devmode dlya starta.'
                : '🧪 Dev explorer inactivo. Vuelve a usar /devmode para iniciar el escaneo.';
    }
    if (snapshot.status === 'running') {
        const progress = formatPercent(snapshot.processedTiles, snapshot.totalTiles);
        const elapsed = snapshot.startedAt ? formatMs(Date.now() - snapshot.startedAt) : '-';
        return [
            '🧪 DEV MODE',
            '✧═══••═══✧',
            `Estado: escaneando 200x200`,
            `Progreso: ${snapshot.processedTiles}/${snapshot.totalTiles} (${progress})`,
            `Tiempo: ${elapsed}`,
            'Tip: vuelve a ejecutar /devmode para refrescar el avance.',
        ].join('\n');
    }
    if (snapshot.status === 'error' || !snapshot.report) {
        return [
            '🧪 DEV MODE',
            '✧═══••═══✧',
            '⚠️ Falló el escaneo.',
            `Detalle: ${snapshot.error || 'sin detalle'}`,
            'Usa /devmode otra vez para reintentar.',
        ].join('\n');
    }
    const report = snapshot.report;
    const biomeLines = Object.entries(report.biomeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([biome, count], idx, arr) => {
        const marker = idx === 0 ? '┌' : idx === arr.length - 1 ? '└' : '├';
        return `${marker} ${biome}: ${shortNum(count)} (${formatPercent(count, report.totalTiles)})`;
    });
    const climateLines = Object.entries(report.climateKindCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([kind, count], idx, arr) => {
        const marker = idx === 0 ? '┌' : idx === arr.length - 1 ? '└' : '├';
        return `${marker} ${kind}: ${shortNum(count)}`;
    });
    const topResourceLines = report.topResources.map((entry, idx, arr) => {
        const marker = idx === 0 ? '┌' : idx === arr.length - 1 ? '└' : '├';
        return `${marker} ${entry.emoji} ${entry.name}: ${shortNum(entry.quantity)} (≈${shortNum(entry.estSilver)}🪙)`;
    });
    const eventLines = Object.keys(report.climateEventCounts).length
        ? Object.entries(report.climateEventCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count], idx, arr) => {
            const marker = idx === 0 ? '┌' : idx === arr.length - 1 ? '└' : '├';
            return `${marker} ${name}: ${shortNum(count)}`;
        })
        : ['└ sin eventos especiales'];
    return [
        '🧪 DEV MODE · Explorador 200x200',
        '✧═══••═══✧',
        `Área: (${report.area.minX},${report.area.minY}) → (${report.area.maxX},${report.area.maxY})`,
        `Tiles: ${shortNum(report.totalTiles)} · Periodo: ${report.dayPeriod}`,
        `Tiempo de exploración: ${formatMs(report.elapsedMs)}`,
        '',
        '📊 Costos simulados (STA infinita en bot):',
        `┌ Movimiento: ${shortNum(report.movement.staCost)} STA`,
        `├ Recolección total: ${shortNum(report.harvesting.staCost)} STA`,
        `└ Total: ${shortNum(report.combinedStaCost)} STA`,
        '',
        '🌍 Biomas más vistos:',
        ...(biomeLines.length > 0 ? biomeLines : ['└ sin datos']),
        '',
        '🌦️ Climas vistos:',
        ...(climateLines.length > 0 ? climateLines : ['└ sin datos']),
        '🌩️ Eventos:',
        ...eventLines,
        '',
        '📦 Recursos recolectados (top):',
        ...(topResourceLines.length > 0 ? topResourceLines : ['└ sin drops']),
        `💰 Valor estimado total: ≈ ${shortNum(report.harvesting.estimatedMarketSilver)} 🪙`,
        '',
        '🏛️ Lugares detectados en el área:',
        `┌ Fijos: ${report.placeCounts.fixed}`,
        `├ Dinámicos: ${report.placeCounts.dynamic}`,
        `├ Pueblos: ${report.placeCounts.villages}`,
        `├ Cuevas: ${report.placeCounts.caves}`,
        `└ Ruinas: ${report.placeCounts.ruins}`,
        '',
        `ℹ️ Extra: pasos simulados=${shortNum(report.movement.steps)} · tipos de recurso=${report.harvesting.totalResourceKinds}`,
    ].join('\n');
}
