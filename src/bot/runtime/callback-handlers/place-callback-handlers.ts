// @ts-nocheck
export const handlePlaceCallbacks = async (ctx, callbackData, deps) => {
    if (callbackData.startsWith('place_building:')) {
        const payload = callbackData.replace('place_building:', '');
        const [placeIdRaw, buildingKey] = payload.split('|');
        const placeId = Number(placeIdRaw);
        if (Number.isFinite(placeId) && buildingKey) {
            await deps.placeModule.handlePlaceBuilding(ctx, placeId, buildingKey);
        }
        return true;
    }
    if (callbackData.startsWith('place_custom:')) {
        const payload = callbackData.replace('place_custom:', '');
        const [placeIdRaw, buildingKey, serviceSlug] = payload.split('|');
        const placeId = Number(placeIdRaw);
        if (Number.isFinite(placeId) && buildingKey && serviceSlug) {
            await deps.handleCustomRecoveryService(ctx, placeId, buildingKey, serviceSlug);
        }
        else {
            await deps.safeAnswerCallbackQuery(ctx, deps.t('es', 'placeInteractionMissing'));
        }
        return true;
    }
    if (callbackData.startsWith('place_interact_')) {
        const interactionId = Number.parseInt(callbackData.replace('place_interact_', ''), 10);
        await deps.handlePlaceInteraction(ctx, interactionId);
        return true;
    }
    if (callbackData === 'place_back') {
        await deps.placeModule.handlePlaceEntry(ctx);
        return true;
    }
    if (callbackData === 'place_exit') {
        await deps.safeAnswerCallbackQuery(ctx);
        await deps.placeModule.handlePlaceExit(ctx);
        return true;
    }
    if (callbackData === 'recovery_focus') {
        const callbackTgId = String(ctx.callbackQuery.from.id);
        const player = await deps.getPlayerByTelegramId(callbackTgId);
        const lang = deps.getPlayerLanguage(player ?? undefined);
        const active = await deps.getActivePlaceRecoveryByTgId(callbackTgId);
        if (!active) {
            await deps.safeAnswerCallbackQuery(ctx, deps.t3(lang, 'No tienes recuperación activa.', 'No active recovery.', 'Aktivnogo vosstanovleniya net.'));
            return true;
        }
        await deps.safeAnswerCallbackQuery(ctx);
        await deps.placeModule.handlePlaceBuilding(ctx, active.placeId, active.buildingKey);
        return true;
    }
    if (callbackData === 'recovery_interrupt') {
        const callbackTgId = String(ctx.callbackQuery.from.id);
        const player = await deps.getPlayerByTelegramId(callbackTgId);
        const lang = deps.getPlayerLanguage(player ?? undefined);
        if (!(await deps.hasActivePlaceRecovery(callbackTgId))) {
            await deps.safeAnswerCallbackQuery(ctx, deps.t3(lang, 'No hay recuperación activa.', 'No active recovery.', 'Aktivnogo vosstanovleniya net.'));
            return true;
        }
        await deps.safeAnswerCallbackQuery(ctx);
        await deps.finalizeActiveRecovery({
            tgId: callbackTgId,
            interrupted: true,
            editCtx: ctx,
        });
        return true;
    }
    return false;
};
export const handleFeatureModuleCallbacks = async (ctx, callbackData, deps) => {
    if (await deps.bankModule.handleCallback(ctx, callbackData))
        return true;
    if (await deps.marketModule.handleCallback(ctx, callbackData))
        return true;
    if (await deps.forgeModule.handleCallback(ctx, callbackData))
        return true;
    if (await deps.mysteryMerchantModule.handleCallback(ctx, callbackData))
        return true;
    if (await deps.pveModule.handleCallback(ctx, callbackData))
        return true;
    if (await deps.buildModule.handleCallback(ctx, callbackData))
        return true;
    if (await deps.racialModule.handleCallback(ctx, callbackData))
        return true;
    return false;
};
