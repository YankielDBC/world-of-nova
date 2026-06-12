// @ts-nocheck
import { RACIAL_TALENT_CATEGORIES, getLocalizedText3, getRacialTalentByKey, } from '../../data/racial-talents.js';
import { canLearnTalent } from '../../services/racial-talents.js';
import { t3, formatRaceLabel, getRacialArchetypeLine, shortLabel, formatPctFraction, formatPctPoints, formatFlat, formatNumber, categoryIcon, getRacialTalentPreview, formatTalentType, activeSlotLabel, getRacialTalentPowerLines, getRacialTalentCompatibilityLines, } from './racial-ui.js';
function renderLoadoutName(state, skillKey, lang) {
    if (!skillKey)
        return t3(lang, 'Vacio', 'Empty', 'Pusto');
    const def = getRacialTalentByKey(skillKey);
    if (!def)
        return skillKey;
    return shortLabel(getLocalizedText3(def.name, lang), 18);
}
export function renderRacialHubText(state, effects, lang, infoLine) {
    const lines = [
        `🧬 ${t3(lang, 'Talentos Raciales', 'Racial Talents', 'Rasovye talanty')}`,
        '✧═══••═══✧',
        `${t3(lang, 'Raza', 'Race', 'Rasa')}: ${formatRaceLabel(state.race)}`,
        `${t3(lang, 'Nivel', 'Level', 'Uroven')}: ${state.level}`,
        `${t3(lang, 'Estilo', 'Style', 'Stil')}: ${getRacialArchetypeLine(state, lang)}`,
        '',
        `📌 ${t3(lang, 'Puntos', 'Points', 'Ochki')}`,
        `┌ ${t3(lang, 'Total', 'Total', 'Vsego')}: ${state.totalPoints} | ${t3(lang, 'Gast', 'Spent', 'Potr')}: ${state.spentPoints}`,
        `└ ${t3(lang, 'Libres', 'Free', 'Svob')}: ${state.freePoints}`,
        '',
        `⚙️ ${t3(lang, 'Loadout', 'Loadout', 'Nabor')}`,
        `┌ A1: ${renderLoadoutName(state, state.loadout.activeSlot1, lang)}`,
        `├ A2: ${renderLoadoutName(state, state.loadout.activeSlot2, lang)}`,
        `└ K: ${renderLoadoutName(state, state.loadout.keystoneKey, lang)}`,
        '',
        `📈 ${t3(lang, 'Bonos activos', 'Active bonuses', 'Aktivnye bonusy')}`,
        `┌ ATK ${formatPctFraction(effects.combatModifiers.attackPct || 0)} | ARC ${formatPctFraction(effects.combatModifiers.arcanePct || 0)}`,
        `├ DEF ${formatPctFraction(effects.combatModifiers.defensePct || 0)} | MOV ${formatPctFraction(effects.combatModifiers.moveSpeedPct || 0)}`,
        `├ Viaje x${formatNumber(effects.travelTimeMultiplier, 2)} | STA x${formatNumber(effects.travelStaminaCostMultiplier, 2)}`,
        `└ Regen ${formatFlat(effects.passiveStaRegenBonus, 0)} | Eva ${formatPctPoints(effects.combatModifiers.evasionFlat || 0)}`,
    ];
    if (infoLine) {
        lines.push('');
        lines.push(infoLine);
    }
    return lines.join('\n');
}
export function renderRacialCategoryText(state, category, lang, infoLine) {
    const categoryMeta = RACIAL_TALENT_CATEGORIES.find((entry) => entry.key === category);
    const categoryName = categoryMeta ? getLocalizedText3(categoryMeta.label, lang) : category;
    const talents = state.talents.filter((entry) => entry.category === category);
    const lines = [
        `${categoryIcon(category)} ${t3(lang, 'Talentos', 'Talents', 'Talanty')} ${categoryName}`,
        '✧═══••═══✧',
        `${t3(lang, 'Raza', 'Race', 'Rasa')}: ${formatRaceLabel(state.race)} | ${t3(lang, 'Libres', 'Free', 'Svob')}: ${state.freePoints}`,
        '',
    ];
    if (talents.length === 0) {
        lines.push(t3(lang, 'No hay talentos en esta rama.', 'No talents in this branch.', 'V etoy vetke net talantov.'));
    }
    else {
        for (const [index, talent] of talents.entries()) {
            const rank = state.ranksByKey[talent.key] || 0;
            const marker = index === 0 ? '┌' : index === talents.length - 1 ? '└' : '├';
            const status = rank > 0 ? '🟢' : '▫️';
            lines.push(`${marker} ${status} ${shortLabel(getLocalizedText3(talent.name, lang), 22)} [${rank}/${talent.maxRank}]`);
            lines.push(`│ ${getRacialTalentPreview(talent, lang)}`);
        }
    }
    if (infoLine) {
        lines.push('');
        lines.push(infoLine);
    }
    return lines.join('\n');
}
export function renderRacialTalentDetailText(state, talent, lang, infoLine) {
    const rank = state.ranksByKey[talent.key] || 0;
    const canLearn = canLearnTalent(state, talent);
    const prereqLines = talent.prerequisites && talent.prerequisites.length > 0
        ? talent.prerequisites.map((key) => {
            const def = getRacialTalentByKey(key);
            const has = (state.ranksByKey[key] || 0) > 0;
            return `${has ? '✅' : '❌'} ${getLocalizedText3(def?.name || { es: key, en: key, ru: key }, lang)}`;
        })
        : [t3(lang, 'Sin prerequisitos', 'No prerequisites', 'Bez trebovaniy')];
    const lines = [
        `🧬 ${getLocalizedText3(talent.name, lang)}`,
        '✧═══••═══✧',
        getLocalizedText3(talent.summary, lang),
        '',
        `📌 ${t3(lang, 'Estado', 'State', 'Sostoyanie')}`,
        `┌ ${t3(lang, 'Tipo', 'Type', 'Tip')}: ${formatTalentType(talent, lang)}`,
        `├ ${t3(lang, 'Rango', 'Rank', 'Rang')}: ${rank}/${talent.maxRank}`,
        `├ ${t3(lang, 'Costo', 'Cost', 'Stoimost')}: ${talent.costPerRank}`,
        `├ ${t3(lang, 'Slot', 'Slot', 'Slot')}: ${activeSlotLabel(state, talent, lang)}`,
        `└ ${t3(lang, 'Preview', 'Preview', 'Preview')}: ${getRacialTalentPreview(talent, lang)}`,
        '',
        `📈 ${t3(lang, 'Impacto real', 'Real impact', 'Realny efekt')}`,
        ...getRacialTalentPowerLines(state, talent, lang).map((line, index, arr) => {
            const marker = index === 0 ? '┌' : index === arr.length - 1 ? '└' : '├';
            return `${marker} ${line}`;
        }),
        '',
        `📚 ${t3(lang, 'Prerequisitos', 'Prerequisites', 'Trebovaniya')}`,
        ...prereqLines.map((line, index, arr) => {
            const marker = arr.length === 1 ? '└' : index === 0 ? '┌' : index === arr.length - 1 ? '└' : '├';
            return `${marker} ${line}`;
        }),
        '',
        canLearn.ok
            ? `✅ ${t3(lang, 'Puedes mejorarlo ahora.', 'You can upgrade it now.', 'Mozhno uluchshit seychas.')}`
            : `⚠️ ${canLearn.reason || t3(lang, 'No disponible.', 'Unavailable.', 'Nedostupno.')}`,
        '',
        `🔗 ${t3(lang, 'Sinergias', 'Synergies', 'Sinergii')}`,
        ...getRacialTalentCompatibilityLines(state, talent, lang),
    ];
    if (infoLine) {
        lines.push('');
        lines.push(infoLine);
    }
    lines.push('');
    lines.push(`↩ ${categoryIcon(talent.category)} ${getLocalizedText3(RACIAL_TALENT_CATEGORIES.find((entry) => entry.key === talent.category)?.label || { es: talent.category, en: talent.category, ru: talent.category }, lang)}`);
    return lines.join('\n');
}
//# sourceMappingURL=racial-ui-content.js.map