export declare function getExchangeSnapshot(): Promise<{
    lastPriceSilver: number;
    change24hPct: number;
    bestBidSilver: number;
    bestAskSilver: number;
    bidLevels: {
        priceSilver: any;
        goldAmount: any;
    }[];
    askLevels: {
        priceSilver: any;
        goldAmount: any;
    }[];
}>;
export declare function placeCurrencyOrderAndMatch(playerId: any, side: any, goldAmount: any, priceSilverPerGold: any): Promise<{
    success: boolean;
    message: string;
    orderId?: undefined;
} | {
    success: boolean;
    orderId: number;
    message: string;
}>;
export declare function listPlayerCurrencyOrders(playerId: any, limit?: number, offset?: number): Promise<{
    orderId: number;
    side: string;
    priceSilverPerGold: number;
    goldRemaining: number;
    goldTotal: number;
    createdAt: Date;
}[]>;
export declare function cancelCurrencyOrder(playerId: any, orderId: any): Promise<{
    success: boolean;
    message: string;
}>;
export declare function getRecentFxTrades(limit?: number, offset?: number): Promise<{
    goldAmount: number;
    priceSilverPerGold: number;
    grossSilver: number;
    createdAt: Date;
}[]>;
