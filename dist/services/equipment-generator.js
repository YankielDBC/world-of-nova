import { prisma } from '../lib/db.js';
import { EQUIPMENT_TEMPLATE_CATALOG } from '../data/equipment-catalog.js';
import { ACTIVE_STATUS, bagInclude } from './bags-types.js';
import { buildBagUsage, getEquippedToolIdsFromEquipment } from './bags-core.js';
import { getFirstFreeSlotIndexes, getRarityCode } from './bags-utils.js';
const PREFIX_POOL = [
    { key: 'firm', prefix: 'Firme', stat: 'defenseFlat', min: 1, max: 4, archetypes: ['guard', 'survivor', 'volcanic'] },
    { key: 'swift', prefix: 'Ligero', stat: 'moveSpeedPct', min: 0.01, max: 0.03, archetypes: ['stalker', 'rogue', 'river'] },
    { key: 'keen', prefix: 'Agudo', stat: 'critChanceFlat', min: 0.8, max: 2.2, archetypes: ['hunter', 'precision', 'rogue'] },
    { key: 'warded', prefix: 'Velado', stat: 'resistArcaneFlat', min: 1, max: 3, archetypes: ['mystic', 'oath'] },
    { key: 'vital', prefix: 'Robusto', stat: 'maxHpFlat', min: 4, max: 14, archetypes: ['survivor', 'guard'] },
    { key: 'charged', prefix: 'Vibrante', stat: 'maxEnergyFlat', min: 3, max: 10, archetypes: ['river', 'mystic', 'swamp'] },
];
const SUFFIX_POOL = [
    { key: 'nova', suffix: 'de Nova', stat: 'resistHolyFlat', min: 1, max: 2, archetypes: ['guard', 'oath'] },
    { key: 'ash', suffix: 'de la Ceniza', stat: 'resistElementalFlat', min: 1, max: 3, archetypes: ['volcanic', 'hunter'] },
    { key: 'briar', suffix: 'de Briar', stat: 'evasionFlat', min: 1, max: 3, archetypes: ['stalker', 'rogue'] },
    { key: 'bog', suffix: 'del Pantano Quieto', stat: 'resistChemicalFlat', min: 1, max: 4, archetypes: ['swamp'] },
    { key: 'vigil', suffix: 'del Vigia', stat: 'attackFlat', min: 1, max: 4, archetypes: ['guard', 'precision', 'hunter'] },
];
const RARITY_AFFIX_COUNT = {
    common: 0,
    uncommon: 1,
    rare: 2,
    epic: 3,
    legendary: 4,
    mythic: 5,
};
const RARITY_MULTIPLIER = {
    common: 1,
    uncommon: 1.15,
    rare: 1.35,
    epic: 1.65,
    legendary: 2.1,
    mythic: 2.75,
};
function stableHash(input) {
    let hash = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash >>> 0);
}
function createDeterministicRng(seedInput) {
    let state = stableHash(seedInput) || 1;
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0xffffffff;
    };
}
function rollFrom(rng, values) {
    return values[Math.min(values.length - 1, Math.floor(rng() * values.length))];
}
function rollRange(rng, min, max) {
    const value = min + (max - min) * rng();
    return Number.isInteger(min) && Number.isInteger(max) ? Math.round(value) : Math.round(value * 100) / 100;
}
function rollRarity(rng) {
    const value = rng();
    if (value > 0.995)
        return 'mythic';
    if (value > 0.97)
        return 'legendary';
    if (value > 0.9)
        return 'epic';
    if (value > 0.7)
        return 'rare';
    if (value > 0.42)
        return 'uncommon';
    return 'common';
}
function pickAffixes(template, rarity, rng) {
    const affixCount = RARITY_AFFIX_COUNT[rarity];
    const explicitStats = {};
    let prefixKey = null;
    let suffixKey = null;
    const prefixCandidates = PREFIX_POOL.filter((affix) => (!affix.archetypes || affix.archetypes.includes(template.archetype)) &&
        (!affix.slots || affix.slots.includes(template.slot)));
    const suffixCandidates = SUFFIX_POOL.filter((affix) => (!affix.archetypes || affix.archetypes.includes(template.archetype)) &&
        (!affix.slots || affix.slots.includes(template.slot)));
    const chosen = [];
    if (affixCount >= 1 && prefixCandidates.length > 0) {
        const picked = rollFrom(rng, prefixCandidates);
        chosen.push(picked);
        prefixKey = picked.key;
    }
    if (affixCount >= 2 && suffixCandidates.length > 0) {
        const picked = rollFrom(rng, suffixCandidates);
        chosen.push(picked);
        suffixKey = picked.key;
    }
    const flexPool = [...prefixCandidates, ...suffixCandidates].filter((affix) => !chosen.some((current) => current.key === affix.key));
    while (chosen.length < affixCount && flexPool.length > 0) {
        const picked = rollFrom(rng, flexPool);
        chosen.push(picked);
        flexPool.splice(flexPool.findIndex((candidate) => candidate.key === picked.key), 1);
    }
    for (const affix of chosen) {
        const value = rollRange(rng, affix.min, affix.max);
        explicitStats[affix.stat] = (explicitStats[affix.stat] || 0) + value;
    }
    return { explicitStats, prefixKey, suffixKey, affixCount: chosen.length };
}
function buildRolledName(template, prefixKey, suffixKey) {
    const prefix = PREFIX_POOL.find((entry) => entry.key === prefixKey)?.prefix;
    const suffix = SUFFIX_POOL.find((entry) => entry.key === suffixKey)?.suffix;
    return [prefix, template.name, suffix].filter(Boolean).join(' ');
}
export async function ensureEquipmentCatalogSeeded(tx = prisma) {
    for (const template of EQUIPMENT_TEMPLATE_CATALOG) {
        await tx.equipmentTemplate.upsert({
            where: { key: template.key },
            update: {
                name: template.name,
                shortName: template.shortName,
                emoji: template.emoji,
                slot: template.slot,
                archetype: template.archetype,
                weaponClass: template.weaponClass || null,
                armorClass: template.armorClass || null,
                description: template.description,
                requiredLevel: template.requiredLevel,
                allowedClassesJson: JSON.stringify(template.allowedClasses || []),
                allowedRacesJson: JSON.stringify(template.allowedRaces || []),
                bindTypeDefault: template.bindTypeDefault,
                baseValue: template.baseValue,
                weightKg: template.weightKg,
                salvageTableKey: template.salvageTableKey || null,
                implicitStatProfileJson: JSON.stringify(template.implicitStatProfile),
                dropFamily: template.dropFamily,
                isEnabled: true,
            },
            create: {
                key: template.key,
                name: template.name,
                shortName: template.shortName,
                emoji: template.emoji,
                slot: template.slot,
                archetype: template.archetype,
                weaponClass: template.weaponClass || null,
                armorClass: template.armorClass || null,
                description: template.description,
                requiredLevel: template.requiredLevel,
                allowedClassesJson: JSON.stringify(template.allowedClasses || []),
                allowedRacesJson: JSON.stringify(template.allowedRaces || []),
                bindTypeDefault: template.bindTypeDefault,
                baseValue: template.baseValue,
                weightKg: template.weightKg,
                salvageTableKey: template.salvageTableKey || null,
                implicitStatProfileJson: JSON.stringify(template.implicitStatProfile),
                dropFamily: template.dropFamily,
                isEnabled: true,
            },
        });
    }
}
export async function generateEquipmentInstance(input) {
    const tx = input.tx || prisma;
    await ensureEquipmentCatalogSeeded(tx);
    const template = await tx.equipmentTemplate.findUnique({ where: { key: input.templateKey } });
    if (!template) {
        throw new Error(`Equipment template not found: ${input.templateKey}`);
    }
    const itemLevel = Math.max(template.requiredLevel, input.itemLevel || template.requiredLevel);
    const rng = createDeterministicRng(`${template.key}:${input.seedHint || Date.now()}:${input.playerId || 0}:${itemLevel}`);
    const rarity = input.rarity || rollRarity(rng);
    const { explicitStats, prefixKey, suffixKey, affixCount } = pickAffixes(EQUIPMENT_TEMPLATE_CATALOG.find((entry) => entry.key === template.key), rarity, rng);
    const qualityScore = Math.round(itemLevel * RARITY_MULTIPLIER[rarity] + affixCount * 6);
    const rolledMarketValue = Math.max(template.baseValue, Math.round(template.baseValue * RARITY_MULTIPLIER[rarity] + affixCount * 5));
    const bindType = input.bindType || template.bindTypeDefault;
    const specialEffectKey = rarity === 'legendary' || rarity === 'mythic' ? `${template.archetype}_surge` : null;
    void buildRolledName(EQUIPMENT_TEMPLATE_CATALOG.find((entry) => entry.key === template.key), prefixKey, suffixKey);
    return tx.equipmentInstance.create({
        data: {
            templateId: template.id,
            ownerPlayerId: input.playerId || null,
            currentContainerType: 'inventory',
            rarity,
            itemLevel,
            qualityScore,
            bindType,
            requiredLevel: Math.max(template.requiredLevel, itemLevel),
            requiredClass: JSON.parse(template.allowedClassesJson || '[]')[0] || null,
            requiredRace: JSON.parse(template.allowedRacesJson || '[]')[0] || null,
            durability: 100,
            maxDurability: 100,
            prefixKey,
            suffixKey,
            explicitStatsJson: JSON.stringify(explicitStats),
            implicitStatsJson: template.implicitStatProfileJson,
            specialEffectKey,
            tradable: bindType === 'none' || bindType === 'bind_on_equip',
            baseMarketValue: template.baseValue,
            rolledMarketValue,
            createdFrom: input.createdFrom || 'generator_v1',
        },
        include: {
            template: true,
        },
    });
}
export async function grantGeneratedEquipmentToActiveBag(input) {
    return prisma.$transaction(async (tx) => {
        await ensureEquipmentCatalogSeeded(tx);
        const [activeBag, equipment, generated] = await Promise.all([
            tx.playerBag.findFirst({
                where: { playerId: input.playerId, status: ACTIVE_STATUS },
                include: bagInclude,
            }),
            tx.playerEquipment.findUnique({ where: { playerId: input.playerId } }),
            generateEquipmentInstance({ ...input, tx }),
        ]);
        if (!activeBag) {
            throw new Error('Active bag not found while granting equipment.');
        }
        const equippedToolIds = getEquippedToolIdsFromEquipment(equipment);
        const usage = buildBagUsage(activeBag, equippedToolIds);
        const projectedWeight = usage.usedWeightKg + generated.template.weightKg;
        const projectedSlots = usage.usedSlots + 1;
        if (projectedWeight > activeBag.definition.weightCapacityKg || projectedSlots > activeBag.definition.slotCapacity) {
            throw new Error(`No cabe el equipo: ${projectedWeight.toFixed(1)}/${activeBag.definition.weightCapacityKg.toFixed(1)} kg, ${projectedSlots}/${activeBag.definition.slotCapacity} slots`);
        }
        const freeIndex = getFirstFreeSlotIndexes(activeBag.definition.slotCapacity, activeBag.slots.map((slot) => slot.slotIndex), 1)[0];
        await tx.playerBagSlot.create({
            data: {
                bagId: activeBag.id,
                slotIndex: freeIndex,
                equipmentInstanceId: generated.id,
                quantity: 1,
            },
        });
        await tx.equipmentInstance.update({
            where: { id: generated.id },
            data: {
                ownerPlayerId: input.playerId,
                currentContainerType: 'inventory',
                currentContainerId: activeBag.id,
            },
        });
        return {
            success: true,
            addedQuantity: 1,
            equipmentId: generated.id,
            rarityCode: getRarityCode(generated.rarity),
        };
    });
}
