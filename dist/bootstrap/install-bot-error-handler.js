export function installBotErrorHandler(bot, deps) {
    bot.catch((err) => {
        const ctx = err.ctx;
        console.log('❌ Bot error:', deps.formatErrorForLog(err));
        const anyErr = err;
        const apiErr = anyErr?.error;
        if (apiErr?.method) {
            const payload = apiErr?.payload ?? {};
            const textPreview = typeof payload?.text === 'string'
                ? payload.text.slice(0, 180).replace(/\n/g, '\\n')
                : typeof payload?.caption === 'string'
                    ? payload.caption.slice(0, 180).replace(/\n/g, '\\n')
                    : '';
            const entitiesCount = Array.isArray(payload?.entities)
                ? payload.entities.length
                : Array.isArray(payload?.caption_entities)
                    ? payload.caption_entities.length
                    : 0;
            console.log(`❌ Bot error meta: method=${apiErr.method} entities=${entitiesCount} text="${textPreview}"`);
            deps.logMapDebug('bot.catch.api-error', {
                method: apiErr.method,
                entitiesCount,
                textPreview,
                parseMode: payload?.parse_mode || null,
            });
        }
        if (ctx.callbackQuery) {
            if (!err.message.includes('query is too old')) {
                ctx.answerCallbackQuery('⚠️ Error occurred').catch(() => { });
            }
        }
    });
    if (deps.debugLogsEnabled) {
        bot.on('message', (ctx) => {
            console.log(`📨 Message from ${ctx.from?.id}: ${ctx.message?.text}`);
        });
    }
}
