// @ts-nocheck
import { RACIAL_TALENT_CATEGORIES, getLocalizedText3, getRacialTalentByKey, } from '../../data/racial-talents.js';
import { canLearnTalent } from '../../services/racial-talents.js';
function t3(lang, es, en, ru) {
    if (lang === 'en')
        return en;
    if (lang === 'ru')
        return ru;
    return es;
}
function formatNumber(value, digits = 1) {
    const rounded = Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(digits);
}
function formatPctFraction(value, digits = 1) {
    return `${value >= 0 ? '+' : ''}${formatNumber(value * 100, digits)}%`;
}
function formatPctPoints(value, digits = 1) {
    return `${value >= 0 ? '+' : ''}${formatNumber(value, digits)}%`;
}
function formatFlat(value, digits = 1) {
    return `${value >= 0 ? '+' : ''}${formatNumber(value, digits)}`;
}
function shortLabel(text, max = 18) {
    if (text.length <= max)
        return text;
    return `${text.slice(0, Math.max(1, max - 1))}…`;
}
function formatRaceLabel(race) {
    if (!race)
        return '-';
    return race.slice(0, 1).toUpperCase() + race.slice(1);
}
function formatTalentType(def, lang) {
    if (def.type === 'passive') {
        return t3(lang, 'Pasiva', 'Passive', 'Passiv');
    }
    if (def.type === 'active') {
        return t3(lang, 'Activa', 'Active', 'Aktivnaya');
    }
    return t3(lang, 'Keystone', 'Keystone', 'Keystone');
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
function activeSlotLabel(state, def, lang) {
    if (def.type === 'passive') {
        return t3(lang, 'Pasiva global', 'Global passive', 'Global passive');
    }
    if (def.type === 'keystone') {
        return state.loadout.keystoneKey === def.key ? 'K' : t3(lang, 'No en K', 'Not in K', 'Ne v K');
    }
    if (state.loadout.activeSlot1 === def.key)
        return 'A1';
    if (state.loadout.activeSlot2 === def.key)
        return 'A2';
    return t3(lang, 'No equipado', 'Not equipped', 'Ne ekipirovano');
}
function tokensToText(tokens) {
    return tokens.slice(0, 3).join(' | ');
}
function scaleTokens(tokens, rank) {
    if (rank <= 1)
        return tokens;
    return tokens;
}
function buildPerRankTokens(def, rank, lang) {
    if (rank <= 0)
        return [];
    switch (def.key) {
        case 'zolk_toxic_blood':
            return [
                `Crit ${formatPctPoints(0.5 * rank)}`,
                `R.Quim ${formatFlat(1 * rank, 0)}`,
            ];
        case 'zolk_lab_reflexes':
            return [
                `Eva ${formatPctPoints(0.8 * rank)}`,
                `MOV ${formatPctFraction(0.01 * rank)}`,
                `ASPD ${formatPctFraction(0.01 * rank)}`,
            ];
        case 'zolk_unstable_metabolism':
            return [
                `STA ${formatFlat(5 * rank, 0)}`,
                `Regen ${formatFlat(1 * rank, 0)}`,
            ];
        case 'zolk_alchemical_skin':
            return [
                `DEF ${formatPctFraction(0.01 * rank)}`,
                `R.Quim ${formatFlat(1 * rank, 0)}`,
            ];
        case 'zolk_delicate_hand':
            return [`Gather Loot ${formatPctFraction(0.04 * rank)}`];
        case 'zolk_quick_escape':
            return [`Viaje STA ${formatPctFraction(-0.07 * rank)}`];
        case 'zolk_toxic_cloud':
            return [`ATK ${formatPctFraction(0.02)}`, `ARC ${formatPctFraction(0.01)}`];
        case 'zolk_venom_glands':
            return [`Crit ${formatPctPoints(1.1)}`, `ATK ${formatPctFraction(0.01)}`];
        case 'zolk_mutation_dash':
            return [`Viaje T ${formatPctFraction(-0.09)}`, `MOV ${formatPctFraction(0.02)}`];
        case 'zolk_chemical_legs':
            return [`Viaje T ${formatPctFraction(-0.05)}`, `Viaje STA ${formatPctFraction(-0.04)}`];
        case 'zolk_toxic_shadow':
            return [`Eva ${formatPctPoints(2.2)}`, `Crit ${formatPctPoints(1.4)}`];
        case 'zolk_reactor_blood':
            return [`ARC ${formatPctFraction(0.04)}`, `ATK ${formatPctFraction(0.02)}`];
        case 'zolk_chemical_survivor':
            return [
                `DEF ${formatPctFraction(0.03)}`,
                `R.Quim ${formatFlat(2, 0)}`,
                `HP ${formatFlat(10, 0)}`,
                `Regen ${formatFlat(1, 0)}`,
            ];
        case 'uren_deep_root':
            return [`DEF ${formatPctFraction(0.011 * rank)}`, `R.Fis ${formatFlat(1 * rank, 0)}`];
        case 'uren_calm_sap':
            return [`HP ${formatFlat(7 * rank, 0)}`, `STA ${formatFlat(4 * rank, 0)}`];
        case 'uren_living_bark':
            return [`DEF ${formatPctFraction(0.01 * rank)}`, `R.Fis ${formatFlat(1 * rank, 0)}`];
        case 'uren_natural_pulse':
            return [`ARC ${formatPctFraction(0.011 * rank)}`, `R.Arc ${formatFlat(1 * rank, 0)}`];
        case 'uren_wild_stride':
            return [`MOV ${formatPctFraction(0.014 * rank)}`, `Viaje T ${formatPctFraction(-0.045 * rank)}`];
        case 'uren_forage_eye':
            return [`Gather Loot ${formatPctFraction(0.035 * rank)}`, `Chop Loot ${formatPctFraction(0.035 * rank)}`];
        case 'uren_forest_breath':
            return [
                `Regen ${formatFlat(1 * rank, 0)}`,
                `Gather STA ${formatPctFraction(-0.018 * rank)}`,
                `Chop STA ${formatPctFraction(-0.014 * rank)}`,
            ];
        case 'uren_vine_snare':
            return [`DEF ${formatPctFraction(0.01)}`, `Chop STA ${formatPctFraction(-0.03)}`];
        case 'uren_reflect_thorns':
            return [`DEF+ ${formatFlat(1.4)}`, `R.Fis ${formatFlat(1, 0)}`];
        case 'uren_arcane_bud':
            return [`ATK ${formatPctFraction(0.01)}`, `ARC ${formatPctFraction(0.02)}`];
        case 'uren_green_channel':
            return [`ARC ${formatPctFraction(0.02)}`];
        case 'uren_forest_heart':
            return [`HP ${formatFlat(15, 0)}`, `DEF ${formatPctFraction(0.04)}`, `Regen ${formatFlat(1, 0)}`];
        case 'uren_arcane_pact':
            return [`ARC ${formatPctFraction(0.05)}`, `Crit ${formatPctPoints(1.1)}`];
        case 'uren_wild_spine':
            return [`ATK ${formatPctFraction(0.03)}`, `DEF ${formatPctFraction(0.02)}`, `R.Fis ${formatFlat(1, 0)}`];
        default:
            return [getLocalizedText3(def.summary, lang)];
    }
}
function getTalentThemes(def) {
    const themes = new Set([def.category]);
    switch (def.key) {
        case 'zolk_toxic_blood':
            themes.add('offense');
            themes.add('crit');
            themes.add('chemical');
            break;
        case 'zolk_lab_reflexes':
            themes.add('mobility');
            themes.add('evasion');
            break;
        case 'zolk_unstable_metabolism':
            themes.add('stamina');
            themes.add('regen');
            themes.add('utility');
            break;
        case 'zolk_alchemical_skin':
            themes.add('defense');
            themes.add('chemical');
            themes.add('tank');
            break;
        case 'zolk_delicate_hand':
            themes.add('gather');
            themes.add('utility');
            break;
        case 'zolk_quick_escape':
            themes.add('travel');
            themes.add('mobility');
            break;
        case 'zolk_toxic_cloud':
            themes.add('offense');
            themes.add('arcane');
            themes.add('active');
            break;
        case 'zolk_venom_glands':
            themes.add('offense');
            themes.add('crit');
            themes.add('chemical');
            break;
        case 'zolk_mutation_dash':
            themes.add('travel');
            themes.add('mobility');
            themes.add('active');
            break;
        case 'zolk_chemical_legs':
            themes.add('travel');
            themes.add('mobility');
            break;
        case 'zolk_toxic_shadow':
            themes.add('keystone');
            themes.add('evasion');
            themes.add('crit');
            break;
        case 'zolk_reactor_blood':
            themes.add('keystone');
            themes.add('arcane');
            themes.add('offense');
            break;
        case 'zolk_chemical_survivor':
            themes.add('keystone');
            themes.add('defense');
            themes.add('tank');
            themes.add('regen');
            themes.add('chemical');
            break;
        case 'uren_deep_root':
            themes.add('defense');
            themes.add('tank');
            themes.add('physical');
            break;
        case 'uren_calm_sap':
            themes.add('defense');
            themes.add('stamina');
            themes.add('tank');
            break;
        case 'uren_living_bark':
            themes.add('defense');
            themes.add('tank');
            themes.add('physical');
            break;
        case 'uren_natural_pulse':
            themes.add('offense');
            themes.add('arcane');
            break;
        case 'uren_wild_stride':
            themes.add('mobility');
            themes.add('travel');
            break;
        case 'uren_forage_eye':
            themes.add('utility');
            themes.add('gather');
            themes.add('chop');
            break;
        case 'uren_forest_breath':
            themes.add('utility');
            themes.add('regen');
            themes.add('stamina');
            themes.add('gather');
            themes.add('chop');
            break;
        case 'uren_vine_snare':
            themes.add('active');
            themes.add('defense');
            themes.add('chop');
            break;
        case 'uren_reflect_thorns':
            themes.add('defense');
            themes.add('physical');
            break;
        case 'uren_arcane_bud':
            themes.add('active');
            themes.add('offense');
            themes.add('arcane');
            break;
        case 'uren_green_channel':
            themes.add('arcane');
            themes.add('offense');
            break;
        case 'uren_forest_heart':
            themes.add('keystone');
            themes.add('tank');
            themes.add('regen');
            themes.add('defense');
            break;
        case 'uren_arcane_pact':
            themes.add('keystone');
            themes.add('arcane');
            themes.add('crit');
            break;
        case 'uren_wild_spine':
            themes.add('keystone');
            themes.add('offense');
            themes.add('defense');
            themes.add('physical');
            break;
    }
    return themes;
}
function evaluatePairSynergy(base, candidate, lang) {
    const baseThemes = getTalentThemes(base);
    const candidateThemes = getTalentThemes(candidate);
    let score = 0;
    const reasons = [];
    const has = (set, theme) => set.has(theme);
    const pair = (a, b) => (has(baseThemes, a) && has(candidateThemes, b)) || (has(baseThemes, b) && has(candidateThemes, a));
    if (base.prerequisites?.includes(candidate.key) || candidate.prerequisites?.includes(base.key)) {
        score += 8;
        reasons.push(t3(lang, 'uno desbloquea o potencia al otro', 'one unlocks or powers the other', 'odin otkryvaet ili usilivaet drugoy'));
    }
    if (pair('evasion', 'crit')) {
        score += 5;
        reasons.push(t3(lang, 'mezcla presion agresiva con juego evasivo', 'mixes pressure with evasive play', 'smeshivaet davlenie s ukloneniyem'));
    }
    if (pair('arcane', 'offense')) {
        score += 4;
        reasons.push(t3(lang, 'sube dano hibrido sin perder ritmo', 'boosts hybrid damage without losing tempo', 'usilivaet gibridniy uron bez poteri tempa'));
    }
    if (pair('defense', 'regen') || pair('tank', 'regen')) {
        score += 5;
        reasons.push(t3(lang, 'sostiene peleas largas con mas aguante', 'supports longer fights with more sustain', 'podderzhivaet dlinniye boi za schet vyzhivaniya'));
    }
    if (pair('mobility', 'travel')) {
        score += 3;
        reasons.push(t3(lang, 'mejora movilidad dentro y fuera del mapa', 'improves movement in and out of combat', 'usilivaet mobilnost v boju i na karte'));
    }
    if (pair('gather', 'regen') || pair('chop', 'regen') || pair('gather', 'stamina') || pair('chop', 'stamina')) {
        score += 3;
        reasons.push(t3(lang, 'farmea mas tiempo con menos desgaste', 'extends farming with less drain', 'daet bolshe farma s menshim rashodom'));
    }
    if (pair('chemical', 'defense')) {
        score += 3;
        reasons.push(t3(lang, 'cierra una linea muy solida contra dano quimico', 'solidifies the chemical defense line', 'ukreplyaet liniyu khimicheskoy zashchity'));
    }
    if (pair('physical', 'defense')) {
        score += 3;
        reasons.push(t3(lang, 'aprieta la defensa base contra dano fisico', 'tightens your baseline against physical damage', 'ukreplyaet bazovuyu zashchitu ot fiz urona'));
    }
    if (base.category === candidate.category) {
        score += 1;
        reasons.push(t3(lang, 'refuerza la misma rama', 'reinforces the same branch', 'usilivaet tu zhe vetku'));
    }
    return {
        score,
        reason: reasons[0] || t3(lang, 'aporta una capa util a tu racial', 'adds a useful layer to your racial setup', 'dobavlyaet polezniy sloy v rasoviy nabor'),
    };
}
function buildSuggestionLine(insight, state, lang) {
    const name = getLocalizedText3(insight.other.name, lang);
    const preview = getRacialTalentPreview(insight.other, lang);
    const learnedRank = state.ranksByKey[insight.other.key] || 0;
    const learnedTag = learnedRank > 0 ? ` ${t3(lang, '[ON]', '[ON]', '[ON]')}` : '';
    return `${name}${learnedTag} -> ${preview} :: ${insight.reason}`;
}
export function getRacialTalentPreview(def, lang) {
    const tokens = buildPerRankTokens(def, 1, lang);
    return tokensToText(tokens.length > 0 ? tokens : [getLocalizedText3(def.summary, lang)]);
}
export function getRacialTalentPowerLines(state, def, lang) {
    const rank = state.ranksByKey[def.key] || 0;
    const lines = [];
    if (rank > 0) {
        lines.push(`Actual R${rank}: ${tokensToText(buildPerRankTokens(def, rank, lang))}`);
    }
    if (rank < def.maxRank) {
        const nextRank = Math.min(def.maxRank, Math.max(1, rank + 1));
        lines.push(`Siguiente R${nextRank}: ${tokensToText(buildPerRankTokens(def, nextRank, lang))}`);
    }
    if (def.maxRank > 1) {
        lines.push(`Max R${def.maxRank}: ${tokensToText(buildPerRankTokens(def, def.maxRank, lang))}`);
    }
    if (def.type === 'active') {
        lines.push(t3(lang, 'Hoy aplica su bonus base al equiparlo en A1/A2.', 'Right now its base bonus applies when equipped in A1/A2.', 'Seychas ego bazoviy bonus rabotaet pri ekvipirovke v A1/A2.'));
    }
    else if (def.type === 'keystone') {
        lines.push(t3(lang, 'Solo cuenta si lo equipas en el slot K.', 'It only counts while equipped in the K slot.', 'Uchityvaetsya tolko kogda postavlen v slot K.'));
    }
    if (lines.length === 0) {
        return [t3(lang, 'Sin datos numericos aun.', 'No numeric data yet.', 'Poka net chisel.')];
    }
    return lines;
}
export function getRacialTalentCompatibilityLines(state, def, lang) {
    const learned = [];
    const next = [];
    for (const candidate of state.talents) {
        if (candidate.key === def.key)
            continue;
        const pair = evaluatePairSynergy(def, candidate, lang);
        if (pair.score <= 0)
            continue;
        const item = { other: candidate, score: pair.score, reason: pair.reason };
        if ((state.ranksByKey[candidate.key] || 0) > 0) {
            learned.push(item);
            continue;
        }
        if (canLearnTalent(state, candidate).ok) {
            next.push(item);
        }
    }
    learned.sort((a, b) => b.score - a.score || a.other.sortOrder - b.other.sortOrder);
    next.sort((a, b) => b.score - a.score || a.other.sortOrder - b.other.sortOrder);
    const lines = [];
    if (learned.length > 0) {
        lines.push(t3(lang, 'Combina con tu racial:', 'Matches your racial setup:', 'Podkhodit tvoemu rasovomu naboru:'));
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
        lines.push(t3(lang, 'Aun faltan piezas para sugerir sinergias fuertes.', 'More pieces are needed for stronger synergy calls.', 'Nuzhno bolshe elementov dlya silnykh sinergiy.'));
    }
    return lines;
}
export function getRacialArchetypeLine(state, lang) {
    const score = new Map();
    for (const def of state.talents) {
        const rank = state.ranksByKey[def.key] || 0;
        if (rank <= 0)
            continue;
        const weight = rank
            + (state.loadout.activeSlot1 === def.key ? 2 : 0)
            + (state.loadout.activeSlot2 === def.key ? 2 : 0)
            + (state.loadout.keystoneKey === def.key ? 3 : 0);
        for (const theme of getTalentThemes(def)) {
            score.set(theme, (score.get(theme) || 0) + weight);
        }
    }
    const labels = [
        { theme: 'offense', text: { es: 'ofensiva', en: 'offense', ru: 'ataka' } },
        { theme: 'defense', text: { es: 'defensa', en: 'defense', ru: 'zashchita' } },
        { theme: 'mobility', text: { es: 'movilidad', en: 'mobility', ru: 'mobilnost' } },
        { theme: 'arcane', text: { es: 'arcano', en: 'arcane', ru: 'arkan' } },
        { theme: 'crit', text: { es: 'critico', en: 'crit', ru: 'krit' } },
        { theme: 'evasion', text: { es: 'evasion', en: 'evasion', ru: 'uklonenie' } },
        { theme: 'tank', text: { es: 'aguante', en: 'tank', ru: 'tank' } },
        { theme: 'travel', text: { es: 'viaje', en: 'travel', ru: 'puteshestvie' } },
        { theme: 'regen', text: { es: 'sustain', en: 'sustain', ru: 'sustain' } },
        { theme: 'gather', text: { es: 'recoleccion', en: 'gathering', ru: 'sbor' } },
        { theme: 'chop', text: { es: 'tala', en: 'chopping', ru: 'rubka' } },
    ];
    const top = labels
        .map((entry) => ({ label: getLocalizedText3(entry.text, lang), value: score.get(entry.theme) || 0 }))
        .filter((entry) => entry.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
        .map((entry) => entry.label);
    if (top.length > 0) {
        return top.join(' / ');
    }
    if (state.race === 'zolk') {
        return t3(lang, 'quimico / movilidad / reaccion', 'chemical / mobility / reaction', 'khimicheskiy / mobilnost / reaktsiya');
    }
    return t3(lang, 'bosque / sustain / control', 'forest / sustain / control', 'les / sustain / kontrol');
}
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
