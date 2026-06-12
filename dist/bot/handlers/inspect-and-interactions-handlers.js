// @ts-nocheck
import { InlineKeyboard } from 'grammy';
import { EMOJIS } from '../../data/emojis.js';
import { compactCoordLabel, compactText } from '../../lib/ui-compact.js';
function getSkillReqEmoji(skillKey) {
    if (skillKey === 'chop') {
        return EMOJIS.tools.hachaPiedra;
    }
    if (skillKey === 'mine') {
        return EMOJIS.tools.picoPiedra;
    }
    if (skillKey === 'fish') {
        return EMOJIS.tools.canapez;
    }
    return EMOJIS.tools.canastaPaja;
}
function formatInspectNodeSummary(node) {
    const code = String(node.listIndex).padStart(2, '0');
    const req = `[${getSkillReqEmoji(node.requiredSkill)}${node.requiredLevel}]`;
    return `#${code} ${node.emoji} ${node.available}x ${compactText(node.displayName, 16)} ${req}`;
}
function buildInspectResultKeyboard(t, lang = 'es') {
    return new InlineKeyboard()
        .text(`🔎 ${t(lang, 'inspectViewResources')}`, 'result_view_resources')
        .text(`🗺 ${t(lang, 'inspectViewMap')}`, 'result_view_map');
}
function buildInspectNodePickerKeyboard(t, lang, action, nodes) {
    const keyboard = new InlineKeyboard();
    nodes.forEach((node, index) => {
        const code = String(node.listIndex).padStart(2, '0');
        keyboard.text(`#${code} ${node.emoji}x${node.available}`, `inspect_pick_node:${action}:${node.listIndex}`);
        if ((index + 1) % 3 === 0 && index < nodes.length - 1) {
            keyboard.row();
        }
    });
    keyboard.row().text(`🔙 ${t(lang, 'inspectBackResources')}`, 'inspect_back_resources');
    return keyboard;
}
function buildInspectQtyPickerKeyboard(t, lang, action, nodeIndex, maxQty) {
    const keyboard = new InlineKeyboard();
    for (let qty = 1; qty <= maxQty; qty += 1) {
        keyboard.text(String(qty), `inspect_pick_qty:${action}:${nodeIndex}:${qty}`);
        if (qty % 3 === 0 && qty < maxQty) {
            keyboard.row();
        }
    }
    keyboard.row().text(`🔙 ${t(lang, 'inspectBackNodes')}`, `inspect_action:${action}`);
    return keyboard;
}
export function createInspectAndInteractionsHandlers(deps) {
    const renderInspectResponse = async (ctx, mode = 'reply') => {
        const tgId = String(ctx.from?.id || ctx.callbackQuery?.from?.id);
        const rendered = await deps.renderInspectForPlayer(tgId);
        if (!rendered) {
            const message = '❌ No pude inspeccionar esta zona.';
            if (mode === 'edit' && typeof ctx.editMessageText === 'function') {
                await ctx.editMessageText(message);
            }
            else {
                await ctx.reply(message);
            }
            return;
        }
        const player = await deps.getPlayerByTelegramId(tgId);
        const lang = deps.getPlayerLanguage(player ?? undefined);
        let text = rendered.text;
        let keyboard = rendered.keyboard;
        if (rendered.isPlace) {
            const eventsLine = deps.t3(lang, '🎉 Eventos activos: ∅', '🎉 Active events: ∅', '🎉 Aktivnye sobytiya: ∅');
            text = `${text}\n\n${eventsLine}`;
            const active = await deps.getActivePlaceRecoveryByTgId(tgId);
            if (active && active.endsAt > Date.now()) {
                const remaining = deps.getRecoveryRemainingSeconds(active);
                const activeLine = deps.t3(lang, `⏳ Recuperación activa: ${active.serviceName} (${deps.formatRemainingTime(remaining)})`, `⏳ Active recovery: ${active.serviceName} (${deps.formatRemainingTime(remaining)})`, `⏳ Aktivnoe vosstanovlenie: ${active.serviceName} (${deps.formatRemainingTime(remaining)})`);
                text = `${text}\n${activeLine}`;
                if (!keyboard) {
                    keyboard = new InlineKeyboard();
                }
                keyboard
                    .row()
                    .text(`${active.slug.startsWith('gilded-rest') ? '🛌' : '🩹'} ${deps.getRecoveryFocusLabel(active.slug, lang)}`, 'recovery_focus');
            }
        }
        const payload = { reply_markup: keyboard };
        if (mode === 'edit' && typeof ctx.editMessageText === 'function' && !rendered.isPlace) {
            await ctx.editMessageText(text, payload);
            return;
        }
        await ctx.reply(text, payload);
    };
    const handleInspectFromMap = async (ctx) => {
        await deps.clearInspectState(String(ctx.callbackQuery.from.id));
        await ctx.answerCallbackQuery();
        await deps.clearCallbackKeyboard(ctx);
        await renderInspectResponse(ctx, 'edit');
    };
    const getCoordinateInteractionContext = async (tgId) => {
        const player = await deps.getPlayerByTelegramId(tgId);
        if (!player) {
            return null;
        }
        const lang = deps.getPlayerLanguage(player);
        const worldMap = await deps.getCanonicalWorldMap();
        const tile = await deps.getOrCreateTile(worldMap.id, player.mapX, player.mapY);
        const [merchant, population, creatures] = await Promise.all([
            deps.getMerchantSnapshotAtCoords({
                worldMapId: worldMap.id,
                x: player.mapX,
                y: player.mapY,
            }),
            deps.getTilePopulationAtCoords({
                currentPlayerId: player.id,
                x: player.mapX,
                y: player.mapY,
            }),
            deps.getCreatureSnapshotsAtCoords({
                worldMapId: worldMap.id,
                x: player.mapX,
                y: player.mapY,
                biomeName: tile.biome?.name || 'plains',
                biomeId: tile.biomeId ?? null,
                includeDead: false,
            }),
        ]);
        const interactions = [];
        for (const creature of creatures) {
            const categoryShort = creature.category === 'boss'
                ? 'Boss'
                : creature.category === 'elite'
                    ? 'Elite'
                    : creature.category === 'veteran'
                        ? 'Vet'
                        : 'Basic';
            interactions.push({
                listIndex: interactions.length + 1,
                kind: 'creature',
                emoji: creature.category === 'boss' ? '☠️' : creature.category === 'elite' ? '👹' : '🐾',
                label: `${compactText(creature.displayName, 13)} Lv ${creature.level} ${categoryShort}`,
                creature,
            });
        }
        if (merchant) {
            interactions.push({
                listIndex: interactions.length + 1,
                kind: 'merchant',
                emoji: '🕵️',
                label: lang === 'en'
                    ? 'Mysterious Merchant'
                    : lang === 'ru'
                        ? 'Tainstvennyy torgovets'
                        : 'Comerciante Misterioso',
            });
        }
        return {
            tgId,
            lang,
            x: player.mapX,
            y: player.mapY,
            interactions,
            nearbyActivePlayers: population.active,
            nearbyAfkPlayers: population.afk,
        };
    };
    const buildCoordinateInteractionKeyboard = (lang, interactions) => {
        const keyboard = new InlineKeyboard();
        interactions.forEach((entry, index) => {
            keyboard.text(`#${String(entry.listIndex).padStart(2, '0')} ${entry.emoji}`, `map_interact_pick:${entry.listIndex}`);
            if ((index + 1) % 3 === 0) {
                keyboard.row();
            }
        });
        keyboard.row().text(`🗺 ${deps.t(lang, 'inspectViewMap')}`, 'map_interact_back');
        return keyboard;
    };
    const renderCoordinateInteractions = async (ctx, mode) => {
        const context = await getCoordinateInteractionContext(String(ctx.from.id));
        if (!context) {
            const text = '❌ No pude leer interacciones de esta coordenada.';
            if (mode === 'edit' && typeof ctx.editMessageText === 'function') {
                await ctx.editMessageText(text);
            }
            else {
                await ctx.reply(text);
            }
            return;
        }
        const lines = [
            `🧩 ${deps.t3(context.lang, 'Interacciones', 'Interactions', 'Vzaimodeystviya')} ${compactCoordLabel(context.x, context.y)}`,
            '✧═══••═══✧',
        ];
        if (context.interactions.length === 0) {
            lines.push(deps.t3(context.lang, 'No hay eventos interactuables ahora mismo.', 'No interactable events right now.', 'Seichas net vzaimodeystviy.'));
        }
        else {
            lines.push('┌────────┐');
            context.interactions.forEach((entry, index) => {
                const marker = index === 0 ? '┌' : index === context.interactions.length - 1 ? '└' : '├';
                lines.push(`${marker} #${String(entry.listIndex).padStart(2, '0')} ${entry.emoji} ${compactText(entry.label, 18)} /ia_${entry.listIndex}`);
            });
        }
        if (context.nearbyActivePlayers + context.nearbyAfkPlayers > 0) {
            lines.push('');
            lines.push(`🔍 ${deps.t(context.lang, 'populationLabel')}: 🧍‍♂️${context.nearbyActivePlayers}   💤 ${context.nearbyAfkPlayers}`);
        }
        const keyboard = buildCoordinateInteractionKeyboard(context.lang, context.interactions);
        if (mode === 'edit' && typeof ctx.editMessageText === 'function') {
            await ctx.editMessageText(lines.join('\n'), { reply_markup: keyboard });
        }
        else {
            await ctx.reply(lines.join('\n'), { reply_markup: keyboard });
        }
    };
    const openCoordinateInteractionByIndex = async (ctx, listIndex, mode) => {
        const context = await getCoordinateInteractionContext(String(ctx.from.id));
        if (!context) {
            return false;
        }
        const selected = context.interactions.find((entry) => entry.listIndex === listIndex);
        if (!selected) {
            const missingText = deps.t3(context.lang, `No existe /ia_${listIndex} en esta coordenada.`, `No /ia_${listIndex} interaction exists on this coordinate.`, `Na etoj koordinate net /ia_${listIndex}.`);
            if (mode === 'edit') {
                await ctx.answerCallbackQuery(missingText);
            }
            else {
                await ctx.reply(missingText);
            }
            return false;
        }
        if (selected.kind === 'merchant') {
            if (mode === 'edit') {
                return deps.openMysteryMerchantByCallback(ctx);
            }
            await deps.openMysteryMerchantByCommand(ctx);
            return true;
        }
        if (selected.kind === 'creature' && selected.creature) {
            await deps.openPveScout(ctx, selected.creature, mode);
            return true;
        }
        return false;
    };
    const handleCreatureDefeat = async (ctx, creatureId) => {
        void creatureId;
        const tgId = String(ctx.callbackQuery?.from?.id || ctx.from?.id || '');
        const player = await deps.getPlayerByTelegramId(tgId);
        const lang = deps.getPlayerLanguage(player ?? undefined);
        await deps.safeAnswerCallbackQuery(ctx, deps.t3(lang, 'PvE en rediseño.', 'PvE being redesigned.', 'PvE pererabatyvaetsya.'));
        if (typeof ctx.reply === 'function') {
            await ctx.reply(deps.t3(lang, '⚠️ El botón de derrota instantánea fue retirado. El combate PvE real se está rediseñando para usar skills, turnos y decisiones de verdad.', '⚠️ The instant defeat button was removed. Real PvE combat is being redesigned around skills, turns, and real decisions.', '⚠️ Knopka mgnovennoy pobedy ubrana. Nastoyashchiy PvE pererabatyvaetsya pod navyki, khody i realnyye resheniya.'));
        }
    };
    const showResultMapDecision = async (ctx, tgId) => {
        const player = await deps.getPlayerByTelegramId(tgId);
        const lang = deps.getPlayerLanguage(player ?? undefined);
        const inspectData = await deps.getInspectNodesForPlayer(tgId);
        const remaining = inspectData?.nodes.filter((node) => node.available > 0) || [];
        if (remaining.length === 0) {
            await deps.openMapInCurrentMessage(ctx, tgId);
            return;
        }
        const preview = remaining.slice(0, 6).map((node) => `┌ ${formatInspectNodeSummary(node)}`);
        if (remaining.length > 6) {
            preview.push(`└ ...y ${remaining.length - 6} más.`);
        }
        const text = '⚠️ Aún tienes recursos para recoger:\n' +
            preview.join('\n') +
            '\n\n¿Seguro que quieres volver al mapa?';
        const keyboard = new InlineKeyboard()
            .text(`🔎 ${deps.t(lang, 'inspectViewResources')}`, 'result_view_resources')
            .text(`🗺 ${deps.t(lang, 'inspectViewMap')}`, 'result_view_map_force');
        await ctx.editMessageText(text, { reply_markup: keyboard });
    };
    const startInspectActionFlow = async (ctx, action) => {
        const tgId = String(ctx.callbackQuery.from.id);
        const player = await deps.getPlayerByTelegramId(tgId);
        const lang = deps.getPlayerLanguage(player ?? undefined);
        const inspectData = await deps.getInspectNodesForPlayer(tgId);
        if (!inspectData) {
            await ctx.answerCallbackQuery(deps.t(lang, 'inspectNoNodes'));
            return;
        }
        const hasActionNodes = inspectData.nodes.some((node) => node.action === action && node.available > 0);
        if (!hasActionNodes) {
            await ctx.answerCallbackQuery(deps.t(lang, 'inspectNoTargets'));
            return;
        }
        const actionNodes = inspectData.nodes.filter((node) => node.action === action && node.available > 0);
        if (actionNodes.length <= 6) {
            await ctx.answerCallbackQuery();
            const label = action === 'chop'
                ? deps.t(lang, 'inspectActionChop')
                : action === 'mine'
                    ? deps.t(lang, 'inspectActionMine')
                    : deps.t(lang, 'inspectActionGather');
            await ctx.editMessageText(`🎯 ${label}: ${deps.t(lang, 'inspectSelectResource')}`, {
                reply_markup: buildInspectNodePickerKeyboard(deps.t, lang, action, actionNodes),
            });
            return;
        }
        await deps.setInspectState(String(ctx.callbackQuery.from.id), { phase: 'awaiting_node', action });
        await ctx.answerCallbackQuery();
        await deps.clearCallbackKeyboard(ctx);
        const label = action === 'chop'
            ? deps.t(lang, 'inspectActionChop')
            : action === 'mine'
                ? deps.t(lang, 'inspectActionMine')
                : deps.t(lang, 'inspectActionGather');
        await ctx.reply(`🎯 ${deps.t(lang, 'inspectAskNodeManual', { action: label.toLowerCase() })}`);
    };
    const handleInspectNodePick = async (ctx, action, nodeIndex) => {
        const tgId = String(ctx.callbackQuery.from.id);
        const player = await deps.getPlayerByTelegramId(tgId);
        const lang = deps.getPlayerLanguage(player ?? undefined);
        if (!Number.isFinite(nodeIndex) || nodeIndex < 1) {
            await ctx.answerCallbackQuery(deps.t(lang, 'inspectInvalidNode'));
            return;
        }
        const inspectData = await deps.getInspectNodesForPlayer(tgId);
        if (!inspectData) {
            await ctx.answerCallbackQuery(deps.t(lang, 'inspectNoNodesShort'));
            return;
        }
        const node = inspectData.nodes.find((entry) => entry.action === action && entry.listIndex === nodeIndex && entry.available > 0);
        if (!node) {
            await ctx.answerCallbackQuery(deps.t(lang, 'inspectNodeUnavailable'));
            return;
        }
        await ctx.answerCallbackQuery();
        if (node.available <= 6) {
            await ctx.editMessageText(`📦 #${String(node.listIndex).padStart(2, '0')} ${node.emoji} ${compactText(node.displayName, 20)}\n${deps.t(lang, 'inspectHowManyActions')}`, {
                reply_markup: buildInspectQtyPickerKeyboard(deps.t, lang, action, node.listIndex, node.available),
            });
            return;
        }
        await deps.setInspectState(String(ctx.callbackQuery.from.id), {
            phase: 'awaiting_qty',
            action,
            nodeIndex: node.listIndex,
            maxQty: node.available,
        });
        await deps.clearCallbackKeyboard(ctx);
        await ctx.reply(deps.t(lang, 'inspectAskQtyManual', {
            node: String(node.listIndex).padStart(2, '0'),
            max: node.available,
        }));
    };
    const handleInspectQtyPick = async (ctx, action, nodeIndex, quantity) => {
        const tgId = ctx.callbackQuery.from.id;
        const player = await deps.getPlayerByTelegramId(String(tgId));
        const lang = deps.getPlayerLanguage(player ?? undefined);
        if (!Number.isFinite(nodeIndex) || nodeIndex < 1 || !Number.isFinite(quantity) || quantity < 1) {
            await ctx.answerCallbackQuery(deps.t(lang, 'inspectInvalidQty'));
            return;
        }
        await ctx.answerCallbackQuery(`⏳ ${deps.t(lang, 'uiWorking')}...`);
        let result;
        try {
            result = await deps.playerActionQueue.enqueueForKey(String(tgId), 'inspect_action', () => deps.executeInspectAction({
                playerTgId: String(tgId),
                action,
                listIndex: nodeIndex,
                quantity,
            }));
        }
        catch {
            await ctx.editMessageText(deps.t3(lang, 'Hay muchas acciones en cola. Intenta de nuevo en un momento.', 'Too many queued actions. Try again shortly.', 'Slishkom mnogo dejstvij v ocheredi. Poprobuj cherez mgnovenie.'), { reply_markup: buildInspectResultKeyboard(deps.t, lang) });
            return;
        }
        await deps.clearInspectState(String(tgId));
        await ctx.editMessageText(result.message, {
            reply_markup: buildInspectResultKeyboard(deps.t, lang),
        });
        await deps.notifyLowVitalsIfNeeded(ctx, String(tgId));
    };
    return {
        renderInspectResponse,
        handleInspectFromMap,
        buildInspectResultKeyboard: (lang = 'es') => buildInspectResultKeyboard(deps.t, lang),
        renderCoordinateInteractions,
        openCoordinateInteractionByIndex,
        handleCreatureDefeat,
        showResultMapDecision,
        startInspectActionFlow,
        handleInspectNodePick,
        handleInspectQtyPick,
    };
}
//# sourceMappingURL=inspect-and-interactions-handlers.js.map