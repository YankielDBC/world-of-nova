import { getPlayerByTelegramId } from '../../lib/db.js';
import { getCanonicalWorldMap } from '../../services/world-map.js';
import { clearActivePveEncounter, getActivePveEncounterByPlayerId, getActivePveEncounterByTgId, getActivePveEncounterViewByPlayerId, getCreatureScoutText, resolvePveAction, startPveEncounter, } from '../../services/pve-combat.js';
import { buildPveAbilityKeyboard, buildPveBlockedKeyboard, buildPveCombatKeyboard, buildPveOutcomeKeyboard, buildPveScoutKeyboard, renderPveAbilityMenu, renderPveCombatText, } from './pve-ui.js';
function t3(lang, es, en, ru) {
    if (lang === 'en')
        return en;
    if (lang === 'ru')
        return ru;
    return es;
}
function getPlayerLanguage(player) {
    return player?.language ?? 'es';
}
function isMessageNotModifiedError(error) {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes('message is not modified');
}
async function sendScreen(ctx, mode, text, keyboard) {
    if (mode === 'edit' && typeof ctx.editMessageText === 'function') {
        try {
            await ctx.editMessageText(text, { reply_markup: keyboard });
        }
        catch (error) {
            if (isMessageNotModifiedError(error))
                return;
            throw error;
        }
        return;
    }
    await ctx.reply(text, { reply_markup: keyboard });
}
export function createPveModule() {
    async function openScout(ctx, snapshot, mode) {
        const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
        const lang = getPlayerLanguage(player ?? undefined);
        const text = getCreatureScoutText(snapshot, lang);
        await sendScreen(ctx, mode, text, buildPveScoutKeyboard(lang, snapshot.id));
    }
    async function openCombatForPlayer(ctx, playerId, mode, infoLine) {
        const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
        const lang = getPlayerLanguage(player ?? undefined);
        const view = await getActivePveEncounterViewByPlayerId(playerId, lang);
        if (!view) {
            await sendScreen(ctx, mode, t3(lang, 'No tienes combate activo.', 'You do not have an active combat.', 'U tebya net aktivnogo boya.'), buildPveOutcomeKeyboard(lang));
            return;
        }
        await sendScreen(ctx, mode, renderPveCombatText(view, lang, infoLine), buildPveCombatKeyboard(lang));
    }
    async function openAbilityMenu(ctx, playerId, mode, kind, infoLine) {
        const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
        const lang = getPlayerLanguage(player ?? undefined);
        const view = await getActivePveEncounterViewByPlayerId(playerId, lang);
        if (!view) {
            await sendScreen(ctx, mode, t3(lang, 'No tienes combate activo.', 'You do not have an active combat.', 'U tebya net aktivnogo boya.'), buildPveOutcomeKeyboard(lang));
            return;
        }
        await sendScreen(ctx, mode, renderPveAbilityMenu(view, lang, kind, infoLine), buildPveAbilityKeyboard(view, lang, kind));
    }
    async function openByCommand(ctx) {
        const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
        if (!player) {
            await ctx.reply('❌ No estás registrado. Usa /start');
            return;
        }
        const lang = getPlayerLanguage(player);
        const active = await getActivePveEncounterByPlayerId(player.id);
        if (!active) {
            await ctx.reply(t3(lang, 'No tienes combate activo. Busca una criatura en /interact.', 'You do not have an active combat. Find a creature in /interact.', 'U tebya net aktivnogo boya. Naydi sushchestvo cherez /interact.'));
            return;
        }
        await openCombatForPlayer(ctx, player.id, 'reply');
    }
    async function handleStart(ctx, creatureId, mode) {
        const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
        if (!player) {
            if (ctx.callbackQuery)
                await ctx.answerCallbackQuery('❌ No estás registrado');
            return;
        }
        const lang = getPlayerLanguage(player);
        if (ctx.callbackQuery) {
            await ctx.answerCallbackQuery();
        }
        const worldMap = await getCanonicalWorldMap();
        const result = await startPveEncounter({
            playerId: player.id,
            worldMapId: worldMap.id,
            x: player.mapX,
            y: player.mapY,
            creatureId,
            lang,
        });
        if (!result.success) {
            await sendScreen(ctx, mode, result.message, buildPveBlockedKeyboard(lang));
            return;
        }
        await openCombatForPlayer(ctx, player.id, mode, result.message);
    }
    async function handleAction(ctx, action, mode) {
        const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
        if (!player) {
            if (ctx.callbackQuery)
                await ctx.answerCallbackQuery('❌ No estás registrado');
            return;
        }
        const lang = getPlayerLanguage(player);
        if (ctx.callbackQuery) {
            await ctx.answerCallbackQuery();
        }
        const result = await resolvePveAction({
            playerId: player.id,
            action,
            lang,
        });
        if (!result.success) {
            await openCombatForPlayer(ctx, player.id, mode, `⚠️ ${result.message}`);
            return;
        }
        if (result.outcome === 'active') {
            await openCombatForPlayer(ctx, player.id, mode, result.notice);
            return;
        }
        await clearActivePveEncounter(player.id);
        await sendScreen(ctx, mode, result.text, buildPveOutcomeKeyboard(lang));
    }
    async function handleCallback(ctx, callbackData) {
        if (callbackData === 'pve_resume') {
            const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
            if (!player)
                return true;
            await ctx.answerCallbackQuery();
            await openCombatForPlayer(ctx, player.id, 'edit');
            return true;
        }
        if (callbackData === 'pve_menu_build') {
            const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
            if (!player)
                return true;
            await ctx.answerCallbackQuery();
            await openAbilityMenu(ctx, player.id, 'edit', 'build');
            return true;
        }
        if (callbackData === 'pve_menu_racial') {
            const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
            if (!player)
                return true;
            await ctx.answerCallbackQuery();
            await openAbilityMenu(ctx, player.id, 'edit', 'racial');
            return true;
        }
        if (callbackData === 'pve_attack') {
            await handleAction(ctx, { kind: 'attack' }, 'edit');
            return true;
        }
        if (callbackData === 'pve_guard') {
            await handleAction(ctx, { kind: 'guard' }, 'edit');
            return true;
        }
        if (callbackData === 'pve_flee') {
            await handleAction(ctx, { kind: 'flee' }, 'edit');
            return true;
        }
        if (callbackData.startsWith('pve_build:')) {
            const key = callbackData.replace('pve_build:', '').trim().toLowerCase();
            if (!key)
                return true;
            await handleAction(ctx, { kind: 'build_skill', key }, 'edit');
            return true;
        }
        if (callbackData.startsWith('pve_racial:')) {
            const key = callbackData.replace('pve_racial:', '').trim().toLowerCase();
            if (!key)
                return true;
            await handleAction(ctx, { kind: 'racial_skill', key }, 'edit');
            return true;
        }
        if (callbackData.startsWith('pve_start:')) {
            const creatureId = Number.parseInt(callbackData.replace('pve_start:', ''), 10);
            if (!Number.isFinite(creatureId) || creatureId < 1) {
                await ctx.answerCallbackQuery('Criatura inválida.');
                return true;
            }
            await handleStart(ctx, creatureId, 'edit');
            return true;
        }
        if (callbackData.startsWith('creature_defeat:')) {
            const creatureId = Number.parseInt(callbackData.replace('creature_defeat:', ''), 10);
            if (!Number.isFinite(creatureId) || creatureId < 1) {
                await ctx.answerCallbackQuery('Criatura inválida.');
                return true;
            }
            await handleStart(ctx, creatureId, 'edit');
            return true;
        }
        return false;
    }
    async function renderBlockedPrompt(ctx) {
        const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
        const lang = getPlayerLanguage(player ?? undefined);
        const active = await getActivePveEncounterByTgId(String(ctx.from?.id || ''));
        if (!active)
            return false;
        const text = t3(lang, `⚔️ Sigues en combate con ${active.creature.displayName}.\n🚫 Mientras peleas no puedes usar otros comandos.\nUsa Reanudar para volver al duelo.`, `⚔️ You are still fighting ${active.creature.displayName}.\n🚫 Other commands are blocked during combat.\nUse Resume to return to the duel.`, `⚔️ Ty vse eshche dereshsya s ${active.creature.displayName}.\n🚫 Drugie komandy zablokirovany vo vremya boya.\nNazhmi Resume, chtoby vernutsya v duel.`);
        const keyboard = buildPveBlockedKeyboard(lang);
        if (ctx.callbackQuery) {
            await ctx.answerCallbackQuery(text);
            if (typeof ctx.editMessageText === 'function') {
                await sendScreen(ctx, 'edit', text, keyboard);
            }
        }
        else {
            await ctx.reply(text, { reply_markup: keyboard });
        }
        return true;
    }
    return {
        openScout,
        openByCommand,
        openCombatForPlayer,
        handleCallback,
        renderBlockedPrompt,
    };
}
