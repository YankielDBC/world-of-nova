export declare function listTradableResources(limit?: number): Promise<{
    resourceId: number;
    name: string;
    emoji: string;
}[]>;
export declare function listListedMarketItems(params: any): Promise<{
    items: {
        resourceId: number;
        resourceName: string;
        resourceEmoji: string;
        totalQty: number;
        bestPriceSilver: number;
    }[];
    page: number;
    pageSize: number;
    hasMore: boolean;
}>;
export declare function getItemOrderBook(resourceId: any, playerId: any): Promise<{
    resourceId: number;
    resourceName: string;
    resourceEmoji: string;
    rangeMinSilver: number;
    rangeMaxSilver: number;
    lastTradeSilver: number;
    topAsks: {
        priceSilver: any;
        quantity: any;
    }[];
    playerOrders: {
        orderId: any;
        priceSilver: any;
        quantityRemaining: any;
        quantityTotal: any;
    }[];
}>;
export declare function getItemMarketInsight(resourceId: any): Promise<{
    avgPrice24h: number;
    changePct24h: number;
    soldQty24h: number;
    capitalSilver24h: number;
    supplyTotal: number;
}>;
