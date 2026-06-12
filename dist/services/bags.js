// @ts-nocheck
import { prisma } from '../lib/db.js';
import { EMOJIS } from '../data/emojis.js';
import { ACTIVE_STATUS, DORMANT_STATUS, STORED_STATUS, } from './bags-types.js';
import { addResourceToActiveBag, storeGatheredItems, useBagSlot, dropBagSlot, grantBagToPlayer, pickupDroppedEquipment } from './bags-actions.js';
import { buildBagKeyboard, buildBagUsage, buildCapacityReason, buildEmptyBagTransferPlan, buildSlotView, ensureLegacyToolInstances, ensurePlayerEquipment, getActiveBagRecord, getEquippedToolIdsFromEquipment, getPocketBagRecord, getPocketDefinition, loadSwitchBags, loadEquippedToolIds, buildBagText, buildTransferItemsForSwitch, buildToolAliasMap, } from './bags-core.js';
import { applyDurabilityDamageOnEquippedToolImpl, equipToolByAliasImpl, equipToolFromBagItemImpl, getActiveBagItemInfoByUidImpl, getEquipmentCardImpl, getEquippedToolForActionImpl, grantToolToPlayerImpl, pickupDroppedToolImpl, unequipEquipmentByAliasImpl, unequipToolByAliasImpl, } from './bags-tools.js';
export { addResourceToActiveBag, storeGatheredItems, useBagSlot, dropBagSlot, grantBagToPlayer, pickupDroppedEquipment };
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
//# sourceMappingURL=bags.js.map