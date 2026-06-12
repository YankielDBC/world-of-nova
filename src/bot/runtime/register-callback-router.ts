// @ts-nocheck
import { handleRegistrationAndProfileCallbacks, handleVentureCallbacks, } from './callback-handlers/core-callback-handlers.js';
import { handleBagCallbacks } from './callback-handlers/bag-callback-handlers.js';
import { handleFeatureModuleCallbacks, handlePlaceCallbacks, } from './callback-handlers/place-callback-handlers.js';
import { handleInspectCallbacks, handleMapCallbacks, } from './callback-handlers/map-and-inspect-callback-handlers.js';
const DEBUG_CALLBACK_LOGS = ['1', 'true', 'yes', 'on'].includes(String(process.env.DEBUG_LOGS || '').toLowerCase());
const CALLBACK_HANDLERS = [
    handleRegistrationAndProfileCallbacks,
    handleVentureCallbacks,
    handlePlaceCallbacks,
    handleFeatureModuleCallbacks,
    handleBagCallbacks,
    handleMapCallbacks,
    handleInspectCallbacks,
];
export function registerCallbackRouter(bot, deps) {
    bot.on('callback_query:data', async (ctx) => {
        const callbackData = ctx.callbackQuery.data;
        const tgId = ctx.callbackQuery.from.id;
        if (DEBUG_CALLBACK_LOGS) {
            console.log(`🔘 Callback received: "${callbackData}" from ${tgId}`);
        }
        try {
            for (const handler of CALLBACK_HANDLERS) {
                if (await handler(ctx, callbackData, deps)) {
                    return;
                }
            }
        }
        catch (error) {
            console.error('❌ Callback error:', error);
            const player = await deps.getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
            const lang = deps.getPlayerLanguage(player ?? undefined);
            await deps.safeAnswerCallbackQuery(ctx, deps.t(lang, 'uiErrorOccurred'));
        }
    });
}
