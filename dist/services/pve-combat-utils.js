// @ts-nocheck
export function t3(lang, es, en, ru) {
    if (lang === 'en')
        return en;
    if (lang === 'ru')
        return ru;
    return es;
}
export function toNumber(value, fallback = 0) {
    if (typeof value === 'number' && Number.isFinite(value))
        return value;
    if (typeof value === 'bigint')
        return Number(value);
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
export function round1(value) {
    return Math.round(value * 10) / 10;
}
export function safeJsonParse(raw, fallback) {
    if (!raw)
        return fallback;
    try {
        const parsed = JSON.parse(raw);
        return parsed ?? fallback;
    }
    catch {
        return fallback;
    }
}
export function turnsFromSeconds(seconds) {
    return Math.max(1, Math.ceil(Math.max(1, seconds) / 8));
}
export function shortLabel(text, max = 18) {
    if (text.length <= max)
        return text;
    return `${text.slice(0, Math.max(1, max - 3))}...`;
}
export function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
}
export function mergeCombatModifiers(base, extra) {
    return {
        attackPct: (base?.attackPct || 0) + (extra?.attackPct || 0),
        arcanePct: (base?.arcanePct || 0) + (extra?.arcanePct || 0),
        defensePct: (base?.defensePct || 0) + (extra?.defensePct || 0),
        moveSpeedPct: (base?.moveSpeedPct || 0) + (extra?.moveSpeedPct || 0),
        atkSpeedPct: (base?.atkSpeedPct || 0) + (extra?.atkSpeedPct || 0),
        maxHpPct: (base?.maxHpPct || 0) + (extra?.maxHpPct || 0),
        maxEnergyPct: (base?.maxEnergyPct || 0) + (extra?.maxEnergyPct || 0),
        maxHpFlat: (base?.maxHpFlat || 0) + (extra?.maxHpFlat || 0),
        maxEnergyFlat: (base?.maxEnergyFlat || 0) + (extra?.maxEnergyFlat || 0),
        maxSoulFlat: (base?.maxSoulFlat || 0) + (extra?.maxSoulFlat || 0),
        attackFlat: (base?.attackFlat || 0) + (extra?.attackFlat || 0),
        arcaneFlat: (base?.arcaneFlat || 0) + (extra?.arcaneFlat || 0),
        baseDamageFlat: (base?.baseDamageFlat || 0) + (extra?.baseDamageFlat || 0),
        defenseFlat: (base?.defenseFlat || 0) + (extra?.defenseFlat || 0),
        critChanceFlat: (base?.critChanceFlat || 0) + (extra?.critChanceFlat || 0),
        evasionFlat: (base?.evasionFlat || 0) + (extra?.evasionFlat || 0),
        atkSpeedFlat: (base?.atkSpeedFlat || 0) + (extra?.atkSpeedFlat || 0),
        moveSpeedFlat: (base?.moveSpeedFlat || 0) + (extra?.moveSpeedFlat || 0),
        resistPhysicalFlat: (base?.resistPhysicalFlat || 0) + (extra?.resistPhysicalFlat || 0),
        resistElementalFlat: (base?.resistElementalFlat || 0) + (extra?.resistElementalFlat || 0),
        resistArcaneFlat: (base?.resistArcaneFlat || 0) + (extra?.resistArcaneFlat || 0),
        resistHolyFlat: (base?.resistHolyFlat || 0) + (extra?.resistHolyFlat || 0),
        resistChemicalFlat: (base?.resistChemicalFlat || 0) + (extra?.resistChemicalFlat || 0),
    };
}
export function effectSetToCombatModifiers(effectSet, scale) {
    if (!effectSet?.combatModifiers)
        return undefined;
    const m = effectSet.combatModifiers;
    const extra = m;
    return {
        attackPct: (m.attackPct || 0) * scale,
        arcanePct: (m.arcanePct || 0) * scale,
        defensePct: (m.defensePct || 0) * scale,
        moveSpeedPct: (m.moveSpeedPct || 0) * scale,
        atkSpeedPct: (m.atkSpeedPct || 0) * scale,
        maxHpPct: (extra.maxHpPct || 0) * scale,
        maxEnergyPct: (extra.maxEnergyPct || 0) * scale,
        maxHpFlat: (m.maxHpFlat || 0) * scale,
        maxEnergyFlat: (m.maxEnergyFlat || 0) * scale,
        maxSoulFlat: (extra.maxSoulFlat || 0) * scale,
        attackFlat: (m.attackFlat || 0) * scale,
        arcaneFlat: (m.arcaneFlat || 0) * scale,
        baseDamageFlat: (extra.baseDamageFlat || 0) * scale,
        defenseFlat: (m.defenseFlat || 0) * scale,
        critChanceFlat: (m.critChanceFlat || 0) * scale,
        evasionFlat: (m.evasionFlat || 0) * scale,
        atkSpeedFlat: (extra.atkSpeedFlat || 0) * scale,
        moveSpeedFlat: (extra.moveSpeedFlat || 0) * scale,
        resistPhysicalFlat: (m.resistPhysicalFlat || 0) * scale,
        resistElementalFlat: (m.resistElementalFlat || 0) * scale,
        resistArcaneFlat: (m.resistArcaneFlat || 0) * scale,
        resistHolyFlat: (m.resistHolyFlat || 0) * scale,
        resistChemicalFlat: (m.resistChemicalFlat || 0) * scale,
    };
}
export function aggregatePlayerEffects(effects) {
    const modifiers = effects.reduce((acc, effect) => mergeCombatModifiers(acc, effect.modifiers), {});
    return {
        modifiers,
        counterAttackRatio: effects.reduce((sum, effect) => sum + (effect.counterAttackRatio || 0), 0),
        damageReductionPct: effects.reduce((sum, effect) => sum + (effect.damageReductionPct || 0), 0),
    };
}
export function aggregateEnemyEffects(effects) {
    return effects.reduce((acc, effect) => mergeCombatModifiers(acc, effect.modifiers), {});
}
//# sourceMappingURL=pve-combat-utils.js.map