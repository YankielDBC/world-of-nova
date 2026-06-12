// @ts-nocheck
export const handleFeatureModuleMessages = async (ctx, text, deps) => {
    if (await deps.bankModule.handleMessage(ctx, text))
        return true;
    if (await deps.marketModule.handleMessage(ctx, text))
        return true;
    if (await deps.mysteryMerchantModule.handleMessage(ctx, text))
        return true;
    if (await deps.forgeModule.handleMessage(ctx, text))
        return true;
    return false;
};
export const handleRegistrationFallbackMessage = async (ctx, text, deps) => {
    if (text.startsWith('/')) {
        console.log(`⏭️ Skipping command in text handler: ${text}`);
        return true;
    }
    if (await deps.registrationModule.handleMessage(ctx)) {
        return true;
    }
    const player = await deps.getPlayerByTelegramId(String(ctx.from.id));
    if (!player) {
        await ctx.reply('Usa /start para comenzar tu aventura.');
        return true;
    }
    return false;
};
