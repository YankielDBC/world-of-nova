// @ts-nocheck
import { getPlayerByTelegramId } from '../../lib/db.js';
import { t } from '../../lib/i18n.js';
import { buyItemAtBestAsks, cancelCurrencyOrder, cancelItemOrder, createItemSellOrder, getExchangeSnapshot, getResourceStockByContainer, placeCurrencyOrderAndMatch } from '../../services/market-exchange.js';
import { MARKET_BUILDING_KEY, resolveCurrentMarketPlaceId } from './market-module-helpers.js';
import { clearMarketState, getMarketState, loadMarketContext, openBuyDirectory, openExchange, openHub, openItemBook, openItemByShortcut, openItemsDirectory, openMyOrders, openRecentTrades, openSellDirectory, setMarketState } from './market-module-content.js';
export function createMarketModule() {
    async function handleCallback(ctx, callbackData) {
        if (callbackData.startsWith('market_hub:')) {
            const [placeIdRaw, buildingKey] = callbackData.replace('market_hub:', '').split('|');
            const placeId = Number(placeIdRaw);
            if (!Number.isFinite(placeId) || !buildingKey)
                return true;
            await ctx.answerCallbackQuery();
            await openHub(ctx, { mode: 'edit', placeId, buildingKey });
            return true;
        }
        if (callbackData.startsWith('market_items:')) {
            const [placeIdRaw, buildingKey] = callbackData.replace('market_items:', '').split('|');
            const placeId = Number(placeIdRaw);
            if (!Number.isFinite(placeId) || !buildingKey)
                return true;
            await ctx.answerCallbackQuery();
            await openItemsDirectory(ctx, { mode: 'edit', placeId, buildingKey });
            return true;
        }
        if (callbackData.startsWith('market_buy_menu:')) {
            const [placeIdRaw, buildingKey, pageRaw] = callbackData.replace('market_buy_menu:', '').split('|');
            const placeId = Number(placeIdRaw);
            const page = Number(pageRaw || '1');
            if (!Number.isFinite(placeId) || !buildingKey || !Number.isFinite(page))
                return true;
            await ctx.answerCallbackQuery();
            await openBuyDirectory(ctx, { mode: 'edit', placeId, buildingKey, page: Math.max(1, page) });
            return true;
        }
        if (callbackData.startsWith('market_sell_menu:')) {
            const [placeIdRaw, buildingKey, pageRaw] = callbackData.replace('market_sell_menu:', '').split('|');
            const placeId = Number(placeIdRaw);
            const page = Number(pageRaw || '1');
            if (!Number.isFinite(placeId) || !buildingKey || !Number.isFinite(page))
                return true;
            await ctx.answerCallbackQuery();
            await openSellDirectory(ctx, { mode: 'edit', placeId, buildingKey, page: Math.max(1, page) });
            return true;
        }
        if (callbackData.startsWith('market_buy_pick:')) {
            const [placeIdRaw, buildingKey, resourceIdRaw] = callbackData.replace('market_buy_pick:', '').split('|');
            const placeId = Number(placeIdRaw);
            const resourceId = Number(resourceIdRaw);
            if (!Number.isFinite(placeId) || !buildingKey || !Number.isFinite(resourceId))
                return true;
            await ctx.answerCallbackQuery();
            await openItemBook(ctx, { mode: 'edit', placeId, buildingKey, resourceId });
            return true;
        }
        if (callbackData.startsWith('market_item_buy:')) {
            const [placeIdRaw, buildingKey, resourceIdRaw] = callbackData.replace('market_item_buy:', '').split('|');
            const placeId = Number(placeIdRaw);
            const resourceId = Number(resourceIdRaw);
            if (!Number.isFinite(placeId) || !buildingKey || !Number.isFinite(resourceId))
                return true;
            await setMarketState(ctx.callbackQuery.from.id, { phase: 'await_item_buy_qty', placeId, buildingKey, resourceId });
            await ctx.answerCallbackQuery();
            await ctx.reply('¿Cuántas unidades quieres comprar? (ej: 5) /cancel para salir');
            return true;
        }
        if (callbackData.startsWith('market_item_sell:')) {
            const [placeIdRaw, buildingKey, resourceIdRaw] = callbackData.replace('market_item_sell:', '').split('|');
            const placeId = Number(placeIdRaw);
            const resourceId = Number(resourceIdRaw);
            if (!Number.isFinite(placeId) || !buildingKey || !Number.isFinite(resourceId))
                return true;
            const player = await getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
            let sellableNow = 0;
            if (player) {
                const stock = await getResourceStockByContainer(player.id, resourceId);
                sellableNow = stock.bagQty;
            }
            await setMarketState(ctx.callbackQuery.from.id, { phase: 'await_item_sell_order', placeId, buildingKey, resourceId });
            await ctx.answerCallbackQuery();
            await ctx.reply(`Vendible ahora (mochila/pocket): ${sellableNow}\nEscribe: cantidad precio (ej: 12 200). /cancel para salir`);
            return true;
        }
        if (callbackData.startsWith('market_sell_info:')) {
            await ctx.answerCallbackQuery('Usa /c_ID para ver información del ítem.');
            return true;
        }
        if (callbackData.startsWith('market_sell_hint:')) {
            await ctx.answerCallbackQuery('Usa /v_ID para comenzar venta del ítem.');
            return true;
        }
        if (callbackData.startsWith('market_exchange:')) {
            const [placeIdRaw, buildingKey] = callbackData.replace('market_exchange:', '').split('|');
            const placeId = Number(placeIdRaw);
            if (!Number.isFinite(placeId) || !buildingKey)
                return true;
            await ctx.answerCallbackQuery();
            await openExchange(ctx, { mode: 'edit', placeId, buildingKey });
            return true;
        }
        if (callbackData.startsWith('market_fx_buy:')) {
            const [placeIdRaw, buildingKey] = callbackData.replace('market_fx_buy:', '').split('|');
            const placeId = Number(placeIdRaw);
            if (!Number.isFinite(placeId) || !buildingKey)
                return true;
            await setMarketState(ctx.callbackQuery.from.id, { phase: 'await_fx_buy', placeId, buildingKey });
            await ctx.answerCallbackQuery();
            await ctx.reply('Compra Oro -> escribe: oro precio (ej: 3 102). /cancel para salir');
            return true;
        }
        if (callbackData.startsWith('market_fx_sell:')) {
            const [placeIdRaw, buildingKey] = callbackData.replace('market_fx_sell:', '').split('|');
            const placeId = Number(placeIdRaw);
            if (!Number.isFinite(placeId) || !buildingKey)
                return true;
            await setMarketState(ctx.callbackQuery.from.id, { phase: 'await_fx_sell', placeId, buildingKey });
            await ctx.answerCallbackQuery();
            await ctx.reply('Vende Oro -> escribe: oro precio (ej: 2 101). /cancel para salir');
            return true;
        }
        if (callbackData.startsWith('market_recent:')) {
            const [placeIdRaw, buildingKey, pageRaw] = callbackData.replace('market_recent:', '').split('|');
            const placeId = Number(placeIdRaw);
            const page = Number(pageRaw || '1');
            if (!Number.isFinite(placeId) || !buildingKey || !Number.isFinite(page))
                return true;
            await ctx.answerCallbackQuery();
            await openRecentTrades(ctx, { mode: 'edit', placeId, buildingKey, page: Math.max(1, page) });
            return true;
        }
        if (callbackData.startsWith('market_orders:')) {
            const [placeIdRaw, buildingKey, pageRaw] = callbackData.replace('market_orders:', '').split('|');
            const placeId = Number(placeIdRaw);
            const page = Number(pageRaw || '1');
            if (!Number.isFinite(placeId) || !buildingKey || !Number.isFinite(page))
                return true;
            await ctx.answerCallbackQuery();
            await openMyOrders(ctx, { mode: 'edit', placeId, buildingKey, page: Math.max(1, page) });
            return true;
        }
        if (callbackData.startsWith('market_cancel_item:')) {
            const [placeIdRaw, buildingKey, orderIdRaw] = callbackData.replace('market_cancel_item:', '').split('|');
            const placeId = Number(placeIdRaw);
            const orderId = Number(orderIdRaw);
            const player = await getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
            if (!player || !Number.isFinite(placeId) || !buildingKey || !Number.isFinite(orderId))
                return true;
            const result = await cancelItemOrder(player.id, orderId);
            await ctx.answerCallbackQuery(result.success ? 'Orden cancelada' : 'No se pudo cancelar');
            await openMyOrders(ctx, {
                mode: 'edit',
                placeId,
                buildingKey,
                page: 1,
                infoLine: result.success ? `✅ ${result.message}` : `⚠️ ${result.message}`,
            });
            return true;
        }
        if (callbackData.startsWith('market_cancel_fx:')) {
            const [placeIdRaw, buildingKey, orderIdRaw] = callbackData.replace('market_cancel_fx:', '').split('|');
            const placeId = Number(placeIdRaw);
            const orderId = Number(orderIdRaw);
            const player = await getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
            if (!player || !Number.isFinite(placeId) || !buildingKey || !Number.isFinite(orderId))
                return true;
            const result = await cancelCurrencyOrder(player.id, orderId);
            await ctx.answerCallbackQuery(result.success ? 'Orden cancelada' : 'No se pudo cancelar');
            await openMyOrders(ctx, {
                mode: 'edit',
                placeId,
                buildingKey,
                page: 1,
                infoLine: result.success ? `✅ ${result.message}` : `⚠️ ${result.message}`,
            });
            return true;
        }
        return false;
    }
    async function handleMessage(ctx, text) {
        const trimmed = text.trim();
        const shortcutBuy = trimmed.match(/^\/c_(\d+)$/i);
        if (shortcutBuy) {
            const resourceId = Number.parseInt(shortcutBuy[1], 10);
            if (!Number.isFinite(resourceId) || resourceId < 1) {
                await ctx.reply('Comando inválido. Usa /c_ID');
                return true;
            }
            return openItemByShortcut(ctx, 'reply', resourceId);
        }
        const shortcutSell = trimmed.match(/^\/v_(\d+)$/i);
        if (shortcutSell) {
            const resourceId = Number.parseInt(shortcutSell[1], 10);
            const player = await getPlayerByTelegramId(String(ctx.from.id));
            if (!player) {
                await ctx.reply(t('es', 'errorNotRegistered'));
                return true;
            }
            const placeId = await resolveCurrentMarketPlaceId(player);
            if (!placeId) {
                await ctx.reply('Debes estar en el mercado para usar /v_ID.');
                return true;
            }
            const stock = await getResourceStockByContainer(player.id, resourceId);
            await setMarketState(ctx.from.id, {
                phase: 'await_item_sell_order',
                placeId,
                buildingKey: MARKET_BUILDING_KEY,
                resourceId,
            });
            await ctx.reply(`Ítem seleccionado: /v_${resourceId}\nVendible ahora (mochila/pocket): ${stock.bagQty}\nEscribe: cantidad precio (ej: 12 200). /cancel para salir`);
            return true;
        }
        const shortcutCancel = trimmed.match(/^\/x_(\d+)$/i);
        if (shortcutCancel) {
            const orderId = Number.parseInt(shortcutCancel[1], 10);
            const player = await getPlayerByTelegramId(String(ctx.from.id));
            if (!player) {
                await ctx.reply(t('es', 'errorNotRegistered'));
                return true;
            }
            const placeId = await resolveCurrentMarketPlaceId(player);
            if (!placeId) {
                await ctx.reply('Debes estar en el mercado para usar /x_ID.');
                return true;
            }
            const itemResult = await cancelItemOrder(player.id, orderId);
            let infoLine = itemResult.message;
            if (!itemResult.success) {
                const fxResult = await cancelCurrencyOrder(player.id, orderId);
                infoLine = fxResult.message;
            }
            await openMyOrders(ctx, {
                mode: 'reply',
                placeId,
                buildingKey: MARKET_BUILDING_KEY,
                page: 1,
                infoLine: `ℹ️ ${infoLine}`,
            });
            return true;
        }
        const state = await getMarketState(ctx.from.id);
        if (!state)
            return false;
        if (/^\/cancel(ar)?$/i.test(trimmed)) {
            await clearMarketState(ctx.from.id);
            await ctx.reply('Operación de mercado cancelada.');
            return true;
        }
        const context = await loadMarketContext(ctx, state.placeId);
        if (!context)
            return true;
        if (state.phase === 'await_item_buy_qty') {
            if (trimmed.startsWith('/')) {
                await ctx.reply('Escribe solo una cantidad. Ej: 5');
                return true;
            }
            const qty = Number.parseInt(trimmed, 10);
            if (!Number.isFinite(qty) || qty < 1) {
                await ctx.reply('Cantidad inválida.');
                return true;
            }
            const result = await buyItemAtBestAsks(context.player.id, state.resourceId, qty);
            await clearMarketState(ctx.from.id);
            await openItemBook(ctx, {
                mode: 'reply',
                placeId: state.placeId,
                buildingKey: state.buildingKey,
                resourceId: state.resourceId,
                infoLine: result.success ? `✅ ${result.message}` : `⚠️ ${result.message}`,
            });
            return true;
        }
        if (state.phase === 'await_item_sell_order') {
            if (trimmed.startsWith('/')) {
                await ctx.reply('Formato: cantidad precio. Ej: 12 200');
                return true;
            }
            const match = trimmed.match(/^(\d+)\s+(\d+)$/);
            if (!match) {
                await ctx.reply('Formato inválido. Usa: cantidad precio (ej: 12 200)');
                return true;
            }
            const qty = Number.parseInt(match[1], 10);
            const price = Number.parseInt(match[2], 10);
            const result = await createItemSellOrder(context.player.id, state.resourceId, qty, price);
            await clearMarketState(ctx.from.id);
            await openItemBook(ctx, {
                mode: 'reply',
                placeId: state.placeId,
                buildingKey: state.buildingKey,
                resourceId: state.resourceId,
                infoLine: result.success ? `✅ ${result.message}` : `⚠️ ${result.message}`,
            });
            return true;
        }
        if (state.phase === 'await_fx_buy' || state.phase === 'await_fx_sell') {
            if (trimmed.startsWith('/')) {
                await ctx.reply('Formato: oro precio. Ej: 3 102');
                return true;
            }
            const match = trimmed.match(/^(\d+)(?:\s+(\d+))?$/);
            if (!match) {
                await ctx.reply('Formato inválido. Usa: oro precio (ej: 3 102)');
                return true;
            }
            const goldAmount = Number.parseInt(match[1], 10);
            let price = match[2] ? Number.parseInt(match[2], 10) : NaN;
            if (!Number.isFinite(price)) {
                const snapshot = await getExchangeSnapshot();
                price =
                    state.phase === 'await_fx_buy'
                        ? snapshot.bestAskSilver || snapshot.lastPriceSilver
                        : snapshot.bestBidSilver || snapshot.lastPriceSilver;
            }
            const result = await placeCurrencyOrderAndMatch(context.player.id, state.phase === 'await_fx_buy' ? 'BUY_GOLD' : 'SELL_GOLD', goldAmount, price);
            await clearMarketState(ctx.from.id);
            await openExchange(ctx, {
                mode: 'reply',
                placeId: state.placeId,
                buildingKey: state.buildingKey,
                infoLine: result.success ? `✅ ${result.message}` : `⚠️ ${result.message}`,
            });
            return true;
        }
        return false;
    }
    return {
        openHub,
        handleCallback,
        handleMessage,
    };
}
//# sourceMappingURL=market-module.js.map