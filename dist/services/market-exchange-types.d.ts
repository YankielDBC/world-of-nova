export type FxOrderSide = 'BUY_GOLD' | 'SELL_GOLD';
export interface MarketHubSummary {
    hotItems: Array<{
        resourceId: number;
        name: string;
        emoji: string;
        soldQty24h: number;
        capitalSilver24h: number;
        changePct24h: number;
    }>;
    uniqueUsers24h: number;
    itemVolume24h: number;
    itemCapital24h: number;
    fxGoldVolume24h: number;
    fxSilverVolume24h: number;
    goldPriceSilver: number;
    activeItemSellOffers: number;
    trendLabel: string;
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
export interface ItemOrderCreateResult {
    success: boolean;
    message: string;
    orderId?: number;
}
export interface ItemBuyResult {
    success: boolean;
    message: string;
    boughtQty?: number;
    spentSilver?: number;
    avgPriceSilver?: number;
}
export interface MarketOrderListEntry {
    orderId: number;
    resourceId: number;
    resourceName: string;
    resourceEmoji: string;
    priceSilver: number;
    quantityRemaining: number;
    quantityTotal: number;
    createdAt: Date;
}
export interface MarketRecentTradeEntry {
    resourceName: string;
    resourceEmoji: string;
    quantity: number;
    priceSilver: number;
    grossSilver: number;
    createdAt: Date;
}
export interface ListedMarketItemEntry {
    resourceId: number;
    resourceName: string;
    resourceEmoji: string;
    totalQty: number;
    bestPriceSilver: number;
}
export interface ExchangeSnapshot {
    lastPriceSilver: number;
    change24hPct: number;
    bestBidSilver: number | null;
    bestAskSilver: number | null;
    bidLevels: Array<{
        priceSilver: number;
        goldAmount: number;
    }>;
    askLevels: Array<{
        priceSilver: number;
        goldAmount: number;
    }>;
}
export interface FxOrderResult {
    success: boolean;
    message: string;
    orderId?: number;
}
export interface FxOrderListEntry {
    orderId: number;
    side: FxOrderSide;
    priceSilverPerGold: number;
    goldRemaining: number;
    goldTotal: number;
    createdAt: Date;
}
export interface FxTradeEntry {
    goldAmount: number;
    priceSilverPerGold: number;
    grossSilver: number;
    createdAt: Date;
}
