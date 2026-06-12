import type { ItemMarketInsight, ItemOrderBookView, ListedMarketItemEntry, MarketHubSummary } from './market-exchange-types.js';
export type { ExchangeSnapshot, FxOrderListEntry, FxOrderResult, FxOrderSide, FxTradeEntry, ItemBuyResult, ItemMarketInsight, ItemOrderBookView, ItemOrderCreateResult, ListedMarketItemEntry, MarketBookLevel, MarketHubSummary, MarketOrderListEntry, MarketRecentTradeEntry, } from './market-exchange-types.js';
export { formatMarketTimeAgo, getItemHoldingsForPlayer, getResourceStockByContainer, } from './market-exchange-holdings.js';
export { buyItemAtBestAsks, cancelItemOrder, createItemSellOrder, getRecentItemTrades, listPlayerItemOrders, } from './market-exchange-item.js';
export { cancelCurrencyOrder, getExchangeSnapshot, getRecentFxTrades, listPlayerCurrencyOrders, placeCurrencyOrderAndMatch, } from './market-exchange-fx.js';
export declare function ensureNovaMarketEnabled(): Promise<void>;
export declare function getMarketHubSummary(): Promise<MarketHubSummary>;
export declare function listTradableResources(limit?: number): Promise<Array<{
    resourceId: number;
    name: string;
    emoji: string;
}>>;
export declare function listListedMarketItems(params?: {
    page?: number;
    pageSize?: number;
}): Promise<{
    items: ListedMarketItemEntry[];
    page: number;
    pageSize: number;
    hasMore: boolean;
}>;
export declare function getItemOrderBook(resourceId: number, playerId?: number): Promise<ItemOrderBookView | null>;
export declare function getItemMarketInsight(resourceId: number): Promise<ItemMarketInsight>;
