// @ts-nocheck
import { InlineKeyboard } from 'grammy';
import { getPlayerByTelegramId, prisma } from '../../lib/db.js';
import { t } from '../../lib/i18n.js';
import { compactText } from '../../lib/ui-compact.js';
import { getForgeServiceCost } from '../../data/price-index.js';
import { getForgeSellEntries, sellAllForgeEntries, sellForgeEntry } from '../../services/forge-shop.js';
import { clearConversationState, getConversationState, setConversationState } from '../../lib/conversation-state.js';
function getPlayerLanguage(player) {
    return player?.language ?? 'es';
}
async function isPlayerAtPlaceById(player, placeId) {
    const place = await prisma.place.findUnique({
        where: { id: placeId },
        select: { coordX: true, coordY: true },
    });
    if (!place) {
        return false;
    }
    return player.mapX === place.coordX && player.mapY === place.coordY;
}
function buildForgeSellListKeyboard(placeId, buildingKey) {
    return new InlineKeyboard()
        .text('🛒 Tienda', `forge_shop:${placeId}|${buildingKey}`)
        .text('↩ Forja', `place_building:${placeId}|${buildingKey}`);
}
function buildForgeSellConfirmKeyboard(scope) {
    const confirmData = scope === 'all' ? 'forge_sell_confirm_all' : 'forge_sell_confirm_single';
    return new InlineKeyboard()
        .text('✅ Confirmar', confirmData)
        .text('❌ Cancelar', 'forge_sell_cancel');
}
function buildForgeSellSingleConfirmText(entry, quantity) {
    const safeQty = Math.max(1, Math.min(quantity, entry.quantity));
    const total = entry.unitSilver * safeQty;
    return [
        '⚠️ Confirmar venta',
        '✧═══••═══✧',
        `${entry.emoji} ${entry.name} x${safeQty}`,
        `Ganancia: +${total} 🪙`,
        'Esta accion no se puede deshacer.',
    ].join('\n');
}
function buildForgeSellAllConfirmText(totalSilver, totalEntries) {
    return [
        '⚠️ Confirmar venta total',
        '✧═══••═══✧',
        `Items vendibles: ${totalEntries}`,
        `Ganancia estimada: +${totalSilver} 🪙`,
        'Esta accion no se puede deshacer.',
    ].join('\n');
}
export function createForgeModule() {
    const FORGE_SCOPE = 'forge';
    async function getForgeState(playerTgId) {
        return getConversationState(FORGE_SCOPE, playerTgId);
    }
    async function setForgeState(playerTgId, state) {
        await setConversationState(FORGE_SCOPE, playerTgId, state, 30 * 60);
    }
    async function clearForgeState(playerTgId) {
        await clearConversationState(FORGE_SCOPE, playerTgId);
    }
    async function renderForgeSellList(ctx, params) {
        const entries = await getForgeSellEntries(params.playerId);
        if (entries.length === 0) {
            await clearForgeState(params.tgNumericId);
            const text = [
                '🛒 Tienda del Cuervo | Venta',
                '✧═══••═══✧',
                'No tienes articulos vendibles en la mochila activa.',
                'Tip: todo lo equipado no se puede vender.',
            ].join('\n');
            const payload = { reply_markup: buildForgeSellListKeyboard(params.placeId, params.buildingKey) };
            if (params.mode === 'edit' && typeof ctx.editMessageText === 'function') {
                await ctx.editMessageText(text, payload);
            }
            else {
                await ctx.reply(text, payload);
            }
            return;
        }
        await setForgeState(params.tgNumericId, {
            phase: 'listing',
            placeId: params.placeId,
            buildingKey: params.buildingKey,
            entries,
        });
        const lines = [
            '🛒 Tienda del Cuervo | Venta',
            '✧═══••═══✧',
            'Todo menos lo equipado es vendible.',
            '',
            '📄Vendible',
            '┌────────┐',
        ];
        for (const entry of entries) {
            const marker = entry.listIndex === entries.length ? '└' : '├';
            const code = String(entry.listIndex).padStart(2, '0');
            const qtyLabel = entry.quantity > 1 ? ` x${entry.quantity}` : '';
            lines.push(`${marker} #${code} ${entry.emoji} ${compactText(entry.name, 16)}${qtyLabel}  /v_${entry.listIndex} (+${entry.totalSilver}🪙)`);
        }
        const total = entries.reduce((sum, entry) => sum + entry.totalSilver, 0);
        lines.push('');
        lines.push(`/s_all  (+${total}🪙)`);
        lines.push('Confirma antes de vender.');
        if (params.infoLine) {
            lines.push('');
            lines.push(params.infoLine);
        }
        const payload = { reply_markup: buildForgeSellListKeyboard(params.placeId, params.buildingKey) };
        if (params.mode === 'edit' && typeof ctx.editMessageText === 'function') {
            await ctx.editMessageText(lines.join('\n'), payload);
        }
        else {
            await ctx.reply(lines.join('\n'), payload);
        }
    }
    async function handleForgeShop(ctx, placeId, buildingKey) {
        const tgId = String(ctx.from.id);
        const player = await getPlayerByTelegramId(tgId);
        if (!player) {
            await ctx.answerCallbackQuery(t('es', 'errorNotRegistered'));
            return;
        }
        const lang = getPlayerLanguage(player);
        const place = await prisma.place.findUnique({
            where: { id: placeId },
            include: {
                interactions: {
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });
        if (!place || player.mapX !== place.coordX || player.mapY !== place.coordY) {
            await ctx.answerCallbackQuery(t(lang, 'placeNotAt'));
            return;
        }
        if (buildingKey !== 'crow-forge') {
            await ctx.answerCallbackQuery(t(lang, 'placeInteractionMissing'));
            return;
        }
        const lines = [
            '🛒 Tienda del Cuervo',
            '✧═══••═══✧',
            'Compra herramientas basicas o vende botin de tu mochila activa.',
            '',
            '📄Compra',
            '┌────────┐',
        ];
        const keyboard = new InlineKeyboard();
        const buyInteractions = place.interactions.filter((entry) => entry.slug === 'crow-forge-buy-pick' ||
            entry.slug === 'crow-forge-buy-axe' ||
            entry.slug === 'crow-forge-buy-fishing-rod');
        buyInteractions.forEach((interaction, index) => {
            const marker = index === buyInteractions.length - 1 ? '└' : '├';
            const serviceName = interaction.slug === 'crow-forge-buy-pick'
                ? 'Pico de Piedra'
                : interaction.slug === 'crow-forge-buy-axe'
                    ? 'Hacha de Piedra'
                    : 'Cana de Bambu';
            const cost = getForgeServiceCost(interaction.slug, interaction.costAmount ?? 8);
            lines.push(`${marker} ${interaction.emoji} ${serviceName}: ${cost} 🪙`);
            keyboard.text(`${interaction.emoji} ${serviceName}`, `place_interact_${interaction.id}`);
            if ((index + 1) % 2 === 0 && index < buyInteractions.length - 1) {
                keyboard.row();
            }
        });
        if (buyInteractions.length === 0) {
            lines.push('└ Sin compras disponibles');
        }
        keyboard.row()
            .text('💰 Vender', `forge_sell_open:${placeId}|${buildingKey}`)
            .text('↩ Forja', `place_building:${placeId}|${buildingKey}`);
        await ctx.answerCallbackQuery();
        await ctx.editMessageText(lines.join('\n'), {
            reply_markup: keyboard,
        });
    }
    async function handleCallback(ctx, callbackData) {
        if (callbackData.startsWith('forge_shop:')) {
            const payload = callbackData.replace('forge_shop:', '');
            const [placeIdRaw, buildingKey] = payload.split('|');
            const placeId = Number(placeIdRaw);
            if (Number.isFinite(placeId) && buildingKey) {
                await handleForgeShop(ctx, placeId, buildingKey);
            }
            else {
                await ctx.answerCallbackQuery(t('es', 'placeInteractionMissing'));
            }
            return true;
        }
        if (callbackData.startsWith('forge_sell_open:')) {
            const payload = callbackData.replace('forge_sell_open:', '');
            const [placeIdRaw, buildingKey] = payload.split('|');
            const placeId = Number(placeIdRaw);
            const player = await getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
            if (!player || !Number.isFinite(placeId) || !buildingKey) {
                await ctx.answerCallbackQuery(t('es', 'placeInteractionMissing'));
                return true;
            }
            if (!(await isPlayerAtPlaceById(player, placeId))) {
                await ctx.answerCallbackQuery(t(getPlayerLanguage(player), 'placeNotAt'));
                return true;
            }
            const lang = getPlayerLanguage(player);
            await ctx.answerCallbackQuery();
            await renderForgeSellList(ctx, {
                mode: 'edit',
                playerId: player.id,
                tgNumericId: ctx.callbackQuery.from.id,
                placeId,
                buildingKey,
                lang,
            });
            return true;
        }
        if (callbackData === 'forge_sell_cancel') {
            const state = await getForgeState(ctx.callbackQuery.from.id);
            if (!state) {
                await ctx.answerCallbackQuery('Abre la venta de forja primero.');
                return true;
            }
            const player = await getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
            if (!player) {
                await clearForgeState(ctx.callbackQuery.from.id);
                await ctx.answerCallbackQuery(t('es', 'errorNotRegistered'));
                return true;
            }
            if (!(await isPlayerAtPlaceById(player, state.placeId))) {
                await clearForgeState(ctx.callbackQuery.from.id);
                await ctx.answerCallbackQuery(t(getPlayerLanguage(player), 'placeNotAt'));
                return true;
            }
            const lang = getPlayerLanguage(player);
            await ctx.answerCallbackQuery('Venta cancelada');
            await renderForgeSellList(ctx, {
                mode: 'edit',
                playerId: player.id,
                tgNumericId: ctx.callbackQuery.from.id,
                placeId: state.placeId,
                buildingKey: state.buildingKey,
                lang,
                infoLine: '❌ Venta cancelada.',
            });
            return true;
        }
        if (callbackData === 'forge_sell_confirm_single') {
            const state = await getForgeState(ctx.callbackQuery.from.id);
            if (!state || state.phase !== 'confirm_single') {
                await ctx.answerCallbackQuery('No hay venta individual pendiente.');
                return true;
            }
            const player = await getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
            if (!player) {
                await clearForgeState(ctx.callbackQuery.from.id);
                await ctx.answerCallbackQuery(t('es', 'errorNotRegistered'));
                return true;
            }
            if (!(await isPlayerAtPlaceById(player, state.placeId))) {
                await clearForgeState(ctx.callbackQuery.from.id);
                await ctx.answerCallbackQuery(t(getPlayerLanguage(player), 'placeNotAt'));
                return true;
            }
            const lang = getPlayerLanguage(player);
            await ctx.answerCallbackQuery();
            const result = await sellForgeEntry(player.id, state.entry.slotUid, state.quantity);
            await renderForgeSellList(ctx, {
                mode: 'edit',
                playerId: player.id,
                tgNumericId: ctx.callbackQuery.from.id,
                placeId: state.placeId,
                buildingKey: state.buildingKey,
                lang,
                infoLine: result.message,
            });
            return true;
        }
        if (callbackData === 'forge_sell_confirm_all') {
            const state = await getForgeState(ctx.callbackQuery.from.id);
            if (!state || state.phase !== 'confirm_all') {
                await ctx.answerCallbackQuery('No hay venta total pendiente.');
                return true;
            }
            const player = await getPlayerByTelegramId(String(ctx.callbackQuery.from.id));
            if (!player) {
                await clearForgeState(ctx.callbackQuery.from.id);
                await ctx.answerCallbackQuery(t('es', 'errorNotRegistered'));
                return true;
            }
            if (!(await isPlayerAtPlaceById(player, state.placeId))) {
                await clearForgeState(ctx.callbackQuery.from.id);
                await ctx.answerCallbackQuery(t(getPlayerLanguage(player), 'placeNotAt'));
                return true;
            }
            const lang = getPlayerLanguage(player);
            await ctx.answerCallbackQuery();
            const result = await sellAllForgeEntries(player.id);
            await renderForgeSellList(ctx, {
                mode: 'edit',
                playerId: player.id,
                tgNumericId: ctx.callbackQuery.from.id,
                placeId: state.placeId,
                buildingKey: state.buildingKey,
                lang,
                infoLine: result.message,
            });
            return true;
        }
        return false;
    }
    async function handleMessage(ctx, text) {
        const tgId = ctx.from.id;
        const forgeSellState = await getForgeState(tgId);
        if (forgeSellState) {
            const player = await getPlayerByTelegramId(String(tgId));
            if (!player) {
                await clearForgeState(tgId);
                await ctx.reply('❌ No estás registrado. Usa /start');
                return true;
            }
            if (!(await isPlayerAtPlaceById(player, forgeSellState.placeId))) {
                await clearForgeState(tgId);
                await ctx.reply('Saliste de la forja. Abre de nuevo la venta cuando regreses.');
                return true;
            }
            const lang = getPlayerLanguage(player);
            const trimmed = text.trim();
            const sellSingleMatch = trimmed.match(/^\/v_(\d+)(?:\.\.\.)?$/i);
            const isSellAll = /^\/s_all(?:\.\.\.)?$/i.test(trimmed);
            const isCancel = /^\/cancel(ar)?$/i.test(trimmed);
            if (forgeSellState.phase === 'listing') {
                if (isSellAll) {
                    const totalSilver = forgeSellState.entries.reduce((sum, entry) => sum + entry.totalSilver, 0);
                    await setForgeState(tgId, {
                        phase: 'confirm_all',
                        placeId: forgeSellState.placeId,
                        buildingKey: forgeSellState.buildingKey,
                        entries: forgeSellState.entries,
                        totalSilver,
                    });
                    await ctx.reply(buildForgeSellAllConfirmText(totalSilver, forgeSellState.entries.length), {
                        reply_markup: buildForgeSellConfirmKeyboard('all'),
                    });
                    return true;
                }
                if (sellSingleMatch) {
                    const listIndex = Number.parseInt(sellSingleMatch[1], 10);
                    const entry = forgeSellState.entries.find((candidate) => candidate.listIndex === listIndex);
                    if (!entry) {
                        await ctx.reply(`No existe /v_${listIndex} en la lista actual.`);
                        return true;
                    }
                    if (entry.quantity > 1) {
                        await setForgeState(tgId, {
                            phase: 'awaiting_qty',
                            placeId: forgeSellState.placeId,
                            buildingKey: forgeSellState.buildingKey,
                            entry,
                        });
                        await ctx.reply(`¿Cuántas unidades quieres vender de ${entry.emoji} ${entry.name}? (1-${entry.quantity})`);
                        return true;
                    }
                    await setForgeState(tgId, {
                        phase: 'confirm_single',
                        placeId: forgeSellState.placeId,
                        buildingKey: forgeSellState.buildingKey,
                        entry,
                        quantity: 1,
                    });
                    await ctx.reply(buildForgeSellSingleConfirmText(entry, 1), {
                        reply_markup: buildForgeSellConfirmKeyboard('single'),
                    });
                    return true;
                }
            }
            else if (forgeSellState.phase === 'awaiting_qty') {
                if (isCancel) {
                    await renderForgeSellList(ctx, {
                        mode: 'reply',
                        playerId: player.id,
                        tgNumericId: tgId,
                        placeId: forgeSellState.placeId,
                        buildingKey: forgeSellState.buildingKey,
                        lang,
                        infoLine: '❌ Venta cancelada.',
                    });
                    return true;
                }
                if (trimmed.startsWith('/')) {
                    await ctx.reply(`Escribe una cantidad entre 1 y ${forgeSellState.entry.quantity}, o /cancel.`);
                    return true;
                }
                const quantity = Number.parseInt(trimmed, 10);
                if (!Number.isFinite(quantity) || quantity < 1 || quantity > forgeSellState.entry.quantity) {
                    await ctx.reply(`Cantidad inválida. Elige entre 1 y ${forgeSellState.entry.quantity}.`);
                    return true;
                }
                await setForgeState(tgId, {
                    phase: 'confirm_single',
                    placeId: forgeSellState.placeId,
                    buildingKey: forgeSellState.buildingKey,
                    entry: forgeSellState.entry,
                    quantity,
                });
                await ctx.reply(buildForgeSellSingleConfirmText(forgeSellState.entry, quantity), {
                    reply_markup: buildForgeSellConfirmKeyboard('single'),
                });
                return true;
            }
            else if (forgeSellState.phase === 'confirm_single' || forgeSellState.phase === 'confirm_all') {
                if (isCancel) {
                    await renderForgeSellList(ctx, {
                        mode: 'reply',
                        playerId: player.id,
                        tgNumericId: tgId,
                        placeId: forgeSellState.placeId,
                        buildingKey: forgeSellState.buildingKey,
                        lang,
                        infoLine: '❌ Venta cancelada.',
                    });
                    return true;
                }
                await ctx.reply('Usa los botones para confirmar o cancelar la venta, o escribe /cancel.');
                return true;
            }
        }
        if (/^\/v_\d+(?:\.\.\.)?$/i.test(text.trim()) || /^\/s_all(?:\.\.\.)?$/i.test(text.trim())) {
            await ctx.reply('No hay venta activa. Entra a ⚒️ Forja del Cuervo > 🛒 Tienda > 💰 Vender.');
            return true;
        }
        return false;
    }
    return {
        handleCallback,
        handleMessage,
    };
}
//# sourceMappingURL=forge-module.js.map