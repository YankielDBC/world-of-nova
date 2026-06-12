// @ts-nocheck
import { PRICE_INDEX } from '../data/price-index.js';
export const ORDER_OPEN = 'OPEN';
export const ORDER_FILLED = 'FILLED';
export const ORDER_CANCELLED = 'CANCELLED';
export const ACTIVE_STATUS = 'ACTIVE';
export const VAULT_STATUS = 'VAULT';
export const TRADE_FEE_RATE = PRICE_INDEX.market.tradeFeeRate;
export function calcTradeFeeSilver(grossSilver) {
    return Math.max(1, Math.ceil(grossSilver * TRADE_FEE_RATE));
}
