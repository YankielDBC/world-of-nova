// @ts-nocheck
export const handleMapCallbacks = async (ctx, callbackData, deps) => {
    if (callbackData === 'map_up' ||
        callbackData === 'map_down' ||
        callbackData === 'map_left' ||
        callbackData === 'map_right') {
        const direction = callbackData.replace('map_', '');
        await deps.handleMapMove(ctx, direction);
        return true;
    }
    if (callbackData === 'ghost_hint') {
        await deps.handleGhostHint(ctx);
        return true;
    }
    if (callbackData === 'ghost_recover') {
        await deps.handleGhostRecover(ctx);
        return true;
    }
    if (callbackData === 'map_profile') {
        await deps.handleProfile(ctx);
        await deps.safeAnswerCallbackQuery(ctx);
        return true;
    }
    if (callbackData === 'map_inspect') {
        await deps.handleInspectFromMap(ctx);
        return true;
    }
    if (callbackData === 'arrival_map' || callbackData === 'inspect_place_open_map') {
        const callbackTgId = String(ctx.callbackQuery.from.id);
        await deps.safeAnswerCallbackQuery(ctx);
        await deps.openMapInCurrentMessage(ctx, callbackTgId);
        return true;
    }
    if (callbackData === 'inspect_place_open_buildings') {
        await deps.safeAnswerCallbackQuery(ctx);
        await deps.placeModule.handlePlaceEntry(ctx);
        return true;
    }
    if (callbackData === 'map_venture') {
        await deps.safeAnswerCallbackQuery(ctx);
        await deps.startVentureFlow(ctx);
        return true;
    }
    if (callbackData === 'map_interact' || callbackData === 'map_soon') {
        await deps.safeAnswerCallbackQuery(ctx);
        await deps.renderCoordinateInteractions(ctx, 'edit');
        return true;
    }
    if (callbackData === 'map_interact_back') {
        const callbackTgId = String(ctx.callbackQuery.from.id);
        await deps.safeAnswerCallbackQuery(ctx);
        await deps.openMapInCurrentMessage(ctx, callbackTgId);
        return true;
    }
    if (callbackData.startsWith('map_interact_pick:')) {
        const listIndex = Number.parseInt(callbackData.replace('map_interact_pick:', ''), 10);
        if (!Number.isFinite(listIndex) || listIndex < 1) {
            const player = await deps.getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
            const lang = deps.getPlayerLanguage(player ?? undefined);
            await deps.safeAnswerCallbackQuery(ctx, deps.t3(lang, 'Interacción inválida.', 'Invalid interaction.', 'Nevernoye vzaimodeystvie.'));
            return true;
        }
        await deps.openCoordinateInteractionByIndex(ctx, listIndex, 'edit');
        return true;
    }
    if (callbackData === 'cave_exit') {
        const callbackTgId = String(ctx.callbackQuery.from.id);
        const player = await deps.getPlayerByTelegramId(callbackTgId);
        const lang = deps.getPlayerLanguage(player ?? undefined);
        const exited = await deps.exitActiveCaveForTgId(callbackTgId);
        if (!exited.success) {
            await deps.safeAnswerCallbackQuery(ctx, deps.t3(lang, 'No estabas dentro de una cueva.', 'You were not inside a cave.', 'Ty ne byl vnutri peschery.'));
            return true;
        }
        await deps.safeAnswerCallbackQuery(ctx, deps.t3(lang, 'Sales de la cueva.', 'You leave the cave.', 'Ty vykhodish iz peschery.'));
        await deps.openMapInCurrentMessage(ctx, callbackTgId);
        return true;
    }
    return false;
};
export const handleInspectCallbacks = async (ctx, callbackData, deps) => {
    if (callbackData.startsWith('inspect_action:')) {
        const action = callbackData.replace('inspect_action:', '');
        await deps.startInspectActionFlow(ctx, action);
        return true;
    }
    if (callbackData === 'inspect_back_resources' || callbackData === 'result_view_resources') {
        await deps.clearInspectState(ctx.callbackQuery.from.id);
        await deps.safeAnswerCallbackQuery(ctx);
        await deps.renderInspectResponse(ctx, 'edit');
        return true;
    }
    if (callbackData === 'result_view_map') {
        await deps.safeAnswerCallbackQuery(ctx);
        const callbackTgId = String(ctx.callbackQuery.from.id);
        await deps.showResultMapDecision(ctx, callbackTgId);
        return true;
    }
    if (callbackData === 'result_view_map_force') {
        await deps.safeAnswerCallbackQuery(ctx);
        const callbackTgId = String(ctx.callbackQuery.from.id);
        await deps.openMapInCurrentMessage(ctx, callbackTgId);
        return true;
    }
    if (callbackData.startsWith('inspect_pick_node:')) {
        const payload = callbackData.replace('inspect_pick_node:', '');
        const [actionRaw, nodeRaw] = payload.split(':');
        const action = actionRaw;
        const nodeIndex = Number.parseInt(nodeRaw || '', 10);
        await deps.handleInspectNodePick(ctx, action, nodeIndex);
        return true;
    }
    if (callbackData.startsWith('inspect_pick_qty:')) {
        const payload = callbackData.replace('inspect_pick_qty:', '');
        const [actionRaw, nodeRaw, qtyRaw] = payload.split(':');
        const action = actionRaw;
        const nodeIndex = Number.parseInt(nodeRaw || '', 10);
        const quantity = Number.parseInt(qtyRaw || '', 10);
        await deps.handleInspectQtyPick(ctx, action, nodeIndex, quantity);
        return true;
    }
    if (callbackData === 'inspect_exit') {
        await deps.clearInspectState(ctx.callbackQuery.from.id);
        const callbackTgId = String(ctx.callbackQuery.from.id);
        const player = await deps.getPlayerByTelegramId(callbackTgId);
        const lang = deps.getPlayerLanguage(player ?? undefined);
        await deps.safeAnswerCallbackQuery(ctx, `${deps.t(lang, 'inspectViewMap')}...`);
        await deps.openMapInCurrentMessage(ctx, callbackTgId);
        return true;
    }
    if (callbackData.startsWith('creature_defeat:')) {
        const creatureId = Number.parseInt(callbackData.replace('creature_defeat:', ''), 10);
        if (!Number.isFinite(creatureId) || creatureId < 1) {
            const player = await deps.getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
            const lang = deps.getPlayerLanguage(player ?? undefined);
            await deps.safeAnswerCallbackQuery(ctx, deps.t3(lang, 'Criatura inválida.', 'Invalid creature.', 'Nevernoye sushchestvo.'));
            return true;
        }
        await deps.handleCreatureDefeat(ctx, creatureId);
        return true;
    }
    return false;
};
//# sourceMappingURL=map-and-inspect-callback-handlers.js.map