import type { ItemBuyResult, ItemOrderCreateResult, MarketOrderListEntry, MarketRecentTradeEntry } from './market-exchange-types.js';
export declare function createItemSellOrder(playerId: number, resourceId: number, quantity: number, priceSilver: number): Promise<ItemOrderCreateResult>;
export declare function buyItemAtBestAsks(playerId: number, resourceId: number, quantity: number): Promise<ItemBuyResult>;
export declare function listPlayerItemOrders(playerId: number, limit?: number, offset?: number): Promise<MarketOrderListEntry[]>;
export declare function cancelItemOrder(playerId: number, orderId: number): Promise<{
    success: boolean;
    message: string;
}>;
export declare function getRecentItemTrades(limit?: number, offset?: number): Promise<MarketRecentTradeEntry[]>;
