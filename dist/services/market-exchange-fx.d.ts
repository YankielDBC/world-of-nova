import type { ExchangeSnapshot, FxOrderListEntry, FxOrderResult, FxOrderSide, FxTradeEntry } from './market-exchange-types.js';
export declare function getExchangeSnapshot(): Promise<ExchangeSnapshot>;
export declare function placeCurrencyOrderAndMatch(playerId: number, side: FxOrderSide, goldAmount: number, priceSilverPerGold: number): Promise<FxOrderResult>;
export declare function listPlayerCurrencyOrders(playerId: number, limit?: number, offset?: number): Promise<FxOrderListEntry[]>;
export declare function cancelCurrencyOrder(playerId: number, orderId: number): Promise<{
    success: boolean;
    message: string;
}>;
export declare function getRecentFxTrades(limit?: number, offset?: number): Promise<FxTradeEntry[]>;
