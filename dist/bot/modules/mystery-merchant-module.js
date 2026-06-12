// @ts-nocheck
import { getPlayerByTelegramId } from '../../lib/db.js';
import { getConversationState, setConversationState, clearConversationState } from '../../lib/conversation-state.js';
import { sendMapCardSafeViaContext } from '../../services/map-delivery.js';
import { renderMapCardText } from '../../services/map-message.js';
import { renderMap } from '../../services/map.js';
import { getMerchantSnapshotForPlayer } from '../../services/mystery-merchant.js';
import { buyFromMerchant, sellToMerchant } from '../../services/mystery-merchant-actions.js';
import { getPlayerLanguage, t3, getRefreshRemainingMs, lockRefresh, buildConfirmKeyboard, buildBuyQuantityKeyboard, renderMerchantMain, renderBuyMenu, renderSellMenu } from './mystery-merchant-module-content.js';
const SCOPE = 'merchant';
export function createMysteryMerchantModule() {
    async function getState(playerTgId) {
        return getConversationState(SCOPE, playerTgId);
    }
    async function setState(playerTgId, state) {
        await setConversationState(SCOPE, playerTgId, state, 30 * 60);
    }
    async function clearState(playerTgId) {
        await clearConversationState(SCOPE, playerTgId);
    }
    async function handleCallback(ctx, callbackData) {
        if (callbackData === 'inspect_merchant' || callbackData === 'merchant_open') {
            await ctx.answerCallbackQuery();
            await renderMerchantMain(ctx, 'edit');
            return true;
        }
        if (callbackData === 'merchant_back') {
            await ctx.answerCallbackQuery();
            await renderMerchantMain(ctx, 'edit');
            return true;
        }
        if (callbackData === 'merchant_refresh') {
            const remainingMs = getRefreshRemainingMs(ctx.from.id);
            if (remainingMs > 0) {
                const seconds = Math.max(1, Math.ceil(remainingMs / 1000));
                await ctx.answerCallbackQuery(`⏳ Espera ${seconds}s para actualizar.`);
                return true;
            }
            lockRefresh(ctx.from.id);
            await ctx.answerCallbackQuery();
            await renderMerchantMain(ctx, 'edit');
            return true;
        }
        if (callbackData === 'merchant_buy_menu') {
            await renderBuyMenu(ctx);
            return true;
        }
        if (callbackData === 'merchant_sell_menu') {
            await renderSellMenu(ctx);
            return true;
        }
        if (callbackData === 'merchant_exit_map') {
            const player = await getPlayerByTelegramId(String(ctx.from.id));
            const lang = getPlayerLanguage(player ?? undefined);
            await clearState(ctx.from.id);
            const mapResult = await renderMap(String(ctx.from.id));
            await ctx.answerCallbackQuery();
            if (!mapResult) {
                await ctx.editMessageText(t3(lang, 'No pude abrir el mapa.', 'Could not open map.', 'Ne udalos otkryt kartu.'));
                return true;
            }
            await sendMapCardSafeViaContext({
                ctx,
                mode: 'edit',
                text: renderMapCardText(mapResult, lang),
                keyboard: mapResult.keyboard,
                source: 'merchant:exit-to-map',
            });
            return true;
        }
        if (callbackData.startsWith('merchant_buy_pick:')) {
            const offerId = callbackData.replace('merchant_buy_pick:', '');
            const player = await getPlayerByTelegramId(String(ctx.from.id));
            if (!player) {
                await ctx.answerCallbackQuery('No registrado');
                return true;
            }
            const lang = getPlayerLanguage(player);
            const snapshot = await getMerchantSnapshotForPlayer(player.id);
            if (!snapshot) {
                await clearState(ctx.from.id);
                await ctx.answerCallbackQuery(t3(lang, 'Ya se fue.', 'He already left.', 'On uzhe ushel.'));
                await renderMerchantMain(ctx, 'edit');
                return true;
            }
            const offer = snapshot.offers.find((entry) => entry.id === offerId && entry.stock > 0);
            if (!offer) {
                await ctx.answerCallbackQuery(t3(lang, 'Oferta agotada.', 'Offer sold out.', 'Predlozhenie zakonchilos.'));
                await renderBuyMenu(ctx);
                return true;
            }
            if (offer.stock === 1) {
                await ctx.answerCallbackQuery();
                await ctx.editMessageText([
                    `🛒 ${offer.emoji} ${offer.name}`,
                    `Costo: ${offer.priceSilver} 🪙`,
                    t3(lang, 'Confirmar compra x1?', 'Confirm purchase x1?', 'Podtverdit pokupku x1?'),
                ].join('\n'), {
                    reply_markup: buildConfirmKeyboard('buy', offer.id, 1, lang),
                });
                return true;
            }
            await ctx.answerCallbackQuery();
            await ctx.editMessageText([
                `🛒 ${offer.emoji} ${offer.name}`,
                `Costo: ${offer.priceSilver} 🪙`,
                t3(lang, `Elige cantidad (1-${offer.stock})`, `Choose quantity (1-${offer.stock})`, `Vyberi kolichestvo (1-${offer.stock})`),
            ].join('\n'), {
                reply_markup: buildBuyQuantityKeyboard(offer.id, offer.stock, lang),
            });
            return true;
        }
        if (callbackData.startsWith('merchant_buy_qty:')) {
            const [, payload] = callbackData.split('merchant_buy_qty:');
            const [offerId, qtyRaw] = payload.split(':');
            const quantity = Number.parseInt(qtyRaw, 10);
            const player = await getPlayerByTelegramId(String(ctx.from.id));
            if (!player || !offerId || !Number.isFinite(quantity)) {
                await ctx.answerCallbackQuery('Invalido');
                return true;
            }
            const lang = getPlayerLanguage(player);
            const snapshot = await getMerchantSnapshotForPlayer(player.id);
            if (!snapshot) {
                await clearState(ctx.from.id);
                await ctx.answerCallbackQuery(t3(lang, 'Ya se fue.', 'He already left.', 'On uzhe ushel.'));
                await renderMerchantMain(ctx, 'edit');
                return true;
            }
            const offer = snapshot.offers.find((entry) => entry.id === offerId && entry.stock > 0);
            if (!offer) {
                await ctx.answerCallbackQuery(t3(lang, 'Oferta agotada.', 'Offer sold out.', 'Predlozhenie zakonchilos.'));
                await renderBuyMenu(ctx);
                return true;
            }
            if (quantity < 1 || quantity > offer.stock) {
                await ctx.answerCallbackQuery(t3(lang, 'Cantidad invalida.', 'Invalid quantity.', 'Nevernoe kolichestvo.'));
                await ctx.editMessageText([
                    `🛒 ${offer.emoji} ${offer.name}`,
                    `Costo: ${offer.priceSilver} 🪙`,
                    t3(lang, `Elige cantidad (1-${offer.stock})`, `Choose quantity (1-${offer.stock})`, `Vyberi kolichestvo (1-${offer.stock})`),
                ].join('\n'), {
                    reply_markup: buildBuyQuantityKeyboard(offer.id, offer.stock, lang),
                });
                return true;
            }
            await ctx.answerCallbackQuery();
            await ctx.editMessageText([
                `🛒 ${offer.emoji} ${offer.name}`,
                `Costo: ${offer.priceSilver} 🪙`,
                t3(lang, `Confirmar compra x${quantity}?`, `Confirm purchase x${quantity}?`, `Podtverdit pokupku x${quantity}?`),
            ].join('\n'), {
                reply_markup: buildConfirmKeyboard('buy', offer.id, quantity, lang),
            });
            return true;
        }
        if (callbackData.startsWith('merchant_sell_pick:')) {
            const slotUid = Number.parseInt(callbackData.replace('merchant_sell_pick:', ''), 10);
            const player = await getPlayerByTelegramId(String(ctx.from.id));
            if (!player || !Number.isFinite(slotUid)) {
                await ctx.answerCallbackQuery('Invalido');
                return true;
            }
            const lang = getPlayerLanguage(player);
            const snapshot = await getMerchantSnapshotForPlayer(player.id);
            if (!snapshot) {
                await clearState(ctx.from.id);
                await ctx.answerCallbackQuery(t3(lang, 'Ya se fue.', 'He already left.', 'On uzhe ushel.'));
                await renderMerchantMain(ctx, 'edit');
                return true;
            }
            const entries = await getMerchantSellEntries(player.id, snapshot.buybackMultiplier);
            const entry = entries.find((candidate) => candidate.slotUid === slotUid);
            if (!entry) {
                await ctx.answerCallbackQuery(t3(lang, 'Ese item ya no esta.', 'That item is gone.', 'Predmet uzhe propal.'));
                await renderSellMenu(ctx);
                return true;
            }
            if (entry.quantity === 1) {
                await ctx.answerCallbackQuery();
                await ctx.editMessageText([
                    `💰 ${entry.emoji} ${entry.name}`,
                    `Pago: +${entry.unitSilver} 🪙`,
                    t3(lang, 'Confirmar venta x1?', 'Confirm sale x1?', 'Podtverdit prodazhu x1?'),
                ].join('\n'), {
                    reply_markup: buildConfirmKeyboard('sell', String(entry.slotUid), 1, lang),
                });
                return true;
            }
            await setState(ctx.from.id, {
                phase: 'awaiting_sell_qty',
                stayToken: snapshot.stayToken,
                slotUid: entry.slotUid,
                maxQty: entry.quantity,
            });
            await ctx.answerCallbackQuery();
            await ctx.reply(t3(lang, `Cuantas unidades quieres vender? (1-${entry.quantity})`, `How many units do you want to sell? (1-${entry.quantity})`, `Skolko edinits prodat? (1-${entry.quantity})`));
            return true;
        }
        if (callbackData.startsWith('merchant_buy_confirm:')) {
            const [, payload] = callbackData.split('merchant_buy_confirm:');
            const [offerId, qtyRaw] = payload.split(':');
            const quantity = Number.parseInt(qtyRaw, 10);
            const player = await getPlayerByTelegramId(String(ctx.from.id));
            if (!player || !offerId || !Number.isFinite(quantity)) {
                await ctx.answerCallbackQuery('Invalido');
                return true;
            }
            const lang = getPlayerLanguage(player);
            const snapshot = await getMerchantSnapshotForPlayer(player.id);
            if (!snapshot) {
                await clearState(ctx.from.id);
                await ctx.answerCallbackQuery(t3(lang, 'Ya se fue.', 'He already left.', 'On uzhe ushel.'));
                await renderMerchantMain(ctx, 'edit');
                return true;
            }
            const result = await buyFromMerchant({
                playerId: player.id,
                stayToken: snapshot.stayToken,
                offerId,
                quantity,
            });
            await ctx.answerCallbackQuery();
            await renderMerchantMain(ctx, 'edit', result.message);
            return true;
        }
        if (callbackData.startsWith('merchant_sell_confirm:')) {
            const [, payload] = callbackData.split('merchant_sell_confirm:');
            const [slotUidRaw, qtyRaw] = payload.split(':');
            const slotUid = Number.parseInt(slotUidRaw, 10);
            const quantity = Number.parseInt(qtyRaw, 10);
            const player = await getPlayerByTelegramId(String(ctx.from.id));
            if (!player || !Number.isFinite(slotUid) || !Number.isFinite(quantity)) {
                await ctx.answerCallbackQuery('Invalido');
                return true;
            }
            const lang = getPlayerLanguage(player);
            const snapshot = await getMerchantSnapshotForPlayer(player.id);
            if (!snapshot) {
                await clearState(ctx.from.id);
                await ctx.answerCallbackQuery(t3(lang, 'Ya se fue.', 'He already left.', 'On uzhe ushel.'));
                await renderMerchantMain(ctx, 'edit');
                return true;
            }
            const result = await sellToMerchant({
                playerId: player.id,
                stayToken: snapshot.stayToken,
                slotUid,
                quantity,
            });
            await ctx.answerCallbackQuery();
            await renderMerchantMain(ctx, 'edit', result.message);
            return true;
        }
        return false;
    }
    async function handleMessage(ctx, text) {
        const state = await getState(ctx.from.id);
        if (!state) {
            return false;
        }
        const player = await getPlayerByTelegramId(String(ctx.from.id));
        const lang = getPlayerLanguage(player ?? undefined);
        if (!player) {
            await clearState(ctx.from.id);
            return false;
        }
        const trimmed = text.trim();
        if (trimmed.startsWith('/') && !/^\/merchant(?:@.+)?$/i.test(trimmed)) {
            await clearState(ctx.from.id);
            return false;
        }
        if (state.phase === 'awaiting_buy_qty') {
            const quantity = Number.parseInt(trimmed, 10);
            if (!Number.isFinite(quantity) || quantity < 1 || quantity > state.maxQty) {
                await ctx.reply(t3(lang, `Cantidad invalida. Elige entre 1 y ${state.maxQty}.`, `Invalid quantity. Choose between 1 and ${state.maxQty}.`, `Nevernoe kolichestvo. Vyberi ot 1 do ${state.maxQty}.`));
                return true;
            }
            await setState(ctx.from.id, { phase: 'main', stayToken: state.stayToken });
            await ctx.reply(t3(lang, 'Confirma la compra:', 'Confirm purchase:', 'Podtverdi pokupku:'), { reply_markup: buildConfirmKeyboard('buy', state.offerId, quantity, lang) });
            return true;
        }
        if (state.phase === 'awaiting_sell_qty') {
            const quantity = Number.parseInt(trimmed, 10);
            if (!Number.isFinite(quantity) || quantity < 1 || quantity > state.maxQty) {
                await ctx.reply(t3(lang, `Cantidad invalida. Elige entre 1 y ${state.maxQty}.`, `Invalid quantity. Choose between 1 and ${state.maxQty}.`, `Nevernoe kolichestvo. Vyberi ot 1 do ${state.maxQty}.`));
                return true;
            }
            await setState(ctx.from.id, { phase: 'main', stayToken: state.stayToken });
            await ctx.reply(t3(lang, 'Confirma la venta:', 'Confirm sale:', 'Podtverdi prodazhu:'), { reply_markup: buildConfirmKeyboard('sell', String(state.slotUid), quantity, lang) });
            return true;
        }
        return false;
    }
    async function openByCommand(ctx) {
        await renderMerchantMain(ctx, 'reply');
    }
    return {
        handleCallback,
        handleMessage,
        openByCommand,
    };
}
//# sourceMappingURL=mystery-merchant-module.js.map