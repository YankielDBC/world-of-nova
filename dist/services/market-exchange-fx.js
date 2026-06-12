// @ts-nocheck
import { prisma } from '../lib/db.js';
import { PRICE_INDEX } from '../data/price-index.js';
import { aggregateFxByPrice, clampInt } from './market-exchange-utils.js';
import { calcTradeFeeSilver, ORDER_CANCELLED, ORDER_FILLED, ORDER_OPEN } from './market-exchange-constants.js';
export async function getExchangeSnapshot() {
    const [bestBid, bestAsk, latestTrade, recentTrades, previousTrades, openBuyRows, openSellRows] = await Promise.all([
        prisma.marketCurrencyOrder.findFirst({
            where: { side: 'BUY_GOLD', status: ORDER_OPEN, goldRemaining: { gt: 0 } },
            orderBy: [{ priceSilverPerGold: 'desc' }, { createdAt: 'asc' }],
            select: { priceSilverPerGold: true },
        }),
        prisma.marketCurrencyOrder.findFirst({
            where: { side: 'SELL_GOLD', status: ORDER_OPEN, goldRemaining: { gt: 0 } },
            orderBy: [{ priceSilverPerGold: 'asc' }, { createdAt: 'asc' }],
            select: { priceSilverPerGold: true },
        }),
        prisma.marketCurrencyTrade.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { priceSilverPerGold: true },
        }),
        prisma.marketCurrencyTrade.findMany({
            where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
            select: { priceSilverPerGold: true },
            take: 500,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.marketCurrencyTrade.findMany({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 48 * 60 * 60 * 1000),
                    lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
            },
            select: { priceSilverPerGold: true },
            take: 500,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.marketCurrencyOrder.findMany({
            where: { side: 'BUY_GOLD', status: ORDER_OPEN, goldRemaining: { gt: 0 } },
            orderBy: [{ priceSilverPerGold: 'desc' }, { createdAt: 'asc' }],
            select: { priceSilverPerGold: true, goldRemaining: true },
            take: 200,
        }),
        prisma.marketCurrencyOrder.findMany({
            where: { side: 'SELL_GOLD', status: ORDER_OPEN, goldRemaining: { gt: 0 } },
            orderBy: [{ priceSilverPerGold: 'asc' }, { createdAt: 'asc' }],
            select: { priceSilverPerGold: true, goldRemaining: true },
            take: 200,
        }),
    ]);
    const lastPriceSilver = latestTrade?.priceSilverPerGold ?? PRICE_INDEX.market.defaultSilverPerGold;
    const avgRecent = recentTrades.length
        ? recentTrades.reduce((sum, row) => sum + row.priceSilverPerGold, 0) / recentTrades.length
        : lastPriceSilver;
    const avgPrev = previousTrades.length
        ? previousTrades.reduce((sum, row) => sum + row.priceSilverPerGold, 0) / previousTrades.length
        : avgRecent;
    const change24hPct = avgPrev > 0 ? ((avgRecent - avgPrev) / avgPrev) * 100 : 0;
    return {
        lastPriceSilver,
        change24hPct: Number(change24hPct.toFixed(2)),
        bestBidSilver: bestBid?.priceSilverPerGold ?? null,
        bestAskSilver: bestAsk?.priceSilverPerGold ?? null,
        bidLevels: aggregateFxByPrice(openBuyRows.map((row) => ({ priceSilverPerGold: row.priceSilverPerGold, qty: row.goldRemaining })), PRICE_INDEX.market.orderBookDepth, 'desc'),
        askLevels: aggregateFxByPrice(openSellRows.map((row) => ({ priceSilverPerGold: row.priceSilverPerGold, qty: row.goldRemaining })), PRICE_INDEX.market.orderBookDepth, 'asc'),
    };
}
export async function placeCurrencyOrderAndMatch(playerId, side, goldAmount, priceSilverPerGold) {
    const goldQty = clampInt(goldAmount, 1, PRICE_INDEX.market.maxGoldPerOrder);
    const price = clampInt(priceSilverPerGold, 1, PRICE_INDEX.market.maxUnitPriceSilver);
    return prisma.$transaction(async (tx) => {
        const player = await tx.player.findUnique({
            where: { id: playerId },
            select: { id: true, silver: true, gold: true },
        });
        if (!player)
            return { success: false, message: 'Jugador no encontrado.' };
        const reserveSilver = side === 'BUY_GOLD' ? goldQty * price : 0;
        const reserveGold = side === 'SELL_GOLD' ? goldQty : 0;
        if (side === 'BUY_GOLD' && player.silver < reserveSilver) {
            return { success: false, message: `Necesitas ${reserveSilver}🪙 para esa orden.` };
        }
        if (side === 'SELL_GOLD' && player.gold < reserveGold) {
            return { success: false, message: `Necesitas ${reserveGold}💰 para esa orden.` };
        }
        if (reserveSilver > 0) {
            await tx.player.update({
                where: { id: playerId },
                data: { silver: { decrement: reserveSilver } },
            });
        }
        if (reserveGold > 0) {
            await tx.player.update({
                where: { id: playerId },
                data: { gold: { decrement: reserveGold } },
            });
        }
        const taker = await tx.marketCurrencyOrder.create({
            data: {
                playerId,
                side,
                priceSilverPerGold: price,
                goldTotal: goldQty,
                goldRemaining: goldQty,
                reservedSilver: reserveSilver,
                reservedGold: reserveGold,
                status: ORDER_OPEN,
            },
        });
        const makerSide = side === 'BUY_GOLD' ? 'SELL_GOLD' : 'BUY_GOLD';
        const makerWhere = side === 'BUY_GOLD'
            ? { side: makerSide, status: ORDER_OPEN, goldRemaining: { gt: 0 }, priceSilverPerGold: { lte: price } }
            : { side: makerSide, status: ORDER_OPEN, goldRemaining: { gt: 0 }, priceSilverPerGold: { gte: price } };
        const makerOrderBy = side === 'BUY_GOLD'
            ? [{ priceSilverPerGold: 'asc' }, { createdAt: 'asc' }]
            : [{ priceSilverPerGold: 'desc' }, { createdAt: 'asc' }];
        const makers = await tx.marketCurrencyOrder.findMany({
            where: { ...makerWhere, playerId: { not: playerId } },
            orderBy: makerOrderBy,
        });
        let takerRemaining = taker.goldRemaining;
        let takerSpentSilver = 0;
        let takerSilverGain = 0;
        let takerGoldGain = 0;
        const makerSilverGains = new Map();
        const makerGoldGains = new Map();
        const tradesData = [];
        for (const maker of makers) {
            if (takerRemaining <= 0)
                break;
            if (maker.goldRemaining <= 0)
                continue;
            const fillGold = Math.min(takerRemaining, maker.goldRemaining);
            const executionPrice = maker.priceSilverPerGold;
            const grossSilver = fillGold * executionPrice;
            const feeSilver = calcTradeFeeSilver(grossSilver);
            const sellerNet = Math.max(0, grossSilver - feeSilver);
            if (side === 'BUY_GOLD') {
                takerSpentSilver += grossSilver;
                takerGoldGain += fillGold;
                makerSilverGains.set(maker.playerId, (makerSilverGains.get(maker.playerId) || 0) + sellerNet);
            }
            else {
                takerSilverGain += sellerNet;
                makerGoldGains.set(maker.playerId, (makerGoldGains.get(maker.playerId) || 0) + fillGold);
            }
            const makerNewRemaining = maker.goldRemaining - fillGold;
            const makerUpdateData = maker.side === 'BUY_GOLD'
                ? {
                    goldRemaining: makerNewRemaining,
                    reservedSilver: Math.max(0, maker.reservedSilver - grossSilver),
                    status: makerNewRemaining <= 0 ? ORDER_FILLED : ORDER_OPEN,
                }
                : {
                    goldRemaining: makerNewRemaining,
                    reservedGold: Math.max(0, maker.reservedGold - fillGold),
                    status: makerNewRemaining <= 0 ? ORDER_FILLED : ORDER_OPEN,
                };
            await tx.marketCurrencyOrder.update({
                where: { id: maker.id },
                data: makerUpdateData,
            });
            tradesData.push({
                orderId: maker.id,
                buyPlayerId: side === 'BUY_GOLD' ? playerId : maker.playerId,
                sellPlayerId: side === 'BUY_GOLD' ? maker.playerId : playerId,
                goldAmount: fillGold,
                priceSilverPerGold: executionPrice,
                grossSilver,
                feeSilver,
            });
            takerRemaining -= fillGold;
        }
        if (side === 'BUY_GOLD') {
            const newReserved = takerRemaining * price;
            const refund = Math.max(0, reserveSilver - takerSpentSilver - newReserved);
            if (refund > 0) {
                await tx.player.update({
                    where: { id: playerId },
                    data: { silver: { increment: refund } },
                });
            }
            if (takerGoldGain > 0) {
                await tx.player.update({
                    where: { id: playerId },
                    data: { gold: { increment: takerGoldGain } },
                });
            }
            await tx.marketCurrencyOrder.update({
                where: { id: taker.id },
                data: {
                    goldRemaining: takerRemaining,
                    reservedSilver: newReserved,
                    status: takerRemaining <= 0 ? ORDER_FILLED : ORDER_OPEN,
                },
            });
        }
        else {
            if (takerSilverGain > 0) {
                await tx.player.update({
                    where: { id: playerId },
                    data: { silver: { increment: takerSilverGain } },
                });
            }
            await tx.marketCurrencyOrder.update({
                where: { id: taker.id },
                data: {
                    goldRemaining: takerRemaining,
                    reservedGold: takerRemaining,
                    status: takerRemaining <= 0 ? ORDER_FILLED : ORDER_OPEN,
                },
            });
        }
        for (const [makerPlayerId, silverGain] of makerSilverGains.entries()) {
            if (silverGain <= 0)
                continue;
            await tx.player.update({
                where: { id: makerPlayerId },
                data: { silver: { increment: silverGain } },
            });
        }
        for (const [makerPlayerId, goldGain] of makerGoldGains.entries()) {
            if (goldGain <= 0)
                continue;
            await tx.player.update({
                where: { id: makerPlayerId },
                data: { gold: { increment: goldGain } },
            });
        }
        if (tradesData.length > 0) {
            await tx.marketCurrencyTrade.createMany({ data: tradesData });
        }
        const executedGold = goldQty - takerRemaining;
        const avgPrice = executedGold > 0
            ? tradesData.reduce((sum, row) => sum + row.priceSilverPerGold * row.goldAmount, 0) / executedGold
            : 0;
        if (executedGold === 0) {
            return {
                success: true,
                orderId: taker.id,
                message: side === 'BUY_GOLD'
                    ? `Orden BUY creada sin match inmediato. ${goldQty}💰 @ ${price}🪙.`
                    : `Orden SELL creada sin match inmediato. ${goldQty}💰 @ ${price}🪙.`,
            };
        }
        const pendingText = takerRemaining > 0 ? ` Pendiente: ${takerRemaining}💰.` : ' Orden completada.';
        return {
            success: true,
            orderId: taker.id,
            message: side === 'BUY_GOLD'
                ? `Compraste ${executedGold}💰 a ${avgPrice.toFixed(2)}🪙.${pendingText}`
                : `Vendiste ${executedGold}💰 a ${avgPrice.toFixed(2)}🪙.${pendingText}`,
        };
    });
}
export async function listPlayerCurrencyOrders(playerId, limit = 12, offset = 0) {
    const rows = await prisma.marketCurrencyOrder.findMany({
        where: {
            playerId,
            status: ORDER_OPEN,
            goldRemaining: { gt: 0 },
        },
        orderBy: [{ createdAt: 'asc' }],
        skip: Math.max(0, Math.floor(offset)),
        take: limit,
    });
    return rows.map((row) => ({
        orderId: row.id,
        side: row.side,
        priceSilverPerGold: row.priceSilverPerGold,
        goldRemaining: row.goldRemaining,
        goldTotal: row.goldTotal,
        createdAt: row.createdAt,
    }));
}
export async function cancelCurrencyOrder(playerId, orderId) {
    return prisma.$transaction(async (tx) => {
        const order = await tx.marketCurrencyOrder.findFirst({
            where: {
                id: orderId,
                playerId,
                status: ORDER_OPEN,
                goldRemaining: { gt: 0 },
            },
        });
        if (!order) {
            return { success: false, message: 'Orden no encontrada o ya cerrada.' };
        }
        if (order.side === 'BUY_GOLD' && order.reservedSilver > 0) {
            await tx.player.update({
                where: { id: playerId },
                data: { silver: { increment: order.reservedSilver } },
            });
        }
        if (order.side === 'SELL_GOLD' && order.reservedGold > 0) {
            await tx.player.update({
                where: { id: playerId },
                data: { gold: { increment: order.reservedGold } },
            });
        }
        await tx.marketCurrencyOrder.update({
            where: { id: order.id },
            data: {
                goldRemaining: 0,
                reservedSilver: 0,
                reservedGold: 0,
                status: ORDER_CANCELLED,
            },
        });
        return { success: true, message: `Orden FX #${order.id} cancelada.` };
    });
}
export async function getRecentFxTrades(limit = 10, offset = 0) {
    const rows = await prisma.marketCurrencyTrade.findMany({
        orderBy: { createdAt: 'desc' },
        skip: Math.max(0, Math.floor(offset)),
        take: limit,
    });
    return rows.map((row) => ({
        goldAmount: row.goldAmount,
        priceSilverPerGold: row.priceSilverPerGold,
        grossSilver: row.grossSilver,
        createdAt: row.createdAt,
    }));
}
//# sourceMappingURL=market-exchange-fx.js.map