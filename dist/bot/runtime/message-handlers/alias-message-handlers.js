// @ts-nocheck
export const handleInteractionAliasMessage = async (ctx, text, deps) => {
    const tgId = ctx.from.id;
    const interactAliasCommand = text.trim().match(/^\/ia_(\d+)(?:\.\.\.)?$/i);
    if (!interactAliasCommand) {
        return false;
    }
    const listIndex = Number.parseInt(interactAliasCommand[1], 10);
    if (!Number.isFinite(listIndex) || listIndex < 1) {
        await ctx.reply('Ese comando de interaccion no es valido.');
        return true;
    }
    const opened = await deps.openCoordinateInteractionByIndex(ctx, listIndex, 'reply');
    if (!opened) {
        const player = await deps.getPlayerByTelegramId(String(tgId));
        const lang = deps.getPlayerLanguage(player ?? undefined);
        await ctx.reply(deps.t3(lang, 'No encontre esa interaccion aqui. Usa /interact para ver la lista actual.', 'Could not find that interaction here. Use /interact to view the current list.', 'Ne nashel takogo vzaimodeystviya zdes. Ispolzuy /interact dlya aktualnogo spiska.'));
    }
    return true;
};
export const handleBagAliasMessage = async (ctx, text, deps) => {
    const tgId = ctx.from.id;
    const itemInfoAliasCommand = text.trim().match(/^\/i_(\d+)(?:\.\.\.)?$/i);
    if (itemInfoAliasCommand) {
        const player = await deps.getPlayerByTelegramId(String(tgId));
        if (!player) {
            await ctx.reply('❌ No estas registrado. Usa /start');
            return true;
        }
        const slotIndex = Number.parseInt(itemInfoAliasCommand[1], 10);
        if (!Number.isFinite(slotIndex) || slotIndex < 1) {
            await ctx.reply('Ese comando de item no es valido.');
            return true;
        }
        const bagView = await deps.getActiveBagView(player.id, deps.getPlayerLanguage(player));
        const slot = bagView.slots.find((entry) => entry.slotIndex === slotIndex);
        if (!slot) {
            await ctx.reply(`No existe el slot #${String(slotIndex).padStart(2, '0')} en tu mochila activa.`);
            return true;
        }
        await deps.openBagItemInfoByUid(ctx, player.id, slot.slotUid, 'reply');
        return true;
    }
    const equipAliasCommand = text.trim().match(/^\/eq_(\d+)(?:\.\.\.)?$/i);
    if (equipAliasCommand) {
        const player = await deps.getPlayerByTelegramId(String(tgId));
        if (!player) {
            await ctx.reply('❌ No estas registrado. Usa /start');
            return true;
        }
        const alias = `/eq_${equipAliasCommand[1]}`;
        const result = await deps.equipToolByAlias(player.id, alias);
        await ctx.reply(result.message);
        if (result.success) {
            await deps.renderBagResponse(ctx);
        }
        return true;
    }
    const unequipToolAlias = text.trim().match(/^\/u_(\d+)(?:\.\.\.)?$/i);
    if (unequipToolAlias) {
        const player = await deps.getPlayerByTelegramId(String(tgId));
        if (!player) {
            await ctx.reply('❌ No estas registrado. Usa /start');
            return true;
        }
        const alias = `/u_${unequipToolAlias[1]}`;
        const result = await deps.unequipToolByAlias(player.id, alias);
        await ctx.reply(result.message);
        if (result.success) {
            await deps.renderBagResponse(ctx);
        }
        return true;
    }
    const unequipEquipmentAlias = text.trim().match(/^\/ue_([a-z0-9_]+)$/i);
    if (!unequipEquipmentAlias) {
        return false;
    }
    const player = await deps.getPlayerByTelegramId(String(tgId));
    if (!player) {
        await ctx.reply('❌ No estas registrado. Usa /start');
        return true;
    }
    const alias = `/ue_${unequipEquipmentAlias[1].toLowerCase()}`;
    const result = await deps.unequipEquipmentByAlias(player.id, alias);
    await ctx.reply(result.message);
    if (result.success) {
        await deps.renderBagResponse(ctx);
    }
    return true;
};
//# sourceMappingURL=alias-message-handlers.js.map