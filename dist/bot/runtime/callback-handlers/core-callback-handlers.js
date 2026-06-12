// @ts-nocheck
export const handleRegistrationAndProfileCallbacks = async (ctx, callbackData, deps) => {
    if (await deps.registrationModule.handleCallback(ctx, callbackData)) {
        return true;
    }
    if (callbackData === 'cmd_profile') {
        await deps.handleProfile(ctx);
        await deps.safeAnswerCallbackQuery(ctx);
        return true;
    }
    if (callbackData === 'change_language') {
        await deps.handleLanguageChange(ctx);
        await deps.safeAnswerCallbackQuery(ctx);
        return true;
    }
    if (!callbackData.startsWith('setlang_')) {
        return false;
    }
    const newLang = callbackData.replace('setlang_', '');
    const userId = String(ctx.callbackQuery.from.id);
    await deps.updatePlayerLanguage(userId, newLang);
    await deps.safeAnswerCallbackQuery(ctx, deps
        .t('es', 'settingsLanguageChanged')
        .replace('{lang}', deps.SUPPORTED_LANGUAGES[newLang].flag));
    await ctx.editMessageText(deps
        .t(newLang, 'settingsCurrent')
        .replace('{lang}', deps.SUPPORTED_LANGUAGES[newLang].flag)
        .replace('{flag}', ''));
    return true;
};
export const handleVentureCallbacks = async (ctx, callbackData, deps) => {
    if (callbackData === 'venture_cancel' || callbackData === 'venture_decline') {
        await deps.clearVentureState(ctx.callbackQuery.from.id);
        await deps.safeAnswerCallbackQuery(ctx, 'Viaje cancelado');
        if (ctx.callbackQuery.message) {
            await ctx.editMessageText('🚫 Viaje cancelado.');
        }
        else {
            await ctx.reply('🚫 Viaje cancelado.');
        }
        return true;
    }
    if (callbackData !== 'venture_confirm') {
        return false;
    }
    const state = await deps.getVentureState(ctx.callbackQuery.from.id);
    if (!state || state.phase !== 'confirming' || !state.plan) {
        await deps.safeAnswerCallbackQuery(ctx, 'No hay viaje pendiente.');
        return true;
    }
    await deps.clearVentureState(ctx.callbackQuery.from.id);
    await deps.safeAnswerCallbackQuery(ctx);
    await deps.clearCallbackKeyboard(ctx);
    await deps.executeVenture(ctx, state.plan);
    return true;
};
//# sourceMappingURL=core-callback-handlers.js.map