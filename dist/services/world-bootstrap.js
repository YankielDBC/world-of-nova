// @ts-nocheck
import { prisma } from '../lib/db.js';
import { EMOJIS } from '../data/emojis.js';
const CANONICAL_BIOMES = [
    { name: 'forest', emoji: EMOJIS.biome.forest, displayName: 'Forest', movementFactor: 1.0 },
    { name: 'swamp', emoji: EMOJIS.biome.swamp, displayName: 'Swamp', movementFactor: 1.5 },
    { name: 'plains', emoji: EMOJIS.biome.plains, displayName: 'Plains', movementFactor: 0.9 },
    { name: 'volcano', emoji: EMOJIS.biome.volcano, displayName: 'Volcano', movementFactor: 2.0 },
    { name: 'river', emoji: EMOJIS.biome.river, displayName: 'River', movementFactor: 1.2 },
    { name: 'lake', emoji: EMOJIS.biome.lake, displayName: 'Lake', movementFactor: 1.25 },
    { name: 'highlands', emoji: EMOJIS.biome.highlands, displayName: 'Highlands', movementFactor: 1.35 },
    { name: 'ashlands', emoji: EMOJIS.biome.ashlands, displayName: 'Ashlands', movementFactor: 1.6 },
    { name: 'desert', emoji: EMOJIS.biome.desert, displayName: 'Desert', movementFactor: 1.4 },
    { name: 'tundra', emoji: EMOJIS.biome.tundra, displayName: 'Tundra', movementFactor: 1.45 },
];
const RESOURCE_EMOJI_OVERRIDES = {
    Trigo: EMOJIS.items.trigo,
    Water: EMOJIS.items.water,
    Wood: EMOJIS.items.wood,
    'Ancient Wood': EMOJIS.items.ancientWood,
    'Pine Cone': EMOJIS.items.pineCone,
    Bamboo: EMOJIS.items.bamboo,
    Coconut: EMOJIS.items.coconut,
    Apple: EMOJIS.items.apple,
    Orange: EMOJIS.items.orange,
};
const EXTENDED_BIOME_NODES = {
    lake: [
        {
            nodeType: 'shallow_lake',
            emoji: '🏞️',
            displayName: 'Shallow Lake',
            spawnChance: 34,
            requiredTool: 'canapez',
            requiredLevel: 8,
            yields: [{ resource: 'Water', emoji: EMOJIS.items.water, minQty: 2, maxQty: 4, chance: 100, rarity: 'common' }],
        },
        {
            nodeType: 'yellow_fish_lake',
            emoji: '🐠',
            displayName: 'Yellow Fish',
            spawnChance: 30,
            requiredTool: 'canapez',
            requiredLevel: 10,
            yields: [{ resource: 'Pez Amarillo', emoji: '🐠', minQty: 1, maxQty: 3, chance: 100, rarity: 'common' }],
        },
        {
            nodeType: 'blue_fish_lake',
            emoji: '🐟',
            displayName: 'Blue Fish',
            spawnChance: 20,
            requiredTool: 'canapez',
            requiredLevel: 18,
            yields: [{ resource: 'Pez Azul', emoji: '🐟', minQty: 1, maxQty: 2, chance: 100, rarity: 'uncommon' }],
        },
        {
            nodeType: 'reed_bank',
            emoji: EMOJIS.items.bamboo,
            displayName: 'Reed Bank',
            spawnChance: 16,
            requiredTool: 'canapez',
            requiredLevel: 12,
            yields: [
                { resource: 'Hierbas', emoji: '🌿', minQty: 1, maxQty: 3, chance: 70, rarity: 'common' },
                { resource: 'Insectos', emoji: '🐛', minQty: 1, maxQty: 2, chance: 40, rarity: 'common' },
            ],
        },
    ],
    highlands: [
        {
            nodeType: 'highland_pine',
            emoji: EMOJIS.forest.pine,
            displayName: 'Highland Pine',
            spawnChance: 34,
            requiredTool: 'hachaPiedra',
            requiredLevel: 10,
            yields: [
                { resource: 'Wood', emoji: EMOJIS.items.wood, minQty: 1, maxQty: 3, chance: 100, rarity: 'common' },
                { resource: 'Pine Cone', emoji: EMOJIS.items.pineCone, minQty: 1, maxQty: 2, chance: 22, rarity: 'uncommon' },
            ],
        },
        {
            nodeType: 'cliff_herbs',
            emoji: '🌿',
            displayName: 'Cliff Herbs',
            spawnChance: 24,
            requiredTool: 'basket',
            requiredLevel: 12,
            yields: [
                { resource: 'Hierbas', emoji: '🌿', minQty: 2, maxQty: 4, chance: 100, rarity: 'common' },
                { resource: 'Hierbas Secas', emoji: '🥀', minQty: 1, maxQty: 2, chance: 35, rarity: 'common' },
            ],
        },
        {
            nodeType: 'stone_ledge',
            emoji: '🪨',
            displayName: 'Stone Ledge',
            spawnChance: 26,
            requiredTool: 'picoPiedra',
            requiredLevel: 16,
            yields: [
                { resource: 'Roca Volcánica', emoji: '🪨', minQty: 1, maxQty: 3, chance: 100, rarity: 'common' },
                { resource: 'Carbón', emoji: '⚫', minQty: 1, maxQty: 2, chance: 36, rarity: 'uncommon' },
            ],
        },
        {
            nodeType: 'elder_stump',
            emoji: EMOJIS.forest.deadTree,
            displayName: 'Elder Stump',
            spawnChance: 16,
            requiredTool: 'hachaPiedra',
            requiredLevel: 24,
            yields: [
                { resource: 'Wood', emoji: EMOJIS.items.wood, minQty: 2, maxQty: 3, chance: 100, rarity: 'common' },
                { resource: 'Ancient Wood', emoji: EMOJIS.items.ancientWood, minQty: 1, maxQty: 1, chance: 32, rarity: 'rare' },
            ],
        },
    ],
    ashlands: [
        {
            nodeType: 'ash_drift',
            emoji: '🌫️',
            displayName: 'Ash Drift',
            spawnChance: 30,
            requiredTool: 'picoPiedra',
            requiredLevel: 18,
            yields: [
                { resource: 'Cenizas', emoji: '🌫️', minQty: 2, maxQty: 4, chance: 100, rarity: 'common' },
                { resource: 'Carbón', emoji: '⚫', minQty: 1, maxQty: 2, chance: 30, rarity: 'uncommon' },
            ],
        },
        {
            nodeType: 'cinder_rock',
            emoji: '🪨',
            displayName: 'Cinder Rock',
            spawnChance: 30,
            requiredTool: 'picoPiedra',
            requiredLevel: 22,
            yields: [
                { resource: 'Roca Volcánica', emoji: '🪨', minQty: 2, maxQty: 4, chance: 100, rarity: 'common' },
                { resource: 'Carbón', emoji: '⚫', minQty: 1, maxQty: 2, chance: 44, rarity: 'uncommon' },
            ],
        },
        {
            nodeType: 'ember_weed',
            emoji: '🥀',
            displayName: 'Ember Weed',
            spawnChance: 22,
            requiredTool: 'basket',
            requiredLevel: 24,
            yields: [
                { resource: 'Hierbas Secas', emoji: '🥀', minQty: 2, maxQty: 4, chance: 100, rarity: 'common' },
                { resource: 'Hojas de Viento', emoji: '🍁', minQty: 1, maxQty: 1, chance: 20, rarity: 'epic' },
            ],
        },
        {
            nodeType: 'obsidian_vein',
            emoji: '🪨',
            displayName: 'Obsidian Vein',
            spawnChance: 12,
            requiredTool: 'picoPiedra',
            requiredLevel: 34,
            yields: [
                { resource: 'Carbón', emoji: '⚫', minQty: 2, maxQty: 4, chance: 100, rarity: 'uncommon' },
                { resource: 'Hojas de Viento', emoji: '🍁', minQty: 1, maxQty: 2, chance: 26, rarity: 'epic' },
            ],
        },
    ],
    desert: [
        {
            nodeType: 'dry_cactus',
            emoji: EMOJIS.forest.cactus,
            displayName: 'Dry Cactus',
            spawnChance: 28,
            requiredTool: 'basket',
            requiredLevel: 18,
            yields: [
                { resource: 'Water', emoji: EMOJIS.items.water, minQty: 1, maxQty: 2, chance: 100, rarity: 'common' },
                { resource: 'Hierbas Secas', emoji: '🥀', minQty: 1, maxQty: 3, chance: 60, rarity: 'common' },
            ],
        },
        {
            nodeType: 'dune_herbs',
            emoji: '🥀',
            displayName: 'Dune Herbs',
            spawnChance: 30,
            requiredTool: 'basket',
            requiredLevel: 20,
            yields: [
                { resource: 'Hierbas Secas', emoji: '🥀', minQty: 2, maxQty: 4, chance: 100, rarity: 'common' },
                { resource: 'Orange', emoji: EMOJIS.items.orange, minQty: 1, maxQty: 1, chance: 26, rarity: 'uncommon' },
            ],
        },
        {
            nodeType: 'wind_drift',
            emoji: '🍁',
            displayName: 'Wind Drift',
            spawnChance: 24,
            requiredTool: 'basket',
            requiredLevel: 28,
            yields: [{ resource: 'Hojas de Viento', emoji: '🍁', minQty: 1, maxQty: 2, chance: 100, rarity: 'epic' }],
        },
        {
            nodeType: 'scorched_stone',
            emoji: '🪨',
            displayName: 'Scorched Stone',
            spawnChance: 18,
            requiredTool: 'picoPiedra',
            requiredLevel: 30,
            yields: [
                { resource: 'Carbón', emoji: '⚫', minQty: 1, maxQty: 3, chance: 100, rarity: 'uncommon' },
                { resource: 'Roca Volcánica', emoji: '🪨', minQty: 1, maxQty: 2, chance: 50, rarity: 'common' },
            ],
        },
    ],
    tundra: [
        {
            nodeType: 'frost_pine',
            emoji: EMOJIS.forest.pine,
            displayName: 'Frost Pine',
            spawnChance: 30,
            requiredTool: 'hachaPiedra',
            requiredLevel: 26,
            yields: [
                { resource: 'Wood', emoji: EMOJIS.items.wood, minQty: 1, maxQty: 3, chance: 100, rarity: 'common' },
                { resource: 'Pine Cone', emoji: EMOJIS.items.pineCone, minQty: 1, maxQty: 2, chance: 30, rarity: 'uncommon' },
            ],
        },
        {
            nodeType: 'frozen_herbs',
            emoji: '🥀',
            displayName: 'Frozen Herbs',
            spawnChance: 26,
            requiredTool: 'basket',
            requiredLevel: 28,
            yields: [
                { resource: 'Hierbas Secas', emoji: '🥀', minQty: 2, maxQty: 4, chance: 100, rarity: 'common' },
                { resource: 'Champiñón Mágico', emoji: '🪻', minQty: 1, maxQty: 1, chance: 18, rarity: 'rare' },
            ],
        },
        {
            nodeType: 'ice_rock',
            emoji: '🪨',
            displayName: 'Ice Rock',
            spawnChance: 24,
            requiredTool: 'picoPiedra',
            requiredLevel: 32,
            yields: [
                { resource: 'Roca Volcánica', emoji: '🪨', minQty: 1, maxQty: 3, chance: 100, rarity: 'common' },
                { resource: 'Carbón', emoji: '⚫', minQty: 1, maxQty: 2, chance: 32, rarity: 'uncommon' },
            ],
        },
        {
            nodeType: 'glint_patch',
            emoji: '🍁',
            displayName: 'Glint Patch',
            spawnChance: 20,
            requiredTool: 'basket',
            requiredLevel: 38,
            yields: [
                { resource: 'Hojas de Viento', emoji: '🍁', minQty: 1, maxQty: 2, chance: 100, rarity: 'epic' },
                { resource: 'Champiñón Mágico', emoji: '🪻', minQty: 1, maxQty: 1, chance: 22, rarity: 'rare' },
            ],
        },
    ],
};
function normalizeText(value) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
}
function resolveResource(byName, resourceName) {
    return byName.get(normalizeText(resourceName)) || null;
}
function syncNodeYieldEmojis(yieldsJson, byName) {
    let parsed = [];
    try {
        parsed = JSON.parse(yieldsJson || '[]');
    }
    catch {
        return { changed: false, value: yieldsJson };
    }
    if (!Array.isArray(parsed)) {
        return { changed: false, value: yieldsJson };
    }
    let changed = false;
    const next = parsed.map((entry) => {
        if (!entry || typeof entry !== 'object' || typeof entry.resource !== 'string') {
            return entry;
        }
        const resolved = resolveResource(byName, entry.resource);
        if (!resolved) {
            return entry;
        }
        if (entry.resource !== resolved.name || entry.emoji !== resolved.emoji) {
            changed = true;
        }
        return {
            ...entry,
            resource: resolved.name,
            emoji: resolved.emoji,
        };
    });
    return { changed, value: changed ? JSON.stringify(next) : yieldsJson };
}
export async function ensureExpandedWorldGenerationCatalog() {
    for (const biome of CANONICAL_BIOMES) {
        await prisma.biome.upsert({
            where: { name: biome.name },
            create: biome,
            update: {
                emoji: biome.emoji,
                displayName: biome.displayName,
                movementFactor: biome.movementFactor,
            },
        });
    }
    for (const [resourceName, emoji] of Object.entries(RESOURCE_EMOJI_OVERRIDES)) {
        await prisma.resource.updateMany({
            where: { name: resourceName },
            data: { emoji },
        });
    }
    const resources = await prisma.resource.findMany({
        select: {
            name: true,
            emoji: true,
        },
    });
    const resourceByName = new Map();
    for (const resource of resources) {
        resourceByName.set(normalizeText(resource.name), resource);
    }
    // Keep all node yields aligned with resource master emoji/name.
    const existingNodes = await prisma.resourceNode.findMany({
        select: {
            id: true,
            yieldsJson: true,
        },
    });
    for (const node of existingNodes) {
        const synced = syncNodeYieldEmojis(node.yieldsJson, resourceByName);
        if (synced.changed) {
            await prisma.resourceNode.update({
                where: { id: node.id },
                data: { yieldsJson: synced.value },
            });
        }
    }
    for (const [biomeName, nodes] of Object.entries(EXTENDED_BIOME_NODES)) {
        const biome = await prisma.biome.findFirst({
            where: { name: biomeName },
            select: { id: true },
        });
        if (!biome) {
            continue;
        }
        const nodeTypes = nodes.map((node) => node.nodeType);
        await prisma.resourceNode.deleteMany({
            where: {
                biomeId: biome.id,
                nodeType: { notIn: nodeTypes },
            },
        });
        for (const node of nodes) {
            const resolvedYields = node.yields
                .map((yieldEntry) => {
                const resolved = resolveResource(resourceByName, yieldEntry.resource);
                if (!resolved) {
                    return null;
                }
                return {
                    resource: resolved.name,
                    emoji: resolved.emoji,
                    minQty: yieldEntry.minQty,
                    maxQty: yieldEntry.maxQty,
                    chance: yieldEntry.chance,
                    rarity: yieldEntry.rarity,
                };
            })
                .filter((entry) => !!entry);
            if (resolvedYields.length === 0) {
                continue;
            }
            await prisma.resourceNode.upsert({
                where: {
                    biomeId_nodeType: {
                        biomeId: biome.id,
                        nodeType: node.nodeType,
                    },
                },
                create: {
                    biomeId: biome.id,
                    nodeType: node.nodeType,
                    emoji: node.emoji,
                    displayName: node.displayName,
                    spawnChance: node.spawnChance,
                    requiredTool: node.requiredTool,
                    requiredLevel: node.requiredLevel,
                    yieldsJson: JSON.stringify(resolvedYields),
                },
                update: {
                    emoji: node.emoji,
                    displayName: node.displayName,
                    spawnChance: node.spawnChance,
                    requiredTool: node.requiredTool,
                    requiredLevel: node.requiredLevel,
                    yieldsJson: JSON.stringify(resolvedYields),
                },
            });
        }
    }
}
//# sourceMappingURL=world-bootstrap.js.map