// @ts-nocheck
const CLIMATE_KIND_POOL = [
    { kind: 'calm', weight: 20 },
    { kind: 'humid', weight: 18 },
    { kind: 'dry', weight: 16 },
    { kind: 'mist', weight: 14 },
    { kind: 'heat', weight: 12 },
    { kind: 'storm', weight: 12 },
    { kind: 'ash', weight: 8 },
];
function pickWeighted(items) {
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;
    for (const item of items) {
        roll -= item.weight;
        if (roll <= 0) {
            return item;
        }
    }
    return items[0];
}
export function pickClimateKind(previous, biomeHint) {
    let pool = CLIMATE_KIND_POOL;
    if (biomeHint === 'river') {
        pool = [
            { kind: 'humid', weight: 24 },
            { kind: 'mist', weight: 20 },
            { kind: 'storm', weight: 16 },
            { kind: 'calm', weight: 14 },
            { kind: 'dry', weight: 10 },
            { kind: 'heat', weight: 8 },
            { kind: 'ash', weight: 8 },
        ];
    }
    else if (biomeHint === 'swamp') {
        pool = [
            { kind: 'humid', weight: 26 },
            { kind: 'mist', weight: 22 },
            { kind: 'storm', weight: 14 },
            { kind: 'calm', weight: 12 },
            { kind: 'dry', weight: 9 },
            { kind: 'heat', weight: 9 },
            { kind: 'ash', weight: 8 },
        ];
    }
    else if (biomeHint === 'volcano') {
        pool = [
            { kind: 'ash', weight: 28 },
            { kind: 'heat', weight: 24 },
            { kind: 'dry', weight: 16 },
            { kind: 'storm', weight: 10 },
            { kind: 'calm', weight: 10 },
            { kind: 'mist', weight: 6 },
            { kind: 'humid', weight: 6 },
        ];
    }
    else if (biomeHint === 'plains') {
        pool = [
            { kind: 'dry', weight: 22 },
            { kind: 'calm', weight: 20 },
            { kind: 'humid', weight: 14 },
            { kind: 'storm', weight: 14 },
            { kind: 'heat', weight: 12 },
            { kind: 'mist', weight: 10 },
            { kind: 'ash', weight: 8 },
        ];
    }
    else if (biomeHint === 'lake') {
        pool = [
            { kind: 'humid', weight: 24 },
            { kind: 'mist', weight: 21 },
            { kind: 'storm', weight: 16 },
            { kind: 'calm', weight: 13 },
            { kind: 'dry', weight: 10 },
            { kind: 'heat', weight: 8 },
            { kind: 'ash', weight: 8 },
        ];
    }
    else if (biomeHint === 'highlands') {
        pool = [
            { kind: 'calm', weight: 18 },
            { kind: 'mist', weight: 18 },
            { kind: 'storm', weight: 18 },
            { kind: 'dry', weight: 14 },
            { kind: 'humid', weight: 12 },
            { kind: 'ash', weight: 10 },
            { kind: 'heat', weight: 10 },
        ];
    }
    else if (biomeHint === 'desert') {
        pool = [
            { kind: 'dry', weight: 28 },
            { kind: 'heat', weight: 24 },
            { kind: 'storm', weight: 16 },
            { kind: 'calm', weight: 12 },
            { kind: 'ash', weight: 10 },
            { kind: 'mist', weight: 6 },
            { kind: 'humid', weight: 4 },
        ];
    }
    else if (biomeHint === 'tundra') {
        pool = [
            { kind: 'mist', weight: 23 },
            { kind: 'calm', weight: 20 },
            { kind: 'storm', weight: 18 },
            { kind: 'dry', weight: 14 },
            { kind: 'humid', weight: 12 },
            { kind: 'ash', weight: 7 },
            { kind: 'heat', weight: 6 },
        ];
    }
    else if (biomeHint === 'ashlands') {
        pool = [
            { kind: 'ash', weight: 30 },
            { kind: 'dry', weight: 20 },
            { kind: 'heat', weight: 18 },
            { kind: 'storm', weight: 10 },
            { kind: 'calm', weight: 10 },
            { kind: 'mist', weight: 7 },
            { kind: 'humid', weight: 5 },
        ];
    }
    let picked = pickWeighted(pool).kind;
    if (previous && picked === previous && Math.random() < 0.7) {
        picked = pickWeighted(pool.filter((entry) => entry.kind !== previous)).kind;
    }
    return picked;
}
export function pickIntensity(kind) {
    if (kind === 'storm' || kind === 'ash') {
        return pickWeighted([
            { value: 1, weight: 20 },
            { value: 2, weight: 45 },
            { value: 3, weight: 35 },
        ]).value;
    }
    if (kind === 'calm') {
        return pickWeighted([
            { value: 1, weight: 60 },
            { value: 2, weight: 30 },
            { value: 3, weight: 10 },
        ]).value;
    }
    return pickWeighted([
        { value: 1, weight: 40 },
        { value: 2, weight: 40 },
        { value: 3, weight: 20 },
    ]).value;
}
export function pickSpecialEvent(biomeHint, kind, intensity) {
    const chance = intensity >= 3 ? 0.18 : 0.08;
    if (Math.random() > chance) {
        return null;
    }
    if (biomeHint === 'river' && (kind === 'humid' || kind === 'storm'))
        return 'flood';
    if (biomeHint === 'lake' && (kind === 'humid' || kind === 'storm'))
        return 'flood';
    if (biomeHint === 'forest' && (kind === 'dry' || kind === 'heat'))
        return 'wildfire';
    if (biomeHint === 'highlands' && kind === 'storm')
        return 'quakes';
    if (biomeHint === 'volcano' && (kind === 'ash' || kind === 'heat'))
        return 'quakes';
    if (biomeHint === 'ashlands' && (kind === 'ash' || kind === 'heat'))
        return 'quakes';
    if (biomeHint === 'plains' && (kind === 'dry' || kind === 'storm'))
        return 'duststorm';
    if (biomeHint === 'desert' && (kind === 'dry' || kind === 'storm'))
        return 'duststorm';
    if (biomeHint === 'swamp' && (kind === 'humid' || kind === 'mist'))
        return 'toxic_fog';
    return null;
}
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
export function getClimateEffectsForBiome(biomeName, snapshot) {
    const biome = (biomeName || '').toLowerCase();
    let effects = {
        spawnMultiplier: 1,
        yieldMultiplier: 1,
        energyCostMultiplier: 1,
    };
    const apply = (next) => {
        effects = {
            spawnMultiplier: next.spawnMultiplier ?? effects.spawnMultiplier,
            yieldMultiplier: next.yieldMultiplier ?? effects.yieldMultiplier,
            energyCostMultiplier: next.energyCostMultiplier ?? effects.energyCostMultiplier,
        };
    };
    if (biome === 'river') {
        if (snapshot.kind === 'humid')
            apply({ spawnMultiplier: 1.35, yieldMultiplier: 1.2, energyCostMultiplier: 1.0 });
        if (snapshot.kind === 'dry')
            apply({ spawnMultiplier: 0.7, yieldMultiplier: 0.8, energyCostMultiplier: 1.1 });
        if (snapshot.kind === 'storm')
            apply({ spawnMultiplier: 1.2, yieldMultiplier: 1.1, energyCostMultiplier: 1.2 });
        if (snapshot.kind === 'heat')
            apply({ spawnMultiplier: 0.8, yieldMultiplier: 0.85, energyCostMultiplier: 1.15 });
        if (snapshot.kind === 'mist')
            apply({ spawnMultiplier: 1.1, yieldMultiplier: 1.0, energyCostMultiplier: 1.05 });
        if (snapshot.kind === 'ash')
            apply({ spawnMultiplier: 0.85, yieldMultiplier: 0.9, energyCostMultiplier: 1.15 });
    }
    else if (biome === 'forest') {
        if (snapshot.kind === 'humid')
            apply({ spawnMultiplier: 1.2, yieldMultiplier: 1.15, energyCostMultiplier: 1.0 });
        if (snapshot.kind === 'dry')
            apply({ spawnMultiplier: 0.85, yieldMultiplier: 0.9, energyCostMultiplier: 1.05 });
        if (snapshot.kind === 'storm')
            apply({ spawnMultiplier: 1.05, yieldMultiplier: 1.0, energyCostMultiplier: 1.1 });
        if (snapshot.kind === 'heat')
            apply({ spawnMultiplier: 0.82, yieldMultiplier: 0.88, energyCostMultiplier: 1.1 });
        if (snapshot.kind === 'mist')
            apply({ spawnMultiplier: 1.1, yieldMultiplier: 1.05, energyCostMultiplier: 1.05 });
        if (snapshot.kind === 'ash')
            apply({ spawnMultiplier: 0.9, yieldMultiplier: 0.9, energyCostMultiplier: 1.15 });
    }
    else if (biome === 'volcano') {
        if (snapshot.kind === 'ash')
            apply({ spawnMultiplier: 1.25, yieldMultiplier: 1.2, energyCostMultiplier: 1.25 });
        if (snapshot.kind === 'heat')
            apply({ spawnMultiplier: 1.15, yieldMultiplier: 1.1, energyCostMultiplier: 1.25 });
        if (snapshot.kind === 'dry')
            apply({ spawnMultiplier: 1.0, yieldMultiplier: 0.95, energyCostMultiplier: 1.15 });
        if (snapshot.kind === 'storm')
            apply({ spawnMultiplier: 0.88, yieldMultiplier: 0.9, energyCostMultiplier: 1.2 });
        if (snapshot.kind === 'humid')
            apply({ spawnMultiplier: 0.8, yieldMultiplier: 0.85, energyCostMultiplier: 1.1 });
        if (snapshot.kind === 'mist')
            apply({ spawnMultiplier: 0.9, yieldMultiplier: 0.9, energyCostMultiplier: 1.1 });
    }
    else if (biome === 'plains') {
        if (snapshot.kind === 'humid')
            apply({ spawnMultiplier: 1.12, yieldMultiplier: 1.1, energyCostMultiplier: 1.0 });
        if (snapshot.kind === 'dry')
            apply({ spawnMultiplier: 0.75, yieldMultiplier: 0.82, energyCostMultiplier: 1.08 });
        if (snapshot.kind === 'storm')
            apply({ spawnMultiplier: 0.95, yieldMultiplier: 0.95, energyCostMultiplier: 1.15 });
        if (snapshot.kind === 'heat')
            apply({ spawnMultiplier: 0.82, yieldMultiplier: 0.88, energyCostMultiplier: 1.1 });
        if (snapshot.kind === 'mist')
            apply({ spawnMultiplier: 0.9, yieldMultiplier: 0.9, energyCostMultiplier: 1.05 });
        if (snapshot.kind === 'ash')
            apply({ spawnMultiplier: 0.85, yieldMultiplier: 0.85, energyCostMultiplier: 1.12 });
    }
    else if (biome === 'swamp') {
        if (snapshot.kind === 'humid')
            apply({ spawnMultiplier: 1.3, yieldMultiplier: 1.2, energyCostMultiplier: 1.1 });
        if (snapshot.kind === 'dry')
            apply({ spawnMultiplier: 0.7, yieldMultiplier: 0.8, energyCostMultiplier: 1.15 });
        if (snapshot.kind === 'mist')
            apply({ spawnMultiplier: 1.25, yieldMultiplier: 1.15, energyCostMultiplier: 1.12 });
        if (snapshot.kind === 'storm')
            apply({ spawnMultiplier: 1.1, yieldMultiplier: 1.05, energyCostMultiplier: 1.16 });
        if (snapshot.kind === 'heat')
            apply({ spawnMultiplier: 0.8, yieldMultiplier: 0.85, energyCostMultiplier: 1.1 });
        if (snapshot.kind === 'ash')
            apply({ spawnMultiplier: 0.85, yieldMultiplier: 0.9, energyCostMultiplier: 1.15 });
    }
    else if (biome === 'lake') {
        if (snapshot.kind === 'humid')
            apply({ spawnMultiplier: 1.28, yieldMultiplier: 1.18, energyCostMultiplier: 1.02 });
        if (snapshot.kind === 'dry')
            apply({ spawnMultiplier: 0.76, yieldMultiplier: 0.84, energyCostMultiplier: 1.1 });
        if (snapshot.kind === 'mist')
            apply({ spawnMultiplier: 1.2, yieldMultiplier: 1.1, energyCostMultiplier: 1.05 });
        if (snapshot.kind === 'storm')
            apply({ spawnMultiplier: 1.14, yieldMultiplier: 1.06, energyCostMultiplier: 1.2 });
        if (snapshot.kind === 'heat')
            apply({ spawnMultiplier: 0.8, yieldMultiplier: 0.88, energyCostMultiplier: 1.12 });
        if (snapshot.kind === 'ash')
            apply({ spawnMultiplier: 0.82, yieldMultiplier: 0.88, energyCostMultiplier: 1.15 });
    }
    else if (biome === 'highlands') {
        if (snapshot.kind === 'humid')
            apply({ spawnMultiplier: 1.08, yieldMultiplier: 1.05, energyCostMultiplier: 1.04 });
        if (snapshot.kind === 'dry')
            apply({ spawnMultiplier: 0.9, yieldMultiplier: 0.92, energyCostMultiplier: 1.06 });
        if (snapshot.kind === 'mist')
            apply({ spawnMultiplier: 1.12, yieldMultiplier: 1.08, energyCostMultiplier: 1.08 });
        if (snapshot.kind === 'storm')
            apply({ spawnMultiplier: 0.95, yieldMultiplier: 0.98, energyCostMultiplier: 1.2 });
        if (snapshot.kind === 'heat')
            apply({ spawnMultiplier: 0.88, yieldMultiplier: 0.9, energyCostMultiplier: 1.1 });
        if (snapshot.kind === 'ash')
            apply({ spawnMultiplier: 0.86, yieldMultiplier: 0.9, energyCostMultiplier: 1.15 });
    }
    else if (biome === 'ashlands') {
        if (snapshot.kind === 'humid')
            apply({ spawnMultiplier: 0.85, yieldMultiplier: 0.88, energyCostMultiplier: 1.08 });
        if (snapshot.kind === 'dry')
            apply({ spawnMultiplier: 1.05, yieldMultiplier: 1.04, energyCostMultiplier: 1.1 });
        if (snapshot.kind === 'mist')
            apply({ spawnMultiplier: 0.9, yieldMultiplier: 0.92, energyCostMultiplier: 1.08 });
        if (snapshot.kind === 'storm')
            apply({ spawnMultiplier: 0.9, yieldMultiplier: 0.95, energyCostMultiplier: 1.18 });
        if (snapshot.kind === 'heat')
            apply({ spawnMultiplier: 1.2, yieldMultiplier: 1.14, energyCostMultiplier: 1.24 });
        if (snapshot.kind === 'ash')
            apply({ spawnMultiplier: 1.28, yieldMultiplier: 1.2, energyCostMultiplier: 1.26 });
    }
    else if (biome === 'desert') {
        if (snapshot.kind === 'humid')
            apply({ spawnMultiplier: 1.08, yieldMultiplier: 1.06, energyCostMultiplier: 1.05 });
        if (snapshot.kind === 'dry')
            apply({ spawnMultiplier: 0.78, yieldMultiplier: 0.84, energyCostMultiplier: 1.16 });
        if (snapshot.kind === 'mist')
            apply({ spawnMultiplier: 0.9, yieldMultiplier: 0.9, energyCostMultiplier: 1.08 });
        if (snapshot.kind === 'storm')
            apply({ spawnMultiplier: 0.86, yieldMultiplier: 0.88, energyCostMultiplier: 1.24 });
        if (snapshot.kind === 'heat')
            apply({ spawnMultiplier: 0.74, yieldMultiplier: 0.82, energyCostMultiplier: 1.22 });
        if (snapshot.kind === 'ash')
            apply({ spawnMultiplier: 0.8, yieldMultiplier: 0.86, energyCostMultiplier: 1.2 });
    }
    else if (biome === 'tundra') {
        if (snapshot.kind === 'humid')
            apply({ spawnMultiplier: 0.95, yieldMultiplier: 0.96, energyCostMultiplier: 1.04 });
        if (snapshot.kind === 'dry')
            apply({ spawnMultiplier: 1.02, yieldMultiplier: 1.0, energyCostMultiplier: 1.06 });
        if (snapshot.kind === 'mist')
            apply({ spawnMultiplier: 1.15, yieldMultiplier: 1.1, energyCostMultiplier: 1.08 });
        if (snapshot.kind === 'storm')
            apply({ spawnMultiplier: 0.88, yieldMultiplier: 0.9, energyCostMultiplier: 1.22 });
        if (snapshot.kind === 'heat')
            apply({ spawnMultiplier: 0.94, yieldMultiplier: 0.96, energyCostMultiplier: 1.02 });
        if (snapshot.kind === 'ash')
            apply({ spawnMultiplier: 0.9, yieldMultiplier: 0.92, energyCostMultiplier: 1.12 });
    }
    if (snapshot.specialEvent === 'flood') {
        effects.spawnMultiplier += 0.18;
        effects.yieldMultiplier += 0.12;
        effects.energyCostMultiplier += 0.08;
    }
    else if (snapshot.specialEvent === 'wildfire') {
        effects.spawnMultiplier -= 0.28;
        effects.yieldMultiplier -= 0.22;
        effects.energyCostMultiplier += 0.18;
    }
    else if (snapshot.specialEvent === 'quakes') {
        effects.spawnMultiplier -= 0.05;
        effects.yieldMultiplier += 0.08;
        effects.energyCostMultiplier += 0.2;
    }
    else if (snapshot.specialEvent === 'duststorm') {
        effects.spawnMultiplier -= 0.2;
        effects.yieldMultiplier -= 0.15;
        effects.energyCostMultiplier += 0.2;
    }
    else if (snapshot.specialEvent === 'toxic_fog') {
        effects.spawnMultiplier += 0.06;
        effects.yieldMultiplier += 0.06;
        effects.energyCostMultiplier += 0.22;
    }
    return {
        spawnMultiplier: clamp(effects.spawnMultiplier, 0.35, 1.85),
        yieldMultiplier: clamp(effects.yieldMultiplier, 0.5, 2.0),
        energyCostMultiplier: clamp(effects.energyCostMultiplier, 0.9, 1.8),
    };
}
