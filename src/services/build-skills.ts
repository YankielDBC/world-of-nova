// @ts-nocheck
import { observePerf } from '../lib/perf-metrics.js';
import { getBuildSkillByKey } from '../data/skill-trees.js';
import { DEFAULT_EFFECTS, } from './build-skills-types.js';
import { clamp, cloneEffects, conditionMatches, normalizeSkillKey, roundTo, toDateMs, toNumber, } from './build-skills-utils.js';
import { buildEffectsCacheKey, ensureBuildSkillSchema, getActiveEffectRows, getCachedEffects, invalidateBuildGameplayEffectsCache, readBuildTelemetrySummary, setCachedEffects, } from './build-skills-state.js';
import { getPlayerBuildSkillState, getConditionSnapshot, } from './build-skills-actions.js';
export { ensureBuildSkillSchema, invalidateBuildGameplayEffectsCache, } from './build-skills-state.js';
export { activateBuildSkill, canLearnBuildSkill, equipBuildSkill, getBuildResetCost, getBuildRuntimeStatus, getPlayerBuildSkillState, learnBuildSkillRank, resetBuildSkills, triggerBuildReactions, unequipBuildSkill, } from './build-skills-actions.js';

function applyEffectSet(target, source, scale = 1) {
    if (!source)
        return;
    const s = Number.isFinite(scale) ? scale : 1;
    const modifiers = source.combatModifiers;
    if (modifiers) {
        target.combatModifiers.attackPct = (target.combatModifiers.attackPct || 0) + (modifiers.attackPct || 0) * s;
        target.combatModifiers.arcanePct = (target.combatModifiers.arcanePct || 0) + (modifiers.arcanePct || 0) * s;
        target.combatModifiers.defensePct = (target.combatModifiers.defensePct || 0) + (modifiers.defensePct || 0) * s;
        target.combatModifiers.moveSpeedPct = (target.combatModifiers.moveSpeedPct || 0) + (modifiers.moveSpeedPct || 0) * s;
        target.combatModifiers.atkSpeedPct = (target.combatModifiers.atkSpeedPct || 0) + (modifiers.atkSpeedPct || 0) * s;
        target.combatModifiers.maxHpFlat = (target.combatModifiers.maxHpFlat || 0) + (modifiers.maxHpFlat || 0) * s;
        target.combatModifiers.maxEnergyFlat = (target.combatModifiers.maxEnergyFlat || 0) + (modifiers.maxEnergyFlat || 0) * s;
        target.combatModifiers.attackFlat = (target.combatModifiers.attackFlat || 0) + (modifiers.attackFlat || 0) * s;
        target.combatModifiers.arcaneFlat = (target.combatModifiers.arcaneFlat || 0) + (modifiers.arcaneFlat || 0) * s;
        target.combatModifiers.defenseFlat = (target.combatModifiers.defenseFlat || 0) + (modifiers.defenseFlat || 0) * s;
        target.combatModifiers.critChanceFlat = (target.combatModifiers.critChanceFlat || 0) + (modifiers.critChanceFlat || 0) * s;
        target.combatModifiers.evasionFlat = (target.combatModifiers.evasionFlat || 0) + (modifiers.evasionFlat || 0) * s;
        target.combatModifiers.resistPhysicalFlat = (target.combatModifiers.resistPhysicalFlat || 0) + (modifiers.resistPhysicalFlat || 0) * s;
        target.combatModifiers.resistElementalFlat = (target.combatModifiers.resistElementalFlat || 0) + (modifiers.resistElementalFlat || 0) * s;
        target.combatModifiers.resistArcaneFlat = (target.combatModifiers.resistArcaneFlat || 0) + (modifiers.resistArcaneFlat || 0) * s;
        target.combatModifiers.resistHolyFlat = (target.combatModifiers.resistHolyFlat || 0) + (modifiers.resistHolyFlat || 0) * s;
        target.combatModifiers.resistChemicalFlat = (target.combatModifiers.resistChemicalFlat || 0) + (modifiers.resistChemicalFlat || 0) * s;
    }
    target.travelStaminaCostMultiplier += (source.travelStaminaCostMultiplierDelta || 0) * s;
    target.travelTimeMultiplier += (source.travelTimeMultiplierDelta || 0) * s;
    target.passiveStaRegenBonus += (source.passiveStaRegenBonusDelta || 0) * s;
    target.counterAttackRatio += (source.counterAttackRatio || 0) * s;
    if (source.actionEnergyCostMultiplierDelta) {
        target.actionEnergyCostMultiplier.chop += (source.actionEnergyCostMultiplierDelta.chop || 0) * s;
        target.actionEnergyCostMultiplier.mine += (source.actionEnergyCostMultiplierDelta.mine || 0) * s;
        target.actionEnergyCostMultiplier.gather += (source.actionEnergyCostMultiplierDelta.gather || 0) * s;
        target.actionEnergyCostMultiplier.fish += (source.actionEnergyCostMultiplierDelta.fish || 0) * s;
    }
    if (source.actionYieldMultiplierDelta) {
        target.actionYieldMultiplier.chop += (source.actionYieldMultiplierDelta.chop || 0) * s;
        target.actionYieldMultiplier.mine += (source.actionYieldMultiplierDelta.mine || 0) * s;
        target.actionYieldMultiplier.gather += (source.actionYieldMultiplierDelta.gather || 0) * s;
        target.actionYieldMultiplier.fish += (source.actionYieldMultiplierDelta.fish || 0) * s;
    }
}
function applyConditionalPerRank(target, perRank, rank, condition) {
    if (!perRank || rank <= 0)
        return;
    for (const entry of perRank) {
        if (!conditionMatches(condition, entry.condition))
            continue;
        applyEffectSet(target, entry.effects, rank);
    }
}
function finalizeEffects(input) {
    const out = cloneEffects(input);
    out.combatModifiers.attackPct = clamp(out.combatModifiers.attackPct || 0, -0.2, 0.25);
    out.combatModifiers.arcanePct = clamp(out.combatModifiers.arcanePct || 0, -0.2, 0.25);
    out.combatModifiers.defensePct = clamp(out.combatModifiers.defensePct || 0, -0.2, 0.25);
    out.combatModifiers.moveSpeedPct = clamp(out.combatModifiers.moveSpeedPct || 0, -0.2, 0.2);
    out.combatModifiers.atkSpeedPct = clamp(out.combatModifiers.atkSpeedPct || 0, -0.2, 0.2);
    out.travelStaminaCostMultiplier = clamp(roundTo(out.travelStaminaCostMultiplier, 4), 0.55, 1.4);
    out.travelTimeMultiplier = clamp(roundTo(out.travelTimeMultiplier, 4), 0.5, 1.45);
    out.actionEnergyCostMultiplier.chop = clamp(roundTo(out.actionEnergyCostMultiplier.chop, 4), 0.55, 1.55);
    out.actionEnergyCostMultiplier.mine = clamp(roundTo(out.actionEnergyCostMultiplier.mine, 4), 0.55, 1.55);
    out.actionEnergyCostMultiplier.gather = clamp(roundTo(out.actionEnergyCostMultiplier.gather, 4), 0.55, 1.55);
    out.actionEnergyCostMultiplier.fish = clamp(roundTo(out.actionEnergyCostMultiplier.fish, 4), 0.55, 1.55);
    out.actionYieldMultiplier.chop = clamp(roundTo(out.actionYieldMultiplier.chop, 4), 0.5, 2.6);
    out.actionYieldMultiplier.mine = clamp(roundTo(out.actionYieldMultiplier.mine, 4), 0.5, 2.6);
    out.actionYieldMultiplier.gather = clamp(roundTo(out.actionYieldMultiplier.gather, 4), 0.5, 2.6);
    out.actionYieldMultiplier.fish = clamp(roundTo(out.actionYieldMultiplier.fish, 4), 0.5, 2.6);
    out.passiveStaRegenBonus = clamp(Math.floor(out.passiveStaRegenBonus), 0, 6);
    out.counterAttackRatio = clamp(roundTo(out.counterAttackRatio, 3), 0, 1);
    return out;
}

