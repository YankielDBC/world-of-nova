export declare function createItemSellOrder(playerId: any, resourceId: any, quantity: any, priceSilver: any): Promise<{
    success: boolean;
    message: string;
    orderId?: undefined;
} | {
    success: boolean;
    message: string;
    orderId: number;
}>;
export declare function buyItemAtBestAsks(playerId: any, resourceId: any, quantity: any): Promise<{
    success: boolean;
    message: string;
    boughtQty?: undefined;
    spentSilver?: undefined;
    avgPriceSilver?: undefined;
} | {
    success: boolean;
    message: string;
    boughtQty: number;
    spentSilver: number;
    avgPriceSilver: number;
}>;
export declare function listPlayerItemOrders(playerId: any, limit?: number, offset?: number): Promise<{
    orderId: number;
    resourceId: number;
    resourceName: string;
    resourceEmoji: string;
    priceSilver: number;
    quantityRemaining: number;
    quantityTotal: number;
    createdAt: Date;
}[]>;
export declare function cancelItemOrder(playerId: any, orderId: any): Promise<{
    success: boolean;
    message: string;
}>;
export declare function getRecentItemTrades(limit?: number, offset?: number): Promise<{
    resourceName: string;
    resourceEmoji: string;
    quantity: number;
    priceSilver: number;
    grossSilver: number;
    createdAt: Date;
}[]>;
