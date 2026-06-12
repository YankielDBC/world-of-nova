// @ts-nocheck
import { prisma } from '../lib/db.js';
import { addResourceToActiveBag, grantToolToPlayer } from './bags.js';
import { normalizeMerchantDisplayName } from './mystery-merchant-utils.js';
import { getBagMarketValue, getResourceMarketValue, getSellableSlots, getToolMarketValue, getToolMeta, markMerchantPurchasedResourceLock, } from './mystery-merchant-trade-helpers.js';
import { clearMerchantSnapshotCache, parseOffers, serializeOffers } from './mystery-merchant-state.js';
const ACTIVE_STATUS = 'ACTIVE';
export async function getMerchantSellEntries(playerId, buybackMultiplier) {
    const slots = await getSellableSlots(playerId);
    const entries = [];
    for (const slot of slots) {
        if (slot.resource) {
            const lockedQty = Math.max(0, Math.min(slot.merchantLockedQty, slot.quantity));
            const sellableQty = Math.max(0, slot.quantity - lockedQty);
            if (sellableQty <= 0) {
                continue;
            }
            const unitSilver = Math.max(1, Math.floor(getResourceMarketValue(slot.resource) * buybackMultiplier));
            entries.push({
                listIndex: entries.length + 1,
                slotUid: slot.id,
                slotIndex: slot.slotIndex,
                kind: 'resource',
                emoji: slot.resource.emoji,
                name: normalizeMerchantDisplayName(slot.resource.name),
                quantity: sellableQty,
                unitSilver,
                totalSilver: unitSilver * sellableQty,
            });
            continue;
        }
        if (slot.playerTool) {
            if (slot.playerTool.merchantLocked) {
                continue;
            }
            const tool = getToolMeta(slot.playerTool.toolKey);
            const unitSilver = Math.max(1, Math.floor(getToolMarketValue(slot.playerTool.toolKey, slot.playerTool.durability, slot.playerTool.maxDurability) *
                buybackMultiplier));
            entries.push({
                listIndex: entries.length + 1,
                slotUid: slot.id,
                slotIndex: slot.slotIndex,
                kind: 'tool',
                emoji: tool?.emoji || '🛠',
                name: normalizeMerchantDisplayName(tool?.name || slot.playerTool.toolKey),
                quantity: 1,
                unitSilver,
                totalSilver: unitSilver,
            });
            continue;
        }
        if (slot.storedBag?.definition) {
            const unitSilver = Math.max(2, Math.floor(getBagMarketValue(slot.storedBag.definition.slotCapacity, slot.storedBag.definition.weightCapacityKg) *
                buybackMultiplier));
            entries.push({
                listIndex: entries.length + 1,
                slotUid: slot.id,
                slotIndex: slot.slotIndex,
                kind: 'bag',
                emoji: slot.storedBag.definition.emoji,
                name: normalizeMerchantDisplayName(slot.storedBag.definition.displayName),
                quantity: 1,
                unitSilver,
                totalSilver: unitSilver,
            });
        }
    }
    return entries;
}
export async function sellToMerchant(params) {
    return prisma.$transaction(async (tx) => {
        const merchant = await tx.mysteryMerchant.findFirst({
            where: { stayToken: params.stayToken },
            select: {
                id: true,
                stayToken: true,
                buybackMultiplier: true,
            },
        });
        if (!merchant || merchant.stayToken !== params.stayToken) {
            return { success: false, message: 'El Comerciante Misterioso ya no esta aqui.' };
        }
        const slot = await tx.playerBagSlot.findFirst({
            where: {
                id: params.slotUid,
                bag: {
                    playerId: params.playerId,
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
        });
        if (!slot) {
            return { success: false, message: 'Ese articulo ya no esta en tu mochila.' };
        }
        const equipment = await tx.playerEquipment.findUnique({
            where: { playerId: params.playerId },
            select: { chopToolId: true, mineToolId: true, gatherToolId: true },
        });
        const equippedIds = new Set([equipment?.chopToolId, equipment?.mineToolId, equipment?.gatherToolId].filter((value) => typeof value === 'number'));
        if (slot.playerTool?.id && equippedIds.has(slot.playerTool.id)) {
            return { success: false, message: 'Esa herramienta esta equipada. Desequipala primero.' };
        }
        let gained = 0;
        if (slot.resource) {
            const lockedQty = Math.max(0, Math.min(slot.merchantLockedQty, slot.quantity));
            const sellableQty = Math.max(0, slot.quantity - lockedQty);
            if (sellableQty <= 0) {
                return {
                    success: false,
                    message: 'Ese lote lo compraste al mercader y no acepta recompras.',
                };
            }
            const safeQty = Math.max(1, Math.min(params.quantity, sellableQty));
            const unitSilver = Math.max(1, Math.floor(getResourceMarketValue(slot.resource) * merchant.buybackMultiplier));
            gained = unitSilver * safeQty;
            if (safeQty >= slot.quantity) {
                await tx.playerBagSlot.delete({ where: { id: slot.id } });
            }
            else {
                await tx.playerBagSlot.update({
                    where: { id: slot.id },
                    data: {
                        quantity: { decrement: safeQty },
                        merchantLockedQty: Math.max(0, Math.min(lockedQty, slot.quantity - safeQty)),
                    },
                });
            }
        }
        else if (slot.playerTool) {
            if (slot.playerTool.merchantLocked) {
                return {
                    success: false,
                    message: 'Esa herramienta la compraste aqui y no te la recompro.',
                };
            }
            gained = Math.max(1, Math.floor(getToolMarketValue(slot.playerTool.toolKey, slot.playerTool.durability, slot.playerTool.maxDurability) *
                merchant.buybackMultiplier));
            await tx.playerBagSlot.delete({ where: { id: slot.id } });
            await tx.playerTool.delete({ where: { id: slot.playerTool.id } });
        }
        else if (slot.storedBag?.definition) {
            if (slot.storedBag.slots.length > 0) {
                return { success: false, message: 'No puedes vender una mochila con items dentro.' };
            }
            gained = Math.max(2, Math.floor(getBagMarketValue(slot.storedBag.definition.slotCapacity, slot.storedBag.definition.weightCapacityKg) *
                merchant.buybackMultiplier));
            await tx.playerBagSlot.delete({ where: { id: slot.id } });
            await tx.playerBag.delete({ where: { id: slot.storedBag.id } });
        }
        else {
            return { success: false, message: 'Ese objeto no se puede vender.' };
        }
        await tx.player.update({
            where: { id: params.playerId },
            data: { silver: { increment: gained } },
        });
        return {
            success: true,
            silverGained: gained,
            message: `💰 Trato cerrado: +${gained} 🪙`,
        };
    });
}
export async function buyFromMerchant(params) {
    const quantity = Math.max(1, Math.floor(params.quantity));
    const reserve = await prisma.$transaction(async (tx) => {
        const merchant = await tx.mysteryMerchant.findFirst({
            where: { stayToken: params.stayToken },
            select: {
                id: true,
                stayToken: true,
                offersJson: true,
            },
        });
        if (!merchant || merchant.stayToken !== params.stayToken) {
            return { ok: false, reason: 'El Comerciante Misterioso ya no esta aqui.' };
        }
        const offers = parseOffers(merchant.offersJson);
        const offer = offers.find((entry) => entry.id === params.offerId);
        if (!offer) {
            return { ok: false, reason: 'Esa oferta ya no existe.' };
        }
        if (offer.stock < quantity) {
            return { ok: false, reason: `Solo quedan ${offer.stock} unidades de esa oferta.` };
        }
        const player = await tx.player.findUnique({
            where: { id: params.playerId },
            select: { silver: true },
        });
        if (!player) {
            return { ok: false, reason: 'Jugador no encontrado.' };
        }
        const totalCost = offer.priceSilver * quantity;
        if (player.silver < totalCost) {
            return { ok: false, reason: `Te faltan ${totalCost - player.silver} 🪙.` };
        }
        offer.stock -= quantity;
        await tx.player.update({
            where: { id: params.playerId },
            data: {
                silver: { decrement: totalCost },
            },
        });
        await tx.mysteryMerchant.update({
            where: { id: merchant.id },
            data: {
                offersJson: serializeOffers(offers),
            },
        });
        return {
            ok: true,
            offer,
            totalCost,
        };
    });
    if (!reserve.ok) {
        return { success: false, message: reserve.reason };
    }
    clearMerchantSnapshotCache();
    let deliveryOk = false;
    let deliveryError = '';
    const reservedOffer = reserve.offer;
    if (reservedOffer.kind === 'resource' && reservedOffer.resourceId) {
        const resource = await prisma.resource.findUnique({
            where: { id: reservedOffer.resourceId },
            select: { name: true },
        });
        if (!resource) {
            deliveryError = 'Ese recurso ya no existe.';
        }
        else {
            const beforeSlots = await prisma.playerBagSlot.findMany({
                where: {
                    bag: {
                        playerId: params.playerId,
                        status: ACTIVE_STATUS,
                    },
                    resourceId: reservedOffer.resourceId,
                },
                select: {
                    id: true,
                    quantity: true,
                },
            });
            const delivered = await addResourceToActiveBag(params.playerId, resource.name, quantity);
            deliveryOk = delivered.success;
            deliveryError = delivered.reason || '';
            if (deliveryOk) {
                await markMerchantPurchasedResourceLock({
                    playerId: params.playerId,
                    resourceId: reservedOffer.resourceId,
                    purchasedQty: quantity,
                    beforeSlots,
                });
            }
        }
    }
    else if (reservedOffer.kind === 'tool' && reservedOffer.toolKey) {
        deliveryOk = true;
        for (let i = 0; i < quantity; i += 1) {
            const delivered = await grantToolToPlayer(params.playerId, reservedOffer.toolKey, {
                merchantLocked: true,
            });
            if (!delivered.success) {
                deliveryOk = false;
                deliveryError = delivered.message;
                break;
            }
        }
    }
    if (!deliveryOk) {
        await prisma.$transaction(async (tx) => {
            const merchant = await tx.mysteryMerchant.findFirst({
                where: { stayToken: params.stayToken },
                select: { id: true, offersJson: true, stayToken: true },
            });
            if (!merchant || merchant.stayToken !== params.stayToken) {
                await tx.player.update({
                    where: { id: params.playerId },
                    data: { silver: { increment: reserve.totalCost } },
                });
                return;
            }
            const offers = parseOffers(merchant.offersJson);
            const offer = offers.find((entry) => entry.id === params.offerId);
            if (offer) {
                offer.stock += quantity;
            }
            await tx.player.update({
                where: { id: params.playerId },
                data: { silver: { increment: reserve.totalCost } },
            });
            await tx.mysteryMerchant.update({
                where: { id: merchant.id },
                data: {
                    offersJson: serializeOffers(offers),
                },
            });
        });
        clearMerchantSnapshotCache();
        return {
            success: false,
            message: deliveryError || 'No hubo espacio en la mochila. Se devolvio tu plata.',
        };
    }
    return {
        success: true,
        message: `✅ Compraste ${reservedOffer.emoji} ${reservedOffer.name} x${quantity} por ${reserve.totalCost} 🪙.`,
    };
}
