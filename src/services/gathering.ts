// @ts-nocheck
// ============================================
// WORLD OF NOVA - GATHERING SERVICE (DB-BASED)
// ============================================
import { prisma } from '../lib/db.js';
import { isResourceAvailableByPeriod } from '../data/day-cycle.js';
import { getDayCycleSnapshot } from './day-cycle.js';
import { getZoneResourcePolicyAtCoords } from './world-resource-rules.js';
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function weightedRandom(items) {
    const total = items.reduce((sum, item) => sum + item.spawnChance, 0);
    let roll = Math.random() * total;
    for (const item of items) {
        roll -= item.spawnChance;
        if (roll <= 0) {
            return item;
        }
    }
    return items[0];
}
export async function gather(biomeName, options) {
    const dayPeriod = getDayCycleSnapshot().period;
    const biome = await prisma.biome.findFirst({
        where: { name: biomeName },
        include: {
            resources: {
                include: { resource: true },
            },
            resourceNodes: true,
        },
    });
    if (!biome) {
        throw new Error(`Bioma "${biomeName}" no encontrado`);
    }
    if (biome.resourceNodes.length > 0) {
        const policy = Number.isFinite(options?.x) && Number.isFinite(options?.y)
            ? getZoneResourcePolicyAtCoords(options.x, options.y)
            : null;
        return gatherFromResourceNodes(biome.resourceNodes, biome, dayPeriod, policy?.hardMax);
    }
    return gatherFromBiomeResources(biome, dayPeriod);
}
function gatherFromResourceNodes(nodes, biome, dayPeriod, hardMaxRequiredLevel) {
    const eligibleNodes = typeof hardMaxRequiredLevel === 'number'
        ? nodes.filter((node) => node.requiredLevel <= hardMaxRequiredLevel)
        : nodes;
    const selectedNode = weightedRandom(eligibleNodes.length > 0 ? eligibleNodes : nodes);
    const biomeKey = biome.name || 'plains';
    const yields = JSON.parse(selectedNode.yieldsJson || '[]').filter((entry) => isResourceAvailableByPeriod(biomeKey, entry.resource, dayPeriod));
    const items = [];
    for (const yieldEntry of yields) {
        const roll = Math.random() * 100;
        if (roll <= yieldEntry.chance) {
            items.push({
                item: yieldEntry.resource,
                emoji: yieldEntry.emoji,
                quantity: randomInt(yieldEntry.minQty, yieldEntry.maxQty),
                rarity: yieldEntry.rarity,
            });
        }
    }
    return {
        encounter: { emoji: selectedNode.emoji, name: selectedNode.displayName },
        items: items.length > 0 ? items : [{ item: 'Nothing', emoji: '💨', quantity: 0, rarity: 'common' }],
    };
}
function gatherFromBiomeResources(biome, dayPeriod) {
    if (biome.resources.length === 0) {
        return {
            encounter: { emoji: biome.emoji, name: biome.displayName },
            items: [{ item: 'Nothing', emoji: '💨', quantity: 0, rarity: 'common' }],
        };
    }
    const gathered = [];
    const biomeKey = biome.name || 'plains';
    for (const biomeResource of biome.resources) {
        if (!isResourceAvailableByPeriod(biomeKey, biomeResource.resource.name, dayPeriod)) {
            continue;
        }
        const roll = Math.random() * 100;
        if (roll <= biomeResource.spawnChance) {
            gathered.push({
                item: biomeResource.resource.name,
                emoji: biomeResource.resource.emoji,
                quantity: randomInt(biomeResource.minQuantity, biomeResource.maxQuantity),
                rarity: 'common',
            });
        }
    }
    return {
        encounter: { emoji: biome.emoji, name: biome.displayName },
        items: gathered.length > 0 ? gathered : [{ item: 'Nothing', emoji: '💨', quantity: 0, rarity: 'common' }],
    };
}
export function formatGatherResult(result) {
    const lines = [`You found ${result.encounter.emoji} **${result.encounter.name}**!`, ''];
    const itemLines = result.items
        .filter((item) => item.item !== 'Nothing')
        .map((item) => `${item.emoji} ${item.item} x${item.quantity}`);
    if (itemLines.length > 0) {
        lines.push(...itemLines);
    }
    else {
        lines.push('You found nothing useful...');
    }
    return lines.join('\n');
}
export async function listBiomes() {
    const biomes = await prisma.biome.findMany();
    return biomes.map((biome) => ({
        id: biome.name,
        name: biome.displayName,
        emoji: biome.emoji,
    }));
}
export async function getBiomeInfo(biomeName) {
    const biome = await prisma.biome.findFirst({
        where: { name: biomeName },
        include: {
            resources: { include: { resource: true } },
            resourceNodes: true,
        },
    });
    if (!biome) {
        return null;
    }
    return {
        id: biome.id,
        name: biome.name,
        emoji: biome.emoji,
        displayName: biome.displayName,
        movementFactor: biome.movementFactor,
        resources: biome.resources.map((resource) => ({
            name: resource.resource.name,
            emoji: resource.resource.emoji,
            type: resource.resource.type,
            chance: resource.spawnChance,
        })),
        resourceNodes: biome.resourceNodes.map((node) => ({
            nodeType: node.nodeType,
            displayName: node.displayName,
            emoji: node.emoji,
            spawnChance: node.spawnChance,
            yields: JSON.parse(node.yieldsJson || '[]'),
        })),
    };
}
