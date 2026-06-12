// @ts-nocheck
import { InlineKeyboard } from 'grammy';
import { prisma } from '../../lib/db.js';
import { t } from '../../lib/i18n.js';
import { EMOJIS } from '../../data/emojis.js';
export const BANK_SCOPE = 'bank';
export function getPlayerLanguage(player) {
    return player?.language ?? 'es';
}
export function getVaultProfileByBuildingKey(buildingKey) {
    return buildingKey === 'village-chest' ? 'village' : 'crown';
}
export function isVillageChest(buildingKey) {
    return getVaultProfileByBuildingKey(buildingKey) === 'village';
}
export async function isPlayerAtPlaceById(player, placeId) {
    const place = await prisma.place.findUnique({
        where: { id: placeId },
        select: { coordX: true, coordY: true },
    });
    if (!place) {
        return false;
    }
    return player.mapX === place.coordX && player.mapY === place.coordY;
}
export function parseBankMoneyInput(text) {
    const normalized = text.trim().toLowerCase().replace(/\s+/g, ' ');
    const match = normalized.match(/^(\d+)(?:\s*(s|plata|silver|g|oro|gold))?$/);
    if (!match) {
        return null;
    }
    const amount = Number.parseInt(match[1], 10);
    if (!Number.isFinite(amount) || amount < 1) {
        return null;
    }
    const token = (match[2] || 's').toLowerCase();
    const currency = token.startsWith('g') || token.startsWith('o') ? 'GOLD' : 'SILVER';
    return { amount, currency };
}
export async function sendBankScreen(ctx, mode, text, keyboard) {
    if (mode === 'edit' && typeof ctx.editMessageText === 'function') {
        await ctx.editMessageText(text, { reply_markup: keyboard });
        return;
    }
    await ctx.reply(text, { reply_markup: keyboard });
}
export function buildBankHubKeyboard(placeId, buildingKey, lang) {
    const keyboard = new InlineKeyboard().text('📦 Mover Objetos', `bank_objects:${placeId}|${buildingKey}`);
    if (!isVillageChest(buildingKey)) {
        keyboard.text(`${EMOJIS.ui.gold} Mover Dinero`, `bank_money:${placeId}|${buildingKey}`);
    }
    keyboard.row().text(`↩ ${t(lang, 'placeBack')}`, 'place_back').text(`🚪 ${t(lang, 'placeExit')}`, 'place_exit');
    return keyboard;
}
export function buildBankObjectDirectionKeyboard(placeId, buildingKey) {
    return new InlineKeyboard()
        .text(`${EMOJIS.ui.bag}➡️🏦 Mochila > Boveda`, `bank_object_dir:${placeId}|${buildingKey}|bag_to_vault`)
        .row()
        .text(`🏦➡️${EMOJIS.ui.bag} Boveda > Mochila`, `bank_object_dir:${placeId}|${buildingKey}|vault_to_bag`)
        .row()
        .text('↩ Menu Banco', `bank_manage:${placeId}|${buildingKey}`);
}
export function buildBankObjectListKeyboard(placeId, buildingKey) {
    return new InlineKeyboard()
        .text('🔁 Cambiar Direccion', `bank_objects:${placeId}|${buildingKey}`)
        .text('↩ Menu Banco', `bank_manage:${placeId}|${buildingKey}`);
}
export function buildBankMoneyDirectionKeyboard(placeId, buildingKey) {
    return new InlineKeyboard()
        .text(`${EMOJIS.ui.gold} Depositar`, `bank_money_dir:${placeId}|${buildingKey}|deposit`)
        .text(`${EMOJIS.ui.silver} Retirar`, `bank_money_dir:${placeId}|${buildingKey}|withdraw`)
        .row()
        .text('↩ Menu Banco', `bank_manage:${placeId}|${buildingKey}`);
}
export function buildBankMoneyAmountKeyboard(placeId, buildingKey) {
    return new InlineKeyboard()
        .text('↩ Dinero', `bank_money:${placeId}|${buildingKey}`)
        .text('🏦 Menu Banco', `bank_manage:${placeId}|${buildingKey}`);
}
export function buildBankMoneyConfirmKeyboard() {
    return new InlineKeyboard().text('✅ Confirmar', 'bank_money_confirm').text('❌ Cancelar', 'bank_money_cancel');
}
//# sourceMappingURL=bank-module-helpers.js.map