export async function getBuildGameplayEffectsForPlayer(playerId, conditionOverride) {
    const startedAt = Date.now();
    try {
        await ensureBuildSkillSchema();
        const condition = await getConditionSnapshot(playerId, conditionOverride);
        const cacheKey = buildEffectsCacheKey(playerId, condition);
        const cached = getCachedEffects(cacheKey);
        if (cached) {
            return cached;
        }
        const [state, activeEffects] = await Promise.all([
            getPlayerBuildSkillState(playerId),
            getActiveEffectRows(playerId),
        ]);
        if (!state) {
            return cloneEffects(DEFAULT_EFFECTS);
        }
        const effects = cloneEffects(DEFAULT_EFFECTS);
        const allDefs = [...state.classSkills, ...state.generalSkills];
        for (const def of allDefs) {
            const rank = state.ranksByKey[def.key] || 0;
            if (rank <= 0)
                continue;
            applyEffectSet(effects, def.passiveEffectsPerRank, rank);
            applyEffectSet(effects, def.passiveEffectsFlat, 1);
            applyConditionalPerRank(effects, def.conditionalEffectsPerRank, rank, condition);
        }
        const nowMs = Date.now();
        for (const active of activeEffects) {
            const startsAt = toDateMs(active.startsAt);
            const endsAt = toDateMs(active.endsAt);
            if (startsAt > nowMs || endsAt <= nowMs)
                continue;
            const def = getBuildSkillByKey(active.skillKey);
            if (!def)
                continue;
            const rank = Math.max(1, Math.floor(toNumber(active.rank, 1)));
            if (active.effectType === 'active') {
                applyEffectSet(effects, def.activeConfig?.effects, rank);
            }
            else if (active.effectType === 'reaction') {
                applyEffectSet(effects, def.reactionConfig?.effects, rank);
            }
        }
        const finalized = finalizeEffects(effects);
        setCachedEffects(cacheKey, finalized);
        return finalized;
    }
    finally {
        observePerf('build.effects.resolve', Date.now() - startedAt);
    }
}

