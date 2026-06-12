// @ts-nocheck
import { InlineKeyboard } from 'grammy';
import { prisma } from '../../lib/db.js';
import { EMOJIS } from '../../data/emojis.js';
export const MARKET_SCOPE = 'market';
export const MARKET_BUILDING_KEY = 'grand-exchange';
export const PAGE_SIZE = 10;
export function isMessageNotModifiedError(error) {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes('message is not modified');
}
export function getPlayerLanguage(player) {
    return player?.language ?? 'es';
}
export function formatShortNumber(value) {
    const abs = Math.abs(value);
    if (abs >= 1000000000)
        return `${(value / 1000000000).toFixed(abs >= 10000000000 ? 0 : 1)}B`;
    if (abs >= 1000000)
        return `${(value / 1000000).toFixed(abs >= 10000000 ? 0 : 1)}M`;
    if (abs >= 1000)
        return `${(value / 1000).toFixed(abs >= 10000 ? 0 : 1)}K`;
    return `${Math.floor(value)}`;
}
export function formatInt(value) {
    return Math.floor(value).toLocaleString('en-US');
}
export function shortLabel(text, max = 16) {
    if (text.length <= max)
        return text;
    return `${text.slice(0, max - 1)}…`;
}
export function formatPct(value) {
    const rounded = Number(value.toFixed(1));
    return `${rounded >= 0 ? '+' : ''}${rounded}%`;
}
export async function isPlayerAtPlaceById(player, placeId) {
    const place = await prisma.place.findUnique({
        where: { id: placeId },
        select: { coordX: true, coordY: true },
    });
    if (!place)
        return false;
    return player.mapX === place.coordX && player.mapY === place.coordY;
}
export async function resolveCurrentMarketPlaceId(player) {
    const place = await prisma.place.findFirst({
        where: {
            coordX: player.mapX,
            coordY: player.mapY,
            interactions: {
                some: { slug: 'grand-exchange-open' },
            },
        },
        select: { id: true },
    });
    return place?.id ?? null;
}
export function buildHubKeyboard(placeId, buildingKey) {
    return new InlineKeyboard()
        .text('📦 Items', `market_items:${placeId}|${buildingKey}`)
        .text('💱 Exchange', `market_exchange:${placeId}|${buildingKey}`)
        .row()
        .text('🧾 Mis órdenes', `market_orders:${placeId}|${buildingKey}|1`)
        .text('🕒 Recientes', `market_recent:${placeId}|${buildingKey}|1`)
        .row()
        .text('↩ Place', 'place_back');
}
export function buildItemsKeyboard(placeId, buildingKey) {
    return new InlineKeyboard()
        .text('🛒 Comprar', `market_buy_menu:${placeId}|${buildingKey}|1`)
        .text('📥 Vender', `market_sell_menu:${placeId}|${buildingKey}|1`)
        .row()
        .text('🕒 Recientes', `market_recent:${placeId}|${buildingKey}|1`)
        .text('🧾 Mis órdenes', `market_orders:${placeId}|${buildingKey}|1`)
        .row()
        .text('↩ Hub', `market_hub:${placeId}|${buildingKey}`);
}
export function buildPagedKeyboard(params) {
    const keyboard = new InlineKeyboard();
    if (params.page > 1) {
        keyboard.text('⬅️ Prev', `${params.baseKey}:${params.placeId}|${params.buildingKey}|${params.page - 1}`);
    }
    if (params.hasMore) {
        keyboard.text('➡️ Next', `${params.baseKey}:${params.placeId}|${params.buildingKey}|${params.page + 1}`);
    }
    if (params.page > 1 || params.hasMore) {
        keyboard.row();
    }
    keyboard.text('↩ Regresar', params.backKey);
    if (params.includeHub) {
        keyboard.text('🏛️ Hub', `market_hub:${params.placeId}|${params.buildingKey}`);
    }
    return keyboard;
}
export function buildItemBookKeyboard(placeId, buildingKey, resourceId) {
    return new InlineKeyboard()
        .text('🟢 Comprar', `market_item_buy:${placeId}|${buildingKey}|${resourceId}`)
        .text('📥 Vender', `market_item_sell:${placeId}|${buildingKey}|${resourceId}`)
        .row()
        .text('🕒 Recientes', `market_recent:${placeId}|${buildingKey}|1`)
        .text('🧾 Mis órdenes', `market_orders:${placeId}|${buildingKey}|1`)
        .row()
        .text('↩ Items', `market_items:${placeId}|${buildingKey}`)
        .text('🏛️ Hub', `market_hub:${placeId}|${buildingKey}`);
}
export function buildExchangeKeyboard(placeId, buildingKey) {
    return new InlineKeyboard()
        .text(`${EMOJIS.ui.gold} Comprar Oro`, `market_fx_buy:${placeId}|${buildingKey}`)
        .text(`${EMOJIS.ui.silver} Vender Oro`, `market_fx_sell:${placeId}|${buildingKey}`)
        .row()
        .text('🧾 Mis órdenes', `market_orders:${placeId}|${buildingKey}|1`)
        .text('🕒 Recientes', `market_recent:${placeId}|${buildingKey}|1`)
        .row()
        .text('↩ Hub', `market_hub:${placeId}|${buildingKey}`);
}
//# sourceMappingURL=market-module-helpers.js.map