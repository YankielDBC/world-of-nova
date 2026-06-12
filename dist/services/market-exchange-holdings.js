// @ts-nocheck
import { prisma } from '../lib/db.js';
import { formatAgoMinutes } from './market-exchange-utils.js';
const ACTIVE_STATUS = 'ACTIVE';
const VAULT_STATUS = 'VAULT';
export async function getItemHoldingsForPlayer(playerId) {
    const activeBag = await prisma.playerBag.findFirst({
        where: { playerId, status: ACTIVE_STATUS },
        include: {
            slots: {
                where: { resourceId: { not: null } },
                include: { resource: true },
            },
        },
    });
    if (!activeBag)
        return [];
    const byResource = new Map();
    for (const slot of activeBag.slots) {
        if (!slot.resourceId || !slot.resource)
            continue;
        const current = byResource.get(slot.resourceId);
        if (current)
            current.quantity += slot.quantity;
        else {
            byResource.set(slot.resourceId, {
                name: slot.resource.name,
                emoji: slot.resource.emoji,
                quantity: slot.quantity,
            });
        }
    }
    return Array.from(byResource.entries())
        .map(([resourceId, row]) => ({
        resourceId,
        name: row.name,
        emoji: row.emoji,
        quantity: row.quantity,
    }))
        .sort((a, b) => b.quantity - a.quantity);
}
export async function getResourceStockByContainer(playerId, resourceId) {
    const [bagSlots, vaultSlots] = await Promise.all([
        prisma.playerBagSlot.findMany({
            where: {
                resourceId,
                bag: {
                    playerId,
                    status: ACTIVE_STATUS,
                },
            },
            select: { quantity: true },
        }),
        prisma.playerBagSlot.findMany({
            where: {
                resourceId,
                bag: {
                    playerId,
                    status: VAULT_STATUS,
                },
            },
            select: { quantity: true },
        }),
    ]);
    const bagQty = bagSlots.reduce((sum, slot) => sum + slot.quantity, 0);
    const vaultQty = vaultSlots.reduce((sum, slot) => sum + slot.quantity, 0);
    return { bagQty, vaultQty, totalQty: bagQty + vaultQty };
}
export function formatMarketTimeAgo(date) {
    return formatAgoMinutes(date);
}
//# sourceMappingURL=market-exchange-holdings.js.map