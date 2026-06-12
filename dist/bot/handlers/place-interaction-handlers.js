import { InlineKeyboard } from 'grammy';
import { EMOJIS } from '../../data/emojis.js';
function getCurrencyLabel(costType, lang) {
    if (costType === 'GOLD') {
        return lang === 'en' ? 'gold' : lang === 'ru' ? 'zoloto' : 'oro';
    }
    return lang === 'en' ? 'silver' : lang === 'ru' ? 'serebro' : 'plata';
}
export function createPlaceInteractionHandlers(deps) {
    const finalizeActiveRecovery = async (params) => {
        const startedAt = Date.now();
        try {
            const result = await deps.finalizeRecoveryState({
                tgId: params.tgId,
                interrupted: params.interrupted,
                expectedToken: params.expectedToken,
            });
            if (!result) {
                return;
            }
            const active = result.active;
            const lang = result.language;
            const statEmoji = active.effectType === 'ENERGY' ? EMOJIS.ui.stamina : EMOJIS.ui.heart;
            const statCode = active.effectType === 'ENERGY' ? 'STA' : 'HP';
            const completionTitle = params.interrupted
                ? deps.t3(lang, '⏹️ Recuperación interrumpida.', '⏹️ Recovery interrupted.', '⏹️ Vosstanovlenie prervano.')
                : deps.t3(lang, '✅ Recuperación completada.', '✅ Recovery complete.', '✅ Vosstanovlenie zaversheno.');
            const lines = [
                active.serviceName,
                '✧═══••═══✧',
                active.lore,
                completionTitle,
                `${statEmoji} ${statCode}: ${result.previousValue}/${active.maxValue} → ${result.nextValue}/${active.maxValue}`,
                `${EMOJIS.ui.gold} ${result.gold}  | ${EMOJIS.ui.silver} ${result.silver}`,
            ].filter((line) => line && String(line).trim().length > 0);
            const keyboard = new InlineKeyboard()
                .text(`🏰 ${deps.t(lang, 'mapBuildingsTitle')}`, 'inspect_place_open_buildings')
                .text(`🗺 ${deps.t(lang, 'inspectViewMap')}`, 'arrival_map');
            if (params.editCtx && typeof params.editCtx.editMessageText === 'function') {
                await params.editCtx.editMessageText(lines.join('\n'), {
                    reply_markup: keyboard,
                });
                return;
            }
            await deps.bot.api.sendMessage(result.chatId, lines.join('\n'), {
                reply_markup: keyboard,
            });
        }
        finally {
            deps.observePerf('recovery.finalize', Date.now() - startedAt);
        }
    };
    const startPlaceRecovery = async (params) => {
        const startedAt = Date.now();
        try {
            const pending = await deps.getActivePlaceRecoveryByTgId(params.tgId);
            if (pending && pending.endsAt > Date.now()) {
                const remaining = deps.getRecoveryRemainingSeconds(pending);
                await params.ctx.answerCallbackQuery(deps.t3(params.lang, `Ya tienes una recuperación en curso (${deps.formatRemainingTime(remaining)}).`, `You already have an active recovery (${deps.formatRemainingTime(remaining)}).`, `U tebya uzhe est aktivnoe vosstanovlenie (${deps.formatRemainingTime(remaining)}).`));
                return false;
            }
            if (pending) {
                await deps.finalizeRecoveryState({
                    tgId: params.tgId,
                    interrupted: false,
                    expectedToken: pending.token,
                });
            }
            const freshPlayer = await deps.prisma.player.findUnique({
                where: { id: params.playerId },
                select: {
                    hp: true,
                    maxHp: true,
                    energy: true,
                    maxEnergy: true,
                    silver: true,
                    gold: true,
                },
            });
            if (!freshPlayer) {
                await params.ctx.answerCallbackQuery(deps.t3(params.lang, 'Jugador no encontrado.', 'Player not found.', 'Igrok ne naiden.'));
                return false;
            }
            const startValue = params.effectType === 'ENERGY' ? freshPlayer.energy : freshPlayer.hp;
            const maxValue = params.effectType === 'ENERGY' ? freshPlayer.maxEnergy : freshPlayer.maxHp;
            if (startValue >= maxValue) {
                await params.ctx.answerCallbackQuery(params.effectType === 'ENERGY'
                    ? deps.t3(params.lang, 'Ya tienes STA al máximo.', 'STA is already full.', 'STA uzhe polnaya.')
                    : deps.t3(params.lang, 'Ya tienes HP al máximo.', 'HP is already full.', 'HP uzhe polnoe.'));
                return false;
            }
            let afterSilver = freshPlayer.silver;
            let afterGold = freshPlayer.gold;
            if (params.costAmount && params.costType) {
                const currentAmount = params.costType === 'SILVER' ? freshPlayer.silver : freshPlayer.gold;
                if (currentAmount < params.costAmount) {
                    await params.ctx.answerCallbackQuery(deps.t(params.lang, 'placeNotEnoughCurrency', {
                        currency: getCurrencyLabel(params.costType, params.lang),
                        current: currentAmount,
                        needed: params.costAmount,
                    }));
                    return false;
                }
                if (params.costType === 'SILVER') {
                    afterSilver = freshPlayer.silver - params.costAmount;
                    await deps.prisma.player.update({
                        where: { id: params.playerId },
                        data: { silver: { decrement: params.costAmount } },
                    });
                }
                else {
                    afterGold = freshPlayer.gold - params.costAmount;
                    await deps.prisma.player.update({
                        where: { id: params.playerId },
                        data: { gold: { decrement: params.costAmount } },
                    });
                }
            }
            const remainingToCap = Math.max(0, maxValue - startValue);
            const explicitGain = params.targetGain && params.targetGain > 0
                ? Math.min(params.targetGain, remainingToCap)
                : remainingToCap;
            const baseRate = params.ratePerSecond && params.ratePerSecond > 0
                ? params.ratePerSecond
                : explicitGain / Math.max(1, params.totalSeconds || 1);
            if (!Number.isFinite(baseRate) || baseRate <= 0) {
                await params.ctx.answerCallbackQuery(deps.t3(params.lang, 'No se pudo iniciar la recuperación.', 'Could not start recovery.', 'Ne udalos zapustit vosstanovlenie.'));
                return false;
            }
            const durationSeconds = params.totalSeconds && params.totalSeconds > 0
                ? Math.max(1, Math.ceil(params.totalSeconds))
                : Math.max(1, Math.ceil(remainingToCap / baseRate));
            const startedAt = Date.now();
            const endsAt = startedAt + durationSeconds * 1000;
            const token = `${params.slug}:${params.playerId}:${endsAt}`;
            const chatId = params.ctx.callbackQuery?.message?.chat.id ?? Number(params.tgId);
            const persisted = await deps.upsertActivePlaceRecovery({
                playerId: params.playerId,
                tgId: params.tgId,
                state: {
                    token,
                    slug: params.slug,
                    placeId: params.placeId,
                    buildingKey: params.buildingKey,
                    serviceName: params.serviceName,
                    lore: params.lore,
                    effectType: params.effectType,
                    startValue,
                    maxValue,
                    ratePerSecond: baseRate,
                    startedAt,
                    endsAt,
                    chatId,
                },
            });
            const canonicalWorldMap = await deps.getCanonicalWorldMap();
            const anchorPlayer = await deps.prisma.player.findUnique({
                where: { id: params.playerId },
                select: { mapX: true, mapY: true },
            });
            if (anchorPlayer) {
                await deps.setSoulAnchorForPlayer({
                    playerId: params.playerId,
                    worldMapId: canonicalWorldMap.id,
                    mapX: anchorPlayer.mapX,
                    mapY: anchorPlayer.mapY,
                    placeId: params.placeId,
                    placeLabel: params.serviceName,
                    sourceSlug: params.slug,
                });
            }
            const activeState = {
                token,
                slug: params.slug,
                placeId: params.placeId,
                buildingKey: params.buildingKey,
                serviceName: params.serviceName,
                lore: params.lore,
                effectType: params.effectType,
                startValue,
                maxValue,
                ratePerSecond: baseRate,
                startedAt,
                endsAt,
                chatId,
            };
            const active = persisted.token === token ? persisted : activeState;
            const interruptLabel = deps.getRecoveryInterruptLabel(params.slug, params.lang);
            const tipLine = deps.t3(params.lang, '💡 Mientras te recuperas no puedes hacer otras acciones. Interrumpe para continuar.', '💡 While recovering you cannot do other actions. Interrupt to continue.', '💡 Пока идет восстановление, другие действия недоступны. Прерви, чтобы продолжить.');
            const startLines = [
                params.serviceName,
                '✧═══••═══✧',
                `⏳ ${deps.t3(params.lang, 'Tiempo estimado', 'Estimated time', 'Primernoe vremya')}: ${deps.formatRemainingTime(durationSeconds)}`,
                tipLine,
                `${EMOJIS.ui.gold} ${afterGold}  | ${EMOJIS.ui.silver} ${afterSilver}`,
            ];
            const startKeyboard = new InlineKeyboard().text(`${params.slug.startsWith('gilded-rest') ? '🛌' : '⛔'} ${interruptLabel}`, 'recovery_interrupt');
            await params.ctx.answerCallbackQuery();
            await params.ctx.editMessageText(startLines.join('\n'), {
                reply_markup: startKeyboard,
            });
            void (async () => {
                try {
                    await deps.sleep(durationSeconds * 1000);
                    await finalizeActiveRecovery({
                        tgId: params.tgId,
                        interrupted: false,
                        expectedToken: active.token,
                    });
                }
                catch (error) {
                    console.error('❌ Recovery timer error:', error);
                }
            })();
            return true;
        }
        finally {
            deps.observePerf('recovery.start', Date.now() - startedAt);
        }
    };
    const handleCustomRecoveryService = async (ctx, placeId, buildingKey, serviceSlug) => {
        const tgId = String(ctx.callbackQuery.from.id);
        const player = await deps.getPlayerByTelegramId(tgId);
        if (!player) {
            await ctx.answerCallbackQuery(deps.t('es', 'errorNotRegistered'));
            return;
        }
        const lang = deps.getPlayerLanguage(player);
        if (!deps.CUSTOM_PLACE_FREE_SERVICES.has(serviceSlug)) {
            await ctx.answerCallbackQuery(deps.t(lang, 'placeInteractionMissing'));
            return;
        }
        const place = await deps.prisma.place.findUnique({
            where: { id: placeId },
        });
        if (!place || player.mapX !== place.coordX || player.mapY !== place.coordY) {
            await ctx.answerCallbackQuery(deps.t(lang, 'placeNotAt'));
            return;
        }
        const placeConfig = deps.getPlaceUiConfig(place.slug);
        const building = placeConfig?.buildings.find((entry) => entry.key === buildingKey) || null;
        const service = building?.services.find((entry) => entry.slug === serviceSlug) || null;
        if (!building || !service) {
            await ctx.answerCallbackQuery(deps.t(lang, 'placeInteractionMissing'));
            return;
        }
        const started = await startPlaceRecovery({
            ctx,
            tgId,
            playerId: player.id,
            lang,
            placeId,
            buildingKey,
            slug: serviceSlug,
            serviceName: deps.getLocalizedText(service.name, lang, service.name.es),
            lore: service.resultLore ? deps.getLocalizedText(service.resultLore, lang, '') : '',
            effectType: deps.getRecoveryEffectTypeFromSlug(serviceSlug),
            ratePerSecond: deps.FREE_RECOVERY_RATE_PER_SECOND,
            totalSeconds: 0,
            costType: null,
            costAmount: 0,
        });
        if (!started) {
            return;
        }
    };
    const handlePlaceInteraction = async (ctx, interactionId) => {
        const tgId = String(ctx.from.id);
        const player = await deps.getPlayerByTelegramId(tgId);
        if (!player) {
            await ctx.answerCallbackQuery(deps.t('es', 'errorNotRegistered'));
            return;
        }
        const lang = deps.getPlayerLanguage(player);
        const interaction = await deps.prisma.placeInteraction.findUnique({
            where: { id: interactionId },
            include: { place: true },
        });
        if (!interaction) {
            await ctx.answerCallbackQuery(deps.t(lang, 'placeInteractionMissing'));
            return;
        }
        if (player.mapX !== interaction.place.coordX || player.mapY !== interaction.place.coordY) {
            await ctx.answerCallbackQuery(deps.t(lang, 'placeNotAt'));
            return;
        }
        const placeConfig = deps.getPlaceUiConfig(interaction.place.slug);
        let serviceUi = null;
        let buildingKey = null;
        if (placeConfig) {
            for (const building of placeConfig.buildings) {
                for (const service of building.services) {
                    if (service.slug === interaction.slug) {
                        serviceUi = {
                            name: deps.getLocalizedText(service.name, lang, interaction.displayName),
                            lore: service.resultLore ? deps.getLocalizedText(service.resultLore, lang, '') : '',
                        };
                        buildingKey = building.key;
                        break;
                    }
                }
                if (serviceUi) {
                    break;
                }
            }
        }
        const customResult = await deps.executeCustomPlaceInteraction({
            playerId: player.id,
            tgId,
            placeId: interaction.place.id,
            interaction: {
                slug: interaction.slug,
                costType: interaction.costType,
                costAmount: interaction.costAmount,
            },
            lang,
        });
        if (customResult.handled) {
            if (!customResult.success) {
                await ctx.answerCallbackQuery(customResult.errorMessage || deps.t(lang, 'uiErrorOccurred'));
                return;
            }
            if (interaction.slug === 'cave-expedition') {
                await ctx.answerCallbackQuery();
                const mapResult = await deps.renderMap(tgId);
                if (!mapResult) {
                    await ctx.editMessageText(customResult.effectMessage || deps.t(lang, 'uiErrorOccurred'));
                    return;
                }
                await deps.sendMapCardSafeViaContext({
                    ctx,
                    mode: 'edit',
                    text: deps.renderMapCardText(mapResult, lang),
                    keyboard: mapResult.keyboard,
                    source: 'place:cave-expedition-open-map',
                });
                return;
            }
            await ctx.answerCallbackQuery();
            const serviceName = serviceUi?.name || interaction.displayName;
            const loreLine = serviceUi?.lore ? `${serviceUi.lore}\n` : '';
            const resultLines = [
                `${serviceName}`,
                '✧═══••═══✧',
                loreLine.trim(),
                customResult.effectMessage || '',
                ...(customResult.extraLines || []),
                customResult.currencyLine || '',
            ].filter((line) => line && line.trim() !== '');
            const keyboard = new InlineKeyboard();
            keyboard.text(`↩ ${deps.t(lang, 'placeBack')}`, 'place_back');
            keyboard.text(`🚪 ${deps.t(lang, 'placeExit')}`, 'place_exit');
            await ctx.editMessageText(resultLines.join('\n'), {
                reply_markup: keyboard,
            });
            return;
        }
        const timedRecoverySeconds = deps.getTimedPlaceRecoverySeconds(interaction.slug);
        if (timedRecoverySeconds &&
            (interaction.effectType === 'ENERGY' || interaction.effectType === 'HP')) {
            const maxGain = interaction.instantFull
                ? interaction.effectType === 'ENERGY'
                    ? Math.max(0, player.maxEnergy - player.energy)
                    : Math.max(0, player.maxHp - player.hp)
                : Math.max(1, interaction.effectValue || 0);
            await startPlaceRecovery({
                ctx,
                tgId,
                playerId: player.id,
                lang,
                placeId: interaction.place.id,
                buildingKey: buildingKey || (interaction.slug.startsWith('mercy-edge') ? 'mercy-edge' : 'gilded-rest'),
                slug: interaction.slug,
                serviceName: serviceUi?.name || interaction.displayName,
                lore: serviceUi?.lore || '',
                effectType: interaction.effectType,
                totalSeconds: timedRecoverySeconds,
                targetGain: maxGain,
                costType: interaction.costType,
                costAmount: interaction.costAmount,
            });
            return;
        }
        if (interaction.costAmount && interaction.costType) {
            const currentAmount = interaction.costType === 'SILVER' ? player.silver : player.gold;
            if (currentAmount < interaction.costAmount) {
                await ctx.answerCallbackQuery(deps.t(lang, 'placeNotEnoughCurrency', {
                    currency: getCurrencyLabel(interaction.costType, lang),
                    current: currentAmount,
                    needed: interaction.costAmount,
                }));
                return;
            }
            if (interaction.costType === 'SILVER') {
                await deps.prisma.player.update({
                    where: { tgId },
                    data: { silver: { decrement: interaction.costAmount } },
                });
            }
            else {
                await deps.prisma.player.update({
                    where: { tgId },
                    data: { gold: { decrement: interaction.costAmount } },
                });
            }
        }
        let effectMessage = '';
        const afterSilver = interaction.costType === 'SILVER'
            ? player.silver - (interaction.costAmount || 0)
            : player.silver;
        const afterGold = interaction.costType === 'GOLD' ? player.gold - (interaction.costAmount || 0) : player.gold;
        if (interaction.effectType === 'ENERGY') {
            const newEnergy = interaction.instantFull
                ? player.maxEnergy
                : Math.min(player.energy + (interaction.effectValue || player.maxEnergy), player.maxEnergy);
            await deps.prisma.player.update({
                where: { tgId },
                data: { energy: newEnergy },
            });
            effectMessage = `${EMOJIS.ui.stamina} STA: ${player.energy}/${player.maxEnergy} → ${newEnergy}/${player.maxEnergy}`;
        }
        else if (interaction.effectType === 'HP') {
            const newHp = interaction.instantFull
                ? player.maxHp
                : Math.min(player.hp + (interaction.effectValue || player.maxHp), player.maxHp);
            await deps.prisma.player.update({
                where: { tgId },
                data: { hp: newHp },
            });
            effectMessage = `${EMOJIS.ui.heart} HP: ${player.hp}/${player.maxHp} → ${newHp}/${player.maxHp}`;
        }
        await ctx.answerCallbackQuery();
        const serviceName = serviceUi?.name || interaction.displayName;
        const loreLine = serviceUi?.lore ? `${serviceUi.lore}\n` : '';
        const currencyLine = interaction.costType === 'GOLD'
            ? `${EMOJIS.ui.gold} ${afterGold}`
            : `${EMOJIS.ui.silver} ${afterSilver}`;
        const resultLines = [
            `${serviceName}`,
            '✧═══••═══✧',
            loreLine.trim(),
            effectMessage,
            currencyLine,
        ].filter((line) => line && line.trim() !== '');
        const keyboard = new InlineKeyboard();
        keyboard.text(`↩ ${deps.t(lang, 'placeBack')}`, 'place_back');
        keyboard.text(`🚪 ${deps.t(lang, 'placeExit')}`, 'place_exit');
        await ctx.editMessageText(resultLines.join('\n'), {
            reply_markup: keyboard,
        });
    };
    return {
        finalizeActiveRecovery,
        startPlaceRecovery,
        handleCustomRecoveryService,
        handlePlaceInteraction,
    };
}
