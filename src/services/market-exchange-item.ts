// @ts-nocheck
import { prisma } from '../lib/db.js';
import { PRICE_INDEX } from '../data/price-index.js';
import { clampInt, safeInt } from './market-exchange-utils.js';
import { creditResourceToActiveBag as creditResourceToActiveBagImpl, reserveResourceFromActiveBag as reserveResourceFromActiveBagImpl, } from './market-exchange-inventory.js';
import { calcTradeFeeSilver, ORDER_CANCELLED, ORDER_FILLED, ORDER_OPEN } from './market-exchange-constants.js';
async function reserveResourceFromActiveBag(tx, playerId, resourceId, quantity) {
    return reserveResourceFromActiveBagImpl(tx, playerId, resourceId, quantity);
}
async function creditResourceToActiveBag(tx, playerId, resourceId, quantity) {
    return creditResourceToActiveBagImpl(tx, playerId, resourceId, quantity);
}
export async function createItemSellOrder(playerId, resourceId, quantity, priceSilver) {
    const qty = clampInt(quantity, 1, PRICE_INDEX.market.maxOrderQuantity);
    const price = clampInt(priceSilver, 1, PRICE_INDEX.market.maxUnitPriceSilver);
    return prisma.$transaction(async (tx) => {
        const resource = await tx.resource.findUnique({
            where: { id: resourceId },
            select: { id: true, name: true, emoji: true },
        });
        if (!resource)
            return { success: false, message: 'Item inválido para mercado.' };
        const reserve = await reserveResourceFromActiveBag(tx, playerId, resourceId, qty);
        if (!reserve.success)
            return { success: false, message: reserve.message };
        const order = await tx.marketItemOrder.create({
            data: {
                playerId,
                resourceId,
                side: 'SELL',
                priceSilver: price,
                quantityTotal: qty,
                quantityRemaining: qty,
                status: ORDER_OPEN,
            },
            select: { id: true },
        });
        return {
            success: true,
            message: `Orden creada: ${resource.emoji} ${resource.name} x${qty} a ${price}🪙.`,
            orderId: order.id,
        };
    });
}
export async function buyItemAtBestAsks(playerId, resourceId, quantity) {
    const wantedQty = clampInt(quantity, 1, PRICE_INDEX.market.maxOrderQuantity);
    return prisma.$transaction(async (tx) => {
        const [player, resource, asks] = await Promise.all([
            tx.player.findUnique({
                where: { id: playerId },
                select: { id: true, silver: true },
            }),
            tx.resource.findUnique({
                where: { id: resourceId },
                select: { id: true, name: true, emoji: true },
            }),
            tx.marketItemOrder.findMany({
                where: {
                    resourceId,
                    side: 'SELL',
                    status: ORDER_OPEN,
                    quantityRemaining: { gt: 0 },
                    playerId: { not: playerId },
                },
                orderBy: [{ priceSilver: 'asc' }, { createdAt: 'asc' }],
            }),
        ]);
        if (!player)
            return { success: false, message: 'Jugador no encontrado.' };
        if (!resource)
            return { success: false, message: 'Item inválido.' };
        if (asks.length === 0)
            return { success: false, message: 'No hay ofertas de venta para ese item.' };
        let remaining = wantedQty;
        let spentSilver = 0;
        let boughtQty = 0;
        let weightedPrice = 0;
        const sellerCredits = new Map();
        const touchedOrders = [];
        const trades = [];
        let availableSilver = safeInt(player.silver);
        for (const ask of asks) {
            if (remaining <= 0)
                break;
            const fillQty = Math.min(remaining, ask.quantityRemaining);
            const gross = fillQty * ask.priceSilver;
            if (gross > availableSilver)
                continue;
            const fee = calcTradeFeeSilver(gross);
            const sellerNet = Math.max(0, gross - fee);
            availableSilver -= gross;
            spentSilver += gross;
            boughtQty += fillQty;
            remaining -= fillQty;
            weightedPrice += fillQty * ask.priceSilver;
            sellerCredits.set(ask.playerId, (sellerCredits.get(ask.playerId) || 0) + sellerNet);
            const newRemaining = ask.quantityRemaining - fillQty;
            touchedOrders.push({
                id: ask.id,
                newRemaining,
                newStatus: newRemaining <= 0 ? ORDER_FILLED : ORDER_OPEN,
            });
            trades.push({
                resourceId,
                orderId: ask.id,
                buyPlayerId: playerId,
                sellPlayerId: ask.playerId,
                quantity: fillQty,
                priceSilver: ask.priceSilver,
                grossSilver: gross,
                feeSilver: fee,
            });
        }
        if (boughtQty <= 0)
            return { success: false, message: 'No alcanzó tu plata para tomar ofertas activas.' };
        const bagCredit = await creditResourceToActiveBag(tx, playerId, resourceId, boughtQty);
        if (!bagCredit.success)
            return { success: false, message: bagCredit.message };
        await tx.player.update({
            where: { id: playerId },
            data: { silver: { decrement: spentSilver } },
        });
        for (const [sellerId, silverGain] of sellerCredits.entries()) {
            if (silverGain <= 0)
                continue;
            await tx.player.update({
                where: { id: sellerId },
                data: { silver: { increment: silverGain } },
            });
        }
        for (const update of touchedOrders) {
            await tx.marketItemOrder.update({
                where: { id: update.id },
                data: {
                    quantityRemaining: update.newRemaining,
                    status: update.newStatus,
                },
            });
        }
        await tx.marketItemTrade.createMany({ data: trades });
        const avgPrice = weightedPrice / boughtQty;
        const partial = boughtQty < wantedQty ? ` Parcial: ${boughtQty}/${wantedQty}.` : '';
        return {
            success: true,
            message: `Compraste ${resource.emoji} ${resource.name} x${boughtQty} por ${spentSilver}🪙 (avg ${avgPrice.toFixed(1)}).${partial}`,
            boughtQty,
            spentSilver,
            avgPriceSilver: Number(avgPrice.toFixed(2)),
        };
    });
}
export async function listPlayerItemOrders(playerId, limit = 12, offset = 0) {
    const rows = await prisma.marketItemOrder.findMany({
        where: {
            playerId,
            status: ORDER_OPEN,
            quantityRemaining: { gt: 0 },
            side: 'SELL',
        },
        orderBy: [{ priceSilver: 'asc' }, { createdAt: 'asc' }],
        skip: Math.max(0, Math.floor(offset)),
        take: limit,
    });
    if (rows.length === 0)
        return [];
    const resourceIds = Array.from(new Set(rows.map((row) => row.resourceId)));
    const resources = await prisma.resource.findMany({
        where: { id: { in: resourceIds } },
        select: { id: true, name: true, emoji: true },
    });
    const map = new Map(resources.map((row) => [row.id, row]));
    return rows.map((row) => ({
        orderId: row.id,
        resourceId: row.resourceId,
        resourceName: map.get(row.resourceId)?.name || `Item ${row.resourceId}`,
        resourceEmoji: map.get(row.resourceId)?.emoji || '📦',
        priceSilver: row.priceSilver,
        quantityRemaining: row.quantityRemaining,
        quantityTotal: row.quantityTotal,
        createdAt: row.createdAt,
    }));
}
export async function cancelItemOrder(playerId, orderId) {
    return prisma.$transaction(async (tx) => {
        const order = await tx.marketItemOrder.findFirst({
            where: {
                id: orderId,
                playerId,
                status: ORDER_OPEN,
                quantityRemaining: { gt: 0 },
            },
        });
        if (!order)
            return { success: false, message: 'Orden no encontrada o ya cerrada.' };
        const restore = await creditResourceToActiveBag(tx, playerId, order.resourceId, order.quantityRemaining);
        if (!restore.success)
            return { success: false, message: `No pude devolver tu item: ${restore.message}` };
        await tx.marketItemOrder.update({
            where: { id: order.id },
            data: { quantityRemaining: 0, status: ORDER_CANCELLED },
        });
        return { success: true, message: `Orden #${order.id} cancelada y devuelta a mochila.` };
    });
}
export async function getRecentItemTrades(limit = 10, offset = 0) {
    const rows = await prisma.marketItemTrade.findMany({
        orderBy: { createdAt: 'desc' },
        skip: Math.max(0, Math.floor(offset)),
        take: limit,
    });
    if (rows.length === 0)
        return [];
    const resourceIds = Array.from(new Set(rows.map((row) => row.resourceId)));
    const resources = await prisma.resource.findMany({
        where: { id: { in: resourceIds } },
        select: { id: true, name: true, emoji: true },
    });
    const map = new Map(resources.map((row) => [row.id, row]));
    return rows.map((row) => ({
        resourceName: map.get(row.resourceId)?.name || `Item ${row.resourceId}`,
        resourceEmoji: map.get(row.resourceId)?.emoji || '📦',
        quantity: row.quantity,
        priceSilver: row.priceSilver,
        grossSilver: row.grossSilver,
        createdAt: row.createdAt,
    }));
}
