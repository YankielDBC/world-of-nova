// @ts-nocheck
import { getLocalizedText3 } from '../../data/skill-trees.js';
import { canLearnBuildSkill } from '../../services/build-skills.js';
import { t3, buildRankSummaryLines, getPreviewTokens, collectThemes, evaluatePairSynergy, isEquipped, buildSuggestionLine } from './build-ui-utils.js';
export function getBuildSkillPreview(def, lang) {
    const tokens = getPreviewTokens(def, lang).slice(0, 2);
    return tokens.join(' | ');
}
export function getBuildSkillPowerLines(state, def, lang) {
    const rank = state.ranksByKey[def.key] || 0;
    const lines = buildRankSummaryLines(def, rank, lang);
    if (lines.length === 0) {
        return [t3(lang, 'Sin efectos numericos definidos aun.', 'No numeric effects defined yet.', 'Poka net chislovykh effektov.')];
    }
    return lines;
}
export function getBuildCompatibilityLines(state, def, lang) {
    const learned = [];
    const next = [];
    const allDefs = [...state.classSkills, ...state.generalSkills];
    for (const candidate of allDefs) {
        if (candidate.key === def.key)
            continue;
        const rank = state.ranksByKey[candidate.key] || 0;
        const pair = evaluatePairSynergy(def, candidate, lang);
        if (pair.score <= 0)
            continue;
        const item = { other: candidate, score: pair.score + (isEquipped(state, candidate.key) ? 1 : 0), reason: pair.reason };
        if (rank > 0) {
            learned.push(item);
            continue;
        }
        const canLearn = canLearnBuildSkill(state, candidate);
        if (canLearn.ok) {
            next.push(item);
        }
    }
    learned.sort((a, b) => b.score - a.score || a.other.sortOrder - b.other.sortOrder);
    next.sort((a, b) => b.score - a.score || a.other.sortOrder - b.other.sortOrder);
    const lines = [];
    if (learned.length > 0) {
        lines.push(t3(lang, 'Combina con tu build:', 'Matches your build:', 'Podkhodit tvoemu buildu:'));
        for (const [index, item] of learned.slice(0, 2).entries()) {
            const marker = index === 0 ? '┌' : index === Math.min(learned.length, 2) - 1 ? '└' : '├';
            lines.push(`${marker} ${buildSuggestionLine(item, state, lang)}`);
        }
    }
    if (next.length > 0) {
        lines.push(t3(lang, 'Buen siguiente pick:', 'Good next pick:', 'Khoroshiy sleduyushchiy pik:'));
        for (const [index, item] of next.slice(0, 2).entries()) {
            const marker = index === 0 ? '┌' : index === Math.min(next.length, 2) - 1 ? '└' : '├';
            lines.push(`${marker} ${buildSuggestionLine(item, state, lang)}`);
        }
    }
    if (lines.length === 0) {
        lines.push(t3(lang, 'Aun no hay suficientes piezas para sugerir combos solidos.', 'Not enough pieces yet for solid combo suggestions.', 'Poka malo elementov dlya silnykh svyazok.'));
    }
    return lines;
}
export function getBuildArchetypeLine(state, lang) {
    const score = new Map();
    const allDefs = [...state.classSkills, ...state.generalSkills];
    for (const def of allDefs) {
        const rank = state.ranksByKey[def.key] || 0;
        if (rank <= 0)
            continue;
        const weight = rank + (isEquipped(state, def.key) ? 2 : 0);
        for (const theme of collectThemes(def)) {
            score.set(theme, (score.get(theme) || 0) + weight);
        }
    }
    const labelMap = [
        { theme: 'offense', label: { es: 'ofensiva', en: 'offense', ru: 'ataka' } },
        { theme: 'arcane', label: { es: 'arcano', en: 'arcane', ru: 'arkan' } },
        { theme: 'defense', label: { es: 'defensa', en: 'defense', ru: 'zashchita' } },
        { theme: 'mobility', label: { es: 'movilidad', en: 'mobility', ru: 'mobilnost' } },
        { theme: 'crit', label: { es: 'critico', en: 'crit', ru: 'krit' } },
        { theme: 'evasion', label: { es: 'evasion', en: 'evasion', ru: 'uklonenie' } },
        { theme: 'counter', label: { es: 'contraataque', en: 'counter', ru: 'kontra' } },
        { theme: 'stamina', label: { es: 'aguante', en: 'stamina', ru: 'vynoslivost' } },
        { theme: 'farm', label: { es: 'farmeo', en: 'farming', ru: 'farm' } },
    ];
    const top = labelMap
        .map((entry) => ({
        label: getLocalizedText3(entry.label, lang),
        value: score.get(entry.theme) || 0,
    }))
        .filter((entry) => entry.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
        .map((entry) => entry.label);
    if (top.length === 0) {
        if (state.classKey === 'curse_hunter') {
            return t3(lang, 'critico / movilidad / reaccion', 'crit / mobility / reaction', 'krit / mobilnost / reaktsiya');
        }
        if (state.classKey === 'arcane') {
            return t3(lang, 'arcano / burst / ventana', 'arcane / burst / window', 'arkan / burst / okno');
        }
        if (state.classKey === 'dark_druid') {
            return t3(lang, 'aguante / defensa / sustain', 'tank / defense / sustain', 'tank / zashchita / sustain');
        }
        if (state.classKey === 'alchemist_rogue') {
            return t3(lang, 'movilidad / evasion / tempo', 'mobility / evasion / tempo', 'mobilnost / uklonenie / temp');
        }
        return t3(lang, 'Sin estilo definido aun.', 'No clear style yet.', 'Poka net chotkogo stilya.');
    }
    return top.join(' / ');
}
