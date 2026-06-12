// @ts-nocheck
import { getLocalizedText3, } from '../../data/skill-trees.js';
import { canLearnBuildSkill } from '../../services/build-skills.js';
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
function formatPercentFromFraction(value, digits = 1) {
    const pct = value * 100;
    return `${pct >= 0 ? '+' : ''}${formatNumber(pct, digits)}%`;
}
function formatPercentPoints(value, digits = 1) {
    return `${value >= 0 ? '+' : ''}${formatNumber(value, digits)}%`;
}
function formatSignedFlat(value, digits = 1) {
    return `${value >= 0 ? '+' : ''}${formatNumber(value, digits)}`;
}
function formatActionLabel(action, lang) {
    if (action === 'chop')
        return t3(lang, 'Tala', 'Chop', 'Rubka');
    if (action === 'mine')
        return t3(lang, 'Mineria', 'Mine', 'Dobycha');
    if (action === 'fish')
        return t3(lang, 'Pesca', 'Fish', 'Rybalka');
    return t3(lang, 'Recoleccion', 'Gather', 'Sbor');
}
function formatEventLabel(event, lang) {
    if (event === 'on_hit_taken') {
        return t3(lang, 'al recibir golpe', 'when hit', 'pri poluchenii udara');
    }
    if (event === 'on_crit_taken') {
        return t3(lang, 'al recibir critico', 'when taking a crit', 'pri poluchenii krita');
    }
    if (event === 'on_crit_evaded') {
        return t3(lang, 'al esquivar un critico', 'when evading a crit', 'pri uklonenii ot krita');
    }
    if (event === 'on_crit_blocked') {
        return t3(lang, 'al bloquear un critico', 'when blocking a crit', 'pri bloke krita');
    }
    if (event === 'on_hp_below_threshold') {
        return t3(lang, 'con HP bajo', 'with low HP', 'pri nizkom HP');
    }
    if (event === 'on_sta_below_threshold') {
        return t3(lang, 'con STA baja', 'with low STA', 'pri nizkoy STA');
    }
    return t3(lang, 'al iniciar turno', 'on turn start', 'v nachale hoda');
}
function formatCondition(condition, lang) {
    const pieces = [];
    if (typeof condition.hpBelowPct === 'number') {
        pieces.push(`HP < ${formatNumber(condition.hpBelowPct, 0)}%`);
    }
    if (typeof condition.hpAbovePct === 'number') {
        pieces.push(`HP > ${formatNumber(condition.hpAbovePct, 0)}%`);
    }
    if (typeof condition.staBelowPct === 'number') {
        pieces.push(`STA < ${formatNumber(condition.staBelowPct, 0)}%`);
    }
    if (typeof condition.staAbovePct === 'number') {
        pieces.push(`STA > ${formatNumber(condition.staAbovePct, 0)}%`);
    }
    if (pieces.length === 0) {
        return t3(lang, 'siempre', 'always', 'vsegda');
    }
    return pieces.join(' & ');
}
function collectEffectTokens(effectSet, scale, lang) {
    if (!effectSet)
        return [];
    const tokens = [];
    const mods = effectSet.combatModifiers;
    if (mods?.attackPct)
        tokens.push(`ATK ${formatPercentFromFraction(mods.attackPct * scale)}`);
    if (mods?.arcanePct)
        tokens.push(`ARC ${formatPercentFromFraction(mods.arcanePct * scale)}`);
    if (mods?.defensePct)
        tokens.push(`DEF ${formatPercentFromFraction(mods.defensePct * scale)}`);
    if (mods?.moveSpeedPct)
        tokens.push(`MOV ${formatPercentFromFraction(mods.moveSpeedPct * scale)}`);
    if (mods?.atkSpeedPct)
        tokens.push(`ASPD ${formatPercentFromFraction(mods.atkSpeedPct * scale)}`);
    if (mods?.maxHpFlat)
        tokens.push(`HP ${formatSignedFlat(mods.maxHpFlat * scale)}`);
    if (mods?.maxEnergyFlat)
        tokens.push(`STA ${formatSignedFlat(mods.maxEnergyFlat * scale)}`);
    if (mods?.attackFlat)
        tokens.push(`ATK+ ${formatSignedFlat(mods.attackFlat * scale)}`);
    if (mods?.arcaneFlat)
        tokens.push(`ARC+ ${formatSignedFlat(mods.arcaneFlat * scale)}`);
    if (mods?.defenseFlat)
        tokens.push(`DEF+ ${formatSignedFlat(mods.defenseFlat * scale)}`);
    if (mods?.critChanceFlat)
        tokens.push(`Crit ${formatPercentPoints(mods.critChanceFlat * scale)}`);
    if (mods?.evasionFlat)
        tokens.push(`Eva ${formatPercentPoints(mods.evasionFlat * scale)}`);
    if (mods?.resistPhysicalFlat)
        tokens.push(`R.Fis ${formatSignedFlat(mods.resistPhysicalFlat * scale)}`);
    if (mods?.resistElementalFlat)
        tokens.push(`R.Ele ${formatSignedFlat(mods.resistElementalFlat * scale)}`);
    if (mods?.resistArcaneFlat)
        tokens.push(`R.Arc ${formatSignedFlat(mods.resistArcaneFlat * scale)}`);
    if (mods?.resistHolyFlat)
        tokens.push(`R.Sac ${formatSignedFlat(mods.resistHolyFlat * scale)}`);
    if (mods?.resistChemicalFlat)
        tokens.push(`R.Quim ${formatSignedFlat(mods.resistChemicalFlat * scale)}`);
    if (effectSet.travelStaminaCostMultiplierDelta) {
        tokens.push(`Viaje STA ${formatPercentFromFraction(effectSet.travelStaminaCostMultiplierDelta * scale)}`);
    }
    if (effectSet.travelTimeMultiplierDelta) {
        tokens.push(`Viaje T ${formatPercentFromFraction(effectSet.travelTimeMultiplierDelta * scale)}`);
    }
    if (effectSet.passiveStaRegenBonusDelta) {
        tokens.push(`Regen STA ${formatSignedFlat(effectSet.passiveStaRegenBonusDelta * scale, 0)}`);
    }
    if (effectSet.counterAttackRatio) {
        tokens.push(`Counter ${formatPercentFromFraction(effectSet.counterAttackRatio * scale, 0)}`);
    }
    if (effectSet.actionEnergyCostMultiplierDelta) {
        for (const action of Object.keys(effectSet.actionEnergyCostMultiplierDelta)) {
            const value = effectSet.actionEnergyCostMultiplierDelta[action];
            if (!value)
                continue;
            tokens.push(`${formatActionLabel(action, lang)} STA ${formatPercentFromFraction(value * scale)}`);
        }
    }
    if (effectSet.actionYieldMultiplierDelta) {
        for (const action of Object.keys(effectSet.actionYieldMultiplierDelta)) {
            const value = effectSet.actionYieldMultiplierDelta[action];
            if (!value)
                continue;
            tokens.push(`${formatActionLabel(action, lang)} Loot ${formatPercentFromFraction(value * scale)}`);
        }
    }
    return tokens;
}
function formatTokenRows(tokens) {
    const rows = [];
    for (let i = 0; i < tokens.length; i += 2) {
        const left = tokens[i];
        const right = tokens[i + 1];
        rows.push(right ? `${left} | ${right}` : left);
    }
    return rows;
}
function buildRankSummaryLines(def, rank, lang) {
    const lines = [];
    const nextRank = Math.min(def.maxRank, Math.max(1, rank + 1));
    if (def.passiveEffectsPerRank) {
        const currentTokens = rank > 0 ? collectEffectTokens(def.passiveEffectsPerRank, rank, lang) : [];
        const nextTokens = rank < def.maxRank ? collectEffectTokens(def.passiveEffectsPerRank, nextRank, lang) : currentTokens;
        const maxTokens = collectEffectTokens(def.passiveEffectsPerRank, def.maxRank, lang);
        if (rank > 0 && currentTokens.length > 0) {
            lines.push(`Actual R${rank}: ${formatTokenRows(currentTokens).join(' / ')}`);
        }
        if (rank < def.maxRank && nextTokens.length > 0) {
            lines.push(`Siguiente R${nextRank}: ${formatTokenRows(nextTokens).join(' / ')}`);
        }
        if (def.maxRank > 1 && maxTokens.length > 0 && (rank < def.maxRank || rank === 0)) {
            lines.push(`Max R${def.maxRank}: ${formatTokenRows(maxTokens).join(' / ')}`);
        }
    }
    if (def.passiveEffectsFlat) {
        const flatTokens = collectEffectTokens(def.passiveEffectsFlat, 1, lang);
        if (flatTokens.length > 0) {
            lines.push(`Base fija: ${formatTokenRows(flatTokens).join(' / ')}`);
        }
    }
    if (def.conditionalEffectsPerRank && def.conditionalEffectsPerRank.length > 0) {
        for (const entry of def.conditionalEffectsPerRank) {
            const previewRank = rank > 0 ? rank : 1;
            const tokens = collectEffectTokens(entry.effects, previewRank, lang);
            if (tokens.length === 0)
                continue;
            const label = rank > 0 ? `Cond. R${previewRank}` : 'Cond. R1';
            lines.push(`${label} [${formatCondition(entry.condition, lang)}]: ${formatTokenRows(tokens).join(' / ')}`);
        }
    }
    if (def.activeConfig) {
        const activeTokens = collectEffectTokens(def.activeConfig.effects, 1, lang);
        const timeLine = `CD ${def.activeConfig.cooldownSeconds}s | Cast ${def.activeConfig.castSeconds}s | Up ${def.activeConfig.durationSeconds}s`;
        lines.push(`Activa: ${timeLine}`);
        if (activeTokens.length > 0) {
            lines.push(`Buff: ${formatTokenRows(activeTokens).join(' / ')}`);
        }
    }
    if (def.reactionConfig) {
        const reactionTokens = collectEffectTokens(def.reactionConfig.effects, 1, lang);
        const triggerLine = `Trigger: ${formatEventLabel(def.reactionConfig.event, lang)}`;
        const timeLine = `CD ${def.reactionConfig.cooldownSeconds}s | Up ${def.reactionConfig.durationSeconds}s`;
        lines.push(`Reaccion: ${triggerLine}`);
        lines.push(timeLine);
        if (def.reactionConfig.condition) {
            lines.push(`Solo si ${formatCondition(def.reactionConfig.condition, lang)}`);
        }
        if (reactionTokens.length > 0) {
            lines.push(`Ventana: ${formatTokenRows(reactionTokens).join(' / ')}`);
        }
    }
    return lines;
}
function getPreviewTokens(def, lang) {
    if (def.passiveEffectsPerRank) {
        const tokens = collectEffectTokens(def.passiveEffectsPerRank, 1, lang);
        if (tokens.length > 0)
            return tokens;
    }
    if (def.passiveEffectsFlat) {
        const tokens = collectEffectTokens(def.passiveEffectsFlat, 1, lang);
        if (tokens.length > 0)
            return tokens;
    }
    if (def.conditionalEffectsPerRank?.length) {
        const entry = def.conditionalEffectsPerRank[0];
        const conditionLabel = formatCondition(entry.condition, lang);
        const tokens = collectEffectTokens(entry.effects, 1, lang);
        if (tokens.length > 0) {
            return [`${conditionLabel}: ${tokens[0]}`, ...tokens.slice(1)];
        }
    }
    if (def.activeConfig) {
        return [`CD ${def.activeConfig.cooldownSeconds}s`, ...collectEffectTokens(def.activeConfig.effects, 1, lang)];
    }
    if (def.reactionConfig) {
        return [
            formatEventLabel(def.reactionConfig.event, lang),
            ...collectEffectTokens(def.reactionConfig.effects, 1, lang),
        ];
    }
    return [getLocalizedText3(def.summary, lang)];
}
function collectThemesFromEffectSet(effectSet, out) {
    if (!effectSet)
        return;
    const mods = effectSet.combatModifiers;
    if (mods?.attackPct || mods?.attackFlat || mods?.critChanceFlat || mods?.atkSpeedPct)
        out.add('offense');
    if (mods?.arcanePct || mods?.arcaneFlat || mods?.resistArcaneFlat)
        out.add('arcane');
    if (mods?.defensePct || mods?.defenseFlat || mods?.maxHpFlat || mods?.resistPhysicalFlat || mods?.resistElementalFlat || mods?.resistHolyFlat || mods?.resistChemicalFlat) {
        out.add('defense');
        out.add('survival');
    }
    if (mods?.moveSpeedPct || mods?.evasionFlat)
        out.add('mobility');
    if (mods?.critChanceFlat)
        out.add('crit');
    if (mods?.evasionFlat)
        out.add('evasion');
    if (effectSet.counterAttackRatio)
        out.add('counter');
    if (effectSet.travelStaminaCostMultiplierDelta || effectSet.travelTimeMultiplierDelta)
        out.add('travel');
    if (effectSet.passiveStaRegenBonusDelta || mods?.maxEnergyFlat || effectSet.actionEnergyCostMultiplierDelta)
        out.add('stamina');
    if (effectSet.actionYieldMultiplierDelta)
        out.add('farm');
    const yieldMap = effectSet.actionYieldMultiplierDelta;
    if (yieldMap?.chop)
        out.add('farm_chop');
    if (yieldMap?.mine)
        out.add('farm_mine');
    if (yieldMap?.gather)
        out.add('farm_gather');
    if (yieldMap?.fish)
        out.add('farm_fish');
}
function collectThemes(def) {
    const themes = new Set();
    if (def.type === 'active')
        themes.add('active_window');
    if (def.type === 'keystone')
        themes.add('keystone');
    if (def.category === 'offense')
        themes.add('offense');
    if (def.category === 'defense')
        themes.add('defense');
    if (def.category === 'mobility')
        themes.add('mobility');
    if (def.category === 'utility')
        themes.add('stamina');
    if (def.passiveEffectsPerRank)
        collectThemesFromEffectSet(def.passiveEffectsPerRank, themes);
    if (def.passiveEffectsFlat)
        collectThemesFromEffectSet(def.passiveEffectsFlat, themes);
    for (const conditional of def.conditionalEffectsPerRank || []) {
        collectThemesFromEffectSet(conditional.effects, themes);
        if (typeof conditional.condition.hpBelowPct === 'number')
            themes.add('low_hp');
        if (typeof conditional.condition.hpAbovePct === 'number')
            themes.add('high_hp');
        if (typeof conditional.condition.staBelowPct === 'number')
            themes.add('low_sta');
        if (typeof conditional.condition.staAbovePct === 'number')
            themes.add('high_sta');
    }
    if (def.activeConfig)
        collectThemesFromEffectSet(def.activeConfig.effects, themes);
    if (def.reactionConfig) {
        collectThemesFromEffectSet(def.reactionConfig.effects, themes);
        if (def.reactionConfig.event === 'on_hit_taken')
            themes.add('react_hit');
        if (def.reactionConfig.event === 'on_crit_taken')
            themes.add('react_crit_taken');
        if (def.reactionConfig.event === 'on_crit_evaded')
            themes.add('react_crit_evaded');
        if (def.reactionConfig.event === 'on_crit_blocked')
            themes.add('react_crit_blocked');
        if (typeof def.reactionConfig.condition?.hpBelowPct === 'number')
            themes.add('low_hp');
        if (typeof def.reactionConfig.condition?.staBelowPct === 'number')
            themes.add('low_sta');
    }
    return themes;
}
function evaluatePairSynergy(base, candidate, lang) {
    const baseThemes = collectThemes(base);
    const candidateThemes = collectThemes(candidate);
    let score = 0;
    const reasons = [];
    const has = (set, theme) => set.has(theme);
    const pair = (a, b) => (has(baseThemes, a) && has(candidateThemes, b)) || (has(baseThemes, b) && has(candidateThemes, a));
    if (base.prerequisites?.includes(candidate.key) || candidate.prerequisites?.includes(base.key)) {
        score += 8;
        reasons.push(t3(lang, 'ruta directa de talento', 'direct talent route', 'pryamaya vetka talanta'));
    }
    if (pair('evasion', 'react_crit_evaded')) {
        score += 7;
        reasons.push(t3(lang, 'la evasion ayuda a disparar la reaccion', 'evasion helps trigger the reaction', 'uklonenie pomogaet zapusku reaktsii'));
    }
    if (pair('defense', 'react_hit') || pair('survival', 'react_hit')) {
        score += 5;
        reasons.push(t3(lang, 'aguanta mejor para activar su respuesta al golpe', 'survives longer to trigger hit response', 'pomogaet dozhit do triggera udara'));
    }
    if (pair('defense', 'react_crit_taken') || pair('survival', 'react_crit_taken')) {
        score += 5;
        reasons.push(t3(lang, 'combina aguante con reaccion a criticos recibidos', 'pairs survivability with crit-taken reaction', 'kombiniruet vyzhivaemost s reaktsiey na krit'));
    }
    if (pair('offense', 'crit')) {
        score += 4;
        reasons.push(t3(lang, 'mezcla dano base con critico', 'mixes base damage with crit', 'smeshivaet bazoviy uron i krit'));
    }
    if (pair('arcane', 'arcane')) {
        score += 4;
        reasons.push(t3(lang, 'ambas skills escalan poder arcano', 'both skills scale arcane power', 'obe skilli usilivayut arkanu'));
    }
    if (pair('counter', 'evasion') || pair('counter', 'defense')) {
        score += 4;
        reasons.push(t3(lang, 'mejora tus ventanas de contraataque', 'improves counterattack windows', 'uluchshaet okna kontrataki'));
    }
    if (pair('travel', 'mobility')) {
        score += 2;
        reasons.push(t3(lang, 'suma movilidad real dentro y fuera de combate', 'adds mobility in and out of combat', 'usilivaet mobilnost v boju i v puti'));
    }
    if (pair('stamina', 'low_sta') || pair('stamina', 'active_window')) {
        score += 3;
        reasons.push(t3(lang, 'te sostiene mejor cuando el ritmo aprieta', 'helps sustain pressure when tempo rises', 'podderzhivaet temp pri davlenii'));
    }
    if (pair('farm', 'stamina')) {
        score += 3;
        reasons.push(t3(lang, 'farmeas mas tiempo con mejor eficiencia', 'extends farming with better efficiency', 'daet bolshe vremeni na farm'));
    }
    if (pair('farm_chop', 'farm_chop') || pair('farm_mine', 'farm_mine') || pair('farm_gather', 'farm_gather') || pair('farm_fish', 'farm_fish')) {
        score += 5;
        reasons.push(t3(lang, 'duplica el foco sobre el mismo oficio', 'doubles down on the same profession', 'usilivaet odin i tot zhe promysel'));
    }
    if (pair('low_hp', 'defense') || pair('low_hp', 'survival')) {
        score += 3;
        reasons.push(t3(lang, 'fortalece tu plan cuando quedas bajo de vida', 'reinforces your low-HP plan', 'usilivaet plan pri nizkom HP'));
    }
    if (pair('high_sta', 'arcane') || pair('high_sta', 'offense')) {
        score += 3;
        reasons.push(t3(lang, 'premia jugar con recursos altos', 'rewards playing from high resources', 'nagrazhdaet igru s visokim resursom'));
    }
    if (base.type === 'active' && candidate.type === 'passive' && (pair('offense', 'offense') || pair('arcane', 'arcane') || pair('mobility', 'mobility'))) {
        score += 2;
        reasons.push(t3(lang, 'el pasivo empuja mejor tu ventana activa', 'the passive amplifies your active window', 'passivka usilivaet aktivnoe okno'));
    }
    if (base.type === 'reaction' && candidate.type === 'passive' && (pair('defense', 'defense') || pair('evasion', 'evasion') || pair('offense', 'offense'))) {
        score += 2;
        reasons.push(t3(lang, 'el pasivo alimenta tu trigger o su recompensa', 'the passive feeds the trigger or payoff', 'passivka podderzhivaet trigger ili nagradu'));
    }
    if (score <= 0) {
        if (base.category === candidate.category) {
            score = 1;
            reasons.push(t3(lang, 'comparten la misma linea de juego', 'they share the same playstyle lane', 'oni v odnoi stilistike igry'));
        }
        else if (candidate.type === 'keystone' || base.type === 'keystone') {
            score = 1;
            reasons.push(t3(lang, 'pueden cerrar una build mas definida', 'can lock in a clearer build', 'mogut zakrepit bolee chotkiy build'));
        }
    }
    return {
        score,
        reason: reasons[0] || t3(lang, 'aporta una capa util a tu build', 'adds a useful layer to your build', 'dobavlyaet polezniy sloy v build'),
    };
}
function isEquipped(state, skillKey) {
    return [state.loadout.activeSlot1, state.loadout.activeSlot2, state.loadout.activeSlot3, state.loadout.keystoneKey].includes(skillKey);
}
function buildSuggestionLine(insight, state, lang) {
    const name = getLocalizedText3(insight.other.name, lang);
    const preview = getBuildSkillPreview(insight.other, lang);
    const equippedTag = isEquipped(state, insight.other.key) ? ` ${t3(lang, '[ON]', '[ON]', '[ON]')}` : '';
    return `${name}${equippedTag} -> ${preview} :: ${insight.reason}`;
}
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
//# sourceMappingURL=build-ui.js.map