// @ts-nocheck
import { InlineKeyboard } from 'grammy';
import { getPlayerByTelegramId } from '../../lib/db.js';
import { compactLabel } from '../../lib/ui-compact.js';
import { clearConversationState, setConversationState } from '../../lib/conversation-state.js';
import { getMerchantIntroText, getMerchantSnapshotForPlayer, registerMerchantWitness } from '../../services/mystery-merchant.js';
import { getMerchantSellEntries } from '../../services/mystery-merchant-actions.js';

const SCOPE = 'merchant';
const MERCHANT_REFRESH_COOLDOWN_MS = 10_000;
const merchantRefreshLocks = new Map();

async function setState(playerTgId, state) {
    await setConversationState(SCOPE, playerTgId, state, 30 * 60);
}
async function clearState(playerTgId) {
    await clearConversationState(SCOPE, playerTgId);
}

function getPlayerLanguage(player) {
    return player?.language ?? 'es';
}
function t3(lang, es, en, ru) {
    if (lang === 'en')
        return en;
    if (lang === 'ru')
        return ru;
    return es;
}
function formatDurationToLeave(departsAt) {
    const remaining = Math.max(0, Math.ceil((departsAt.getTime() - Date.now()) / 1000));
    if (remaining < 60) {
        return `${remaining}s`;
    }
    const mins = Math.ceil(remaining / 60);
    return `${mins}m`;
}
function getOfferLine(offer, index) {
    const marker = index === 0 ? '┌' : '├';
    return `${marker} #${String(index + 1).padStart(2, '0')} ${offer.emoji} ${compactLabel(offer.name, 17)} x${offer.stock} · ${offer.priceSilver}🪙`;
}
function getSellLine(entry, index) {
    const marker = index === 0 ? '┌' : '├';
    const qty = entry.quantity > 1 ? ` x${entry.quantity}` : '';
    return `${marker} #${String(index + 1).padStart(2, '0')} ${entry.emoji} ${compactLabel(entry.name, 16)}${qty} · +${entry.totalSilver}🪙`;
}
function buildMainKeyboard(lang) {
    return new InlineKeyboard()
        .text(`🛒 ${t3(lang, 'Comprar', 'Buy', 'Kupit')}`, 'merchant_buy_menu')
        .text(`💰 ${t3(lang, 'Vender', 'Sell', 'Prodat')}`, 'merchant_sell_menu')
        .row()
        .text(`🗺 ${t3(lang, 'Mapa', 'Map', 'Karta')}`, 'merchant_exit_map')
        .text(`🔄 ${t3(lang, 'Actualizar', 'Refresh', 'Obnovit')}`, 'merchant_refresh');
}
function buildBackKeyboard(lang) {
    return new InlineKeyboard().text(`↩ ${t3(lang, 'Volver', 'Back', 'Nazad')}`, 'merchant_back');
}
function buildConfirmKeyboard(kind, payload, qty, lang) {
    return new InlineKeyboard()
        .text(`✅ ${t3(lang, 'Confirmar', 'Confirm', 'Podtverdit')}`, `merchant_${kind}_confirm:${payload}:${qty}`)
        .text(`❌ ${t3(lang, 'Cancelar', 'Cancel', 'Otmena')}`, 'merchant_back');
}
function buildBuyQuantityKeyboard(offerId, maxQty, lang) {
    const keyboard = new InlineKeyboard();
    const limit = Math.max(1, Math.min(maxQty, 12));
    for (let qty = 1; qty <= limit; qty += 1) {
        keyboard.text(String(qty), `merchant_buy_qty:${offerId}:${qty}`);
        if (qty % 4 === 0) {
            keyboard.row();
        }
    }
    keyboard.row().text(`↩ ${t3(lang, 'Volver', 'Back', 'Nazad')}`, 'merchant_buy_menu');
    return keyboard;
}
function getRefreshRemainingMs(playerTgId) {
    const now = Date.now();
    const lockedUntil = merchantRefreshLocks.get(playerTgId) ?? 0;
    if (lockedUntil <= now) {
        merchantRefreshLocks.delete(playerTgId);
        return 0;
    }
    return lockedUntil - now;
}
function lockRefresh(playerTgId) {
    merchantRefreshLocks.set(playerTgId, Date.now() + MERCHANT_REFRESH_COOLDOWN_MS);
}
async function renderMerchantMain(ctx, mode, infoLine) {
    const player = await getPlayerByTelegramId(String(ctx.from.id));
    if (!player) {
        if (mode === 'edit' && typeof ctx.editMessageText === 'function') {
            await ctx.editMessageText('❌ No estas registrado. Usa /start');
        }
        else {
            await ctx.reply('❌ No estas registrado. Usa /start');
        }
        return;
    }
    const lang = getPlayerLanguage(player);
    const snapshot = await getMerchantSnapshotForPlayer(player.id);
    if (!snapshot) {
        await clearState(ctx.from.id);
        const text = t3(lang, 'No ves rastro del Comerciante Misterioso aqui.', 'You cannot find the Mysterious Merchant here.', 'Zdes net sledov Tainstvennogo Torgovtsa.');
        if (mode === 'edit' && typeof ctx.editMessageText === 'function') {
            await ctx.editMessageText(text);
        }
        else {
            await ctx.reply(text);
        }
        return;
    }
    await registerMerchantWitness(player.id, snapshot.stayToken);
    await setState(ctx.from.id, { phase: 'main', stayToken: snapshot.stayToken });
    const offers = snapshot.offers.filter((offer) => offer.stock > 0).slice(0, 6);
    const lines = [
        '🕵️ Comerciante Misterioso',
        '✧═══••═══✧',
        getMerchantIntroText(lang, snapshot.buybackMultiplier),
        '',
        `⏱ ${t3(lang, 'Se quedara aprox:', 'Stays for:', 'Ostanetsya primerno:')} ${formatDurationToLeave(snapshot.departsAt)}`,
        `💸 ${t3(lang, 'Compra a', 'Buys at', 'Pokupaet po')} x${snapshot.buybackMultiplier}`,
        '',
        `📄 ${t3(lang, 'Ofertas', 'Offers', 'Predlozheniya')}`,
        '┌────────┐',
    ];
    if (offers.length === 0) {
        lines.push(`└ ${t3(lang, 'Sin stock por ahora', 'No stock right now', 'Seichas net tovara')}`);
    }
    else {
        offers.forEach((offer, index) => {
            lines.push(getOfferLine(offer, index));
        });
    }
    if (infoLine) {
        lines.push('');
        lines.push(infoLine);
    }
    const payload = { reply_markup: buildMainKeyboard(lang) };
    if (mode === 'edit' && typeof ctx.editMessageText === 'function') {
        await ctx.editMessageText(lines.join('\n'), payload);
    }
    else {
        await ctx.reply(lines.join('\n'), payload);
    }
}
async function renderBuyMenu(ctx) {
    const player = await getPlayerByTelegramId(String(ctx.from.id));
    if (!player) {
        await ctx.answerCallbackQuery('No registrado');
        return;
    }
    const lang = getPlayerLanguage(player);
    const snapshot = await getMerchantSnapshotForPlayer(player.id);
    if (!snapshot) {
        await clearState(ctx.from.id);
        await ctx.answerCallbackQuery(t3(lang, 'Ya se fue.', 'He already left.', 'On uzhe ushel.'));
        await renderMerchantMain(ctx, 'edit');
        return;
    }
    await registerMerchantWitness(player.id, snapshot.stayToken);
    await setState(ctx.from.id, { phase: 'main', stayToken: snapshot.stayToken });
    const offers = snapshot.offers.filter((offer) => offer.stock > 0);
    const lines = [
        `🛒 ${t3(lang, 'Comprar al Mercader', 'Buy from Merchant', 'Kupit u torgovtsa')}`,
        '✧═══••═══✧',
        '┌────────┐',
    ];
    const keyboard = new InlineKeyboard();
    offers.forEach((offer, index) => {
        lines.push(getOfferLine(offer, index));
        keyboard.text(`#${String(index + 1).padStart(2, '0')}`, `merchant_buy_pick:${offer.id}`);
        if ((index + 1) % 4 === 0) {
            keyboard.row();
        }
    });
    keyboard.row().text(`↩ ${t3(lang, 'Volver', 'Back', 'Nazad')}`, 'merchant_back');
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(lines.join('\n'), {
        reply_markup: keyboard,
    });
}
async function renderSellMenu(ctx) {
    const player = await getPlayerByTelegramId(String(ctx.from.id));
    if (!player) {
        await ctx.answerCallbackQuery('No registrado');
        return;
    }
    const lang = getPlayerLanguage(player);
    const snapshot = await getMerchantSnapshotForPlayer(player.id);
    if (!snapshot) {
        await clearState(ctx.from.id);
        await ctx.answerCallbackQuery(t3(lang, 'Ya se fue.', 'He already left.', 'On uzhe ushel.'));
        await renderMerchantMain(ctx, 'edit');
        return;
    }
    await registerMerchantWitness(player.id, snapshot.stayToken);
    await setState(ctx.from.id, { phase: 'main', stayToken: snapshot.stayToken });
    const entries = await getMerchantSellEntries(player.id, snapshot.buybackMultiplier);
    if (entries.length === 0) {
        await ctx.answerCallbackQuery();
        await ctx.editMessageText([
            `💰 ${t3(lang, 'Venta al Mercader', 'Sell to Merchant', 'Prodazha torgovtsu')}`,
            '✧═══••═══✧',
            t3(lang, 'No tienes articulos vendibles en la mochila activa.', 'You have no sellable items in the active bag.', 'V aktivnoi sumke net predmetov dlya prodazhi.'),
        ].join('\n'), { reply_markup: buildBackKeyboard(lang) });
        return;
    }
    const lines = [
        `💰 ${t3(lang, 'Venta al Mercader', 'Sell to Merchant', 'Prodazha torgovtsu')}`,
        '✧═══••═══✧',
        t3(lang, '🤨 "Mmm... no tienes mucho que me interese ahora mismo, pero te compro estos objetos:"', '🤨 "Hmm... not much catches my eye right now, but I can buy these from you:"', '🤨 "Khm... seichas malo chto menya interesuet, no vot eto ya kuplyu:"'),
        '',
        '┌────────┐',
    ];
    const keyboard = new InlineKeyboard();
    entries.slice(0, 12).forEach((entry, index) => {
        lines.push(getSellLine(entry, index));
        keyboard.text(`#${String(index + 1).padStart(2, '0')}`, `merchant_sell_pick:${entry.slotUid}`);
        if ((index + 1) % 4 === 0) {
            keyboard.row();
        }
    });
    keyboard.row().text(`↩ ${t3(lang, 'Volver', 'Back', 'Nazad')}`, 'merchant_back');
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(lines.join('\n'), {
        reply_markup: keyboard,
    });
}

export {
    getPlayerLanguage,
    t3,
    getRefreshRemainingMs,
    lockRefresh,
    buildConfirmKeyboard,
    buildBuyQuantityKeyboard,
    renderMerchantMain,
    renderBuyMenu,
    renderSellMenu,
};
