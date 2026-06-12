// @ts-nocheck
import { prisma } from '../lib/db.js';
import { PRICE_INDEX } from '../data/price-index.js';
import { aggregateByPrice } from './market-exchange-utils.js';
const ORDER_OPEN = 'OPEN';
export async function listTradableResources(limit = 8) {
    const [recentRows, openOrderRows] = await Promise.all([
        prisma.marketItemTrade.findMany({
            orderBy: { createdAt: 'desc' },
            take: 300,
            select: { resourceId: true },
        }),
        prisma.marketItemOrder.findMany({
            where: { status: ORDER_OPEN, quantityRemaining: { gt: 0 } },
            orderBy: { updatedAt: 'desc' },
            take: 200,
            select: { resourceId: true },
        }),
    ]);
    const candidateIds = [];
    for (const row of recentRows)
        candidateIds.push(row.resourceId);
    for (const row of openOrderRows)
        candidateIds.push(row.resourceId);
    const uniqueIds = Array.from(new Set(candidateIds)).slice(0, 40);
    if (uniqueIds.length === 0) {
        const fallback = await prisma.resource.findMany({
            orderBy: { id: 'asc' },
            take: limit,
            select: { id: true, name: true, emoji: true },
        });
        return fallback.map((row) => ({ resourceId: row.id, name: row.name, emoji: row.emoji }));
    }
    const resources = await prisma.resource.findMany({
        where: { id: { in: uniqueIds } },
        select: { id: true, name: true, emoji: true },
    });
    const map = new Map(resources.map((resource) => [resource.id, resource]));
    return uniqueIds
        .map((id) => map.get(id))
        .filter((row) => Boolean(row))
        .slice(0, limit)
        .map((row) => ({ resourceId: row.id, name: row.name, emoji: row.emoji }));
}
export async function listListedMarketItems(params) {
    const page = Math.max(1, Math.floor(params?.page ?? 1));
    const pageSize = Math.max(1, Math.floor(params?.pageSize ?? 10));
    const skip = (page - 1) * pageSize;
    const grouped = await prisma.marketItemOrder.groupBy({
        by: ['resourceId'],
        where: {
            side: 'SELL',
            status: ORDER_OPEN,
            quantityRemaining: { gt: 0 },
        },
        _sum: { quantityRemaining: true },
        _min: { priceSilver: true },
        orderBy: [{ _sum: { quantityRemaining: 'desc' } }, { resourceId: 'asc' }],
        skip,
        take: pageSize + 1,
    });
    const pageRows = grouped.slice(0, pageSize);
    const hasMore = grouped.length > pageSize;
    if (pageRows.length === 0) {
        return { items: [], page, pageSize, hasMore };
    }
    const resourceIds = pageRows.map((row) => row.resourceId);
    const resources = await prisma.resource.findMany({
        where: { id: { in: resourceIds } },
        select: { id: true, name: true, emoji: true },
    });
    const resourceMap = new Map(resources.map((resource) => [resource.id, resource]));
    const items = pageRows.map((row) => ({
        resourceId: row.resourceId,
        resourceName: resourceMap.get(row.resourceId)?.name || `Item ${row.resourceId}`,
        resourceEmoji: resourceMap.get(row.resourceId)?.emoji || '📦',
        totalQty: row._sum.quantityRemaining || 0,
        bestPriceSilver: row._min.priceSilver || 0,
    }));
    return { items, page, pageSize, hasMore };
}
export async function getItemOrderBook(resourceId, playerId) {
    const [resource, openAsks, lastTrade, playerOrders] = await Promise.all([
        prisma.resource.findUnique({
            where: { id: resourceId },
            select: { id: true, name: true, emoji: true },
        }),
        prisma.marketItemOrder.findMany({
            where: {
                resourceId,
                side: 'SELL',
                status: ORDER_OPEN,
                quantityRemaining: { gt: 0 },
            },
            orderBy: [{ priceSilver: 'asc' }, { createdAt: 'asc' }],
            select: { priceSilver: true, quantityRemaining: true },
            take: 200,
        }),
        prisma.marketItemTrade.findFirst({
            where: { resourceId },
            orderBy: { createdAt: 'desc' },
            select: { priceSilver: true },
        }),
        playerId
            ? prisma.marketItemOrder.findMany({
                where: {
                    playerId,
                    resourceId,
                    status: ORDER_OPEN,
                    quantityRemaining: { gt: 0 },
                },
                orderBy: { createdAt: 'asc' },
                select: {
                    id: true,
                    priceSilver: true,
                    quantityRemaining: true,
                    quantityTotal: true,
                },
                take: 8,
            })
            : Promise.resolve([]),
    ]);
    if (!resource)
        return null;
    const topAsks = aggregateByPrice(openAsks.map((ask) => ({ priceSilver: ask.priceSilver, qty: ask.quantityRemaining })), PRICE_INDEX.market.orderBookDepth);
    const prices = openAsks.map((ask) => ask.priceSilver);
    return {
        resourceId: resource.id,
        resourceName: resource.name,
        resourceEmoji: resource.emoji,
        rangeMinSilver: prices.length ? Math.min(...prices) : null,
        rangeMaxSilver: prices.length ? Math.max(...prices) : null,
        lastTradeSilver: lastTrade?.priceSilver ?? null,
        topAsks,
        playerOrders: playerOrders.map((order) => ({
            orderId: order.id,
            priceSilver: order.priceSilver,
            quantityRemaining: order.quantityRemaining,
            quantityTotal: order.quantityTotal,
        })),
    };
}
export async function getItemMarketInsight(resourceId) {
    const now = Date.now();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now - 48 * 60 * 60 * 1000);
    const [recentTrades, previousTrades, stockAgg, marketAgg] = await Promise.all([
        prisma.marketItemTrade.findMany({
            where: { resourceId, createdAt: { gte: dayAgo } },
            select: { priceSilver: true, quantity: true, grossSilver: true },
            orderBy: { createdAt: 'desc' },
            take: 500,
        }),
        prisma.marketItemTrade.findMany({
            where: { resourceId, createdAt: { gte: twoDaysAgo, lt: dayAgo } },
            select: { priceSilver: true },
            orderBy: { createdAt: 'desc' },
            take: 500,
        }),
        prisma.playerBagSlot.aggregate({
            where: { resourceId },
            _sum: { quantity: true },
        }),
        prisma.marketItemOrder.aggregate({
            where: {
                resourceId,
                side: 'SELL',
                status: ORDER_OPEN,
                quantityRemaining: { gt: 0 },
            },
            _sum: { quantityRemaining: true },
        }),
    ]);
    const avgPrice24h = recentTrades.length > 0 ? recentTrades.reduce((sum, row) => sum + row.priceSilver, 0) / recentTrades.length : null;
    const avgPricePrev24h = previousTrades.length > 0 ? previousTrades.reduce((sum, row) => sum + row.priceSilver, 0) / previousTrades.length : null;
    let changePct24h = 0;
    if (avgPrice24h != null && avgPricePrev24h != null && avgPricePrev24h > 0) {
        changePct24h = Number((((avgPrice24h - avgPricePrev24h) / avgPricePrev24h) * 100).toFixed(2));
    }
    else if (recentTrades.length > 1) {
        const latestPrice = recentTrades[0].priceSilver;
        const oldestPrice = recentTrades[recentTrades.length - 1].priceSilver;
        if (oldestPrice > 0) {
            changePct24h = Number((((latestPrice - oldestPrice) / oldestPrice) * 100).toFixed(2));
        }
    }
    const soldQty24h = recentTrades.reduce((sum, row) => sum + row.quantity, 0);
    const capitalSilver24h = recentTrades.reduce((sum, row) => sum + row.grossSilver, 0);
    const stockQty = stockAgg._sum.quantity || 0;
    const marketQty = marketAgg._sum.quantityRemaining || 0;
    return {
        avgPrice24h: avgPrice24h == null ? null : Number(avgPrice24h.toFixed(2)),
        changePct24h,
        soldQty24h,
        capitalSilver24h,
        supplyTotal: stockQty + marketQty,
    };
}
//# sourceMappingURL=market-exchange-read.js.map