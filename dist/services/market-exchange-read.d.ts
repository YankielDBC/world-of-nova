export interface ListedMarketItemEntry {
    resourceId: number;
    resourceName: string;
    resourceEmoji: string;
    totalQty: number;
    bestPriceSilver: number;
}
export interface MarketBookLevel {
    priceSilver: number;
    quantity: number;
}
export interface ItemOrderBookView {
    resourceId: number;
    resourceName: string;
    resourceEmoji: string;
    rangeMinSilver: number | null;
    rangeMaxSilver: number | null;
    lastTradeSilver: number | null;
    topAsks: MarketBookLevel[];
    playerOrders: Array<{
        orderId: number;
        priceSilver: number;
        quantityRemaining: number;
        quantityTotal: number;
    }>;
}
export interface ItemMarketInsight {
    avgPrice24h: number | null;
    changePct24h: number;
    soldQty24h: number;
    capitalSilver24h: number;
    supplyTotal: number;
}
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
