import { InlineKeyboard } from 'grammy';
import { getPlayerByTelegramId } from '../../lib/db.js';
import { activateBuildSkill, canLearnBuildSkill, getBuildGameplayEffectsForPlayer, ensureBuildSkillSchema, equipBuildSkill, getBuildResetCost, getBuildRuntimeStatus, getPlayerBuildSkillState, listBuildActiveEffects, learnBuildSkillRank, resetBuildSkills, unequipBuildSkill, } from '../../services/build-skills.js';
import { getBuildSkillByKey, getLocalizedText3 } from '../../data/skill-trees.js';
import { getBuildArchetypeLine, getBuildCompatibilityLines, getBuildSkillPowerLines, getBuildSkillPreview, } from './build-ui.js';
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
function shortLabel(text, max = 18) {
    if (text.length <= max)
        return text;
    return `${text.slice(0, Math.max(1, max - 1))}…`;
}
function isMessageNotModifiedError(error) {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes('message is not modified');
}
async function sendScreen(ctx, mode, message, keyboard) {
    if (mode === 'edit' && typeof ctx.editMessageText === 'function') {
        try {
            await ctx.editMessageText(message, { reply_markup: keyboard });
        }
        catch (error) {
            if (isMessageNotModifiedError(error))
                return;
            throw error;
        }
        return;
    }
    await ctx.reply(message, { reply_markup: keyboard });
}
function tabLabel(lang, tab) {
    if (tab === 'class')
        return t3(lang, 'Clase', 'Class', 'Klass');
    return t3(lang, 'General', 'General', 'Obshchee');
}
function renderLoadoutLine(state, lang) {
    const resolveName = (skillKey) => {
        if (!skillKey)
            return t3(lang, 'Vacio', 'Empty', 'Pusto');
        const def = getBuildSkillByKey(skillKey);
        if (!def)
            return skillKey;
        return shortLabel(getLocalizedText3(def.name, lang), 18);
    };
    return [
        t3(lang, '⚙️ Loadout', '⚙️ Loadout', '⚙️ Nabor'),
        `┌A1: ${resolveName(state.loadout.activeSlot1)}`,
        `├A2: ${resolveName(state.loadout.activeSlot2)}`,
        `├A3: ${resolveName(state.loadout.activeSlot3)}`,
        `└K: ${resolveName(state.loadout.keystoneKey)}`,
    ];
}
async function renderHubText(state, lang, infoLine) {
    const activeEffects = await listBuildActiveEffects(state.playerId);
    const computed = await getBuildGameplayEffectsForPlayer(state.playerId);
    const activeLine = activeEffects.length === 0
        ? t3(lang, 'Sin buffs activos.', 'No active buffs.', 'Aktivnykh buffov net.')
        : activeEffects
            .slice(0, 3)
            .map((entry) => {
            const def = getBuildSkillByKey(entry.skillKey);
            const label = shortLabel(def ? getLocalizedText3(def.name, lang) : entry.skillKey, 14);
            if (entry.startsInSeconds > 0) {
                return `${label} (cast ${entry.startsInSeconds}s)`;
            }
            return `${label} (${entry.activeSeconds}s)`;
        })
            .join(' | ');
    const lines = [
        `🧩 ${t3(lang, 'Build Summary', 'Build Summary', 'Build Summary')}`,
        '✧═══••═══✧',
        `${t3(lang, 'Clase', 'Class', 'Klass')}: ${state.classKey || '-'}`,
        `${t3(lang, 'Nivel', 'Level', 'Uroven')}: ${state.level}`,
        `${t3(lang, 'Estilo', 'Style', 'Stil')}: ${getBuildArchetypeLine(state, lang)}`,
        '',
        `${t3(lang, 'Puntos de clase', 'Class points', 'Ochki klassa')}: ${state.freeClassPoints}/${state.totalClassPoints}`,
        `${t3(lang, 'Puntos generales', 'General points', 'Obshchie ochki')}: ${state.freeGeneralPoints}/${state.totalGeneralPoints}`,
        '',
        ...renderLoadoutLine(state, lang),
        '',
        `⏱ ${t3(lang, 'Estado runtime', 'Runtime status', 'Runtime status')}:`,
        `└ ${activeLine}`,
        '',
        `📊 ${t3(lang, 'Bonos activos', 'Active bonuses', 'Aktivnye bonusy')}:`,
        `┌ ATK% ${(computed.combatModifiers.attackPct || 0) * 100 >= 0 ? '+' : ''}${((computed.combatModifiers.attackPct || 0) * 100).toFixed(1)} | ARC% ${(computed.combatModifiers.arcanePct || 0) * 100 >= 0 ? '+' : ''}${((computed.combatModifiers.arcanePct || 0) * 100).toFixed(1)}`,
        `├ DEF% ${(computed.combatModifiers.defensePct || 0) * 100 >= 0 ? '+' : ''}${((computed.combatModifiers.defensePct || 0) * 100).toFixed(1)} | MOV% ${(computed.combatModifiers.moveSpeedPct || 0) * 100 >= 0 ? '+' : ''}${((computed.combatModifiers.moveSpeedPct || 0) * 100).toFixed(1)}`,
        `├ Travel x${computed.travelTimeMultiplier.toFixed(2)} | STA x${computed.travelStaminaCostMultiplier.toFixed(2)}`,
        `└ Regen +${computed.passiveStaRegenBonus} | Counter ${Math.round((computed.counterAttackRatio || 0) * 100)}%`,
    ];
    if (infoLine) {
        lines.push('');
        lines.push(infoLine);
    }
    return lines.join('\n');
}
function buildHubKeyboard(lang) {
    return new InlineKeyboard()
        .text(`📘 ${tabLabel(lang, 'class')}`, 'bs_tab:class')
        .text(`📗 ${tabLabel(lang, 'general')}`, 'bs_tab:general')
        .row()
        .text(`⏱ ${t3(lang, 'Runtime', 'Runtime', 'Runtime')}`, 'bs_runtime')
        .text(`♻️ ${t3(lang, 'Reset', 'Reset', 'Reset')}`, 'bs_reset_prompt')
        .row()
        .text(`📋 ${t3(lang, 'Perfil', 'Profile', 'Profil')}`, 'cmd_profile');
}
function listByTab(state, tab) {
    return tab === 'class' ? state.classSkills : state.generalSkills;
}
function renderTabText(state, tab, lang, infoLine) {
    const defs = listByTab(state, tab);
    const free = tab === 'class' ? state.freeClassPoints : state.freeGeneralPoints;
    const lines = [
        `🧩 ${t3(lang, 'Arbol', 'Tree', 'Derevo')} ${tabLabel(lang, tab)}`,
        '✧═══••═══✧',
        `${t3(lang, 'Puntos libres', 'Free points', 'Svobodnye ochki')}: ${free}`,
        '',
    ];
    if (defs.length === 0) {
        lines.push(t3(lang, 'No hay skills disponibles.', 'No skills available.', 'Net dostupnykh skillov.'));
    }
    else {
        for (const [index, def] of defs.entries()) {
            const rank = state.ranksByKey[def.key] || 0;
            const marker = index === 0 ? '┌' : index === defs.length - 1 ? '└' : '├';
            const status = rank > 0 ? '🟢' : '▫️';
            lines.push(`${marker} ${status} ${shortLabel(getLocalizedText3(def.name, lang), 18)} [${rank}/${def.maxRank}]`);
            lines.push(`│ ${getBuildSkillPreview(def, lang)}`);
        }
    }
    if (infoLine) {
        lines.push('');
        lines.push(infoLine);
    }
    return lines.join('\n');
}
function buildTabKeyboard(state, tab, lang) {
    const defs = listByTab(state, tab);
    const keyboard = new InlineKeyboard();
    for (let i = 0; i < defs.length; i += 1) {
        const def = defs[i];
        keyboard.text(shortLabel(getLocalizedText3(def.name, lang), 16), `bs_view:${def.key}|${tab}`);
        if (i % 2 === 1 && i < defs.length - 1) {
            keyboard.row();
        }
    }
    keyboard.row().text(`↩ ${t3(lang, 'Hub', 'Hub', 'Hub')}`, 'bs_hub');
    return keyboard;
}
async function renderSkillText(playerId, state, def, tab, lang, infoLine) {
    const rank = state.ranksByKey[def.key] || 0;
    const canLearn = canLearnBuildSkill(state, def);
    const runtime = await getBuildRuntimeStatus(playerId, def.key);
    const slotState = def.type === 'passive'
        ? t3(lang, 'Pasiva global', 'Global passive', 'Global passive')
        : def.type === 'keystone'
            ? state.loadout.keystoneKey === def.key
                ? 'K'
                : t3(lang, 'No en K', 'Not in K', 'Ne v K')
            : state.loadout.activeSlot1 === def.key
                ? 'A1'
                : state.loadout.activeSlot2 === def.key
                    ? 'A2'
                    : state.loadout.activeSlot3 === def.key
                        ? 'A3'
                        : t3(lang, 'No equipado', 'Not equipped', 'Ne ekipirovano');
    const prereq = def.prerequisites && def.prerequisites.length > 0
        ? def.prerequisites
            .map((key) => {
            const req = getBuildSkillByKey(key);
            const has = (state.ranksByKey[key] || 0) > 0;
            return `${has ? '✅' : '❌'} ${getLocalizedText3(req?.name || { es: key, en: key, ru: key }, lang)}`;
        })
            .join('\n')
        : t3(lang, 'Sin prerequisitos', 'No prerequisites', 'Bez trebovanii');
    const lines = [
        `🧠 ${getLocalizedText3(def.name, lang)}`,
        '✧═══••═══✧',
        getLocalizedText3(def.summary, lang),
        '',
        `${t3(lang, 'Tipo', 'Type', 'Tip')}: ${def.type}`,
        `${t3(lang, 'Rango', 'Rank', 'Rang')}: ${rank}/${def.maxRank}`,
        `${t3(lang, 'Costo', 'Cost', 'Stoimost')}: ${def.costPerRank}`,
        `${t3(lang, 'Preview', 'Preview', 'Preview')}: ${getBuildSkillPreview(def, lang)}`,
        `${t3(lang, 'Estado', 'State', 'Sostoyanie')}: ${slotState}`,
        '',
        `${t3(lang, 'Impacto real', 'Real impact', 'Realny efekt')}:`,
        ...getBuildSkillPowerLines(state, def, lang).map((line, index, arr) => {
            const marker = index === 0 ? '┌' : index === arr.length - 1 ? '└' : '├';
            return `${marker} ${line}`;
        }),
        '',
        `${t3(lang, 'Prerequisitos', 'Prerequisites', 'Trebovaniya')}:`,
        prereq,
        '',
        canLearn.ok
            ? t3(lang, '✅ Puedes mejorarla.', '✅ You can upgrade it.', '✅ Mozhno uluchshit.')
            : `⚠️ ${canLearn.reason || t3(lang, 'No disponible', 'Unavailable', 'Nedostupno')}`,
    ];
    lines.push('');
    if (def.type === 'active' || def.type === 'reaction') {
        lines.push(`${t3(lang, 'Runtime', 'Runtime', 'Runtime')}: Cast ${runtime.castSeconds}s | Up ${runtime.activeSeconds}s | CD ${runtime.cooldownSeconds}s`);
    }
    else {
        lines.push(`${t3(lang, 'Runtime', 'Runtime', 'Runtime')}: ${t3(lang, 'pasiva siempre activa', 'always-on passive', 'passiv vsegda aktiven')}`);
    }
    lines.push('');
    lines.push(`${t3(lang, 'Sinergias', 'Synergies', 'Sinergii')}:`);
    lines.push(...getBuildCompatibilityLines(state, def, lang));
    if (infoLine) {
        lines.push('');
        lines.push(infoLine);
    }
    lines.push('');
    lines.push(`↩ ${tabLabel(lang, tab)}`);
    return lines.join('\n');
}
function buildSkillKeyboard(state, def, tab, lang) {
    const rank = state.ranksByKey[def.key] || 0;
    const keyboard = new InlineKeyboard();
    const canLearn = canLearnBuildSkill(state, def);
    if (canLearn.ok && rank < def.maxRank) {
        keyboard.text(`➕ ${t3(lang, 'Aprender', 'Learn', 'Izuchit')}`, `bs_learn:${def.key}|${tab}`);
    }
    if (def.type === 'active' && rank > 0) {
        keyboard
            .text('A1', `bs_equip1:${def.key}|${tab}`)
            .text('A2', `bs_equip2:${def.key}|${tab}`)
            .text('A3', `bs_equip3:${def.key}|${tab}`)
            .row()
            .text(`⚡ ${t3(lang, 'Usar', 'Use', 'Ispolzovat')}`, `bs_use:${def.key}|${tab}`);
    }
    if (def.type === 'keystone' && rank > 0) {
        keyboard.text(`🗿 ${t3(lang, 'Equipar', 'Equip', 'Nadet')}`, `bs_equipk:${def.key}|${tab}`);
        keyboard.row().text(`✖ ${t3(lang, 'Quitar K', 'Unequip K', 'Snyat K')}`, `bs_unequip_k:${tab}`);
    }
    keyboard.row().text(`↩ ${tabLabel(lang, tab)}`, `bs_tab:${tab}`).text(`🏠 ${t3(lang, 'Hub', 'Hub', 'Hub')}`, 'bs_hub');
    return keyboard;
}
function parsePayload(raw) {
    const [skillKeyRaw, tabRaw] = raw.split('|');
    const skillKey = String(skillKeyRaw || '').trim().toLowerCase();
    const tab = String(tabRaw || '').trim().toLowerCase();
    if (!skillKey)
        return null;
    if (tab !== 'class' && tab !== 'general')
        return null;
    return { skillKey, tab };
}
function parseTab(raw) {
    const tab = String(raw || '').trim().toLowerCase();
    if (tab === 'class' || tab === 'general')
        return tab;
    return null;
}
export function createBuildModule() {
    async function loadState(ctx) {
        const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
        if (!player) {
            await ctx.reply('❌ No estas registrado. Usa /start');
            return null;
        }
        const lang = getPlayerLanguage(player);
        const state = await getPlayerBuildSkillState(player.id);
        if (!state) {
            await ctx.reply('❌ No pude cargar tu build.');
            return null;
        }
        return { player, state, lang };
    }
    async function openHub(ctx, mode, infoLine) {
        const payload = await loadState(ctx);
        if (!payload)
            return;
        const { state, lang } = payload;
        const text = await renderHubText(state, lang, infoLine);
        await sendScreen(ctx, mode, text, buildHubKeyboard(lang));
    }
    async function openTab(ctx, mode, tab, infoLine) {
        const payload = await loadState(ctx);
        if (!payload)
            return;
        const { state, lang } = payload;
        await sendScreen(ctx, mode, renderTabText(state, tab, lang, infoLine), buildTabKeyboard(state, tab, lang));
    }
    async function openSkill(ctx, mode, skillKey, tab, infoLine) {
        const payload = await loadState(ctx);
        if (!payload)
            return;
        const { player, state, lang } = payload;
        const def = getBuildSkillByKey(skillKey);
        if (!def) {
            await openTab(ctx, mode, tab, '⚠️ Skill invalida.');
            return;
        }
        const text = await renderSkillText(player.id, state, def, tab, lang, infoLine);
        await sendScreen(ctx, mode, text, buildSkillKeyboard(state, def, tab, lang));
    }
    async function openRuntime(ctx, mode) {
        const payload = await loadState(ctx);
        if (!payload)
            return;
        const { player, state, lang } = payload;
        const keys = [state.loadout.activeSlot1, state.loadout.activeSlot2, state.loadout.activeSlot3, state.loadout.keystoneKey]
            .filter((entry) => !!entry);
        const lines = [
            `⏱ ${t3(lang, 'Runtime de Build', 'Build Runtime', 'Build Runtime')}`,
            '✧═══••═══✧',
        ];
        if (keys.length === 0) {
            lines.push(t3(lang, 'No tienes skills equipadas.', 'No equipped skills.', 'Ekipirovannykh skillov net.'));
        }
        else {
            for (const [index, key] of keys.entries()) {
                const def = getBuildSkillByKey(key);
                const runtime = await getBuildRuntimeStatus(player.id, key);
                const marker = index === 0 ? '┌' : index === keys.length - 1 ? '└' : '├';
                lines.push(`${marker} ${shortLabel(def ? getLocalizedText3(def.name, lang) : key, 16)} | cast ${runtime.castSeconds}s | act ${runtime.activeSeconds}s | cd ${runtime.cooldownSeconds}s`);
            }
        }
        await sendScreen(ctx, mode, lines.join('\n'), new InlineKeyboard().text(`↩ ${t3(lang, 'Hub', 'Hub', 'Hub')}`, 'bs_hub'));
    }
    async function openResetPrompt(ctx, mode) {
        const payload = await loadState(ctx);
        if (!payload)
            return;
        const { state, lang } = payload;
        const cost = getBuildResetCost(state.spentClassPoints, state.spentGeneralPoints);
        const lines = [
            `♻️ ${t3(lang, 'Reset Build', 'Reset Build', 'Reset Build')}`,
            '✧═══••═══✧',
            `${t3(lang, 'Costo', 'Cost', 'Stoimost')}: ${cost} 🪙`,
            `${t3(lang, 'Plata', 'Silver', 'Serebro')}: ${state.silver} 🪙`,
            '',
            cost > 0
                ? t3(lang, 'Confirmas resetear puntos y loadout?', 'Confirm reset points and loadout?', 'Podtverzhdaesh reset ochkov i nabora?')
                : t3(lang, 'No hay puntos gastados.', 'No spent points.', 'Net potrachennykh ochkov.'),
        ];
        const kb = new InlineKeyboard();
        if (cost > 0) {
            kb.text(`✅ ${t3(lang, 'Confirmar', 'Confirm', 'Podtverdit')}`, 'bs_reset_confirm')
                .text(`❌ ${t3(lang, 'Cancelar', 'Cancel', 'Otmena')}`, 'bs_hub');
        }
        else {
            kb.text(`↩ ${t3(lang, 'Hub', 'Hub', 'Hub')}`, 'bs_hub');
        }
        await sendScreen(ctx, mode, lines.join('\n'), kb);
    }
    async function openByCommand(ctx) {
        await ensureBuildSkillSchema();
        await openHub(ctx, 'reply');
    }
    async function handleCallback(ctx, callbackData) {
        if (callbackData === 'cmd_bs') {
            await ctx.answerCallbackQuery();
            await openHub(ctx, 'edit');
            return true;
        }
        if (!callbackData.startsWith('bs_'))
            return false;
        await ensureBuildSkillSchema();
        await ctx.answerCallbackQuery();
        if (callbackData === 'bs_hub') {
            await openHub(ctx, 'edit');
            return true;
        }
        if (callbackData === 'bs_runtime') {
            await openRuntime(ctx, 'edit');
            return true;
        }
        if (callbackData === 'bs_reset_prompt') {
            await openResetPrompt(ctx, 'edit');
            return true;
        }
        if (callbackData === 'bs_reset_confirm') {
            const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
            if (!player) {
                await ctx.reply('❌ No estas registrado. Usa /start');
                return true;
            }
            const result = await resetBuildSkills(player.id);
            await openHub(ctx, 'edit', result.success ? `✅ ${result.message}` : `⚠️ ${result.message}`);
            return true;
        }
        if (callbackData.startsWith('bs_tab:')) {
            const tab = parseTab(callbackData.replace('bs_tab:', ''));
            if (!tab) {
                await openHub(ctx, 'edit', '⚠️ Tab invalido.');
                return true;
            }
            await openTab(ctx, 'edit', tab);
            return true;
        }
        if (callbackData.startsWith('bs_view:')) {
            const payload = parsePayload(callbackData.replace('bs_view:', ''));
            if (!payload) {
                await openHub(ctx, 'edit', '⚠️ Skill invalida.');
                return true;
            }
            await openSkill(ctx, 'edit', payload.skillKey, payload.tab);
            return true;
        }
        if (callbackData.startsWith('bs_learn:')) {
            const payload = parsePayload(callbackData.replace('bs_learn:', ''));
            if (!payload) {
                await openHub(ctx, 'edit', '⚠️ Skill invalida.');
                return true;
            }
            const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
            if (!player) {
                await ctx.reply('❌ No estas registrado. Usa /start');
                return true;
            }
            const result = await learnBuildSkillRank(player.id, payload.skillKey);
            await openSkill(ctx, 'edit', payload.skillKey, payload.tab, result.success ? `✅ ${result.message}` : `⚠️ ${result.message}`);
            return true;
        }
        if (callbackData.startsWith('bs_equip1:') || callbackData.startsWith('bs_equip2:') || callbackData.startsWith('bs_equip3:')) {
            const slot = callbackData.startsWith('bs_equip1:')
                ? 'active1'
                : callbackData.startsWith('bs_equip2:')
                    ? 'active2'
                    : 'active3';
            const payload = parsePayload(callbackData.replace(/^bs_equip[123]:/, ''));
            if (!payload) {
                await openHub(ctx, 'edit', '⚠️ Skill invalida.');
                return true;
            }
            const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
            if (!player) {
                await ctx.reply('❌ No estas registrado. Usa /start');
                return true;
            }
            const result = await equipBuildSkill(player.id, payload.skillKey, slot);
            await openSkill(ctx, 'edit', payload.skillKey, payload.tab, result.success ? `✅ ${result.message}` : `⚠️ ${result.message}`);
            return true;
        }
        if (callbackData.startsWith('bs_equipk:')) {
            const payload = parsePayload(callbackData.replace('bs_equipk:', ''));
            if (!payload) {
                await openHub(ctx, 'edit', '⚠️ Skill invalida.');
                return true;
            }
            const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
            if (!player) {
                await ctx.reply('❌ No estas registrado. Usa /start');
                return true;
            }
            const result = await equipBuildSkill(player.id, payload.skillKey, 'keystone');
            await openSkill(ctx, 'edit', payload.skillKey, payload.tab, result.success ? `✅ ${result.message}` : `⚠️ ${result.message}`);
            return true;
        }
        if (callbackData.startsWith('bs_unequip_k:')) {
            const tab = parseTab(callbackData.replace('bs_unequip_k:', '')) || 'class';
            const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
            if (!player) {
                await ctx.reply('❌ No estas registrado. Usa /start');
                return true;
            }
            const result = await unequipBuildSkill(player.id, 'keystone');
            await openTab(ctx, 'edit', tab, result.success ? `✅ ${result.message}` : `⚠️ ${result.message}`);
            return true;
        }
        if (callbackData.startsWith('bs_use:')) {
            const payload = parsePayload(callbackData.replace('bs_use:', ''));
            if (!payload) {
                await openHub(ctx, 'edit', '⚠️ Skill invalida.');
                return true;
            }
            const player = await getPlayerByTelegramId(String(ctx.from?.id || ''));
            if (!player) {
                await ctx.reply('❌ No estas registrado. Usa /start');
                return true;
            }
            const result = await activateBuildSkill(player.id, payload.skillKey);
            await openSkill(ctx, 'edit', payload.skillKey, payload.tab, result.success ? `✅ ${result.message}` : `⚠️ ${result.message}`);
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
