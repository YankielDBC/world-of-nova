export interface MarketHubSummaryRead {
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
export declare function getMarketHubSummaryRead(): Promise<MarketHubSummaryRead>;
