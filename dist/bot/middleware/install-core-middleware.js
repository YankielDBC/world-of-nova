import { InlineKeyboard } from 'grammy';
function getUpdateMetricKey(ctx) {
    const callbackData = String(ctx.callbackQuery?.data || '').trim();
    if (callbackData) {
        const prefix = callbackData.includes(':') ? callbackData.split(':')[0] : callbackData;
        const compact = prefix.slice(0, 32).replace(/[^a-zA-Z0-9_-]/g, '_');
        return `update.callback.${compact || 'unknown'}`;
    }
    const text = String(ctx.message?.text || '').trim();
    if (text.startsWith('/')) {
        const token = text.split(/\s+/)[0] || '/unknown';
        const command = token.slice(1).split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_');
        return `update.command.${command || 'unknown'}`;
    }
    return 'update.message';
}
export function installCoreMiddleware(bot, deps) {
    bot.use(async (ctx, next) => {
        if (deps.debugLogsEnabled) {
            if (ctx.message) {
                console.log(`📩 Message from ${ctx.from?.id}: ${ctx.message.text}`);
            }
            if (ctx.callbackQuery) {
                console.log(`🔘 Callback from ${ctx.callbackQuery.from?.id}: ${ctx.callbackQuery.data}`);
            }
        }
        await next();
    });
    bot.use(async (ctx, next) => {
        const metricKey = getUpdateMetricKey(ctx);
        const startedAt = Date.now();
        try {
            await next();
        }
        finally {
            deps.observePerf(metricKey, Date.now() - startedAt);
        }
    });
    bot.use(async (ctx, next) => {
        const fromId = ctx.from?.id;
        if (!fromId) {
            await next();
            return;
        }
        try {
            await deps.touchPlayerActivity(String(fromId));
        }
        catch (error) {
            console.error('⚠️ player activity touch failed:', error);
        }
        await next();
    });
    bot.use(async (ctx, next) => {
        const fromId = ctx.from?.id;
        if (!fromId) {
            await next();
            return;
        }
        const tgId = String(fromId);
        const active = await deps.getActivePlaceRecoveryByTgId(tgId);
        if (!active) {
            await next();
            return;
        }
        const player = await deps.getPlayerByTelegramId(tgId);
        const lang = deps.getPlayerLanguage(player ?? undefined);
        if (active.endsAt <= Date.now()) {
            await deps.finalizeActiveRecovery({
                tgId,
                interrupted: false,
            });
            await next();
            return;
        }
        const callbackData = ctx.callbackQuery?.data || '';
        const messageText = (ctx.message && 'text' in ctx.message ? String(ctx.message.text || '') : '').trim().toLowerCase();
        const isInterruptCommand = messageText === '/despertar' ||
            messageText === '/interrumpir' ||
            messageText === '/interrupt' ||
            messageText === '/wake';
        const allowCallback = callbackData === 'recovery_interrupt' ||
            callbackData === 'recovery_focus';
        if (isInterruptCommand || allowCallback) {
            await next();
            return;
        }
        const remaining = deps.getRecoveryRemainingSeconds(active);
        const blockedText = deps.t3(lang, `Estás recuperándote (${deps.formatRemainingTime(remaining)}). Debes interrumpir para hacer otras acciones.`, `You are recovering (${deps.formatRemainingTime(remaining)}). Interrupt to do other actions.`, `Ty vosstanavlivaeshsya (${deps.formatRemainingTime(remaining)}). Prervi, chtoby delat drugie deistviya.`);
        if (ctx.callbackQuery) {
            await ctx.answerCallbackQuery(blockedText);
            return;
        }
        const keyboard = new InlineKeyboard().text(`${active.slug.startsWith('gilded-rest') ? '🛌' : '⛔'} ${deps.getRecoveryInterruptLabel(active.slug, lang)}`, 'recovery_interrupt');
        await ctx.reply(blockedText, { reply_markup: keyboard });
    });
    bot.use(async (ctx, next) => {
        const fromId = ctx.from?.id;
        if (!fromId) {
            await next();
            return;
        }
        const tgId = String(fromId);
        if (!(await deps.isPlayerGhostByTgId(tgId))) {
            await next();
            return;
        }
        const callbackData = String(ctx.callbackQuery?.data || '');
        const messageText = (ctx.message && 'text' in ctx.message ? String(ctx.message.text || '') : '').trim().toLowerCase();
        const allowCallback = callbackData === 'map_up' ||
            callbackData === 'map_down' ||
            callbackData === 'map_left' ||
            callbackData === 'map_right' ||
            callbackData === 'map_profile' ||
            callbackData === 'ghost_recover' ||
            callbackData === 'ghost_hint';
        const allowMessage = messageText === '/map' || messageText === '/profile';
        if (allowCallback || allowMessage) {
            await next();
            return;
        }
        const blockedText = (await deps.buildGhostBlockedText(tgId)) ||
            'Estas muerto. Solo puedes moverte en el plano astral y recuperar tu cuerpo.';
        if (ctx.callbackQuery) {
            await deps.safeAnswerCallbackQuery(ctx, blockedText);
            return;
        }
        await ctx.reply(blockedText);
    });
    bot.use(async (ctx, next) => {
        const fromId = ctx.from?.id;
        if (!fromId) {
            await next();
            return;
        }
        const callbackData = String(ctx.callbackQuery?.data || '');
        const messageText = (ctx.message && 'text' in ctx.message ? String(ctx.message.text || '') : '').trim().toLowerCase();
        const allowCallback = callbackData.startsWith('pve_') ||
            callbackData.startsWith('creature_defeat:');
        const allowMessage = messageText === '/combat';
        if (allowCallback || allowMessage) {
            await next();
            return;
        }
        const activeEncounter = await deps.getActivePveEncounterByTgId(String(fromId));
        if (!activeEncounter) {
            await next();
            return;
        }
        const handled = await deps.renderPveBlockedPrompt(ctx);
        if (handled) {
            return;
        }
        await next();
    });
    bot.use(async (ctx, next) => {
        if (deps.debugLogsEnabled && ctx.message && !ctx.message.text?.startsWith('/')) {
            console.log(`💬 Non-command message from ${ctx.from?.id}: ${ctx.message.text}`);
        }
        await next();
    });
}
