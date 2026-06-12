import { prisma } from '../lib/db.js';
import { TOOLS } from '../types/tools.js';
const ACTIVE_STATUS = 'ACTIVE';
export function getToolMeta(toolKey) {
    if (!toolKey)
        return null;
    return TOOLS[toolKey] || null;
}
export function getResourceMarketValue(resource) {
    return Math.max(1, Math.floor(resource.baseValue));
}
export function getToolMarketValue(toolKey, durability, maxDurability) {
    const toolMeta = getToolMeta(toolKey);
    const baseValue = toolMeta?.baseValue ?? 12;
    const ratio = maxDurability > 0 ? Math.max(0.2, Math.min(1, durability / maxDurability)) : 0.2;
    return Math.max(1, Math.floor(baseValue * ratio));
}
export function getBagMarketValue(slotCapacity, weightCapacityKg) {
    const seed = slotCapacity + weightCapacityKg * 2;
    return Math.max(2, Math.floor(seed * 0.75));
}
export async function getSellableSlots(playerId, tx = prisma) {
    const [equipment, slots] = await Promise.all([
        tx.playerEquipment.findUnique({
            where: { playerId },
            select: {
                chopToolId: true,
                mineToolId: true,
                gatherToolId: true,
            },
        }),
        tx.playerBagSlot.findMany({
            where: {
                bag: {
                    playerId,
                    status: ACTIVE_STATUS,
                },
            },
            include: {
                resource: true,
                playerTool: true,
                storedBag: {
                    include: {
                        definition: true,
                        slots: {
                            select: { id: true },
                        },
                    },
                },
            },
            orderBy: {
                slotIndex: 'asc',
            },
        }),
    ]);
    const equippedIds = new Set([equipment?.chopToolId, equipment?.mineToolId, equipment?.gatherToolId].filter((value) => typeof value === 'number'));
    return slots.filter((slot) => {
        if (slot.playerTool?.id && equippedIds.has(slot.playerTool.id))
            return false;
        if (slot.storedBag?.slots.length)
            return false;
        return Boolean(slot.resource || slot.playerTool || slot.storedBag);
    });
}
export async function markMerchantPurchasedResourceLock(params) {
    if (params.purchasedQty <= 0)
        return;
    const beforeById = new Map();
    for (const row of params.beforeSlots)
        beforeById.set(row.id, row.quantity);
    const after = await prisma.playerBagSlot.findMany({
        where: {
            bag: {
                playerId: params.playerId,
                status: ACTIVE_STATUS,
            },
            resourceId: params.resourceId,
        },
        select: {
            id: true,
            slotIndex: true,
            quantity: true,
        },
        orderBy: {
            slotIndex: 'asc',
        },
    });
    let remainingToLock = params.purchasedQty;
    for (const row of after) {
        if (remainingToLock <= 0)
            break;
        const previousQty = beforeById.get(row.id) ?? 0;
        const delta = Math.max(0, row.quantity - previousQty);
        if (delta <= 0)
            continue;
        const lockAmount = Math.min(delta, remainingToLock);
        await prisma.playerBagSlot.update({
            where: { id: row.id },
            data: {
                merchantLockedQty: { increment: lockAmount },
            },
        });
        remainingToLock -= lockAmount;
    }
}
