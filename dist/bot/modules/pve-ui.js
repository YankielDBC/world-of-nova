import { InlineKeyboard } from 'grammy';
import { getPvePressurePct, } from '../../services/pve-combat.js';
function t3(lang, es, en, ru) {
    if (lang === 'en')
        return en;
    if (lang === 'ru')
        return ru;
    return es;
}
function shortLabel(text, max = 18) {
    if (text.length <= max)
        return text;
    return `${text.slice(0, Math.max(1, max - 3))}...`;
}
function categoryLabel(raw, lang) {
    if (raw === 'boss')
        return t3(lang, 'Boss', 'Boss', 'Boss');
    if (raw === 'elite')
        return t3(lang, 'Elite', 'Elite', 'Elita');
    if (raw === 'veteran')
        return t3(lang, 'Veterano', 'Veteran', 'Veteran');
    return t3(lang, 'Basico', 'Basic', 'Bazovyy');
}
function abilityStatusLine(choice, lang) {
    if (!choice.ready) {
        return t3(lang, `CD ${choice.cooldownTurns}T · STA ${choice.staminaCost}`, `CD ${choice.cooldownTurns}T · STA ${choice.staminaCost}`, `CD ${choice.cooldownTurns}T · STA ${choice.staminaCost}`);
    }
    return t3(lang, `Lista · STA ${choice.staminaCost}`, `Ready · STA ${choice.staminaCost}`, `Gotovo · STA ${choice.staminaCost}`);
}
function compactLine(values, emptyValue) {
    const valid = values.filter((entry) => entry && entry.trim().length > 0);
    return valid.length > 0 ? shortLabel(valid.join(' | '), 30) : emptyValue;
}
function splitInfoLines(infoLine) {
    if (!infoLine)
        return [];
    return infoLine
        .split('\n')
        .map((entry) => entry.trim())
        .filter(Boolean);
}
function buildRoundLines(view, infoLine) {
    const fromInfo = splitInfoLines(infoLine);
    if (fromInfo.length > 0 && !fromInfo[0].startsWith('⚠️')) {
        return fromInfo.slice(-4);
    }
    return view.state.log.slice(-4);
}
function buildAlertLine(infoLine) {
    if (!infoLine)
        return null;
    const trimmed = infoLine.trim();
    return trimmed.startsWith('⚠️') ? trimmed : null;
}
export function renderPveCombatText(view, lang, infoLine) {
    const pressurePct = Math.round(getPvePressurePct(view.state.turnNumber) * 100);
    const playerEffects = compactLine(view.playerEffectLabels, t3(lang, 'Sin efectos', 'No effects', 'Bez effektov'));
    const reactionState = compactLine(view.reactionLines, t3(lang, 'Sin reacciones listas', 'No reactions ready', 'Reaktsii ne gotovy'));
    const enemyEffects = compactLine(view.enemyEffectLabels, t3(lang, 'Sin efectos', 'No effects', 'Bez effektov'));
    const roundLines = buildRoundLines(view, infoLine);
    const alertLine = buildAlertLine(infoLine);
    const lines = [
        `⚔️ ${t3(lang, 'Combate PvE', 'PvE Combat', 'PvE Boy')}`,
        '✧═══••═══✧',
        `👤 ${view.playerName} vs 👹 ${view.enemy.displayName}`,
        `🎯 ${t3(lang, 'Turno', 'Turn', 'Khod')} ${view.state.turnNumber} · ${categoryLabel(view.enemy.category, lang)} Lv ${view.enemy.level}`,
        `🔥 ${t3(lang, 'Presion', 'Pressure', 'Davlenie')}: +${pressurePct}% ${t3(lang, 'dano', 'damage', 'urona')}`,
        '',
        `🫵 ${t3(lang, 'Tu estado', 'Your state', 'Tvoe sostoyanie')}`,
        `┌❤️ ${view.player.currentHp}/${view.player.maxHp}   🔋 ${view.player.currentSta}/${view.player.maxSta}`,
        `├✨ ${playerEffects}`,
        `└⚡ ${reactionState}`,
        '',
        `👹 ${t3(lang, 'Enemigo', 'Enemy', 'Vrag')}`,
        `┌❤️ ${view.enemy.currentHp}/${view.enemy.maxHp}`,
        `├🎯 ${shortLabel(view.state.enemyIntent.label, 28)}`,
        `├💡 ${shortLabel(view.state.enemyIntent.hint, 28)}`,
        `└☠ ${enemyEffects}`,
    ];
    if (alertLine) {
        lines.push('');
        lines.push(`⚠️ ${t3(lang, 'Aviso', 'Notice', 'Vnimanie')}`);
        lines.push(`└ ${alertLine.replace(/^⚠️\s*/, '')}`);
    }
    lines.push('');
    lines.push(`📜 ${t3(lang, 'Ultima ronda', 'Last round', 'Posledniy raund')}`);
    if (roundLines.length === 0) {
        lines.push(`└ ${t3(lang, 'Aun no se cruzan golpes.', 'No blows have been traded yet.', 'Udary eshche ne obmenivalis.')}`);
    }
    else {
        roundLines.forEach((entry, index) => {
            const marker = index === 0 ? '┌' : index === roundLines.length - 1 ? '└' : '├';
            lines.push(`${marker} ${entry}`);
        });
    }
    lines.push('');
    lines.push(`🚫 ${t3(lang, 'Otros comandos: bloqueados', 'Other commands: blocked', 'Drugie komandy: blok')}`);
    return lines.join('\n');
}
export function renderPveAbilityMenu(view, lang, kind, infoLine) {
    const choices = kind === 'build' ? view.buildChoices : view.racialChoices;
    const title = kind === 'build'
        ? t3(lang, 'Skills activas', 'Active skills', 'Aktivnye navyki')
        : t3(lang, 'Raciales activas', 'Active racials', 'Aktivnye rasovye');
    const lines = [`✨ ${title}`, '✧═══••═══✧'];
    if (choices.length === 0) {
        lines.push(kind === 'build'
            ? t3(lang, 'No tienes activas equipadas en A1/A2/A3.', 'You have no active skills equipped in A1/A2/A3.', 'U tebya net aktivnykh navykov v A1/A2/A3.')
            : t3(lang, 'No tienes raciales activas equipadas.', 'You have no active racials equipped.', 'U tebya net ekipirovannykh rasovykh aktivok.'));
    }
    else {
        choices.forEach((choice, index) => {
            const marker = index === 0 ? '┌' : index === choices.length - 1 ? '└' : '├';
            lines.push(`${marker} ${choice.slotLabel} ${choice.label}`);
            lines.push(`│ ${shortLabel(choice.shortSummary, 32)}`);
            lines.push(`│ ${abilityStatusLine(choice, lang)}`);
        });
    }
    if (infoLine) {
        lines.push('');
        lines.push(infoLine);
    }
    return lines.join('\n');
}
export function buildPveCombatKeyboard(lang) {
    return new InlineKeyboard()
        .text(`🗡 ${t3(lang, 'Atacar', 'Attack', 'Ataka')}`, 'pve_attack')
        .text(`🛡 ${t3(lang, 'Defender', 'Guard', 'Zashchita')}`, 'pve_guard')
        .row()
        .text(`✨ ${t3(lang, 'Skills', 'Skills', 'Skills')}`, 'pve_menu_build')
        .text(`🧬 ${t3(lang, 'Raciales', 'Racials', 'Racial')}`, 'pve_menu_racial')
        .row()
        .text(`🏃 ${t3(lang, 'Huir', 'Flee', 'Begstvo')}`, 'pve_flee');
}
function buildAbilityRowLabel(choice) {
    return `${choice.slotLabel} ${shortLabel(choice.label, 11)}`;
}
export function buildPveAbilityKeyboard(view, lang, kind) {
    const choices = kind === 'build' ? view.buildChoices : view.racialChoices;
    const keyboard = new InlineKeyboard();
    for (let i = 0; i < choices.length; i += 1) {
        const choice = choices[i];
        const callback = kind === 'build' ? `pve_build:${choice.key}` : `pve_racial:${choice.key}`;
        keyboard.text(buildAbilityRowLabel(choice), callback);
        if (i % 2 === 1 && i < choices.length - 1) {
            keyboard.row();
        }
    }
    keyboard.row().text(`↩ ${t3(lang, 'Combate', 'Combat', 'Boy')}`, 'pve_resume');
    return keyboard;
}
export function buildPveScoutKeyboard(lang, creatureId) {
    return new InlineKeyboard()
        .text(`⚔️ ${t3(lang, 'Combatir', 'Fight', 'Dratsya')}`, `pve_start:${creatureId}`)
        .row()
        .text(`🧩 ${t3(lang, 'Interacciones', 'Interactions', 'Vzaimodeystviya')}`, 'map_interact')
        .text(`🗺 ${t3(lang, 'Mapa', 'Map', 'Karta')}`, 'map_interact_back');
}
export function buildPveOutcomeKeyboard(lang) {
    return new InlineKeyboard()
        .text(`🧩 ${t3(lang, 'Interacciones', 'Interactions', 'Vzaimodeystviya')}`, 'map_interact')
        .text(`🗺 ${t3(lang, 'Mapa', 'Map', 'Karta')}`, 'map_interact_back');
}
export function buildPveBlockedKeyboard(lang) {
    return new InlineKeyboard().text(`⚔️ ${t3(lang, 'Reanudar', 'Resume', 'Vernutsya')}`, 'pve_resume');
}
