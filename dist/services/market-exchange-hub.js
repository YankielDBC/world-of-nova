// @ts-nocheck
import { prisma } from '../lib/db.js';
import { PRICE_INDEX } from '../data/price-index.js';
export async function getMarketHubSummaryRead() {
    const now = Date.now();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now - 48 * 60 * 60 * 1000);
    const [recentItemTrades, previousItemTrades, recentFxTrades, activeItemSellOffers, latestFxTrade] = await Promise.all([
        prisma.marketItemTrade.findMany({
            where: { createdAt: { gte: dayAgo } },
            select: {
                resourceId: true,
                quantity: true,
                priceSilver: true,
                grossSilver: true,
                buyPlayerId: true,
                sellPlayerId: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 2000,
        }),
        prisma.marketItemTrade.findMany({
            where: { createdAt: { gte: twoDaysAgo, lt: dayAgo } },
            select: { resourceId: true, priceSilver: true },
            orderBy: { createdAt: 'desc' },
            take: 2000,
        }),
        prisma.marketCurrencyTrade.findMany({
            where: { createdAt: { gte: dayAgo } },
            select: { goldAmount: true, grossSilver: true, buyPlayerId: true, sellPlayerId: true },
            orderBy: { createdAt: 'desc' },
            take: 2000,
        }),
        prisma.marketItemOrder.count({
            where: {
                status: 'OPEN',
                side: 'SELL',
                quantityRemaining: { gt: 0 },
            },
        }),
        prisma.marketCurrencyTrade.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { priceSilverPerGold: true },
        }),
    ]);
    const [resourceRows] = await Promise.all([
        prisma.resource.findMany({
            where: {
                id: { in: Array.from(new Set(recentItemTrades.map((row) => row.resourceId))) },
            },
            select: { id: true, name: true, emoji: true },
        }),
    ]);
    const resourceMap = new Map(resourceRows.map((row) => [row.id, row]));
    const uniqueUsers = new Set();
    let itemVolume24h = 0;
    let itemCapital24h = 0;
    const perItem = new Map();
    for (const row of recentItemTrades) {
        uniqueUsers.add(row.buyPlayerId);
        uniqueUsers.add(row.sellPlayerId);
        itemVolume24h += row.quantity;
        itemCapital24h += row.grossSilver;
        const current = perItem.get(row.resourceId) || { soldQty24h: 0, capitalSilver24h: 0, prices: [] };
        current.soldQty24h += row.quantity;
        current.capitalSilver24h += row.grossSilver;
        current.prices.push(row.priceSilver);
        perItem.set(row.resourceId, current);
    }
    const previousByItem = new Map();
    for (const row of previousItemTrades) {
        const list = previousByItem.get(row.resourceId) || [];
        list.push(row.priceSilver);
        previousByItem.set(row.resourceId, list);
    }
    const hotItems = Array.from(perItem.entries())
        .map(([resourceId, stats]) => {
        const nowAvg = stats.prices.length ? stats.prices.reduce((sum, value) => sum + value, 0) / stats.prices.length : 0;
        const prevPrices = previousByItem.get(resourceId) || [];
        const prevAvg = prevPrices.length ? prevPrices.reduce((sum, value) => sum + value, 0) / prevPrices.length : 0;
        let changePct24h = 0;
        if (prevAvg > 0) {
            changePct24h = Number((((nowAvg - prevAvg) / prevAvg) * 100).toFixed(2));
        }
        else if (stats.prices.length > 1) {
            const latestPrice = stats.prices[0];
            const oldestPrice = stats.prices[stats.prices.length - 1];
            if (oldestPrice > 0) {
                changePct24h = Number((((latestPrice - oldestPrice) / oldestPrice) * 100).toFixed(2));
            }
        }
        const resource = resourceMap.get(resourceId);
        return {
            resourceId,
            name: resource?.name || `Item ${resourceId}`,
            emoji: resource?.emoji || '📦',
            soldQty24h: stats.soldQty24h,
            capitalSilver24h: stats.capitalSilver24h,
            changePct24h,
        };
    })
        .sort((a, b) => {
        if (b.soldQty24h !== a.soldQty24h)
            return b.soldQty24h - a.soldQty24h;
        return b.capitalSilver24h - a.capitalSilver24h;
    })
        .slice(0, 5);
    const fxGoldVolume24h = recentFxTrades.reduce((sum, row) => sum + row.goldAmount, 0);
    const fxSilverVolume24h = recentFxTrades.reduce((sum, row) => sum + row.grossSilver, 0);
    for (const row of recentFxTrades) {
        uniqueUsers.add(row.buyPlayerId);
        uniqueUsers.add(row.sellPlayerId);
    }
    const avgRecent = recentItemTrades.length > 0
        ? recentItemTrades.reduce((sum, row) => sum + row.priceSilver, 0) / recentItemTrades.length
        : 0;
    const avgPrevious = previousItemTrades.length > 0
        ? previousItemTrades.reduce((sum, row) => sum + row.priceSilver, 0) / previousItemTrades.length
        : 0;
    let trendLabel = 'Mercado estable';
    if (avgRecent > 0 && avgPrevious > 0) {
        if (avgRecent > avgPrevious * 1.03)
            trendLabel = 'Mercado en alza';
        else if (avgRecent < avgPrevious * 0.97)
            trendLabel = 'Mercado en baja';
    }
    return {
        hotItems,
        uniqueUsers24h: uniqueUsers.size,
        itemVolume24h,
        itemCapital24h,
        fxGoldVolume24h,
        fxSilverVolume24h,
        goldPriceSilver: latestFxTrade?.priceSilverPerGold ?? PRICE_INDEX.market.defaultSilverPerGold,
        activeItemSellOffers,
        trendLabel,
    };
}
//# sourceMappingURL=market-exchange-hub.js.map