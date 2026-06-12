export declare function getMarketHubSummaryRead(): Promise<{
    hotItems: {
        resourceId: any;
        name: string;
        emoji: string;
        soldQty24h: any;
        capitalSilver24h: any;
        changePct24h: number;
    }[];
    uniqueUsers24h: number;
    itemVolume24h: number;
    itemCapital24h: number;
    fxGoldVolume24h: number;
    fxSilverVolume24h: number;
    goldPriceSilver: number;
    activeItemSellOffers: number;
    trendLabel: string;
}>;
