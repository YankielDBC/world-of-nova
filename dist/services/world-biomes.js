import { getZoneBandAtCoords, getRadialDistance } from './world-zones.js';
const VOLCANO_CELL_SIZE = 44;
const VOLCANO_CELL_SCAN_RADIUS = 2;
const LAKE_CELL_SIZE = 28;
const LAKE_CELL_SCAN_RADIUS = 2;
const BAND_BIASES = {
    core: {
        plains: 1.65,
        forest: 1.3,
        swamp: 0.18,
        volcano: 0.01,
        ashlands: 0.02,
        highlands: 0.28,
        desert: 0.02,
        tundra: 0.0,
    },
    inner: {
        plains: 1.45,
        forest: 1.28,
        swamp: 0.32,
        volcano: 0.06,
        ashlands: 0.09,
        highlands: 0.44,
        desert: 0.08,
        tundra: 0.03,
    },
    middle: {
        plains: 1.12,
        forest: 1.3,
        swamp: 0.5,
        volcano: 0.14,
        ashlands: 0.2,
        highlands: 0.62,
        desert: 0.2,
        tundra: 0.1,
    },
    outer: {
        plains: 0.95,
        forest: 1.16,
        swamp: 0.66,
        volcano: 0.28,
        ashlands: 0.34,
        highlands: 0.82,
        desert: 0.36,
        tundra: 0.26,
    },
    frontier: {
        plains: 0.78,
        forest: 0.96,
        swamp: 0.76,
        volcano: 0.46,
        ashlands: 0.52,
        highlands: 1.0,
        desert: 0.54,
        tundra: 0.48,
    },
};
const VOLCANO_BAND_CHANCE = {
    core: 0.0,
    inner: 0.004,
    middle: 0.011,
    outer: 0.026,
    frontier: 0.04,
};
const LAKE_BAND_CHANCE = {
    core: 0.018,
    inner: 0.03,
    middle: 0.04,
    outer: 0.034,
    frontier: 0.028,
};
function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}
function lerp(a, b, t) {
    return a + (b - a) * t;
}
function smoothStep(t) {
    const x = clamp01(t);
    return x * x * (3 - 2 * x);
}
function hash2D(x, y, salt) {
    const n = Math.sin(x * 127.1 + y * 311.7 + salt * 19.19) * 43758.5453123;
    return n - Math.floor(n);
}
function valueNoise2D(x, y, scale, salt) {
    const sx = x / scale;
    const sy = y / scale;
    const x0 = Math.floor(sx);
    const y0 = Math.floor(sy);
    const tx = smoothStep(sx - x0);
    const ty = smoothStep(sy - y0);
    const v00 = hash2D(x0, y0, salt);
    const v10 = hash2D(x0 + 1, y0, salt);
    const v01 = hash2D(x0, y0 + 1, salt);
    const v11 = hash2D(x0 + 1, y0 + 1, salt);
    const top = lerp(v00, v10, tx);
    const bottom = lerp(v01, v11, tx);
    return lerp(top, bottom, ty);
}
function layeredNoise(x, y, layers) {
    let sum = 0;
    let totalWeight = 0;
    for (const layer of layers) {
        const sample = valueNoise2D(x, y, layer.scale, layer.salt) * 2 - 1;
        sum += sample * layer.weight;
        totalWeight += layer.weight;
    }
    if (totalWeight <= 0) {
        return 0;
    }
    return sum / totalWeight;
}
function getRiverDistance(x, y) {
    const riverAOffset = (valueNoise2D(x, y, 180, 1201) - 0.5) * 26;
    const riverABase = Math.sin(x / 18 + valueNoise2D(x, y, 92, 1202) * 2.4) * 9 +
        Math.sin(x / 43 + valueNoise2D(x, y, 138, 1203) * 2.1) * 13 +
        riverAOffset;
    const distA = Math.abs(y - riverABase);
    const riverBOffset = (valueNoise2D(x, y, 190, 1211) - 0.5) * 24;
    const riverBBase = Math.sin(y / 19 + valueNoise2D(x, y, 86, 1212) * 2.3) * 8 +
        Math.sin(y / 47 + valueNoise2D(x, y, 142, 1213) * 2.0) * 12 +
        riverBOffset;
    const distB = Math.abs(x - riverBBase);
    return Math.min(distA, distB);
}
function getVolcanoField(x, y) {
    const cellX = Math.floor(x / VOLCANO_CELL_SIZE);
    const cellY = Math.floor(y / VOLCANO_CELL_SIZE);
    let bestDistance = Number.POSITIVE_INFINITY;
    let bestInfluence = 0;
    for (let dx = -VOLCANO_CELL_SCAN_RADIUS; dx <= VOLCANO_CELL_SCAN_RADIUS; dx++) {
        for (let dy = -VOLCANO_CELL_SCAN_RADIUS; dy <= VOLCANO_CELL_SCAN_RADIUS; dy++) {
            const cx = cellX + dx;
            const cy = cellY + dy;
            const originX = cx * VOLCANO_CELL_SIZE;
            const originY = cy * VOLCANO_CELL_SIZE;
            const centerX = originX + Math.floor(hash2D(cx, cy, 1301) * VOLCANO_CELL_SIZE);
            const centerY = originY + Math.floor(hash2D(cx, cy, 1302) * VOLCANO_CELL_SIZE);
            const bandAtCenter = getZoneBandAtCoords(centerX, centerY);
            const spawnChance = VOLCANO_BAND_CHANCE[bandAtCenter.id];
            if (spawnChance <= 0) {
                continue;
            }
            const spawnRoll = hash2D(cx, cy, 1303);
            if (spawnRoll >= spawnChance) {
                continue;
            }
            const dxCenter = x - centerX;
            const dyCenter = y - centerY;
            const dist = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
            if (dist < bestDistance) {
                bestDistance = dist;
            }
            const coreRadius = 1.5 + hash2D(cx, cy, 1304) * 1.8;
            const falloff = 10 + hash2D(cx, cy, 1305) * 12;
            const influence = dist <= coreRadius ? 1 : clamp01(1 - (dist - coreRadius) / falloff);
            if (influence > bestInfluence) {
                bestInfluence = influence;
            }
        }
    }
    return {
        distance: bestDistance,
        influence: bestInfluence,
    };
}
function getLakeField(x, y) {
    const cellX = Math.floor(x / LAKE_CELL_SIZE);
    const cellY = Math.floor(y / LAKE_CELL_SIZE);
    let bestDistance = Number.POSITIVE_INFINITY;
    let bestInfluence = 0;
    for (let dx = -LAKE_CELL_SCAN_RADIUS; dx <= LAKE_CELL_SCAN_RADIUS; dx++) {
        for (let dy = -LAKE_CELL_SCAN_RADIUS; dy <= LAKE_CELL_SCAN_RADIUS; dy++) {
            const cx = cellX + dx;
            const cy = cellY + dy;
            const originX = cx * LAKE_CELL_SIZE;
            const originY = cy * LAKE_CELL_SIZE;
            const centerX = originX + Math.floor(hash2D(cx, cy, 1501) * LAKE_CELL_SIZE);
            const centerY = originY + Math.floor(hash2D(cx, cy, 1502) * LAKE_CELL_SIZE);
            const bandAtCenter = getZoneBandAtCoords(centerX, centerY);
            const spawnChance = LAKE_BAND_CHANCE[bandAtCenter.id];
            if (spawnChance <= 0) {
                continue;
            }
            const spawnRoll = hash2D(cx, cy, 1503);
            if (spawnRoll >= spawnChance) {
                continue;
            }
            const dxCenter = x - centerX;
            const dyCenter = y - centerY;
            const dist = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
            if (dist < bestDistance) {
                bestDistance = dist;
            }
            const coreRadius = 1.2 + hash2D(cx, cy, 1504) * 2.1;
            const falloff = 6 + hash2D(cx, cy, 1505) * 7;
            const influence = dist <= coreRadius ? 1 : clamp01(1 - (dist - coreRadius) / falloff);
            if (influence > bestInfluence) {
                bestInfluence = influence;
            }
        }
    }
    return {
        distance: bestDistance,
        influence: bestInfluence,
    };
}
function weightedPick(entries, roll) {
    let total = 0;
    for (const entry of entries) {
        total += Math.max(0, entry.weight);
    }
    if (total <= 0) {
        return entries[0].key;
    }
    let cursor = roll * total;
    for (const entry of entries) {
        cursor -= Math.max(0, entry.weight);
        if (cursor <= 0) {
            return entry.key;
        }
    }
    return entries[entries.length - 1].key;
}
function sanitizeLandPick(picked, metrics) {
    if (picked === 'desert' && (metrics.humidity > 0.56 || metrics.nearWater > 0.4)) {
        return 'plains';
    }
    if (picked === 'swamp' && metrics.aridity > 0.72) {
        return 'plains';
    }
    if (picked === 'volcano' && metrics.volcanoInfluence < 0.65) {
        return 'ashlands';
    }
    if (picked === 'ashlands' && metrics.volcanoInfluence < 0.35) {
        return 'highlands';
    }
    return picked;
}
export function pickBiomeNameForCoords(x, y) {
    const zoneBand = getZoneBandAtCoords(x, y);
    const distance = getRadialDistance(x, y);
    const distanceFactor = clamp01(distance / 170);
    const volcanoField = getVolcanoField(x, y);
    const lakeField = getLakeField(x, y);
    const riverDistance = getRiverDistance(x, y);
    const latitude = clamp01(Math.abs(y) / 220);
    const terrainNoise = layeredNoise(x, y, [
        { scale: 130, weight: 0.52, salt: 1601 },
        { scale: 58, weight: 0.3, salt: 1602 },
        { scale: 24, weight: 0.18, salt: 1603 },
    ]);
    const humidity = clamp01(0.52 +
        layeredNoise(x, y, [
            { scale: 95, weight: 0.56, salt: 1401 },
            { scale: 42, weight: 0.3, salt: 1402 },
            { scale: 20, weight: 0.14, salt: 1403 },
        ]) *
            0.34 -
        distanceFactor * 0.06 +
        lakeField.influence * 0.08);
    const temperature = clamp01(0.5 +
        layeredNoise(x, y, [
            { scale: 120, weight: 0.58, salt: 1411 },
            { scale: 54, weight: 0.28, salt: 1412 },
            { scale: 24, weight: 0.14, salt: 1413 },
        ]) *
            0.3 +
        distanceFactor * 0.17 +
        volcanoField.influence * 0.3 -
        latitude * 0.28);
    const elevation = clamp01(0.42 +
        layeredNoise(x, y, [
            { scale: 80, weight: 0.5, salt: 1421 },
            { scale: 34, weight: 0.3, salt: 1422 },
            { scale: 16, weight: 0.2, salt: 1423 },
        ]) *
            0.36 +
        terrainNoise * 0.08 +
        distanceFactor * 0.14 +
        volcanoField.influence * 0.35 -
        lakeField.influence * 0.24);
    const riverWidth = 0.75 + humidity * 0.9 + (zoneBand.id === 'core' ? 0.2 : 0);
    const isRiver = riverDistance <= riverWidth && volcanoField.influence < 0.9;
    if (isRiver) {
        return 'river';
    }
    const isLake = lakeField.influence >= 0.64 &&
        volcanoField.influence < 0.82 &&
        riverDistance > 0.25 &&
        elevation < 0.68;
    if (isLake) {
        return 'lake';
    }
    const riverProximity = clamp01(1 - Math.max(0, riverDistance - riverWidth) / 3.5);
    const nearWater = clamp01(Math.max(riverProximity, lakeField.influence * 0.9));
    const aridity = clamp01(temperature * 0.62 + (1 - humidity) * 0.52 + distanceFactor * 0.18 - nearWater * 0.24);
    if (volcanoField.influence >= 0.88 && distance > 16) {
        return 'volcano';
    }
    if (volcanoField.influence >= 0.56 && distance > 18) {
        return 'ashlands';
    }
    const swampScore = humidity * 0.6 +
        nearWater * 0.58 +
        (1 - elevation) * 0.24 -
        temperature * 0.2 -
        volcanoField.influence * 0.34;
    const swampThresholdByBand = {
        core: 0.76,
        inner: 0.7,
        middle: 0.66,
        outer: 0.63,
        frontier: 0.6,
    };
    if (swampScore >= swampThresholdByBand[zoneBand.id]) {
        return 'swamp';
    }
    if (aridity >= 0.78 &&
        humidity < 0.34 &&
        nearWater < 0.3 &&
        volcanoField.influence < 0.45 &&
        distance > 24) {
        return 'desert';
    }
    if (temperature <= 0.23 && humidity < 0.6 && distance > 58) {
        return 'tundra';
    }
    if (elevation >= 0.74 && humidity < 0.72) {
        return 'highlands';
    }
    const bias = BAND_BIASES[zoneBand.id];
    let plainsWeight = bias.plains + (1 - humidity) * 0.8 + (1 - elevation) * 0.45 + (1 - aridity) * 0.16;
    let forestWeight = bias.forest + humidity * 0.95 + (1 - aridity) * 0.42 + nearWater * 0.28;
    let swampWeight = bias.swamp + Math.max(0, swampScore - 0.42) * 1.7;
    let volcanoWeight = bias.volcano + volcanoField.influence * 2.2 + elevation * 0.26 + temperature * 0.18;
    let ashlandsWeight = bias.ashlands + volcanoField.influence * 1.92 + aridity * 0.2;
    let highlandsWeight = bias.highlands + elevation * 1.1 + (1 - nearWater) * 0.2;
    let desertWeight = bias.desert + aridity * 1.22 + temperature * 0.42 - nearWater * 0.75;
    let tundraWeight = bias.tundra + (1 - temperature) * 1.25 + distanceFactor * 0.18 - humidity * 0.22;
    if (distance < 22) {
        volcanoWeight *= 0.1;
        ashlandsWeight *= 0.14;
        desertWeight *= 0.32;
        tundraWeight *= 0.1;
    }
    if (nearWater > 0.54) {
        desertWeight *= 0.18;
    }
    if (zoneBand.id === 'core') {
        swampWeight *= 0.54;
        highlandsWeight *= 0.6;
    }
    const pickRoll = hash2D(x, y, 1999);
    const picked = weightedPick([
        { key: 'plains', weight: plainsWeight },
        { key: 'forest', weight: forestWeight },
        { key: 'swamp', weight: swampWeight },
        { key: 'highlands', weight: highlandsWeight },
        { key: 'ashlands', weight: ashlandsWeight },
        { key: 'volcano', weight: volcanoWeight },
        { key: 'desert', weight: desertWeight },
        { key: 'tundra', weight: tundraWeight },
    ], pickRoll);
    return sanitizeLandPick(picked, {
        humidity,
        aridity,
        volcanoInfluence: volcanoField.influence,
        nearWater,
    });
}
