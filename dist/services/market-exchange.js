// @ts-nocheck
import { prisma } from '../lib/db.js';
export { formatMarketTimeAgo, getItemHoldingsForPlayer, getResourceStockByContainer, } from './market-exchange-holdings.js';
import { getItemMarketInsight as getItemMarketInsightRead, getItemOrderBook as getItemOrderBookRead, listListedMarketItems as listListedMarketItemsRead, listTradableResources as listTradableResourcesRead, } from './market-exchange-read.js';
import { getMarketHubSummaryRead } from './market-exchange-hub.js';
export { buyItemAtBestAsks, cancelItemOrder, createItemSellOrder, getRecentItemTrades, listPlayerItemOrders, } from './market-exchange-item.js';
export { cancelCurrencyOrder, getExchangeSnapshot, getRecentFxTrades, listPlayerCurrencyOrders, placeCurrencyOrderAndMatch, } from './market-exchange-fx.js';
export async function ensureNovaMarketEnabled() {
    const place = await prisma.place.findFirst({
        where: { slug: 'nova-castle' },
        select: { id: true },
    });
    if (!place)
        return;
    await prisma.placeInteraction.upsert({
        where: { placeId_slug: { placeId: place.id, slug: 'grand-exchange-open' } },
        create: {
            placeId: place.id,
            slug: 'grand-exchange-open',
            name: 'Grand Exchange',
            displayName: 'Gran Mercado Nova',
            description: 'Mercado de jugadores con order book y exchange.',
            type: 'MARKET',
            emoji: '🏛️',
            costType: null,
            costAmount: 0,
            effectType: null,
            effectValue: null,
            instantFull: false,
            sortOrder: 999,
        },
        update: {
            displayName: 'Gran Mercado Nova',
            description: 'Mercado de jugadores con order book y exchange.',
            type: 'MARKET',
            emoji: '🏛️',
            costType: null,
            costAmount: 0,
            sortOrder: 999,
        },
    });
}
export async function getMarketHubSummary() {
    return getMarketHubSummaryRead();
}
export async function listTradableResources(limit = 8) {
    return listTradableResourcesRead(limit);
}
export async function listListedMarketItems(params) {
    return listListedMarketItemsRead(params);
}
export async function getItemOrderBook(resourceId, playerId) {
    return getItemOrderBookRead(resourceId, playerId);
}
export async function getItemMarketInsight(resourceId) {
    return getItemMarketInsightRead(resourceId);
}
//# sourceMappingURL=market-exchange.js.map