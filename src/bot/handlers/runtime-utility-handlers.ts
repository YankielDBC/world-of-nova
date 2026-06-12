// @ts-nocheck
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export function getPlayerLanguage(player) {
    return player?.language ?? 'es';
}
export async function clearCallbackKeyboard(ctx) {
    const message = ctx.callbackQuery?.message;
    if (!message) {
        return;
    }
    try {
        await ctx.api.editMessageReplyMarkup(message.chat.id, message.message_id);
    }
    catch (error) {
        console.error('Could not clear inline keyboard:', error);
    }
}
export function t3(lang, es, en, ru) {
    if (lang === 'en') {
        return en;
    }
    if (lang === 'ru') {
        return ru;
    }
    return es;
}
export function createLowVitalsNotifier(deps) {
    return async function notifyLowVitalsIfNeeded(ctx, tgId) {
        try {
            const alert = await deps.consumeLowVitalsAlertByTgId(tgId);
            if (!alert) {
                return;
            }
            await ctx.reply(alert.text);
        }
        catch (error) {
            console.error('âŒ Low vitals notify error:', error);
        }
    };
}
