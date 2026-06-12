// @ts-nocheck
import { InlineKeyboard } from 'grammy';
import { EMOJIS } from '../../data/emojis.js';
import { getItemShortDescription } from '../../data/game-dictionary.js';
import { compactText } from '../../lib/ui-compact.js';
function parsePositiveInt(text) {
    const value = Number.parseInt(text.trim(), 10);
    if (!Number.isFinite(value) || value < 1)
        return null;
    return value;
}
function parseNodeIndex(text) {
    return parsePositiveInt(text.trim().replace('#', ''));
}
function toDurabilityBar(current, max) {
    const safeMax = Math.max(1, max);
    const ratio = Math.max(0, Math.min(1, current / safeMax));
    const totalBlocks = 3;
    const filledBlocks = Math.max(0, Math.min(totalBlocks, Math.round(ratio * totalBlocks)));
    return `${'█'.repeat(filledBlocks)}${'░'.repeat(totalBlocks - filledBlocks)}`;
}
function buildBagItemInfoText(item) {
    const titleLabel = compactText((item.label || 'Item').toUpperCase(), 18);
    const lines = [`┌─ ${item.emoji} ${titleLabel} ─┐`];
    const shortDescription = item.description || getItemShortDescription(item.label);
    if (item.kind === 'tool') {
        const durability = item.durability ?? 0;
        const maxDurability = item.maxDurability ?? 1;
        lines.push(`├⚔️ Durabilidad  ${toDurabilityBar(durability, maxDurability)} ${durability}/${maxDurability}`);
        lines.push(`├🎯 Nivel requerido: ${item.requiredLevel ?? 1}`);
        lines.push(`├⚒ Skill requerido: ${(item.requiredSkill ?? 'GATHER').toUpperCase()}`);
    }
    else if (item.kind === 'equipment') {
        const durability = item.durability ?? 0;
        const maxDurability = item.maxDurability ?? 1;
        lines.push(`├🛡 Slot: ${item.equipmentSlot ?? 'Equipo'}`);
        lines.push(`├✨ Rareza: ${item.rarityCode}`);
        lines.push(`├🎯 Nivel requerido: ${item.requiredLevel ?? 1}`);
        if (item.itemLevel)
            lines.push(`├📈 Item Lv: ${item.itemLevel}`);
        if (item.bindType)
            lines.push(`├🔒 Bind: ${item.bindType}`);
        if (item.requiredClass)
            lines.push(`├🏹 Clase: ${item.requiredClass}`);
        if (item.requiredRace)
            lines.push(`├🧬 Raza: ${item.requiredRace}`);
        if (maxDurability > 0) {
            lines.push(`├⚔️ Durabilidad  ${toDurabilityBar(durability, maxDurability)} ${durability}/${maxDurability}`);
        }
        if (item.specialEffectKey) {
            lines.push(`├🌀 Efecto: ${compactText(item.specialEffectKey, 20)}`);
        }
    }
    else if (item.kind === 'resource') {
        lines.push(`├📦 Cantidad: x${item.quantity}`);
        if (item.effectType && item.effectValue) {
            lines.push(`├✨ Efecto: ${item.effectType} +${item.effectValue}`);
        }
        else {
            lines.push('├✨ Efecto: Sin uso directo');
        }
    }
    else {
        lines.push(`├📦 Cantidad: x${item.quantity}`);
        lines.push(`├${EMOJIS.ui.bag} Tipo: Bolsa`);
    }
    if (shortDescription) {
        lines.push(`├📝 ${compactText(shortDescription, 28)}`);
    }
    lines.push(`├🆔 ID del objeto: ${item.uniqueObjectId}`);
    lines.push('└──────────────┘');
    return lines.join('\n');
}
function buildBagItemInfoKeyboard(item) {
    const keyboard = new InlineKeyboard();
    if (item.kind === 'tool') {
        keyboard.text('🟢 Equipar', `item_info_equip:${item.slotUid}`);
        keyboard.text('🗑 Soltar', `item_info_drop:${item.slotUid}`);
        keyboard.text(`${EMOJIS.ui.bag} Mochila`, 'item_info_bag');
        return keyboard;
    }
    if (item.kind === 'resource' && item.usable) {
        keyboard.text('✨ Usar', `item_info_use:${item.slotUid}`);
        keyboard.text('🗑 Soltar', `item_info_drop:${item.slotUid}`);
        keyboard.text(`${EMOJIS.ui.bag} Mochila`, 'item_info_bag');
        return keyboard;
    }
    if (item.kind === 'equipment') {
        keyboard.text('🟢 Equipar', `item_info_equip:${item.slotUid}`);
        keyboard.text('🗑 Soltar', `item_info_drop:${item.slotUid}`);
        keyboard.text(`${EMOJIS.ui.bag} Mochila`, 'item_info_bag');
        return keyboard;
    }
    keyboard.text('🗑 Soltar', `item_info_drop:${item.slotUid}`);
    keyboard.text(`${EMOJIS.ui.bag} Mochila`, 'item_info_bag');
    return keyboard;
}
function buildBagItemActionConfirmText(item, action) {
    const amountLabel = item.kind === 'tool' || item.kind === 'storedBag' || item.kind === 'equipment' ? '1 unidad' : '1 unidad';
    if (action === 'use') {
        return `¿Confirmas usar ${amountLabel} de ${item.emoji} ${item.label}?\nTienes: x${item.quantity}`;
    }
    return `¿Confirmas soltar ${amountLabel} de ${item.emoji} ${item.label}?\nTienes: x${item.quantity}`;
}
function buildBagItemActionConfirmKeyboard(action, slotUid) {
    const keyboard = new InlineKeyboard();
    const confirmData = action === 'use' ? `item_info_use_confirm:${slotUid}` : `item_info_drop_confirm:${slotUid}`;
    keyboard.text('✅ Confirmar', confirmData);
    keyboard.text('↩ Cancelar', `item_info_cancel:${slotUid}`);
    return keyboard;
}
export function createBagFlowHandlers(deps) {
    const renderBagResponse = async (ctx, mode = 'reply') => {
        const player = await deps.getPlayerByTelegramId(String(ctx.from?.id || ctx.callbackQuery?.from?.id));
        if (!player) {
            const text = '❌ No estás registrado. Usa /start';
            if (mode === 'edit' && typeof ctx.editMessageText === 'function') {
                await ctx.editMessageText(text);
            }
            else {
                await ctx.reply(text);
            }
            return;
        }
        await deps.ensurePlayerBagSetup(player.id);
        const lang = deps.getPlayerLanguage(player);
        const bagView = await deps.getActiveBagView(player.id, lang);
        if (mode === 'edit' && typeof ctx.editMessageText === 'function') {
            await ctx.editMessageText(bagView.text, { reply_markup: bagView.keyboard });
            return;
        }
        await ctx.reply(bagView.text, { reply_markup: bagView.keyboard });
    };
    const openBagItemInfoByUid = async (ctx, playerId, slotUid, mode = 'reply') => {
        const item = await deps.getActiveBagItemInfoByUid(playerId, slotUid);
        if (!item) {
            const message = 'No encontré ese item en tu mochila activa.';
            if (mode === 'edit' && typeof ctx.editMessageText === 'function') {
                await ctx.editMessageText(message, {
                    reply_markup: new InlineKeyboard().text(`${EMOJIS.ui.bag} Mochila`, 'item_info_bag'),
                });
            }
            else {
                await ctx.reply(message);
            }
            return false;
        }
        const text = buildBagItemInfoText(item);
        const keyboard = buildBagItemInfoKeyboard(item);
        if (mode === 'edit' && typeof ctx.editMessageText === 'function') {
            await ctx.editMessageText(text, { reply_markup: keyboard });
        }
        else {
            await ctx.reply(text, { reply_markup: keyboard });
        }
        return true;
    };
    const startGrabFlow = async (ctx) => {
        const player = await deps.getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
        if (!player) {
            await ctx.answerCallbackQuery('❌ No estás registrado');
            return;
        }
        await deps.setBagState(String(ctx.callbackQuery.from.id), { phase: 'awaiting_grab_slot' });
        await ctx.answerCallbackQuery();
        await deps.clearCallbackKeyboard(ctx);
        await ctx.reply(`${EMOJIS.ui.grab} ¿Qué slot quieres consumir? Escribe el número, por ejemplo 1.`);
    };
    const startDropFlow = async (ctx) => {
        const player = await deps.getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
        if (!player) {
            await ctx.answerCallbackQuery('❌ No estás registrado');
            return;
        }
        await deps.setBagState(String(ctx.callbackQuery.from.id), { phase: 'awaiting_drop_slot' });
        await ctx.answerCallbackQuery();
        await deps.clearCallbackKeyboard(ctx);
        await ctx.reply(`${EMOJIS.ui.drop} ¿Qué slot vas a soltar? Escribe el número del slot.`);
    };
    const startSwitchFlow = async (ctx) => {
        const player = await deps.getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
        if (!player) {
            await ctx.answerCallbackQuery('❌ No estás registrado');
            return;
        }
        const lang = deps.getPlayerLanguage(player);
        const options = await deps.listBagSwitchOptions(player.id);
        if (options.length === 0) {
            await ctx.answerCallbackQuery(deps.t(lang, 'bagNoOtherReady'));
            return;
        }
        const keyboard = new InlineKeyboard();
        for (const option of options) {
            const data = option.bagId === 'pockets' ? 'pockets' : String(option.bagId);
            keyboard.text(`${option.emoji} ${option.label}`, `bag_switch_pick:${data}`);
        }
        keyboard.text(`🔙 ${deps.t(lang, 'mapBag')}`, 'bag_switch_back');
        await ctx.answerCallbackQuery();
        await deps.clearCallbackKeyboard(ctx);
        const normalizedOptions = options.map((option) => `${option.emoji} ${option.label} · ${option.usageLabel.replace(/\bslots\b/gi, deps.t(lang, 'bagSlots').toLowerCase())}`);
        await ctx.reply(`${EMOJIS.ui.switch} Elige la bolsa que quieres equipar:\n${normalizedOptions.join('  |  ')}`, { reply_markup: keyboard });
    };
    return {
        parsePositiveInt,
        parseNodeIndex,
        renderBagResponse,
        buildBagItemActionConfirmText,
        buildBagItemActionConfirmKeyboard,
        openBagItemInfoByUid,
        startGrabFlow,
        startDropFlow,
        startSwitchFlow,
    };
}