export async function getBuildTelemetrySummary(sinceHours) {
    await ensureBuildSkillSchema();
    const topEvents = await readBuildTelemetrySummary(sinceHours);
    return { topEvents };
}
export async function renderBuildTelemetrySummary(lang) {
    const summary = await getBuildTelemetrySummary(24);
    if (summary.topEvents.length === 0) {
        if (lang === 'en')
            return 'No build telemetry yet (last 24h).';
        if (lang === 'ru')
            return 'Po build-telemetrii net dannykh za 24 chasa.';
        return 'Sin telemetria de build aun (ultimas 24h).';
    }
    const rows = summary.topEvents.slice(0, 10);
    const lines = [
        lang === 'en' ? 'Build Telemetry (24h)' : lang === 'ru' ? 'Build Telemetriya (24 ch)' : 'Telemetria Build (24h)',
        '┌────────┐',
    ];
    for (const [index, row] of rows.entries()) {
        const marker = index === rows.length - 1 ? '└' : '├';
        const skillLabel = row.skillKey ? row.skillKey : '-';
        lines.push(`${marker} ${row.eventType} :: ${skillLabel} => ${row.count}`);
    }
    return lines.join('\n');
}
export async function listBuildActiveEffects(playerId) {
    await ensureBuildSkillSchema();
    const rows = await getActiveEffectRows(playerId);
    const nowMs = Date.now();
    return rows
        .map((row) => {
        const startsAt = toDateMs(row.startsAt);
        const endsAt = toDateMs(row.endsAt);
        return {
            skillKey: normalizeSkillKey(row.skillKey),
            startsInSeconds: Math.max(0, Math.ceil((startsAt - nowMs) / 1000)),
            activeSeconds: startsAt > nowMs ? 0 : Math.max(0, Math.ceil((endsAt - nowMs) / 1000)),
        };
    })
        .filter((row) => row.startsInSeconds > 0 || row.activeSeconds > 0);
}
