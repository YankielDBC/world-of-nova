// @ts-nocheck
import { prisma } from '../lib/db.js';
import { EMOJIS } from '../data/emojis.js';
import { getEffectiveStackLimit, getFirstFreeSlotIndexes, getToolMeta, } from './bags-utils.js';
import { ACTIVE_STATUS, DORMANT_STATUS, STORED_STATUS, bagInclude, } from './bags-types.js';
import { buildBagKeyboard, buildBagUsage, buildCapacityReason, buildEmptyBagTransferPlan, buildSlotView, ensureLegacyToolInstances, ensurePlayerEquipment, getActiveBagRecord, getEquippedToolIdsFromEquipment, getPocketBagRecord, getPocketDefinition, loadSwitchBags, loadEquippedToolIds, persistDroppedLootAtPlayerTile, unequipToolIfEquipped, buildBagText, buildTransferItemsForSwitch, buildToolAliasMap, } from './bags-core.js';
import { applyDurabilityDamageOnEquippedToolImpl, equipToolByAliasImpl, equipToolFromBagItemImpl, getActiveBagItemInfoByUidImpl, getEquipmentCardImpl, getEquippedToolForActionImpl, grantToolToPlayerImpl, pickupDroppedToolImpl, unequipEquipmentByAliasImpl, unequipToolByAliasImpl, } from './bags-tools.js';
export async function ensurePlayerBagSetup(playerId) {
    const pocketDefinition = await getPocketDefinition();
    if (!pocketDefinition) {
        throw new Error('Pocket definition not found. Run bag seeds first.');
    }
    await prisma.$transaction(async (tx) => {
        await ensurePlayerEquipment(playerId, tx);
        const current = await tx.playerBag.findMany({
            where: { playerId },
            include: { definition: true },
        });
        const currentPocket = current.find((bag) => bag.definition.isPocket);
        const currentActive = current.find((bag) => bag.status === ACTIVE_STATUS);
        if (!currentPocket) {
            await tx.playerBag.create({
                data: {
                    playerId,
                    bagDefinitionId: pocketDefinition.id,
                    status: currentActive ? DORMANT_STATUS : ACTIVE_STATUS,
                },
            });
            return;
        }
        if (!currentActive) {
            await tx.playerBag.update({
                where: { id: currentPocket.id },
                data: { status: ACTIVE_STATUS },
            });
        }
        await ensureLegacyToolInstances(playerId, tx);
    });
}
export async function getActiveBagView(playerId, lang = 'es') {
    await ensurePlayerBagSetup(playerId);
    const [bag, equipment] = await Promise.all([
        getActiveBagRecord(playerId),
        prisma.playerEquipment.findUnique({
            where: { playerId },
        }),
    ]);
    if (!bag) {
        throw new Error('Active bag not found.');
    }
    const equippedToolIds = getEquippedToolIdsFromEquipment(equipment);
    const usage = buildBagUsage(bag, equippedToolIds);
    const slotViews = bag.slots
        .map((slot) => buildSlotView(slot, equippedToolIds))
        .filter((slot) => !!slot && !slot.isEquipped);
    const toolAliasMap = buildToolAliasMap(slotViews);
    const switchOptions = await listBagSwitchOptions(playerId);
    const keyboard = buildBagKeyboard(slotViews, switchOptions, lang);
    return {
        text: buildBagText(bag, usage, slotViews, lang),
        keyboard,
        usage,
        slots: slotViews,
        toolAliasMap,
    };
}
export async function getActiveBagUsage(playerId) {
    await ensurePlayerBagSetup(playerId);
    const [bag, equippedToolIds] = await Promise.all([getActiveBagRecord(playerId), loadEquippedToolIds(playerId)]);
    if (!bag) {
        return null;
    }
    return buildBagUsage(bag, equippedToolIds);
}
export async function addResourceToActiveBag(playerId, resourceName, quantity) {
    await ensurePlayerBagSetup(playerId);
    return prisma.$transaction(async (tx) => {
        const [bag, resource, equipment] = await Promise.all([
            tx.playerBag.findFirst({
                where: { playerId, status: ACTIVE_STATUS },
                include: bagInclude,
            }),
            tx.resource.findUnique({ where: { name: resourceName } }),
            tx.playerEquipment.findUnique({ where: { playerId } }),
        ]);
        if (!bag || !resource) {
            return {
                success: false,
                reason: 'No se encontró la bolsa activa o el recurso.',
            };
        }
        const equippedToolIds = getEquippedToolIdsFromEquipment(equipment);
        const usage = buildBagUsage(bag, equippedToolIds);
        const stackLimit = getEffectiveStackLimit(bag.definition, resource);
        const matchingStacks = bag.slots.filter((slot) => slot.resourceId === resource.id && !!slot.resource && slot.quantity < stackLimit);
        let remaining = quantity;
        for (const slot of matchingStacks) {
            const freeSpace = stackLimit - slot.quantity;
            remaining -= Math.min(freeSpace, remaining);
            if (remaining <= 0) {
                break;
            }
        }
        const newSlotsNeeded = remaining > 0 ? Math.ceil(remaining / stackLimit) : 0;
        const projectedSlots = usage.usedSlots + newSlotsNeeded;
        const projectedWeight = usage.usedWeightKg + resource.weightKg * quantity;
        const weightExceeded = projectedWeight > bag.definition.weightCapacityKg;
        const slotExceeded = projectedSlots > bag.definition.slotCapacity;
        if (weightExceeded || slotExceeded) {
            return {
                success: false,
                reason: buildCapacityReason(weightExceeded, slotExceeded, {
                    weightNeeded: projectedWeight,
                    weightCapacity: bag.definition.weightCapacityKg,
                    slotsNeeded: projectedSlots,
                    slotCapacity: bag.definition.slotCapacity,
                }),
            };
        }
        let leftToPlace = quantity;
        for (const slot of matchingStacks) {
            if (leftToPlace <= 0) {
                break;
            }
            const freeSpace = stackLimit - slot.quantity;
            if (freeSpace <= 0) {
                continue;
            }
            const amount = Math.min(freeSpace, leftToPlace);
            await tx.playerBagSlot.update({
                where: { id: slot.id },
                data: { quantity: slot.quantity + amount },
            });
            leftToPlace -= amount;
        }
        if (leftToPlace > 0) {
            const freeIndexes = getFirstFreeSlotIndexes(bag.definition.slotCapacity, bag.slots.map((slot) => slot.slotIndex), Math.ceil(leftToPlace / stackLimit));
            let remainingToCreate = leftToPlace;
            for (const slotIndex of freeIndexes) {
                if (remainingToCreate <= 0) {
                    break;
                }
                const amount = Math.min(stackLimit, remainingToCreate);
                await tx.playerBagSlot.create({
                    data: {
                        bagId: bag.id,
                        slotIndex,
                        resourceId: resource.id,
                        quantity: amount,
                    },
                });
                remainingToCreate -= amount;
            }
        }
        const refreshed = await tx.playerBag.findUnique({
            where: { id: bag.id },
            include: bagInclude,
        });
        return {
            success: true,
            addedQuantity: quantity,
            usage: refreshed ? buildBagUsage(refreshed, equippedToolIds) : usage,
        };
    });
}
export async function storeGatheredItems(playerId, items) {
    const result = { stored: [], rejected: [] };
    const grouped = new Map();
    for (const item of items) {
        if (item.item === 'Nothing' || item.quantity <= 0) {
            continue;
        }
        const key = item.item.trim().toLowerCase();
        const existing = grouped.get(key);
        if (existing) {
            existing.quantity += item.quantity;
        }
        else {
            grouped.set(key, {
                item: item.item,
                emoji: item.emoji,
                quantity: item.quantity,
            });
        }
    }
    for (const groupedItem of grouped.values()) {
        const addResult = await addResourceToActiveBag(playerId, groupedItem.item, groupedItem.quantity);
        if (addResult.success) {
            result.stored.push({
                emoji: groupedItem.emoji,
                name: groupedItem.item,
                quantity: groupedItem.quantity,
            });
        }
        else {
            result.rejected.push({
                emoji: groupedItem.emoji,
                name: groupedItem.item,
                quantity: groupedItem.quantity,
                reason: addResult.reason || 'No cupo en la bolsa.',
            });
        }
    }
    return result;
}
export async function useBagSlot(playerId, slotIndex, quantity) {
    await ensurePlayerBagSetup(playerId);
    return prisma.$transaction(async (tx) => {
        const bag = await tx.playerBag.findFirst({
            where: { playerId, status: ACTIVE_STATUS },
            include: bagInclude,
        });
        const player = await tx.player.findUnique({ where: { id: playerId } });
        if (!bag || !player) {
            return { success: false, message: 'No se encontró al jugador o su bolsa activa.' };
        }
        const slot = bag.slots.find((entry) => entry.slotIndex === slotIndex);
        if (!slot || !slot.resource) {
            return { success: false, message: `No existe el slot #${String(slotIndex).padStart(2, '0')}.` };
        }
        if (!slot.resource.usable || !slot.resource.effectType || !slot.resource.effectValue) {
            return { success: false, message: `${slot.resource.emoji} ${slot.resource.name} no tiene un efecto directo para usar.` };
        }
        if (quantity < 1 || quantity > slot.quantity) {
            return { success: false, message: `Cantidad inválida. En ese slot tienes ${slot.quantity}.` };
        }
        const totalEffect = slot.resource.effectValue * quantity;
        let playerData = {};
        let effectSummary = '';
        if (slot.resource.effectType === 'HP') {
            const newHp = Math.min(player.maxHp, player.hp + totalEffect);
            playerData = { hp: newHp };
            effectSummary = `${EMOJIS.ui.heart} +${newHp - player.hp} HP`;
        }
        else if (slot.resource.effectType === 'ENERGY') {
            const newEnergy = Math.min(player.maxEnergy, player.energy + totalEffect);
            playerData = { energy: newEnergy };
            effectSummary = `${EMOJIS.ui.energy} +${newEnergy - player.energy} STA`;
        }
        else {
            return { success: false, message: 'Ese objeto todavía no tiene efecto soportado.' };
        }
        await tx.player.update({
            where: { id: player.id },
            data: playerData,
        });
        if (slot.quantity === quantity) {
            if (slot.equipmentInstance?.template) {
                await tx.playerBagSlot.delete({ where: { id: slot.id } });
                await tx.equipmentInstance.update({
                    where: { id: slot.equipmentInstance.id },
                    data: {
                        ownerPlayerId: null,
                        currentContainerType: 'ground',
                        currentContainerId: null,
                    },
                });
                return {
                    success: true,
                    message: `${EMOJIS.ui.drop} Soltaste ${slot.equipmentInstance.template.emoji} ${slot.equipmentInstance.template.shortName || slot.equipmentInstance.template.name}.`,
                    groundPayload: {
                        kind: 'equipment',
                        emoji: slot.equipmentInstance.template.emoji,
                        name: slot.equipmentInstance.template.shortName || slot.equipmentInstance.template.name,
                        quantity: 1,
                        equipmentInstanceId: slot.equipmentInstance.id,
                        templateKey: slot.equipmentInstance.template.key,
                    },
                };
            }
            if (slot.playerToolId) {
                await unequipToolIfEquipped(tx, playerId, slot.playerToolId);
            }
            await tx.playerBagSlot.delete({ where: { id: slot.id } });
        }
        else {
            await tx.playerBagSlot.update({
                where: { id: slot.id },
                data: { quantity: slot.quantity - quantity },
            });
        }
        return {
            success: true,
            message: `${EMOJIS.ui.check} Usaste ${slot.resource.emoji} ${slot.resource.name} x${quantity}.\n${effectSummary}`,
        };
    });
}
export async function dropBagSlot(playerId, slotIndex, quantity) {
    await ensurePlayerBagSetup(playerId);
    const dropped = await prisma.$transaction(async (tx) => {
        const bag = await tx.playerBag.findFirst({
            where: { playerId, status: ACTIVE_STATUS },
            include: bagInclude,
        });
        if (!bag) {
            return { success: false, message: 'No se encontró la bolsa activa.' };
        }
        const slot = bag.slots.find((entry) => entry.slotIndex === slotIndex);
        if (!slot) {
            return { success: false, message: `No existe el slot #${String(slotIndex).padStart(2, '0')}.` };
        }
        if (!slot.resource) {
            if (quantity !== 1) {
                return { success: false, message: 'Este objeto se suelta de a 1 unidad.' };
            }
            const toolKey = slot.playerTool?.toolKey || slot.toolKey;
            if (!slot.storedBag?.definition && !toolKey && !slot.equipmentInstance?.template) {
                return { success: false, message: 'Ese slot no tiene un objeto válido.' };
            }
            if (slot.storedBag?.definition) {
                return { success: false, message: 'Las bolsas no se pueden soltar al suelo todavía.' };
            }
            if (slot.playerToolId) {
                await unequipToolIfEquipped(tx, playerId, slot.playerToolId);
            }
            await tx.playerBagSlot.delete({ where: { id: slot.id } });
            const meta = getToolMeta(toolKey);
            return {
                success: true,
                message: `${EMOJIS.ui.drop} Soltaste ${(meta?.emoji || '').trim()} ${(meta?.name || 'Tool').trim()}.`.trim(),
                groundPayload: {
                    kind: 'tool',
                    emoji: meta?.emoji || 'T',
                    name: meta?.name || 'Tool',
                    quantity: 1,
                    playerToolId: slot.playerToolId || undefined,
                    toolKey: toolKey || undefined,
                },
            };
        }
        if (quantity < 1 || quantity > slot.quantity) {
            return { success: false, message: `Cantidad inválida. En ese slot tienes ${slot.quantity}.` };
        }
        if (quantity === slot.quantity) {
            await tx.playerBagSlot.delete({ where: { id: slot.id } });
        }
        else {
            await tx.playerBagSlot.update({
                where: { id: slot.id },
                data: { quantity: slot.quantity - quantity },
            });
        }
        return {
            success: true,
            message: `${EMOJIS.ui.drop} Soltaste ${slot.resource.emoji} ${slot.resource.name} x${quantity}.`,
            groundPayload: {
                kind: 'resource',
                emoji: slot.resource.emoji,
                name: slot.resource.name,
                quantity,
                resourceName: slot.resource.name,
                resourceId: slot.resource.id,
            },
        };
    });
    if (!dropped.success || !('groundPayload' in dropped) || !dropped.groundPayload) {
        return dropped;
    }
    const persisted = await persistDroppedLootAtPlayerTile(playerId, dropped.groundPayload);
    if (!persisted) {
        return {
            success: true,
            message: `${dropped.message}\nNo pude persistirlo en el suelo, intenta nuevamente.`,
        };
    }
    return {
        success: true,
        message: `${dropped.message}\nQuedó en el suelo de esta coordenada.`,
    };
}
export async function listBagSwitchOptions(playerId) {
    await ensurePlayerBagSetup(playerId);
    const activeBag = await getActiveBagRecord(playerId);
    if (!activeBag) {
        return [];
    }
    const options = [];
    if (!activeBag.definition.isPocket) {
        const pockets = await getPocketBagRecord(playerId);
        if (pockets) {
            options.push({
                bagId: 'pockets',
                emoji: pockets.definition.emoji,
                label: `${pockets.definition.displayName} (default)`,
                usageLabel: `${pockets.definition.slotCapacity} slots / ${pockets.definition.weightCapacityKg.toFixed(1)} kg`,
            });
        }
    }
    for (const slot of activeBag.slots) {
        if (!slot.storedBag?.definition) {
            continue;
        }
        options.push({
            bagId: slot.storedBag.id,
            emoji: slot.storedBag.definition.emoji,
            label: slot.storedBag.definition.displayName,
            usageLabel: `${slot.storedBag.definition.slotCapacity} slots / ${slot.storedBag.definition.weightCapacityKg.toFixed(1)} kg`,
        });
    }
    return options;
}
export async function previewBagSwitch(playerId, targetId) {
    await ensurePlayerBagSetup(playerId);
    const { sourceBag, targetBag } = await loadSwitchBags(playerId, targetId);
    if (!sourceBag || !targetBag) {
        return { success: false, reason: 'No se encontró la mochila origen o destino.' };
    }
    if (sourceBag.id === targetBag.id) {
        return { success: false, reason: 'Esa mochila ya está equipada.' };
    }
    if (targetBag.status === ACTIVE_STATUS) {
        return { success: false, reason: 'Esa mochila ya está en uso.' };
    }
    if (targetBag.slots.length > 0) {
        return { success: false, reason: 'La mochila destino debe estar vacía antes de equiparse.' };
    }
    const items = buildTransferItemsForSwitch(sourceBag, targetId);
    const plan = buildEmptyBagTransferPlan(targetBag.definition, items);
    const weightExceeded = plan.totalWeightKg > targetBag.definition.weightCapacityKg;
    const slotExceeded = plan.slotsNeeded > targetBag.definition.slotCapacity;
    if (weightExceeded || slotExceeded) {
        return {
            success: false,
            reason: buildCapacityReason(weightExceeded, slotExceeded, {
                weightNeeded: plan.totalWeightKg,
                weightCapacity: targetBag.definition.weightCapacityKg,
                slotsNeeded: plan.slotsNeeded,
                slotCapacity: targetBag.definition.slotCapacity,
            }),
        };
    }
    return {
        success: true,
        option: {
            bagId: targetId,
            emoji: targetBag.definition.emoji,
            label: targetBag.definition.displayName,
            usageLabel: `${targetBag.definition.slotCapacity} slots / ${targetBag.definition.weightCapacityKg.toFixed(1)} kg`,
        },
        targetUsage: {
            slotUsage: `${plan.slotsNeeded}/${targetBag.definition.slotCapacity}`,
            weightUsage: `${plan.totalWeightKg.toFixed(1)}/${targetBag.definition.weightCapacityKg.toFixed(1)} kg`,
        },
    };
}
export async function executeBagSwitch(playerId, targetId) {
    await ensurePlayerBagSetup(playerId);
    return prisma.$transaction(async (tx) => {
        const { sourceBag, targetBag } = await loadSwitchBags(playerId, targetId, tx);
        if (!sourceBag || !targetBag) {
            return { success: false, message: 'No se encontró la mochila origen o destino.' };
        }
        if (sourceBag.id === targetBag.id) {
            return { success: false, message: 'Esa mochila ya está equipada.' };
        }
        if (targetBag.slots.length > 0) {
            return { success: false, message: 'La mochila destino debe estar vacía antes de equiparse.' };
        }
        const items = buildTransferItemsForSwitch(sourceBag, targetId);
        const plan = buildEmptyBagTransferPlan(targetBag.definition, items);
        const weightExceeded = plan.totalWeightKg > targetBag.definition.weightCapacityKg;
        const slotExceeded = plan.slotsNeeded > targetBag.definition.slotCapacity;
        if (weightExceeded || slotExceeded) {
            return {
                success: false,
                message: buildCapacityReason(weightExceeded, slotExceeded, {
                    weightNeeded: plan.totalWeightKg,
                    weightCapacity: targetBag.definition.weightCapacityKg,
                    slotsNeeded: plan.slotsNeeded,
                    slotCapacity: targetBag.definition.slotCapacity,
                }),
            };
        }
        await tx.playerBagSlot.deleteMany({
            where: {
                bagId: { in: [sourceBag.id, targetBag.id] },
            },
        });
        await tx.playerBag.update({
            where: { id: sourceBag.id },
            data: {
                status: sourceBag.definition.isPocket ? DORMANT_STATUS : STORED_STATUS,
            },
        });
        await tx.playerBag.update({
            where: { id: targetBag.id },
            data: { status: ACTIVE_STATUS },
        });
        const slotRows = plan.blueprint.map((entry, index) => {
            if (entry.kind === 'resource') {
                return {
                    bagId: targetBag.id,
                    slotIndex: index + 1,
                    resourceId: entry.resourceId,
                    storedBagId: null,
                    toolKey: null,
                    playerToolId: null,
                    quantity: entry.quantity,
                };
            }
            if (entry.kind === 'storedBag') {
                return {
                    bagId: targetBag.id,
                    slotIndex: index + 1,
                    resourceId: null,
                    storedBagId: entry.storedBagId,
                    toolKey: null,
                    playerToolId: null,
                    equipmentInstanceId: null,
                    quantity: 1,
                };
            }
            if (entry.kind === 'equipment') {
                return {
                    bagId: targetBag.id,
                    slotIndex: index + 1,
                    resourceId: null,
                    storedBagId: null,
                    toolKey: null,
                    playerToolId: null,
                    equipmentInstanceId: entry.equipmentInstanceId,
                    quantity: 1,
                };
            }
            return {
                bagId: targetBag.id,
                slotIndex: index + 1,
                resourceId: null,
                storedBagId: null,
                toolKey: entry.toolKey,
                playerToolId: entry.playerToolId ?? null,
                equipmentInstanceId: null,
                quantity: 1,
            };
        });
        await tx.playerBagSlot.createMany({
            data: slotRows,
        });
        return {
            success: true,
            message: `${EMOJIS.ui.switch} Ahora llevas ${targetBag.definition.emoji} ${targetBag.definition.displayName}.`,
        };
    });
}
export async function grantBagToPlayer(playerId, bagSlug) {
    await ensurePlayerBagSetup(playerId);
    return prisma.$transaction(async (tx) => {
        const [activeBag, bagDefinition, equipment] = await Promise.all([
            tx.playerBag.findFirst({
                where: { playerId, status: ACTIVE_STATUS },
                include: bagInclude,
            }),
            tx.bagDefinition.findUnique({
                where: { slug: bagSlug },
            }),
            tx.playerEquipment.findUnique({ where: { playerId } }),
        ]);
        if (!activeBag || !bagDefinition) {
            return { success: false, message: 'No se encontró la bolsa activa o la definición pedida.' };
        }
        const usage = buildBagUsage(activeBag, getEquippedToolIdsFromEquipment(equipment));
        const projectedWeight = usage.usedWeightKg + bagDefinition.itemWeightKg;
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
        const bagInstance = await tx.playerBag.create({
            data: {
                playerId,
                bagDefinitionId: bagDefinition.id,
                status: STORED_STATUS,
            },
            include: { definition: true },
        });
        const freeIndex = getFirstFreeSlotIndexes(activeBag.definition.slotCapacity, activeBag.slots.map((slot) => slot.slotIndex), 1)[0];
        await tx.playerBagSlot.create({
            data: {
                bagId: activeBag.id,
                slotIndex: freeIndex,
                storedBagId: bagInstance.id,
                quantity: 1,
            },
        });
        return {
            success: true,
            message: `${EMOJIS.ui.check} Guardaste ${bagDefinition.emoji} ${bagDefinition.displayName} en tu bolsa.`,
        };
    });
}
export async function getActiveBagItemInfoByUid(playerId, slotUid) {
    await ensurePlayerBagSetup(playerId);
    return getActiveBagItemInfoByUidImpl(playerId, slotUid);
}
export async function equipToolFromBagItem(playerId, slotUid) {
    await ensurePlayerBagSetup(playerId);
    return equipToolFromBagItemImpl(playerId, slotUid);
}
export async function equipToolByAlias(playerId, alias) {
    await ensurePlayerBagSetup(playerId);
    return equipToolByAliasImpl(playerId, alias);
}
export async function unequipToolByAlias(playerId, alias) {
    await ensurePlayerBagSetup(playerId);
    return unequipToolByAliasImpl(playerId, alias);
}
export async function unequipEquipmentByAlias(playerId, alias) {
    await ensurePlayerBagSetup(playerId);
    return unequipEquipmentByAliasImpl(playerId, alias);
}
export async function grantToolToPlayer(playerId, toolKey, options) {
    await ensurePlayerBagSetup(playerId);
    return grantToolToPlayerImpl(playerId, toolKey, options);
}
export async function pickupDroppedTool(playerId, input) {
    await ensurePlayerBagSetup(playerId);
    return pickupDroppedToolImpl(playerId, input);
}
export async function pickupDroppedBag(playerId, bagSlug) {
    if (!bagSlug) {
        return { success: false, message: 'Ese loot no tiene bolsa valida.' };
    }
    return grantBagToPlayer(playerId, bagSlug);
}
export async function pickupDroppedEquipment(playerId, input) {
    await ensurePlayerBagSetup(playerId);
    if (!input.equipmentInstanceId) {
        return { success: false, message: 'Ese equipo no tiene una instancia valida.' };
    }
    return prisma.$transaction(async (tx) => {
        const [activeBag, equipment, instance] = await Promise.all([
            tx.playerBag.findFirst({
                where: { playerId, status: ACTIVE_STATUS },
                include: bagInclude,
            }),
            tx.playerEquipment.findUnique({ where: { playerId } }),
            tx.equipmentInstance.findUnique({
                where: { id: input.equipmentInstanceId },
                include: { template: true },
            }),
        ]);
        if (!activeBag || !instance?.template) {
            return { success: false, message: 'No pude recoger ese equipo ahora mismo.' };
        }
        const equippedToolIds = getEquippedToolIdsFromEquipment(equipment);
        const usage = buildBagUsage(activeBag, equippedToolIds);
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
        const freeIndex = getFirstFreeSlotIndexes(activeBag.definition.slotCapacity, activeBag.slots.map((slot) => slot.slotIndex), 1)[0];
        await tx.playerBagSlot.create({
            data: {
                bagId: activeBag.id,
                slotIndex: freeIndex,
                equipmentInstanceId: instance.id,
                quantity: 1,
            },
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
            message: `${EMOJIS.ui.check} Recogiste ${instance.template.emoji} ${instance.template.shortName || instance.template.name}.`,
        };
    });
}
export async function getEquippedToolForAction(playerId, action) {
    await ensurePlayerBagSetup(playerId);
    return getEquippedToolForActionImpl(playerId, action);
}
export async function applyDurabilityDamageOnEquippedTool(playerId, action, damage) {
    await ensurePlayerBagSetup(playerId);
    return applyDurabilityDamageOnEquippedToolImpl(playerId, action, damage);
}
export async function getEquipmentCard(playerId) {
    await ensurePlayerBagSetup(playerId);
    return getEquipmentCardImpl(playerId);
}
