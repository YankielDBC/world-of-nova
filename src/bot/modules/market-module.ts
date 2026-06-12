// @ts-nocheck
import { InlineKeyboard } from 'grammy';
import { getPlayerByTelegramId } from '../../lib/db.js';
import { t } from '../../lib/i18n.js';
import { clearConversationState, getConversationState, setConversationState } from '../../lib/conversation-state.js';
import { EMOJIS } from '../../data/emojis.js';
import { buyItemAtBestAsks, cancelCurrencyOrder, cancelItemOrder, createItemSellOrder, ensureNovaMarketEnabled, formatMarketTimeAgo, getExchangeSnapshot, getItemHoldingsForPlayer, getItemMarketInsight, getItemOrderBook, getMarketHubSummary, getRecentFxTrades, getRecentItemTrades, getResourceStockByContainer, listListedMarketItems, listPlayerCurrencyOrders, listPlayerItemOrders, placeCurrencyOrderAndMatch, } from '../../services/market-exchange.js';
import { MARKET_BUILDING_KEY, MARKET_SCOPE, PAGE_SIZE, buildExchangeKeyboard, buildHubKeyboard, buildItemBookKeyboard, buildItemsKeyboard, buildPagedKeyboard, formatInt, formatPct, formatShortNumber, getPlayerLanguage, isMessageNotModifiedError, isPlayerAtPlaceById, resolveCurrentMarketPlaceId, shortLabel, } from './market-module-helpers.js';
export function createMarketModule() {
    async function getMarketState(playerTgId) {
        return getConversationState(MARKET_SCOPE, playerTgId);
    }
    async function setMarketState(playerTgId, state) {
        await setConversationState(MARKET_SCOPE, playerTgId, state, 30 * 60);
    }
    async function clearMarketState(playerTgId) {
        await clearConversationState(MARKET_SCOPE, playerTgId);
    }
    async function loadMarketContext(ctx, placeId) {
        const player = await getPlayerByTelegramId(String(ctx.from.id));
        if (!player) {
            await ctx.reply(t('es', 'errorNotRegistered'));
            return null;
        }
        const lang = getPlayerLanguage(player);
        if (!(await isPlayerAtPlaceById(player, placeId))) {
            await clearMarketState(ctx.from.id);
            await ctx.reply(t(lang, 'placeNotAt'));
            return null;
        }
        return { player, lang };
    }
    async function sendScreen(ctx, mode, message, keyboard) {
        if (mode === 'edit' && typeof ctx.editMessageText === 'function') {
            try {
                await ctx.editMessageText(message, { reply_markup: keyboard });
            }
            catch (error) {
                if (isMessageNotModifiedError(error)) {
                    return;
                }
                throw error;
            }
            return;
        }
        await ctx.reply(message, { reply_markup: keyboard });
    }
    async function openHub(ctx, params) {
        const context = await loadMarketContext(ctx, params.placeId);
        if (!context)
            return;
        await ensureNovaMarketEnabled();
        await clearMarketState(ctx.from.id);
        const summary = await getMarketHubSummary();
        const lines = [
            '🏛️ Centro de Comercio',
            '✧═══••═══✧',
            '💡 Mercado comunitario por oferta y demanda.',
            '',
            '🔥 Ítems calientes (24H)',
            '┌────────┐',
        ];
        if (summary.hotItems.length === 0) {
            lines.push('└ Sin actividad aún.');
        }
        else {
            summary.hotItems.forEach((item, index) => {
                const marker = index === summary.hotItems.length - 1 ? '└' : '├';
                lines.push(`${marker} ${item.emoji} ${shortLabel(item.name, 14)} · ${formatShortNumber(item.soldQty24h)} uds · ${formatShortNumber(item.capitalSilver24h)}${EMOJIS.ui.silver}`);
            });
        }
        lines.push('');
        lines.push(`${EMOJIS.ui.stats} Mercado 24H`);
        lines.push(`├💱 Vol FX: ${EMOJIS.ui.gold} ${formatShortNumber(summary.fxGoldVolume24h)} | ${EMOJIS.ui.silver} ${formatShortNumber(summary.fxSilverVolume24h)}`);
        lines.push(`├${EMOJIS.ui.silver} 1 Oro: ${summary.goldPriceSilver.toFixed(2)} plata`);
        lines.push(`├📦 Ofertas activas: ${formatShortNumber(summary.activeItemSellOffers)}`);
        lines.push(`├👥 Traders únicos: ${formatShortNumber(summary.uniqueUsers24h)}`);
        lines.push(`└📉 Tendencia: ${summary.trendLabel}`);
        if (params.infoLine) {
            lines.push('');
            lines.push(params.infoLine);
        }
        await sendScreen(ctx, params.mode, lines.join('\n'), buildHubKeyboard(params.placeId, params.buildingKey));
    }
    async function openItemsDirectory(ctx, params) {
        const context = await loadMarketContext(ctx, params.placeId);
        if (!context)
            return;
        await clearMarketState(ctx.from.id);
        const summary = await getMarketHubSummary();
        const lines = ['📦 Mercado de Items', '✧═══••═══✧', '', `${EMOJIS.ui.stats}Populares 24H`, '┌────────┐'];
        if (summary.hotItems.length === 0) {
            lines.push('└ Sin variación por ahora.');
        }
        else {
            summary.hotItems.slice(0, 5).forEach((item, index, arr) => {
                const marker = index === arr.length - 1 ? '└' : '├';
                const isUp = item.changePct24h >= 0;
                lines.push(`${marker} ${item.emoji} ${shortLabel(item.name, 12)} ${isUp ? EMOJIS.ui.level : '📉'} ${formatPct(item.changePct24h)} ${isUp ? '⤴️' : '⤵️'}`);
            });
        }
        lines.push('');
        lines.push(`${EMOJIS.ui.stats} Volumen 24H`);
        lines.push('┌────────┐');
        lines.push(`├🕴️Usuarios: ${formatInt(summary.uniqueUsers24h)}`);
        lines.push(`├📦 Items: ${formatInt(summary.itemVolume24h)}`);
        lines.push(`└${EMOJIS.ui.silver} Capital: ${formatInt(summary.itemCapital24h)}`);
        if (params.infoLine) {
            lines.push('');
            lines.push(params.infoLine);
        }
        await sendScreen(ctx, params.mode, lines.join('\n'), buildItemsKeyboard(params.placeId, params.buildingKey));
    }
    async function openBuyDirectory(ctx, params) {
        const context = await loadMarketContext(ctx, params.placeId);
        if (!context)
            return;
        await clearMarketState(ctx.from.id);
        const listed = await listListedMarketItems({ page: params.page, pageSize: PAGE_SIZE });
        const lines = ['🛒 Comprar Items', '✧═══••═══✧', 'Ítems listados ahora (10 por página):', '┌────────┐'];
        if (listed.items.length === 0) {
            lines.push('└ No hay ofertas activas.');
        }
        else {
            listed.items.forEach((item, index) => {
                const marker = index === listed.items.length - 1 ? '└' : '├';
                const listIndex = `${index + 1}`.padStart(2, '0');
                lines.push(`${marker} #${listIndex} ${item.resourceEmoji} ${shortLabel(item.resourceName, 12)} x${formatShortNumber(item.totalQty)} desde ${item.bestPriceSilver}${EMOJIS.ui.silver} /c_${item.resourceId}`);
            });
            lines.push('');
            lines.push('💡 Usa /c_ID para ver info y comprar.');
        }
        if (params.infoLine) {
            lines.push('');
            lines.push(params.infoLine);
        }
        const keyboard = buildPagedKeyboard({
            placeId: params.placeId,
            buildingKey: params.buildingKey,
            baseKey: 'market_buy_menu',
            page: listed.page,
            hasMore: listed.hasMore,
            backKey: `market_items:${params.placeId}|${params.buildingKey}`,
            includeHub: true,
        });
        if (listed.items.length > 0 && listed.items.length <= 6) {
            const picker = new InlineKeyboard();
            listed.items.forEach((item, index) => {
                picker.text(`${item.resourceEmoji} ${shortLabel(item.resourceName, 10)}`, `market_buy_pick:${params.placeId}|${params.buildingKey}|${item.resourceId}`);
                if ((index + 1) % 2 === 0 && index < listed.items.length - 1)
                    picker.row();
            });
            picker.row();
            for (const row of keyboard.inline_keyboard) {
                picker.inline_keyboard.push(row);
            }
            await sendScreen(ctx, params.mode, lines.join('\n'), picker);
            return;
        }
        await sendScreen(ctx, params.mode, lines.join('\n'), keyboard);
    }
    async function openSellDirectory(ctx, params) {
        const context = await loadMarketContext(ctx, params.placeId);
        if (!context)
            return;
        await clearMarketState(ctx.from.id);
        const holdings = await getItemHoldingsForPlayer(context.player.id);
        const offset = (params.page - 1) * PAGE_SIZE;
        const pageItems = holdings.slice(offset, offset + PAGE_SIZE);
        const hasMore = holdings.length > offset + PAGE_SIZE;
        const lines = ['📥 Vender Items', '✧═══••═══✧', 'Tus vendibles (mochila/pocket):', '┌────────┐'];
        if (pageItems.length === 0) {
            lines.push('└ No tienes ítems vendibles.');
        }
        else {
            pageItems.forEach((item, index) => {
                const marker = index === pageItems.length - 1 ? '└' : '├';
                const listIndex = `${index + 1}`.padStart(2, '0');
                lines.push(`${marker} #${listIndex} ${item.emoji} ${shortLabel(item.name, 12)} x${item.quantity} /v_${item.resourceId}`);
            });
            lines.push('');
            lines.push('💡 /v_ID para vender | /c_ID para info/comprar');
        }
        if (params.infoLine) {
            lines.push('');
            lines.push(params.infoLine);
        }
        const keyboard = buildPagedKeyboard({
            placeId: params.placeId,
            buildingKey: params.buildingKey,
            baseKey: 'market_sell_menu',
            page: params.page,
            hasMore,
            backKey: `market_items:${params.placeId}|${params.buildingKey}`,
            includeHub: true,
        })
            .row()
            .text('ℹ️ Información', `market_sell_info:${params.placeId}|${params.buildingKey}`)
            .text('📥 Vender', `market_sell_hint:${params.placeId}|${params.buildingKey}`)
            .row()
            .text('🛒 Comprar', `market_buy_menu:${params.placeId}|${params.buildingKey}|1`)
            .text('🕒 Recientes', `market_recent:${params.placeId}|${params.buildingKey}|1`)
            .row()
            .text('🧾 Mis órdenes', `market_orders:${params.placeId}|${params.buildingKey}|1`);
        await sendScreen(ctx, params.mode, lines.join('\n'), keyboard);
    }
    async function openItemBook(ctx, params) {
        const context = await loadMarketContext(ctx, params.placeId);
        if (!context)
            return;
        await clearMarketState(ctx.from.id);
        const [book, stock, insight] = await Promise.all([
            getItemOrderBook(params.resourceId, context.player.id),
            getResourceStockByContainer(context.player.id, params.resourceId),
            getItemMarketInsight(params.resourceId),
        ]);
        if (!book) {
            await openItemsDirectory(ctx, {
                mode: params.mode,
                placeId: params.placeId,
                buildingKey: params.buildingKey,
                infoLine: 'Ese ítem no existe.',
            });
            return;
        }
        const range = book.rangeMinSilver == null ? 'Sin ofertas' : `${book.rangeMinSilver} - ${book.rangeMaxSilver} ${EMOJIS.ui.silver}`;
        const lines = [
            `${book.resourceEmoji} Mercado: ${book.resourceName}`,
            '✧═══••═══✧',
            `Rango (10 más baratas): ${range}`,
            `Último trade: ${book.lastTradeSilver ?? '-'}${EMOJIS.ui.silver}`,
            `Stock: ${EMOJIS.ui.bag} ${stock.bagQty} | 🏦 ${stock.vaultQty} | Σ ${stock.totalQty}`,
            `Promedio 24H: ${insight.avgPrice24h ?? '-'}${EMOJIS.ui.silver}`,
            `Cambio 24H: ${insight.changePct24h >= 0 ? EMOJIS.ui.level : '📉'} ${formatPct(insight.changePct24h)}`,
            `Top ventas 24H: ${formatShortNumber(insight.soldQty24h)} uds | ${formatShortNumber(insight.capitalSilver24h)}${EMOJIS.ui.silver}`,
            `Supply total: ${formatInt(insight.supplyTotal)}`,
            '',
            'Top ofertas (venta):',
        ];
        if (book.topAsks.length === 0) {
            lines.push('└ No hay ofertas activas.');
        }
        else {
            book.topAsks.slice(0, 10).forEach((level, index) => {
                const marker = index === Math.min(book.topAsks.length, 10) - 1 ? '└' : '├';
                lines.push(`${marker} ${level.priceSilver}${EMOJIS.ui.silver} (${level.quantity} uds)`);
            });
        }
        if (book.playerOrders.length > 0) {
            lines.push('');
            lines.push('📌 Tus órdenes en este ítem:');
            book.playerOrders.forEach((order, index) => {
                const marker = index === book.playerOrders.length - 1 ? '└' : '├';
                lines.push(`${marker} #${order.orderId} ${order.priceSilver}${EMOJIS.ui.silver} (${order.quantityRemaining}/${order.quantityTotal})`);
            });
        }
        if (params.infoLine) {
            lines.push('');
            lines.push(params.infoLine);
        }
        await sendScreen(ctx, params.mode, lines.join('\n'), buildItemBookKeyboard(params.placeId, params.buildingKey, params.resourceId));
    }
    async function openExchange(ctx, params) {
        const context = await loadMarketContext(ctx, params.placeId);
        if (!context)
            return;
        await clearMarketState(ctx.from.id);
        const snapshot = await getExchangeSnapshot();
        const lines = [
            '💱 Exchange Oro/Plata',
            '✧═══••═══✧',
            `Par: ORO/PLATA`,
            `Precio actual: ${snapshot.lastPriceSilver.toFixed(2)}${EMOJIS.ui.silver}`,
            `Cambio 24h: ${snapshot.change24hPct >= 0 ? EMOJIS.ui.level : '📉'} ${snapshot.change24hPct.toFixed(2)}%`,
            '',
            `🟢 Comprar Oro: ${snapshot.bestAskSilver ?? '-'}${EMOJIS.ui.silver}`,
            `🔴 Vender Oro: ${snapshot.bestBidSilver ?? '-'}${EMOJIS.ui.silver}`,
        ];
        if (params.infoLine) {
            lines.push('');
            lines.push(params.infoLine);
        }
        await sendScreen(ctx, params.mode, lines.join('\n'), buildExchangeKeyboard(params.placeId, params.buildingKey));
    }
    async function openRecentTrades(ctx, params) {
        const context = await loadMarketContext(ctx, params.placeId);
        if (!context)
            return;
        await clearMarketState(ctx.from.id);
        const offset = (params.page - 1) * PAGE_SIZE;
        const [itemTradesRaw, fxTradesRaw] = await Promise.all([
            getRecentItemTrades(PAGE_SIZE + 1, offset),
            getRecentFxTrades(PAGE_SIZE + 1, offset),
        ]);
        const hasMore = itemTradesRaw.length > PAGE_SIZE || fxTradesRaw.length > PAGE_SIZE;
        const itemTrades = itemTradesRaw.slice(0, PAGE_SIZE);
        const fxTrades = fxTradesRaw.slice(0, PAGE_SIZE);
        const lines = ['🕒 Recientes', '✧═══••═══✧', 'Items'];
        if (itemTrades.length === 0) {
            lines.push('└ Sin operaciones recientes.');
        }
        else {
            itemTrades.forEach((trade, index) => {
                const marker = index === itemTrades.length - 1 ? '└' : '├';
                lines.push(`${marker} ${trade.resourceEmoji} ${shortLabel(trade.resourceName, 12)} x${trade.quantity} @${trade.priceSilver}${EMOJIS.ui.silver} (${formatMarketTimeAgo(trade.createdAt)})`);
            });
        }
        lines.push('');
        lines.push('Divisas');
        if (fxTrades.length === 0) {
            lines.push('└ Sin operaciones recientes.');
        }
        else {
            fxTrades.forEach((trade, index) => {
                const marker = index === fxTrades.length - 1 ? '└' : '├';
                lines.push(`${marker} ${trade.goldAmount}${EMOJIS.ui.gold} @${trade.priceSilverPerGold}${EMOJIS.ui.silver} (${formatMarketTimeAgo(trade.createdAt)})`);
            });
        }
        const keyboard = buildPagedKeyboard({
            placeId: params.placeId,
            buildingKey: params.buildingKey,
            baseKey: 'market_recent',
            page: params.page,
            hasMore,
            backKey: `market_items:${params.placeId}|${params.buildingKey}`,
            includeHub: true,
        });
        await sendScreen(ctx, params.mode, lines.join('\n'), keyboard);
    }
    async function openMyOrders(ctx, params) {
        const context = await loadMarketContext(ctx, params.placeId);
        if (!context)
            return;
        await clearMarketState(ctx.from.id);
        const offset = (params.page - 1) * PAGE_SIZE;
        const [itemOrdersRaw, fxOrdersRaw] = await Promise.all([
            listPlayerItemOrders(context.player.id, PAGE_SIZE + 1, offset),
            listPlayerCurrencyOrders(context.player.id, PAGE_SIZE + 1, offset),
        ]);
        const hasMore = itemOrdersRaw.length > PAGE_SIZE || fxOrdersRaw.length > PAGE_SIZE;
        const itemOrders = itemOrdersRaw.slice(0, PAGE_SIZE);
        const fxOrders = fxOrdersRaw.slice(0, PAGE_SIZE);
        const lines = ['🧾 Mis Órdenes', '✧═══••═══✧', 'Items'];
        if (itemOrders.length === 0) {
            lines.push('└ Sin órdenes abiertas.');
        }
        else {
            itemOrders.forEach((order, index) => {
                const marker = index === itemOrders.length - 1 ? '└' : '├';
                lines.push(`${marker} #${order.orderId} ${order.resourceEmoji} ${shortLabel(order.resourceName, 12)} ${order.quantityRemaining}/${order.quantityTotal} @${order.priceSilver}${EMOJIS.ui.silver} /x_${order.orderId}`);
            });
        }
        lines.push('');
        lines.push('Divisas');
        if (fxOrders.length === 0) {
            lines.push('└ Sin órdenes abiertas.');
        }
        else {
            fxOrders.forEach((order, index) => {
                const marker = index === fxOrders.length - 1 ? '└' : '├';
                lines.push(`${marker} #${order.orderId} ${order.side === 'BUY_GOLD' ? 'BUY' : 'SELL'} ${order.goldRemaining}/${order.goldTotal}${EMOJIS.ui.gold} @${order.priceSilverPerGold}${EMOJIS.ui.silver} /x_${order.orderId}`);
            });
        }
        if (params.infoLine) {
            lines.push('');
            lines.push(params.infoLine);
        }
        const keyboard = buildPagedKeyboard({
            placeId: params.placeId,
            buildingKey: params.buildingKey,
            baseKey: 'market_orders',
            page: params.page,
            hasMore,
            backKey: `market_items:${params.placeId}|${params.buildingKey}`,
            includeHub: true,
        });
        await sendScreen(ctx, params.mode, lines.join('\n'), keyboard);
    }
    async function openItemByShortcut(ctx, mode, resourceId) {
        const player = await getPlayerByTelegramId(String(ctx.from.id));
        if (!player) {
            await ctx.reply(t('es', 'errorNotRegistered'));
            return true;
        }
        const placeId = await resolveCurrentMarketPlaceId(player);
        if (!placeId) {
            await ctx.reply('Debes estar en el mercado para usar este comando.');
            return true;
        }
        await openItemBook(ctx, {
            mode,
            placeId,
            buildingKey: MARKET_BUILDING_KEY,
            resourceId,
        });
        return true;
    }
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
