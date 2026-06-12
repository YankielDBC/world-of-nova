// @ts-nocheck
import { prisma } from '../lib/db.js';
import { EMOJIS } from '../data/emojis.js';
import { EQUIPMENT_SLOT_LABELS } from '../data/equipment.js';
import { getEquipmentSlotLabel } from './bags-equipment-utils.js';
import { getFirstFreeSlotIndexes, getToolEquipSlot, getToolMeta } from './bags-utils.js';
import { ACTIVE_STATUS, bagInclude } from './bags-types.js';
import { buildBagUsage, buildCapacityReason, ensurePlayerEquipment, getEquippedToolIdsFromEquipment } from './bags-core.js';
const EQUIPMENT_SLOT_FIELD_MAP = {
    head: 'headId',
    chest: 'chestId',
    legs: 'legsId',
    boots: 'bootsId',
    gloves: 'glovesId',
    belt: 'beltId',
    cloak: 'cloakId',
    ring_1: 'ring1Id',
    ring_2: 'ring2Id',
    amulet: 'amuletId',
    main_hand: 'mainHandId',
    off_hand: 'offHandId',
    two_hand: 'twoHandId',
    fishing_tool: 'fishingToolId',
};
const EQUIPMENT_UNEQUIP_ALIAS_MAP = {
    head: 'head',
    chest: 'chest',
    legs: 'legs',
    boots: 'boots',
    gloves: 'gloves',
    belt: 'belt',
    cloak: 'cloak',
    ring1: 'ring_1',
    ring2: 'ring_2',
    amulet: 'amulet',
    main: 'main_hand',
    off: 'off_hand',
    two: 'two_hand',
    fish: 'fishing_tool',
};
function parseEquipmentUnequipAlias(alias) {
    const raw = alias.trim().toLowerCase();
    const match = raw.match(/^\/?ue_([a-z0-9_]+)$/);
    if (!match)
        return null;
    return EQUIPMENT_UNEQUIP_ALIAS_MAP[match[1]] || null;
}
export async function equipPlayerToolById(playerId, playerToolId, tx) {
    const [playerTool, equipment] = await Promise.all([
        tx.playerTool.findFirst({
            where: { id: playerToolId, playerId },
        }),
        ensurePlayerEquipment(playerId, tx),
    ]);
    if (!playerTool) {
        return { success: false, message: 'No se encontro esa herramienta en tu inventario.' };
    }
    if (playerTool.isBroken || playerTool.durability <= 0) {
        return { success: false, message: 'Esa herramienta esta rota. Reparala o sueltala.' };
    }
    const equipSlot = getToolEquipSlot(playerTool.toolKey);
    if (!equipSlot) {
        return { success: false, message: 'Esa herramienta no puede equiparse en un slot activo.' };
    }
    const currentToolId = equipment[equipSlot];
    if (currentToolId === playerTool.id) {
        return { success: false, message: 'Esa herramienta ya esta equipada.' };
    }
    if (equipSlot === 'chopToolId') {
        await tx.playerEquipment.update({
            where: { playerId },
            data: {
                chopTool: { connect: { id: playerTool.id } },
            },
        });
    }
    else if (equipSlot === 'mineToolId') {
        await tx.playerEquipment.update({
            where: { playerId },
            data: {
                mineTool: { connect: { id: playerTool.id } },
            },
        });
    }
    else {
        await tx.playerEquipment.update({
            where: { playerId },
            data: {
                gatherTool: { connect: { id: playerTool.id } },
            },
        });
    }
    const toolMeta = getToolMeta(playerTool.toolKey);
    const slotLabel = getEquipmentSlotLabel(equipSlot);
    return {
        success: true,
        message: `${EMOJIS.ui.check} ${toolMeta?.emoji || ''} ${toolMeta?.name || 'Tool'} ahora esta equipada en ${slotLabel}.`,
    };
}
export async function equipEquipmentFromBagById(playerId, equipmentInstanceId, bagSlotId, tx) {
    const [instance, activeBag, equipment] = await Promise.all([
        tx.equipmentInstance.findUnique({
            where: { id: equipmentInstanceId },
            include: { template: true },
        }),
        tx.playerBag.findFirst({
            where: { playerId, status: ACTIVE_STATUS },
            include: bagInclude,
        }),
        ensurePlayerEquipment(playerId, tx),
    ]);
    if (!instance?.template || !activeBag) {
        return { success: false, message: 'No pude equipar ese objeto ahora mismo.' };
    }
    const slotKey = instance.template.slot;
    const slotField = EQUIPMENT_SLOT_FIELD_MAP[slotKey];
    if (!slotField) {
        return { success: false, message: 'Ese equipo no tiene un slot valido.' };
    }
    if (equipment[slotField] === instance.id) {
        return { success: false, message: 'Ese equipo ya esta equipado.' };
    }
    const player = await tx.player.findUnique({
        where: { id: playerId },
        select: { level: true, race: true, class: true },
    });
    if (!player) {
        return { success: false, message: 'No encontre al jugador para equipar ese objeto.' };
    }
    if (player.level < instance.requiredLevel) {
        return { success: false, message: `Necesitas nivel ${instance.requiredLevel} para equipar ese objeto.` };
    }
    if (instance.requiredClass &&
        String(player.class || '').toLowerCase() !== String(instance.requiredClass).toLowerCase()) {
        return { success: false, message: `Ese equipo requiere la clase ${instance.requiredClass}.` };
    }
    if (instance.requiredRace &&
        String(player.race || '').toLowerCase() !== String(instance.requiredRace).toLowerCase()) {
        return { success: false, message: `Ese equipo requiere la raza ${instance.requiredRace}.` };
    }
    const previousEquippedId = Number(equipment[slotField] || 0) || null;
    const updateData = { [slotField]: instance.id };
    if (slotKey === 'two_hand') {
        updateData.mainHandId = null;
        updateData.offHandId = null;
    }
    else if (slotKey === 'main_hand' || slotKey === 'off_hand') {
        updateData.twoHandId = null;
    }
    await tx.playerEquipment.update({
        where: { playerId },
        data: updateData,
    });
    if (previousEquippedId) {
        await tx.playerBagSlot.update({
            where: { id: bagSlotId },
            data: {
                resourceId: null,
                storedBagId: null,
                toolKey: null,
                playerToolId: null,
                equipmentInstanceId: previousEquippedId,
                quantity: 1,
            },
        });
        await tx.equipmentInstance.update({
            where: { id: previousEquippedId },
            data: {
                ownerPlayerId: playerId,
                currentContainerType: 'inventory',
                currentContainerId: activeBag.id,
            },
        });
    }
    else {
        await tx.playerBagSlot.delete({ where: { id: bagSlotId } });
    }
    await tx.equipmentInstance.update({
        where: { id: instance.id },
        data: {
            ownerPlayerId: playerId,
            currentContainerType: 'equipped',
            currentContainerId: equipment.id,
            boundPlayerId: instance.bindType === 'bind_on_equip' && !instance.boundPlayerId ? playerId : instance.boundPlayerId,
            boundAt: instance.bindType === 'bind_on_equip' && !instance.boundAt ? new Date() : instance.boundAt,
            tradable: instance.bindType === 'bind_on_equip' ? false : instance.tradable,
        },
    });
    const slotLabel = EQUIPMENT_SLOT_LABELS[slotKey] || String(instance.template.slot || 'Equipo');
    const itemLabel = instance.template.shortName || instance.template.name;
    return {
        success: true,
        message: `${EMOJIS.ui.check} ${instance.template.emoji} ${itemLabel} ahora esta equipado en ${slotLabel}.`,
    };
}
export async function unequipToolById(playerId, playerToolId, tx) {
    const equipment = await ensurePlayerEquipment(playerId, tx);
    const updateData = {};
    if (equipment.chopToolId === playerToolId)
        updateData.chopTool = { disconnect: true };
    if (equipment.mineToolId === playerToolId)
        updateData.mineTool = { disconnect: true };
    if (equipment.gatherToolId === playerToolId)
        updateData.gatherTool = { disconnect: true };
    if (!Object.keys(updateData).length) {
        return { success: false, message: 'Esa herramienta no esta equipada en ningun slot.' };
    }
    await tx.playerEquipment.update({
        where: { playerId },
        data: updateData,
    });
    const toolMeta = getToolMeta((await tx.playerTool.findFirst({ where: { id: playerToolId } }))?.toolKey ?? '');
    return {
        success: true,
        message: `${EMOJIS.ui.check} ${toolMeta?.emoji || ''} ${toolMeta?.name || 'Tool'} fue desequipada.`,
    };
}
export async function unequipEquipmentByAliasImpl(playerId, alias) {
    const slotKey = parseEquipmentUnequipAlias(alias);
    if (!slotKey) {
        return { success: false, message: 'Alias invalido. Usa /ue_head, /ue_chest, /ue_main, etc.' };
    }
    return prisma.$transaction(async (tx) => {
        const [activeBag, equipment] = await Promise.all([
            tx.playerBag.findFirst({
                where: { playerId, status: ACTIVE_STATUS },
                include: bagInclude,
            }),
            ensurePlayerEquipment(playerId, tx),
        ]);
        if (!activeBag) {
            return { success: false, message: 'No se encontro tu bolsa activa.' };
        }
        const slotField = EQUIPMENT_SLOT_FIELD_MAP[slotKey];
        const equippedId = Number(equipment[slotField] || 0) || null;
        if (!equippedId) {
            return { success: false, message: `No tienes equipo en ${EQUIPMENT_SLOT_LABELS[slotKey]}.` };
        }
        const instance = await tx.equipmentInstance.findUnique({
            where: { id: equippedId },
            include: { template: true },
        });
        if (!instance?.template) {
            await tx.playerEquipment.update({
                where: { playerId },
                data: { [slotField]: null },
            });
            return { success: false, message: 'Ese equipo no esta disponible. Slot limpiado.' };
        }
        const usage = buildBagUsage(activeBag, getEquippedToolIdsFromEquipment(equipment));
        const projectedWeight = usage.usedWeightKg + instance.template.weightKg;
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
            return { success: false, message: 'No hay slot libre en la bolsa para desequipar.' };
        }
        await tx.playerBagSlot.create({
            data: {
                bagId: activeBag.id,
                slotIndex: freeSlot,
                equipmentInstanceId: instance.id,
                quantity: 1,
            },
        });
        await tx.playerEquipment.update({
            where: { playerId },
            data: { [slotField]: null },
        });
        await tx.equipmentInstance.update({
            where: { id: instance.id },
            data: {
                ownerPlayerId: playerId,
                currentContainerType: 'inventory',
                currentContainerId: activeBag.id,
            },
        });
        return {
            success: true,
            message: `${EMOJIS.ui.check} Desequipaste ${instance.template.emoji} ${instance.template.shortName || instance.template.name} de ${EQUIPMENT_SLOT_LABELS[slotKey]}.`,
        };
    });
}
//# sourceMappingURL=bags-tools-actions.js.map