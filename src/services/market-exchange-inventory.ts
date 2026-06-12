// @ts-nocheck
import { getFreeSlotIndexes, getSlotWeightKg } from './market-exchange-utils.js';
const ACTIVE_STATUS = 'ACTIVE';
export async function getActiveBagWithSlotsForUpdate(playerId, tx) {
    return tx.playerBag.findFirst({
        where: { playerId, status: ACTIVE_STATUS },
        include: {
            definition: true,
            slots: {
                include: {
                    resource: true,
                    playerTool: true,
                    storedBag: { include: { definition: true } },
                },
                orderBy: { slotIndex: 'asc' },
            },
        },
    });
}
export async function reserveResourceFromActiveBag(tx, playerId, resourceId, quantity) {
    const qty = Math.max(1, Math.floor(quantity));
    const activeBag = await getActiveBagWithSlotsForUpdate(playerId, tx);
    if (!activeBag)
        return { success: false, message: 'No tienes mochila activa.' };
    const resourceSlots = activeBag.slots.filter((slot) => slot.resourceId === resourceId && slot.quantity > 0);
    const total = resourceSlots.reduce((sum, slot) => sum + slot.quantity, 0);
    if (total < qty)
        return { success: false, message: `No tienes suficientes unidades (${total}/${qty}).` };
    let remaining = qty;
    for (const slot of resourceSlots) {
        if (remaining <= 0)
            break;
        const take = Math.min(remaining, slot.quantity);
        if (take >= slot.quantity) {
            await tx.playerBagSlot.delete({ where: { id: slot.id } });
        }
        else {
            await tx.playerBagSlot.update({
                where: { id: slot.id },
                data: { quantity: { decrement: take } },
            });
        }
        remaining -= take;
    }
    return { success: true, message: 'OK' };
}
export async function creditResourceToActiveBag(tx, playerId, resourceId, quantity) {
    const qty = Math.max(1, Math.floor(quantity));
    const activeBag = await getActiveBagWithSlotsForUpdate(playerId, tx);
    if (!activeBag)
        return { success: false, message: 'No tienes mochila activa.' };
    const resource = await tx.resource.findUnique({
        where: { id: resourceId },
        select: { weightKg: true, maxStack: true, stackable: true },
    });
    if (!resource)
        return { success: false, message: 'Recurso inválido.' };
    const currentWeight = activeBag.slots.reduce((sum, slot) => sum + getSlotWeightKg(slot), 0);
    const extraWeight = resource.weightKg * qty;
    if (currentWeight + extraWeight > activeBag.definition.weightCapacityKg + 0.001) {
        return {
            success: false,
            message: `No cabe por peso (${(currentWeight + extraWeight).toFixed(1)}/${activeBag.definition.weightCapacityKg.toFixed(1)} kg).`,
        };
    }
    const maxStack = Math.max(1, resource.maxStack || activeBag.definition.maxResourceStack || 99);
    const stackable = resource.stackable && activeBag.definition.allowResourceStack;
    let remaining = qty;
    if (stackable) {
        const existingStacks = activeBag.slots
            .filter((slot) => slot.resourceId === resourceId)
            .sort((a, b) => a.slotIndex - b.slotIndex);
        for (const stack of existingStacks) {
            if (remaining <= 0)
                break;
            const free = Math.max(0, maxStack - stack.quantity);
            if (free <= 0)
                continue;
            const add = Math.min(free, remaining);
            await tx.playerBagSlot.update({
                where: { id: stack.id },
                data: { quantity: { increment: add } },
            });
            remaining -= add;
        }
    }
    if (remaining <= 0)
        return { success: true, message: 'OK' };
    const bagAfterStacks = await tx.playerBag.findUnique({
        where: { id: activeBag.id },
        include: { slots: { select: { slotIndex: true } }, definition: true },
    });
    if (!bagAfterStacks)
        return { success: false, message: 'No se pudo actualizar la mochila.' };
    const perSlot = stackable ? maxStack : 1;
    const freeSlots = getFreeSlotIndexes(bagAfterStacks.slots, bagAfterStacks.definition.slotCapacity);
    const neededSlots = Math.ceil(remaining / perSlot);
    if (freeSlots.length < neededSlots) {
        return {
            success: false,
            message: `No hay slots suficientes (${bagAfterStacks.slots.length}/${bagAfterStacks.definition.slotCapacity}).`,
        };
    }
    let idx = 0;
    while (remaining > 0) {
        const chunk = Math.min(remaining, perSlot);
        await tx.playerBagSlot.create({
            data: {
                bagId: activeBag.id,
                slotIndex: freeSlots[idx],
                resourceId,
                quantity: chunk,
            },
        });
        remaining -= chunk;
        idx += 1;
    }
    return { success: true, message: 'OK' };
}
