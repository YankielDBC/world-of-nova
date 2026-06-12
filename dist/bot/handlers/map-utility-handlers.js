import { InlineKeyboard } from 'grammy';
export function isExpiredCallbackQueryError(error) {
    if (!error || typeof error !== 'object') {
        return false;
    }
    const description = error.description;
    if (typeof description !== 'string') {
        return false;
    }
    return description.includes('query is too old') || description.includes('query ID is invalid');
}
export function createSafeAnswerCallbackQuery(logMapDebug) {
    return async function safeAnswerCallbackQuery(ctx, text) {
        try {
            if (typeof text === 'string') {
                await ctx.answerCallbackQuery(text);
            }
            else {
                await ctx.answerCallbackQuery();
            }
        }
        catch (error) {
            if (isExpiredCallbackQueryError(error)) {
                logMapDebug('callback.answer.ignored', {
                    data: String(ctx?.callbackQuery?.data || ''),
                    message: error?.message || String(error),
                });
                return;
            }
            throw error;
        }
    };
}
export function installSafeCallbackAnswerMiddleware(bot, logMapDebug) {
    bot.use(async (ctx, next) => {
        if (!ctx.callbackQuery || typeof ctx.answerCallbackQuery !== 'function') {
            await next();
            return;
        }
        const originalAnswerCallbackQuery = ctx.answerCallbackQuery.bind(ctx);
        ctx.answerCallbackQuery = async (...args) => {
            try {
                return await originalAnswerCallbackQuery(...args);
            }
            catch (error) {
                if (isExpiredCallbackQueryError(error)) {
                    logMapDebug('callback.answer.ignored', {
                        data: String(ctx?.callbackQuery?.data || ''),
                        message: error?.message || String(error),
                    });
                    return true;
                }
                throw error;
            }
        };
        await next();
    });
}
export function createOpenMapInCurrentMessage(deps) {
    return async function openMapInCurrentMessage(ctx, tgId) {
        const mapResult = await deps.renderMap(tgId);
        if (!mapResult) {
            await ctx.editMessageText('❌ No pude abrir el mapa.');
            return;
        }
        const player = await deps.getPlayerByTelegramId(tgId);
        const lang = deps.getPlayerLanguage(player ?? undefined);
        const text = deps.renderMapCardText(mapResult, lang);
        await deps.sendMapCardSafeViaContext({
            ctx,
            mode: 'edit',
            text,
            keyboard: mapResult.keyboard,
            source: 'callback:open-map-current-message',
        });
    };
}
export function createGhostHandlers(deps) {
    return {
        handleGhostHint: async (ctx) => {
            const tgId = String(ctx.callbackQuery.from.id);
            const hint = await deps.getGhostHintText(tgId);
            await deps.safeAnswerCallbackQuery(ctx, hint || 'Tu cuerpo ya no responde desde aqui.');
        },
        handleGhostRecover: async (ctx) => {
            const tgId = String(ctx.callbackQuery.from.id);
            await deps.safeAnswerCallbackQuery(ctx);
            const result = await deps.recoverOwnCorpse(tgId);
            if (!result.success) {
                await ctx.reply(result.message);
                return;
            }
            const player = await deps.getPlayerByTelegramId(tgId);
            const lang = deps.getPlayerLanguage(player ?? undefined);
            await ctx.editMessageText(result.message, {
                reply_markup: new InlineKeyboard().text(`🗺 ${deps.t(lang, 'inspectViewMap')}`, 'arrival_map'),
            });
        },
    };
}
export function createMapMoveHandler(deps) {
    return async function handleMapMove(ctx, direction) {
        const tgId = String(ctx.callbackQuery.from.id);
        const player = await deps.getPlayerByTelegramId(tgId);
        if (!player) {
            await deps.safeAnswerCallbackQuery(ctx, deps.t('es', 'errorNotRegistered'));
            return;
        }
        const lang = deps.getPlayerLanguage(player ?? undefined);
        if (await deps.isPlayerGhostByTgId(tgId)) {
            const ghostMove = await deps.moveGhostPlayer(tgId, direction);
            if (!ghostMove.success) {
                await deps.safeAnswerCallbackQuery(ctx, ghostMove.message || 'No se pudo mover en el plano astral.');
                return;
            }
            await deps.safeAnswerCallbackQuery(ctx);
            await deps.openMapInCurrentMessage(ctx, tgId);
            return;
        }
        const activeCave = await deps.getActiveCaveContextByTgId(tgId);
        if (activeCave) {
            const caveMove = await deps.movePlayerInCave(tgId, direction);
            if (!caveMove.success) {
                await deps.safeAnswerCallbackQuery(ctx, caveMove.message);
                return;
            }
            await deps.safeAnswerCallbackQuery(ctx);
            await deps.openMapInCurrentMessage(ctx, tgId);
            return;
        }
        if (await deps.hasPendingTravelJob(tgId)) {
            await deps.safeAnswerCallbackQuery(ctx, '⏳ Ya tienes un viaje en progreso.');
            return;
        }
        await deps.safeAnswerCallbackQuery(ctx);
        const result = await deps.movePlayer(tgId, direction);
        if (!result.success) {
            await ctx.reply('❌ ' + result.message);
            return;
        }
        const travelSeconds = Math.max(1, Math.ceil(result.travelTime));
        const travelMessage = deps.buildCountdownMessage({
            baseText: result.message,
            remainingSeconds: travelSeconds,
            totalSeconds: travelSeconds,
            etaLabel: `🕒 ${deps.t(lang, 'mapArrivalIn')}`,
        });
        await ctx.editMessageText(travelMessage);
        const chatId = ctx.callbackQuery.message?.chat.id;
        const messageId = ctx.callbackQuery.message?.message_id;
        if (typeof chatId === 'number') {
            await deps.enqueueMoveArrivalJob({
                tgId,
                playerId: player.id,
                chatId,
                fromX: result.fromX,
                fromY: result.fromY,
                toX: result.toX,
                toY: result.toY,
                energyCost: result.energyCost,
                isNewDiscovery: result.isNewDiscovery,
                arrivalMessage: result.arrivalMessage,
                placeArrival: result.placeArrival,
            }, travelSeconds + deps.travelArrivalBufferSeconds);
            if (typeof messageId === 'number') {
                deps.startTravelCountdownAnimation({
                    chatId,
                    messageId,
                    baseText: result.message,
                    totalSeconds: travelSeconds,
                    etaLabel: `🕒 ${deps.t(lang, 'mapArrivalIn')}`,
                });
            }
        }
    };
}
