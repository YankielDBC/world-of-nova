// @ts-nocheck
import { prisma } from '../lib/db.js';
import { EMOJIS } from '../data/emojis.js';
import { EQUIPMENT_SLOT_LABELS } from '../data/equipment.js';
import { formatToolInstanceLine, getToolRequirement, parseEquipAlias, parseUnequipAlias, } from './bags-equipment-utils.js';
import { getFirstFreeSlotIndexes, getRarityCode, getToolMeta, getToolWeight, } from './bags-utils.js';
import { ACTIVE_STATUS, bagInclude } from './bags-types.js';
import { actionToEquipSlot, buildBagUsage, buildCapacityReason, ensurePlayerEquipment, getEquippedToolIdsFromEquipment, unequipToolIfEquipped, } from './bags-core.js';
import { equipPlayerToolById, equipEquipmentFromBagById, unequipToolById, unequipEquipmentByAliasImpl, } from './bags-tools-actions.js';
export { unequipEquipmentByAliasImpl };
export async function getActiveBagItemInfoByUidImpl(playerId, slotUid) {
    const slot = await prisma.playerBagSlot.findFirst({
        where: {
            id: slotUid,
            bag: {
                playerId,
                status: ACTIVE_STATUS,
            },
        },
        include: {
            resource: true,
            playerTool: true,
            equipmentInstance: {
                include: {
                    template: true,
                },
            },
            storedBag: {
                include: {
                    definition: true,
                },
            },
            bag: true,
        },
    });
    if (!slot) {
        return null;
    }
    if (slot.resource) {
        return {
            slotUid: slot.id,
            slotIndex: slot.slotIndex,
            bagId: slot.bagId,
            kind: 'resource',
            emoji: slot.resource.emoji,
            label: slot.resource.name,
            rarityCode: getRarityCode(slot.resource.rarity),
            quantity: slot.quantity,
            usable: slot.resource.usable,
            effectType: slot.resource.effectType || undefined,
            effectValue: slot.resource.effectValue || undefined,
            description: slot.resource.description || undefined,
            uniqueObjectId: `S-${slot.id}`,
        };
    }
    if (slot.storedBag?.definition) {
        return {
            slotUid: slot.id,
            slotIndex: slot.slotIndex,
            bagId: slot.bagId,
            kind: 'storedBag',
            emoji: slot.storedBag.definition.emoji,
            label: slot.storedBag.definition.displayName,
            rarityCode: 'C',
            quantity: 1,
            usable: false,
            description: slot.storedBag.definition.description || undefined,
            uniqueObjectId: `B-${slot.storedBag.id}`,
        };
    }
    if (slot.equipmentInstance?.template) {
        const template = slot.equipmentInstance.template;
        return {
            slotUid: slot.id,
            slotIndex: slot.slotIndex,
            bagId: slot.bagId,
            kind: 'equipment',
            emoji: template.emoji,
            label: template.shortName || template.name,
            rarityCode: getRarityCode(slot.equipmentInstance.rarity),
            quantity: 1,
            usable: false,
            equipmentInstanceId: slot.equipmentInstance.id,
            durability: slot.equipmentInstance.durability,
            maxDurability: slot.equipmentInstance.maxDurability,
            isBroken: slot.equipmentInstance.isBroken,
            description: template.description || undefined,
            equipmentSlot: EQUIPMENT_SLOT_LABELS[template.slot || 'head'] || template.slot,
            bindType: slot.equipmentInstance.bindType,
            itemLevel: slot.equipmentInstance.itemLevel,
            requiredLevel: slot.equipmentInstance.requiredLevel,
            requiredClass: slot.equipmentInstance.requiredClass || undefined,
            requiredRace: slot.equipmentInstance.requiredRace || undefined,
            specialEffectKey: slot.equipmentInstance.specialEffectKey || undefined,
            uniqueObjectId: `E-${slot.equipmentInstance.id}`,
        };
    }
    const toolKey = slot.playerTool?.toolKey || slot.toolKey;
    const meta = getToolMeta(toolKey);
    if (!meta) {
        return null;
    }
    const req = getToolRequirement(meta.type);
    return {
        slotUid: slot.id,
        slotIndex: slot.slotIndex,
        bagId: slot.bagId,
        kind: 'tool',
        emoji: meta.emoji,
        label: meta.name,
        rarityCode: getRarityCode(slot.playerTool?.rarity || meta.rarity),
        quantity: 1,
        usable: false,
        toolKey: meta.id,
        playerToolId: slot.playerTool?.id,
        durability: slot.playerTool?.durability,
        maxDurability: slot.playerTool?.maxDurability,
        isBroken: slot.playerTool?.isBroken ?? false,
        description: meta.description,
        requiredSkill: req.skill,
        requiredLevel: req.level,
        uniqueObjectId: slot.playerTool?.id ? `T-${slot.playerTool.id}` : `S-${slot.id}`,
    };
}
export async function equipToolFromBagItemImpl(playerId, slotUid) {
    const info = await getActiveBagItemInfoByUidImpl(playerId, slotUid);
    if (!info) {
        return { success: false, message: 'No encontre ese objeto en tu mochila activa.' };
    }
    if (info.kind === 'tool' && info.playerToolId) {
        return prisma.$transaction(async (tx) => equipPlayerToolById(playerId, info.playerToolId, tx));
    }
    if (info.kind === 'equipment' && info.equipmentInstanceId) {
        return prisma.$transaction(async (tx) => equipEquipmentFromBagById(playerId, info.equipmentInstanceId, info.slotUid, tx));
    }
    return { success: false, message: 'Ese item no es equipable.' };
}
export async function equipToolByAliasImpl(playerId, alias) {
    const equipId = parseEquipAlias(alias);
    if (equipId == null) {
        return { success: false, message: 'Alias invalido. Usa el formato /eq_0' };
    }
    const slot = await prisma.playerBagSlot.findFirst({
        where: {
            bag: { playerId, status: ACTIVE_STATUS },
            playerToolId: equipId,
        },
        include: { playerTool: true },
    });
    if (!slot?.playerToolId) {
        return { success: false, message: 'No encontre esa herramienta para equipar.' };
    }
    return prisma.$transaction(async (tx) => equipPlayerToolById(playerId, slot.playerToolId, tx));
}
export async function unequipToolByAliasImpl(playerId, alias) {
    const equipment = await prisma.playerEquipment.findUnique({
        where: { playerId },
    });
    const aliasValue = parseUnequipAlias(alias);
    if (aliasValue == null) {
        return { success: false, message: 'Alias invalido. Usa /u_0' };
    }
    const toolIds = [equipment?.chopToolId, equipment?.mineToolId, equipment?.gatherToolId].filter((value) => typeof value === 'number');
    let toolId;
    if (toolIds.includes(aliasValue)) {
        toolId = aliasValue;
    }
    else if (aliasValue >= 0 && aliasValue < toolIds.length) {
        toolId = toolIds[aliasValue];
    }
    if (!toolId) {
        return { success: false, message: 'No encontre la herramienta para desequipar.' };
    }
    return prisma.$transaction(async (tx) => unequipToolById(playerId, toolId, tx));
}
export async function grantToolToPlayerImpl(playerId, toolKey, options) {
    const toolMeta = getToolMeta(toolKey);
    if (!toolMeta) {
        return { success: false, message: 'La herramienta solicitada no existe.' };
    }
    return prisma.$transaction(async (tx) => {
        const [activeBag, equipment] = await Promise.all([
            tx.playerBag.findFirst({
                where: { playerId, status: ACTIVE_STATUS },
                include: bagInclude,
            }),
            tx.playerEquipment.findUnique({ where: { playerId } }),
        ]);
        if (!activeBag) {
            return { success: false, message: 'No se encontro tu bolsa activa.' };
        }
        const usage = buildBagUsage(activeBag, getEquippedToolIdsFromEquipment(equipment));
        const projectedWeight = usage.usedWeightKg + toolMeta.weightKg;
        const projectedSlots = usage.usedSlots + 1;
        const weightExceeded = projectedWeight > activeBag.definition.weightCapacityKg;
        const slotExceeded = projectedSlots > activeBag.definition.slotCapacity;
        if (weightExceeded || slotExceeded) {
            return {
                success: false,
                message: buildCapacityReason(weightExceeded, slotExceeded, {
                    weightNeeded: projectedWeight,
                    weightCapacity: activeBag.definition.weightCapacityKg,
                    slotsNeeded: projectedSlots,
                    slotCapacity: activeBag.definition.slotCapacity,
                }),
            };
        }
        const freeIndex = getFirstFreeSlotIndexes(activeBag.definition.slotCapacity, activeBag.slots.map((slot) => slot.slotIndex), 1)[0];
        const playerTool = await tx.playerTool.create({
            data: {
                playerId,
                toolKey: toolMeta.id,
                rarity: toolMeta.rarity,
                merchantLocked: options?.merchantLocked ?? false,
                durability: toolMeta.durabilityMax,
                maxDurability: toolMeta.durabilityMax,
                isBroken: false,
            },
        });
        await tx.playerBagSlot.create({
            data: {
                bagId: activeBag.id,
                slotIndex: freeIndex,
                toolKey: toolMeta.id,
                playerToolId: playerTool.id,
                quantity: 1,
            },
        });
        return {
            success: true,
            message: `${EMOJIS.ui.check} Recibiste ${toolMeta.emoji} ${toolMeta.name}.`,
        };
    });
}
export async function pickupDroppedToolImpl(playerId, input) {
    if (!input.playerToolId) {
        if (!input.toolKey) {
            return { success: false, message: 'Ese loot no tiene herramienta valida.' };
        }
        return grantToolToPlayerImpl(playerId, input.toolKey);
    }
    return prisma.$transaction(async (tx) => {
        const [activeBag, instance, equipment] = await Promise.all([
            tx.playerBag.findFirst({
                where: { playerId, status: ACTIVE_STATUS },
                include: bagInclude,
            }),
            tx.playerTool.findUnique({
                where: { id: input.playerToolId },
            }),
            tx.playerEquipment.findUnique({ where: { playerId } }),
        ]);
        if (!activeBag) {
            return { success: false, message: 'No se encontro tu bolsa activa.' };
        }
        if (!instance) {
            if (input.toolKey) {
                return grantToolToPlayerImpl(playerId, input.toolKey);
            }
            return { success: false, message: 'Esa herramienta ya no esta disponible.' };
        }
        const slotted = await tx.playerBagSlot.findFirst({
            where: { playerToolId: instance.id },
        });
        if (slotted) {
            return { success: false, message: 'Esa herramienta ya esta en uso.' };
        }
        const usage = buildBagUsage(activeBag, getEquippedToolIdsFromEquipment(equipment));
        const projectedWeight = usage.usedWeightKg + getToolWeight(instance.toolKey);
        const projectedSlots = usage.usedSlots + 1;
        const weightExceeded = projectedWeight > activeBag.definition.weightCapacityKg;
        const slotExceeded = projectedSlots > activeBag.definition.slotCapacity;
        if (weightExceeded || slotExceeded) {
            return {
                success: false,
                message: buildCapacityReason(weightExceeded, slotExceeded, {
                    weightNeeded: projectedWeight,
                    weightCapacity: activeBag.definition.weightCapacityKg,
                    slotsNeeded: projectedSlots,
                    slotCapacity: activeBag.definition.slotCapacity,
                }),
            };
        }
        const freeSlot = getFirstFreeSlotIndexes(activeBag.definition.slotCapacity, activeBag.slots.map((slot) => slot.slotIndex), 1)[0];
        if (!freeSlot) {
            return { success: false, message: 'No hay slots libres para recoger la herramienta.' };
        }
        await unequipToolIfEquipped(tx, instance.playerId, instance.id);
        await tx.playerTool.update({
            where: { id: instance.id },
            data: { playerId },
        });
        await tx.playerBagSlot.create({
            data: {
                bagId: activeBag.id,
                slotIndex: freeSlot,
                toolKey: instance.toolKey,
                playerToolId: instance.id,
                quantity: 1,
            },
        });
        const meta = getToolMeta(instance.toolKey);
        return {
            success: true,
            message: `${EMOJIS.ui.check} Recogiste ${meta?.emoji || input.emoji} ${meta?.name || input.name}.`,
        };
    });
}
export async function getEquippedToolForActionImpl(playerId, action) {
    const equipment = await prisma.playerEquipment.findUnique({
        where: { playerId },
    });
    if (!equipment) {
        return null;
    }
    const slot = actionToEquipSlot(action);
    const toolId = equipment[slot];
    if (!toolId) {
        return null;
    }
    const instance = await prisma.playerTool.findFirst({
        where: { id: toolId, playerId },
    });
    if (!instance) {
        return null;
    }
    return { instance, toolKey: instance.toolKey };
}
export async function applyDurabilityDamageOnEquippedToolImpl(playerId, action, damage) {
    return prisma.$transaction(async (tx) => {
        const equipment = await ensurePlayerEquipment(playerId, tx);
        const slot = actionToEquipSlot(action);
        const toolId = equipment[slot];
        if (!toolId) {
            return null;
        }
        const instance = await tx.playerTool.findFirst({
            where: { id: toolId, playerId },
        });
        if (!instance) {
            return null;
        }
        const toolMeta = getToolMeta(instance.toolKey);
        if (!toolMeta) {
            return null;
        }
        const previousBroken = instance.isBroken || instance.durability <= 0;
        const nextDurability = Math.max(0, instance.durability - Math.max(1, damage));
        const nextBroken = nextDurability <= 0;
        await tx.playerTool.update({
            where: { id: instance.id },
            data: {
                durability: nextDurability,
                isBroken: nextBroken,
            },
        });
        return {
            brokeNow: !previousBroken && nextBroken,
            nowBroken: nextBroken,
            durability: nextDurability,
            maxDurability: instance.maxDurability,
            toolName: toolMeta.name,
            emoji: toolMeta.emoji,
        };
    });
}
export async function getEquipmentCardImpl(playerId) {
    const equipment = await prisma.playerEquipment.findUnique({
        where: { playerId },
        include: {
            chopTool: true,
            mineTool: true,
            gatherTool: true,
            fishingTool: { include: { template: true } },
            head: { include: { template: true } },
            chest: { include: { template: true } },
            legs: { include: { template: true } },
            boots: { include: { template: true } },
            gloves: { include: { template: true } },
            belt: { include: { template: true } },
            cloak: { include: { template: true } },
            ring1: { include: { template: true } },
            ring2: { include: { template: true } },
            amulet: { include: { template: true } },
            mainHand: { include: { template: true } },
            offHand: { include: { template: true } },
            twoHand: { include: { template: true } },
        },
    });
    const lines = ['🔧 Equipped Items', '✧═══••═══✧', '', '⋆ Basic Tools ⋆', '┌────────┐'];
    const slotRows = [
        { slot: 'chopToolId', tool: equipment?.chopTool || null },
        { slot: 'mineToolId', tool: equipment?.mineTool || null },
        { slot: 'gatherToolId', tool: equipment?.gatherTool || null },
    ];
    const unequipMap = {};
    slotRows.forEach((row) => {
        if (row.tool) {
            unequipMap[row.tool.id] = `/u_${row.tool.id}`;
        }
    });
    const equippedRows = slotRows.filter((row) => !!row.tool);
    if (equippedRows.length === 0) {
        lines.push('└ Sin herramientas equipadas');
    }
    else {
        equippedRows.forEach((row, index) => {
            const marker = index === 0 ? '┌' : index === equippedRows.length - 1 ? '└' : '├';
            lines.push(`${marker} ${formatToolInstanceLine(row.tool, 'Tool')} ${unequipMap[row.tool.id]}`);
        });
    }
    const gearRows = [
        { key: 'head', alias: 'head', item: equipment?.head || null },
        { key: 'chest', alias: 'chest', item: equipment?.chest || null },
        { key: 'legs', alias: 'legs', item: equipment?.legs || null },
        { key: 'boots', alias: 'boots', item: equipment?.boots || null },
        { key: 'gloves', alias: 'gloves', item: equipment?.gloves || null },
        { key: 'belt', alias: 'belt', item: equipment?.belt || null },
        { key: 'cloak', alias: 'cloak', item: equipment?.cloak || null },
        { key: 'ring_1', alias: 'ring1', item: equipment?.ring1 || null },
        { key: 'ring_2', alias: 'ring2', item: equipment?.ring2 || null },
        { key: 'amulet', alias: 'amulet', item: equipment?.amulet || null },
        { key: 'main_hand', alias: 'main', item: equipment?.mainHand || null },
        { key: 'off_hand', alias: 'off', item: equipment?.offHand || null },
        { key: 'two_hand', alias: 'two', item: equipment?.twoHand || null },
        { key: 'fishing_tool', alias: 'fish', item: equipment?.fishingTool || null },
    ];
    lines.push('', '⋆ Gear Slots ⋆', '┌────────┐');
    gearRows.forEach((row, index) => {
        const marker = index === 0 ? '┌' : index === gearRows.length - 1 ? '└' : '├';
        const slotLabel = EQUIPMENT_SLOT_LABELS[row.key];
        if (!row.item?.template) {
            lines.push(`${marker} ${slotLabel}: Empty`);
            return;
        }
        const gearName = row.item.template.shortName || row.item.template.name;
        lines.push(`${marker} ${row.item.template.emoji} ${slotLabel}: ${gearName} /ue_${row.alias}`);
    });
    lines.push('', 'Tip: /u_<id> desequipa tools, /ue_<slot> desequipa gear.');
    return lines.join('\n').trim();
}
