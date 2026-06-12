// @ts-nocheck
import { InlineKeyboard } from 'grammy';
import { EMOJIS } from '../../../data/emojis.js';
export const handleBagCallbacks = async (ctx, callbackData, deps) => {
    if (callbackData === 'map_bag') {
        await deps.safeAnswerCallbackQuery(ctx);
        await deps.renderBagResponse(ctx, 'edit');
        return true;
    }
    if (callbackData === 'bag_grab') {
        await deps.startGrabFlow(ctx);
        return true;
    }
    if (callbackData === 'bag_drop') {
        await deps.startDropFlow(ctx);
        return true;
    }
    if (callbackData === 'bag_switch') {
        await deps.startSwitchFlow(ctx);
        return true;
    }
    if (callbackData === 'bag_map') {
        const callbackTgId = String(ctx.callbackQuery.from.id);
        await deps.safeAnswerCallbackQuery(ctx);
        await deps.openMapInCurrentMessage(ctx, callbackTgId);
        return true;
    }
    if (callbackData === 'item_info_bag') {
        await deps.safeAnswerCallbackQuery(ctx);
        await deps.renderBagResponse(ctx, 'edit');
        return true;
    }
    if (callbackData.startsWith('item_info_use:')) {
        const slotUid = Number.parseInt(callbackData.replace('item_info_use:', ''), 10);
        const player = await deps.getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
        if (!player || !Number.isFinite(slotUid)) {
            await deps.safeAnswerCallbackQuery(ctx, deps.t('es', 'uiInvalidItem'));
            return true;
        }
        const lang = deps.getPlayerLanguage(player);
        const item = await deps.getActiveBagItemInfoByUid(player.id, slotUid);
        if (!item) {
            await deps.safeAnswerCallbackQuery(ctx, deps.t(lang, 'bagItemGone'));
            await deps.renderBagResponse(ctx, 'edit');
            return true;
        }
        if (item.kind !== 'resource' || !item.usable) {
            await deps.safeAnswerCallbackQuery(ctx, deps.t(lang, 'bagItemNotUsable'));
            return true;
        }
        await deps.safeAnswerCallbackQuery(ctx);
        await ctx.editMessageText(deps.buildBagItemActionConfirmText(item, 'use'), {
            reply_markup: deps.buildBagItemActionConfirmKeyboard('use', slotUid),
        });
        return true;
    }
    if (callbackData.startsWith('item_info_drop:')) {
        const slotUid = Number.parseInt(callbackData.replace('item_info_drop:', ''), 10);
        const player = await deps.getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
        if (!player || !Number.isFinite(slotUid)) {
            await deps.safeAnswerCallbackQuery(ctx, deps.t('es', 'uiInvalidItem'));
            return true;
        }
        const lang = deps.getPlayerLanguage(player);
        const item = await deps.getActiveBagItemInfoByUid(player.id, slotUid);
        if (!item) {
            await deps.safeAnswerCallbackQuery(ctx, deps.t(lang, 'bagItemGone'));
            await deps.renderBagResponse(ctx, 'edit');
            return true;
        }
        await deps.safeAnswerCallbackQuery(ctx);
        await ctx.editMessageText(deps.buildBagItemActionConfirmText(item, 'drop'), {
            reply_markup: deps.buildBagItemActionConfirmKeyboard('drop', slotUid),
        });
        return true;
    }
    if (callbackData.startsWith('item_info_use_confirm:')) {
        const slotUid = Number.parseInt(callbackData.replace('item_info_use_confirm:', ''), 10);
        const player = await deps.getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
        if (!player || !Number.isFinite(slotUid)) {
            await deps.safeAnswerCallbackQuery(ctx, deps.t('es', 'uiInvalidItem'));
            return true;
        }
        const lang = deps.getPlayerLanguage(player);
        const item = await deps.getActiveBagItemInfoByUid(player.id, slotUid);
        if (!item || item.kind !== 'resource' || !item.usable) {
            await deps.safeAnswerCallbackQuery(ctx, deps.t(lang, 'bagItemNoLongerUsable'));
            await deps.renderBagResponse(ctx, 'edit');
            return true;
        }
        const result = await deps.useBagSlot(player.id, item.slotIndex, 1);
        await deps.safeAnswerCallbackQuery(ctx, result.success ? deps.t(lang, 'bagUsed') : deps.t(lang, 'bagUseFailed'));
        await ctx.editMessageText(result.message, {
            reply_markup: new InlineKeyboard().text(`${EMOJIS.ui.bag} Mochila`, 'item_info_bag'),
        });
        return true;
    }
    if (callbackData.startsWith('item_info_drop_confirm:')) {
        const slotUid = Number.parseInt(callbackData.replace('item_info_drop_confirm:', ''), 10);
        const player = await deps.getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
        if (!player || !Number.isFinite(slotUid)) {
            await deps.safeAnswerCallbackQuery(ctx, deps.t('es', 'uiInvalidItem'));
            return true;
        }
        const lang = deps.getPlayerLanguage(player);
        const item = await deps.getActiveBagItemInfoByUid(player.id, slotUid);
        if (!item) {
            await deps.safeAnswerCallbackQuery(ctx, deps.t(lang, 'bagItemGone'));
            await deps.renderBagResponse(ctx, 'edit');
            return true;
        }
        const result = await deps.dropBagSlot(player.id, item.slotIndex, 1);
        await deps.safeAnswerCallbackQuery(ctx, result.success ? deps.t(lang, 'bagDropped') : deps.t(lang, 'bagDropFailed'));
        await ctx.editMessageText(result.message, {
            reply_markup: new InlineKeyboard().text(`${EMOJIS.ui.bag} Mochila`, 'item_info_bag'),
        });
        return true;
    }
    if (callbackData.startsWith('item_info_cancel:')) {
        const slotUid = Number.parseInt(callbackData.replace('item_info_cancel:', ''), 10);
        const player = await deps.getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
        if (!player || !Number.isFinite(slotUid)) {
            await deps.safeAnswerCallbackQuery(ctx, deps.t('es', 'uiInvalidItem'));
            return true;
        }
        await deps.safeAnswerCallbackQuery(ctx, deps.t(deps.getPlayerLanguage(player), 'uiActionCancelled'));
        await deps.openBagItemInfoByUid(ctx, player.id, slotUid, 'edit');
        return true;
    }
    if (callbackData.startsWith('item_info_equip:')) {
        const slotUid = Number.parseInt(callbackData.replace('item_info_equip:', ''), 10);
        const player = await deps.getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
        if (!player || !Number.isFinite(slotUid)) {
            await deps.safeAnswerCallbackQuery(ctx, deps.t('es', 'uiInvalidItem'));
            return true;
        }
        const lang = deps.getPlayerLanguage(player);
        const result = await deps.equipToolFromBagItem(player.id, slotUid);
        await deps.safeAnswerCallbackQuery(ctx, result.success ? deps.t(lang, 'bagEquipped') : deps.t(lang, 'bagEquipFailed'));
        await deps.renderBagResponse(ctx, 'edit');
        return true;
    }
    if (callbackData === 'bag_switch_back') {
        await deps.safeAnswerCallbackQuery(ctx);
        await deps.renderBagResponse(ctx, 'edit');
        return true;
    }
    if (callbackData.startsWith('bag_switch_pick:')) {
        const rawTarget = callbackData.replace('bag_switch_pick:', '');
        const targetBagId = rawTarget === 'pockets' ? 'pockets' : Number.parseInt(rawTarget, 10);
        const player = await deps.getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
        if (!player) {
            await deps.safeAnswerCallbackQuery(ctx, '❌ No estás registrado');
            return true;
        }
        const lang = deps.getPlayerLanguage(player);
        const preview = await deps.previewBagSwitch(player.id, targetBagId);
        if (!preview.success || !preview.option || !preview.targetUsage) {
            await deps.safeAnswerCallbackQuery(ctx, preview.reason || deps.t(lang, 'bagCannotSwitch'));
            return true;
        }
        await deps.setBagState(ctx.callbackQuery.from.id, {
            phase: 'confirming_switch',
            targetBagId,
            targetLabel: preview.option.label,
        });
        const keyboard = new InlineKeyboard()
            .text('✅ Sí', `bag_switch_confirm:${rawTarget}`)
            .text('❌ No', 'bag_switch_cancel');
        await deps.safeAnswerCallbackQuery(ctx);
        await deps.clearCallbackKeyboard(ctx);
        await ctx.reply(`${EMOJIS.ui.switch} ${deps.t(lang, 'bagConfirmEquip')} ${preview.option.emoji} ${preview.option.label}?\n` +
            `${deps.t(lang, 'bagFinalSlots')}: ${preview.targetUsage.slotUsage}\n` +
            `${EMOJIS.ui.weight} ${deps.t(lang, 'bagFinalWeight')}: ${preview.targetUsage.weightUsage}`, { reply_markup: keyboard });
        return true;
    }
    if (callbackData.startsWith('bag_switch_confirm:')) {
        const rawTarget = callbackData.replace('bag_switch_confirm:', '');
        const targetBagId = rawTarget === 'pockets' ? 'pockets' : Number.parseInt(rawTarget, 10);
        const player = await deps.getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
        if (!player) {
            await deps.safeAnswerCallbackQuery(ctx, '❌ No estás registrado');
            return true;
        }
        const lang = deps.getPlayerLanguage(player);
        const result = await deps.executeBagSwitch(player.id, targetBagId);
        await deps.clearBagState(ctx.callbackQuery.from.id);
        await deps.safeAnswerCallbackQuery(ctx, result.success ? deps.t(lang, 'bagSwitched') : deps.t(lang, 'bagSwitchFailed'));
        await deps.clearCallbackKeyboard(ctx);
        await ctx.reply(result.message);
        await deps.renderBagResponse(ctx, 'reply');
        return true;
    }
    if (callbackData === 'bag_switch_cancel') {
        await deps.clearBagState(ctx.callbackQuery.from.id);
        const player = await deps.getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
        const lang = deps.getPlayerLanguage(player ?? undefined);
        await deps.safeAnswerCallbackQuery(ctx, deps.t(lang, 'bagSwitchCancelled'));
        await deps.clearCallbackKeyboard(ctx);
        await ctx.reply(`🔒 ${deps.t(lang, 'bagSwitchCancelledMsg')}`);
        return true;
    }
    return false;
};
//# sourceMappingURL=bag-callback-handlers.js.map