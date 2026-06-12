// @ts-nocheck
import { InlineKeyboard } from 'grammy';
import { getPlayerByTelegramId } from '../../lib/db.js';
import { RACIAL_TALENT_CATEGORIES, getLocalizedText3, getRacialTalentByKey, } from '../../data/racial-talents.js';
import { canLearnTalent, ensureRacialTalentSchema, equipRacialTalent, getPlayerRacialTalentState, getRacialResetCost, getTalentsByCategory, learnRacialTalentRank, resetRacialTalents, unequipRacialTalent, } from '../../services/racial-talents.js';
import { getRacialGameplayEffectsForPlayer, invalidateRacialGameplayEffectsCache, } from '../../services/racial-effects.js';
import { renderRacialCategoryText, renderRacialHubText, renderRacialTalentDetailText, } from './racial-ui.js';
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
function shortLabel(text, max = 22) {
    if (text.length <= max)
        return text;
    return `${text.slice(0, Math.max(1, max - 1))}…`;
}
function isMessageNotModifiedError(error) {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes('message is not modified');
}
function categoryIcon(category) {
    if (category === 'offense')
        return '⚔️';
    if (category === 'defense')
        return '🛡️';
    if (category === 'mobility')
        return '💨';
    if (category === 'utility')
        return '🧰';
    if (category === 'active')
        return '✨';
    return '👑';
}
async function sendScreen(ctx, mode, message, keyboard) {
    if (mode === 'edit' && typeof ctx.editMessageText === 'function') {
        try {
            await ctx.editMessageText(message, { reply_markup: keyboard });
        }
        catch (error) {
            if (isMessageNotModifiedError(error)) {
                return;
            }
            throw error;
        }
        return;
    }
    await ctx.reply(message, { reply_markup: keyboard });
}
function buildHubKeyboard(lang) {
    const keyboard = new InlineKeyboard();
    for (let i = 0; i < RACIAL_TALENT_CATEGORIES.length; i += 1) {
        const category = RACIAL_TALENT_CATEGORIES[i];
        keyboard.text(`${categoryIcon(category.key)} ${getLocalizedText3(category.label, lang)}`, `racial_tab:${category.key}`);
        if (i % 2 === 1 && i < RACIAL_TALENT_CATEGORIES.length - 1) {
            keyboard.row();
        }
    }
    keyboard.row().text(`♻️ ${t3(lang, 'Reset', 'Reset', 'Reset')}`, 'racial_reset_prompt');
    keyboard.text(`📋 ${t3(lang, 'Perfil', 'Profile', 'Profil')}`, 'cmd_profile');
    return keyboard;
}
function buildCategoryKeyboard(state, category, lang) {
    const keyboard = new InlineKeyboard();
    const talents = getTalentsByCategory(state, category);
    for (let i = 0; i < talents.length; i += 1) {
        const talent = talents[i];
        const rank = state.ranksByKey[talent.key] || 0;
        const title = `${rank > 0 ? '🟢' : '▫️'} ${shortLabel(getLocalizedText3(talent.name, lang), 14)}`;
        keyboard.text(title, `racial_view:${talent.key}|${category}`);
        if (i % 2 === 1 && i < talents.length - 1) {
            keyboard.row();
        }
    }
    keyboard.row().text(`↩ ${t3(lang, 'Hub', 'Hub', 'Hub')}`, 'racial_hub');
    return keyboard;
}
function buildTalentKeyboard(state, talent, category, lang) {
    const keyboard = new InlineKeyboard();
    const rank = state.ranksByKey[talent.key] || 0;
    const canLearn = canLearnTalent(state, talent).ok;
    if (canLearn && rank < talent.maxRank) {
        keyboard.text(`➕ ${t3(lang, 'Aprender', 'Learn', 'Izuchit')}`, `racial_learn:${talent.key}|${category}`);
    }
    if (talent.type === 'active' && rank > 0) {
        keyboard.text('A1', `racial_equip1:${talent.key}|${category}`);
        keyboard.text('A2', `racial_equip2:${talent.key}|${category}`);
        keyboard.row();
        if (state.loadout.activeSlot1 === talent.key || state.loadout.activeSlot2 === talent.key) {
            keyboard.text(`✖ ${t3(lang, 'Quitar', 'Unequip', 'Snyat')}`, `racial_unequip_active:${talent.key}|${category}`);
            keyboard.row();
        }
    }
    if (talent.type === 'keystone' && rank > 0) {
        keyboard.text(`👑 ${t3(lang, 'Equipar', 'Equip', 'Nadet')}`, `racial_equipk:${talent.key}|${category}`);
        if (state.loadout.keystoneKey === talent.key) {
            keyboard.text(`✖ ${t3(lang, 'Quitar', 'Unequip', 'Snyat')}`, `racial_unequip_keystone:${category}`);
        }
        keyboard.row();
    }
    keyboard.text(`↩ ${t3(lang, 'Categoria', 'Category', 'Kategoriya')}`, `racial_tab:${category}`);
    keyboard.text(`🏠 ${t3(lang, 'Hub', 'Hub', 'Hub')}`, 'racial_hub');
    return keyboard;
}
function parseCallbackPayload(raw) {
    const [talentKeyRaw, categoryRaw] = raw.split('|');
    const talentKey = String(talentKeyRaw || '').trim().toLowerCase();
    const category = String(categoryRaw || '').trim().toLowerCase();
    if (!talentKey)
        return null;
    if (!RACIAL_TALENT_CATEGORIES.some((entry) => entry.key === category)) {
        return null;
    }
    return { talentKey, category };
}
function parseCategory(raw) {
    const normalized = String(raw || '').trim().toLowerCase();
    return RACIAL_TALENT_CATEGORIES.some((entry) => entry.key === normalized) ? normalized : null;
}
export function createRacialModule() {
    async function loadStateFromCtx(ctx) {
        const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
        if (!player) {
            await ctx.reply('❌ No estás registrado. Usa /start');
            return null;
        }
        const lang = getPlayerLanguage(player);
        try {
            const state = await getPlayerRacialTalentState(player.id);
            if (!state) {
                await ctx.reply('❌ No pude cargar tus talentos raciales.');
                return null;
            }
            return { player, state, lang };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (message.toLowerCase().includes('race')) {
                await ctx.reply(t3(lang, '⚠️ Aún no tienes raza seleccionada. Completa tu registro primero.', '⚠️ You do not have a race selected yet. Complete registration first.', '⚠️ U tebya poka net vybrannoy rasy. Snachala zavershi registratsiyu.'));
                return null;
            }
            throw error;
        }
    }
    async function openHub(ctx, mode, infoLine) {
        const context = await loadStateFromCtx(ctx);
        if (!context)
            return;
        const { player, state, lang } = context;
        const effects = await getRacialGameplayEffectsForPlayer(player.id);
        await sendScreen(ctx, mode, renderRacialHubText(state, effects, lang, infoLine), buildHubKeyboard(lang));
    }
    async function openCategory(ctx, mode, category, infoLine) {
        const context = await loadStateFromCtx(ctx);
        if (!context)
            return;
        const { state, lang } = context;
        await sendScreen(ctx, mode, renderRacialCategoryText(state, category, lang, infoLine), buildCategoryKeyboard(state, category, lang));
    }
    async function openTalent(ctx, mode, talentKey, category, infoLine) {
        const context = await loadStateFromCtx(ctx);
        if (!context)
            return;
        const { state, lang } = context;
        const talent = getRacialTalentByKey(talentKey);
        if (!talent || talent.race !== state.race) {
            await sendScreen(ctx, mode, t3(lang, 'Talento no encontrado para tu raza.', 'Talent not found for your race.', 'Talant ne nayden dlya tvoey rasy.'), new InlineKeyboard().text(`↩ ${t3(lang, 'Categoria', 'Category', 'Kategoriya')}`, `racial_tab:${category}`));
            return;
        }
        await sendScreen(ctx, mode, renderRacialTalentDetailText(state, talent, lang, infoLine), buildTalentKeyboard(state, talent, category, lang));
    }
    async function openResetPrompt(ctx, mode) {
        const context = await loadStateFromCtx(ctx);
        if (!context)
            return;
        const { state, lang } = context;
        const resetCost = getRacialResetCost(state.spentPoints);
        const text = [
            `♻️ ${t3(lang, 'Reset racial', 'Racial reset', 'Reset rasovogo')}`,
            '✧═══••═══✧',
            `${t3(lang, 'Gastado', 'Spent', 'Potracheno')}: ${state.spentPoints}`,
            `${t3(lang, 'Costo', 'Cost', 'Stoimost')}: ${resetCost} 🪙`,
            `${t3(lang, 'Plata', 'Silver', 'Serebro')}: ${state.silver} 🪙`,
            '',
            state.spentPoints > 0
                ? t3(lang, '¿Confirmas el reset? Borra rangos y loadout racial.', 'Confirm reset? This clears ranks and racial loadout.', 'Podtverzhdaesh reset? Rangi i rasoviy nabor budut ochishcheny.')
                : t3(lang, 'No hay puntos gastados. No necesitas reset.', 'There are no spent points. You do not need a reset.', 'Net potrachennykh ochkov. Reset ne nuzhen.'),
        ].join('\n');
        const keyboard = new InlineKeyboard();
        if (state.spentPoints > 0) {
            keyboard
                .text(`✅ ${t3(lang, 'Confirmar', 'Confirm', 'Podtverdit')}`, 'racial_reset_confirm')
                .text(`❌ ${t3(lang, 'Cancelar', 'Cancel', 'Otmena')}`, 'racial_hub');
        }
        else {
            keyboard.text(`↩ ${t3(lang, 'Volver', 'Back', 'Nazad')}`, 'racial_hub');
        }
        await sendScreen(ctx, mode, text, keyboard);
    }
    async function openByCommand(ctx) {
        await ensureRacialTalentSchema();
        await openHub(ctx, 'reply');
    }
    async function handleCallback(ctx, callbackData) {
        if (callbackData === 'cmd_racial') {
            await ctx.answerCallbackQuery();
            await openHub(ctx, 'edit');
            return true;
        }
        if (!callbackData.startsWith('racial_')) {
            return false;
        }
        await ensureRacialTalentSchema();
        await ctx.answerCallbackQuery();
        if (callbackData === 'racial_hub') {
            await openHub(ctx, 'edit');
            return true;
        }
        if (callbackData === 'racial_reset_prompt') {
            await openResetPrompt(ctx, 'edit');
            return true;
        }
        if (callbackData === 'racial_reset_confirm') {
            const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
            if (!player) {
                await ctx.reply('❌ No estás registrado. Usa /start');
                return true;
            }
            const lang = getPlayerLanguage(player);
            const reset = await resetRacialTalents(player.id);
            if (reset.success) {
                invalidateRacialGameplayEffectsCache(player.id);
            }
            if (!reset.success) {
                await openHub(ctx, 'edit', `⚠️ ${reset.message}`);
                return true;
            }
            await openHub(ctx, 'edit', `✅ ${reset.message}`);
            return true;
        }
        if (callbackData.startsWith('racial_tab:')) {
            const category = parseCategory(callbackData.replace('racial_tab:', ''));
            if (!category) {
                await openHub(ctx, 'edit', '⚠️ Categoría inválida.');
                return true;
            }
            await openCategory(ctx, 'edit', category);
            return true;
        }
        if (callbackData.startsWith('racial_view:')) {
            const payload = parseCallbackPayload(callbackData.replace('racial_view:', ''));
            if (!payload) {
                await openHub(ctx, 'edit', '⚠️ Talento inválido.');
                return true;
            }
            await openTalent(ctx, 'edit', payload.talentKey, payload.category);
            return true;
        }
        if (callbackData.startsWith('racial_learn:')) {
            const payload = parseCallbackPayload(callbackData.replace('racial_learn:', ''));
            if (!payload) {
                await openHub(ctx, 'edit', '⚠️ Talento inválido.');
                return true;
            }
            const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
            if (!player) {
                await ctx.reply('❌ No estás registrado. Usa /start');
                return true;
            }
            const learn = await learnRacialTalentRank(player.id, payload.talentKey);
            if (learn.success) {
                invalidateRacialGameplayEffectsCache(player.id);
            }
            const status = learn.success ? `✅ ${learn.message}` : `⚠️ ${learn.message}`;
            await openTalent(ctx, 'edit', payload.talentKey, payload.category, status);
            return true;
        }
        if (callbackData.startsWith('racial_equip1:')) {
            const payload = parseCallbackPayload(callbackData.replace('racial_equip1:', ''));
            if (!payload) {
                await openHub(ctx, 'edit', '⚠️ Talento inválido.');
                return true;
            }
            const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
            if (!player) {
                await ctx.reply('❌ No estás registrado. Usa /start');
                return true;
            }
            const result = await equipRacialTalent(player.id, payload.talentKey, 'active1');
            if (result.success) {
                invalidateRacialGameplayEffectsCache(player.id);
            }
            await openTalent(ctx, 'edit', payload.talentKey, payload.category, result.success ? `✅ ${result.message}` : `⚠️ ${result.message}`);
            return true;
        }
        if (callbackData.startsWith('racial_equip2:')) {
            const payload = parseCallbackPayload(callbackData.replace('racial_equip2:', ''));
            if (!payload) {
                await openHub(ctx, 'edit', '⚠️ Talento inválido.');
                return true;
            }
            const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
            if (!player) {
                await ctx.reply('❌ No estás registrado. Usa /start');
                return true;
            }
            const result = await equipRacialTalent(player.id, payload.talentKey, 'active2');
            if (result.success) {
                invalidateRacialGameplayEffectsCache(player.id);
            }
            await openTalent(ctx, 'edit', payload.talentKey, payload.category, result.success ? `✅ ${result.message}` : `⚠️ ${result.message}`);
            return true;
        }
        if (callbackData.startsWith('racial_equipk:')) {
            const payload = parseCallbackPayload(callbackData.replace('racial_equipk:', ''));
            if (!payload) {
                await openHub(ctx, 'edit', '⚠️ Talento inválido.');
                return true;
            }
            const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
            if (!player) {
                await ctx.reply('❌ No estás registrado. Usa /start');
                return true;
            }
            const result = await equipRacialTalent(player.id, payload.talentKey, 'keystone');
            if (result.success) {
                invalidateRacialGameplayEffectsCache(player.id);
            }
            await openTalent(ctx, 'edit', payload.talentKey, payload.category, result.success ? `✅ ${result.message}` : `⚠️ ${result.message}`);
            return true;
        }
        if (callbackData.startsWith('racial_unequip_active:')) {
            const payload = parseCallbackPayload(callbackData.replace('racial_unequip_active:', ''));
            if (!payload) {
                await openHub(ctx, 'edit', '⚠️ Talento inválido.');
                return true;
            }
            const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
            if (!player) {
                await ctx.reply('❌ No estás registrado. Usa /start');
                return true;
            }
            const state = await getPlayerRacialTalentState(player.id);
            if (!state) {
                await openHub(ctx, 'edit', '⚠️ No pude cargar tus datos.');
                return true;
            }
            let slot = 'active1';
            if (state.loadout.activeSlot2 === payload.talentKey) {
                slot = 'active2';
            }
            else if (state.loadout.activeSlot1 !== payload.talentKey) {
                await openTalent(ctx, 'edit', payload.talentKey, payload.category, '⚠️ Ese talento no estaba equipado.');
                return true;
            }
            const result = await unequipRacialTalent(player.id, slot);
            if (result.success) {
                invalidateRacialGameplayEffectsCache(player.id);
            }
            await openTalent(ctx, 'edit', payload.talentKey, payload.category, result.success ? `✅ ${result.message}` : `⚠️ ${result.message}`);
            return true;
        }
        if (callbackData.startsWith('racial_unequip_keystone:')) {
            const categoryRaw = callbackData.replace('racial_unequip_keystone:', '');
            const category = parseCategory(categoryRaw) || 'keystone';
            const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
            if (!player) {
                await ctx.reply('❌ No estás registrado. Usa /start');
                return true;
            }
            const result = await unequipRacialTalent(player.id, 'keystone');
            if (result.success) {
                invalidateRacialGameplayEffectsCache(player.id);
            }
            await openCategory(ctx, 'edit', category, result.success ? `✅ ${result.message}` : `⚠️ ${result.message}`);
            return true;
        }
        await openHub(ctx, 'edit');
        return true;
    }
    return {
        openByCommand,
        handleCallback,
    };
}
