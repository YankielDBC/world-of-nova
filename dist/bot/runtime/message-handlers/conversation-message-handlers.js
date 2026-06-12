// @ts-nocheck
export const handleVentureConversationMessage = async (ctx, text, deps) => {
    const tgId = ctx.from.id;
    const ventureState = await deps.getVentureState(tgId);
    if (!ventureState) {
        return false;
    }
    const trimmedText = text.trim();
    const lowered = trimmedText.toLowerCase();
    if (lowered === '/cancel' || lowered === '/cancelar' || lowered === '/cancelar_viaje') {
        await deps.clearVentureState(tgId);
        await ctx.reply('🚫 Viaje cancelado.');
        return true;
    }
    if (trimmedText.startsWith('/')) {
        return false;
    }
    if (ventureState.phase === 'awaiting_coords') {
        await deps.handleVentureCoords(ctx, text);
        return true;
    }
    if (ventureState.phase === 'confirming') {
        if (lowered === 'si' || lowered === 'sí' || lowered === 'yes') {
            await deps.clearVentureState(tgId);
            if (ventureState.plan) {
                await deps.executeVenture(ctx, ventureState.plan);
            }
        }
        else if (lowered === 'no') {
            await deps.clearVentureState(tgId);
            await ctx.reply('Viaje cancelado.');
        }
        else {
            await ctx.reply('Usa los botones para confirmar o cancelar el viaje.');
        }
        return true;
    }
    return true;
};
export const handleInspectConversationMessage = async (ctx, text, deps) => {
    const tgId = ctx.from.id;
    const inspectState = await deps.getInspectState(tgId);
    if (!inspectState) {
        return false;
    }
    const player = await deps.getPlayerByTelegramId(String(tgId));
    if (!player) {
        await deps.clearInspectState(tgId);
        await ctx.reply('❌ No estás registrado. Usa /start');
        return true;
    }
    if (inspectState.phase === 'awaiting_node') {
        const nodeIndex = deps.parseNodeIndex(text);
        if (!nodeIndex) {
            await ctx.reply('Escribe un numero de nodo valido, por ejemplo 1.');
            return true;
        }
        const inspectData = await deps.getInspectNodesForPlayer(String(tgId));
        if (!inspectData) {
            await deps.clearInspectState(tgId);
            await ctx.reply('No hay recursos para inspeccionar ahora mismo.');
            return true;
        }
        const node = inspectData.nodes.find((entry) => entry.listIndex === nodeIndex);
        if (!node) {
            await ctx.reply(`No existe el nodo #${String(nodeIndex).padStart(2, '0')}.`);
            return true;
        }
        if (node.action !== inspectState.action) {
            await ctx.reply('Ese nodo corresponde a otra accion.');
            return true;
        }
        await deps.setInspectState(tgId, {
            phase: 'awaiting_qty',
            action: inspectState.action,
            nodeIndex,
            maxQty: node.available,
        });
        await ctx.reply(`📦 ¿Cuantas acciones haras sobre #${String(nodeIndex).padStart(2, '0')}? Disponible: ${node.available}.`);
        return true;
    }
    if (inspectState.phase !== 'awaiting_qty') {
        return true;
    }
    const quantity = deps.parsePositiveInt(text);
    if (!quantity) {
        await ctx.reply('Escribe una cantidad valida.');
        return true;
    }
    if (quantity > inspectState.maxQty) {
        await ctx.reply(`No puedes tomar ${quantity}. Maximo disponible: ${inspectState.maxQty}.`);
        return true;
    }
    await ctx.reply('⏳ Trabajando el recurso...');
    await deps.sleep(1200);
    let result;
    try {
        result = await deps.playerActionQueue.enqueueForKey(String(tgId), 'inspect_action', () => deps.executeInspectAction({
            playerTgId: String(tgId),
            action: inspectState.action,
            listIndex: inspectState.nodeIndex,
            quantity,
        }));
    }
    catch {
        await ctx.reply(deps.t3(deps.getPlayerLanguage(player), 'Hay muchas acciones en cola. Intenta de nuevo en un momento.', 'Too many queued actions. Try again shortly.', 'Slishkom mnogo dejstvij v ocheredi. Poprobuj cherez mgnovenie.'));
        return true;
    }
    await deps.clearInspectState(tgId);
    await ctx.reply(result.message, {
        reply_markup: deps.buildInspectResultKeyboard(deps.getPlayerLanguage(player)),
    });
    await deps.notifyLowVitalsIfNeeded(ctx, String(tgId));
    return true;
};
export const handleBagConversationMessage = async (ctx, text, deps) => {
    const tgId = ctx.from.id;
    const bagState = await deps.getBagState(tgId);
    if (!bagState) {
        return false;
    }
    const player = await deps.getPlayerByTelegramId(String(tgId));
    if (!player) {
        await deps.clearBagState(tgId);
        await ctx.reply('❌ No estás registrado. Usa /start');
        return true;
    }
    if (bagState.phase === 'awaiting_grab_slot') {
        const slotIndex = deps.parsePositiveInt(text);
        if (!slotIndex) {
            await ctx.reply('Escribe un número de slot válido, por ejemplo 1.');
            return true;
        }
        const bagView = await deps.getActiveBagView(player.id, deps.getPlayerLanguage(player));
        const slot = bagView.slots.find((entry) => entry.slotIndex === slotIndex);
        if (!slot) {
            await ctx.reply(`No existe el slot #${String(slotIndex).padStart(2, '0')}.`);
            return true;
        }
        if (!slot.usable || typeof slot.quantity !== 'number') {
            await ctx.reply(`${slot.emoji} ${slot.label} no se puede consumir directamente.`);
            return true;
        }
        await deps.setBagState(tgId, {
            phase: 'awaiting_grab_qty',
            slotIndex,
            maxQty: slot.quantity,
        });
        await ctx.reply(`${deps.EMOJIS.ui.grab} ¿Cuántos quieres usar del slot #${String(slotIndex).padStart(2, '0')}? Tienes ${slot.quantity}.`);
        return true;
    }
    if (bagState.phase === 'awaiting_grab_qty') {
        const quantity = deps.parsePositiveInt(text);
        if (!quantity) {
            await ctx.reply('Escribe una cantidad válida.');
            return true;
        }
        const result = await deps.useBagSlot(player.id, bagState.slotIndex, quantity);
        if (!result.success) {
            await ctx.reply(result.message);
            return true;
        }
        await deps.clearBagState(tgId);
        await ctx.reply(result.message);
        await deps.renderBagResponse(ctx);
        return true;
    }
    if (bagState.phase === 'awaiting_drop_slot') {
        const slotIndex = deps.parsePositiveInt(text);
        if (!slotIndex) {
            await ctx.reply('Escribe un número de slot válido, por ejemplo 1.');
            return true;
        }
        const bagView = await deps.getActiveBagView(player.id, deps.getPlayerLanguage(player));
        const slot = bagView.slots.find((entry) => entry.slotIndex === slotIndex);
        if (!slot) {
            await ctx.reply(`No existe el slot #${String(slotIndex).padStart(2, '0')}.`);
            return true;
        }
        if (slot.kind !== 'resource' || typeof slot.quantity !== 'number') {
            const result = await deps.dropBagSlot(player.id, slotIndex, 1);
            await deps.clearBagState(tgId);
            await ctx.reply(result.message);
            await deps.renderBagResponse(ctx);
            return true;
        }
        await deps.setBagState(tgId, {
            phase: 'awaiting_drop_qty',
            slotIndex,
            maxQty: slot.quantity,
        });
        await ctx.reply(`${deps.EMOJIS.ui.drop} ¿Cuántos vas a soltar del slot #${String(slotIndex).padStart(2, '0')}? Tienes ${slot.quantity}.`);
        return true;
    }
    if (bagState.phase === 'awaiting_drop_qty') {
        const quantity = deps.parsePositiveInt(text);
        if (!quantity) {
            await ctx.reply('Escribe una cantidad válida.');
            return true;
        }
        const result = await deps.dropBagSlot(player.id, bagState.slotIndex, quantity);
        if (!result.success) {
            await ctx.reply(result.message);
            return true;
        }
        await deps.clearBagState(tgId);
        await ctx.reply(result.message);
        await deps.renderBagResponse(ctx);
        return true;
    }
    if (bagState.phase === 'confirming_switch') {
        const lowered = text.trim().toLowerCase();
        if (lowered === 'si' || lowered === 'sí' || lowered === 'yes') {
            const result = await deps.executeBagSwitch(player.id, bagState.targetBagId);
            await deps.clearBagState(tgId);
            await ctx.reply(result.message);
            await deps.renderBagResponse(ctx);
            return true;
        }
        if (lowered === 'no') {
            await deps.clearBagState(tgId);
            await ctx.reply('🔒 El cambio de mochila fue cancelado.');
            return true;
        }
        await ctx.reply('Responde "si" o "no" para confirmar el cambio de mochila.');
        return true;
    }
    return true;
};
//# sourceMappingURL=conversation-message-handlers.js.map