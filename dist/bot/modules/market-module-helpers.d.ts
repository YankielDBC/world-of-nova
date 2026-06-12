import { InlineKeyboard } from 'grammy';
import type { Language } from '../../lib/i18n.js';
export type MarketConversationState = {
    phase: 'await_item_buy_qty';
    placeId: number;
    buildingKey: string;
    resourceId: number;
} | {
    phase: 'await_item_sell_order';
    placeId: number;
    buildingKey: string;
    resourceId: number;
} | {
    phase: 'await_fx_buy';
    placeId: number;
    buildingKey: string;
} | {
    phase: 'await_fx_sell';
    placeId: number;
    buildingKey: string;
};
export declare const MARKET_SCOPE = "market";
export declare const MARKET_BUILDING_KEY = "grand-exchange";
export declare const PAGE_SIZE = 10;
export declare function isMessageNotModifiedError(error: unknown): boolean;
export declare function getPlayerLanguage(player?: {
    language?: string | null;
}): Language;
export declare function formatShortNumber(value: number): string;
export declare function formatInt(value: number): string;
export declare function shortLabel(text: string, max?: number): string;
export declare function formatPct(value: number): string;
export declare function isPlayerAtPlaceById(player: {
    mapX: number;
    mapY: number;
}, placeId: number): Promise<boolean>;
export declare function resolveCurrentMarketPlaceId(player: {
    mapX: number;
    mapY: number;
}): Promise<number | null>;
export declare function buildHubKeyboard(placeId: number, buildingKey: string): InlineKeyboard;
export declare function buildItemsKeyboard(placeId: number, buildingKey: string): InlineKeyboard;
export declare function buildPagedKeyboard(params: {
    placeId: number;
    buildingKey: string;
    baseKey: string;
    page: number;
    hasMore: boolean;
    backKey: string;
    includeHub?: boolean;
}): InlineKeyboard;
export declare function buildItemBookKeyboard(placeId: number, buildingKey: string, resourceId: number): InlineKeyboard;
export declare function buildExchangeKeyboard(placeId: number, buildingKey: string): InlineKeyboard;
