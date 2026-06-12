// @ts-nocheck
import { calculateCombatStats, prisma } from '../lib/db.js';
import { observePerf } from '../lib/perf-metrics.js';
import { getBuildSkillByKey, getClassSkillDefinitions, getClassSkillPointsForLevel, getGeneralSkillDefinitions, getGeneralSkillPointsForLevel, } from '../data/skill-trees.js';
import { DEFAULT_EFFECTS, } from './build-skills-types.js';
import { clamp, cloneEffects, getSpentPointsForFamily, normalizeSkillKey, rankMap, roundTo, toDateMs, toNumber, } from './build-skills-utils.js';
import { deleteSkillEffects, ensureBuildSkillSchema, getActiveEffectRows, getCachedEffects, getCachedState, getCooldownRows, insertSkillEffect, invalidateBuildGameplayEffectsCache, logBuildTelemetry, readBuildTelemetrySummary, readLoadout, readSkillRows, setCachedEffects, setCachedState, updateLoadout, upsertCooldown, upsertSkillRank, buildEffectsCacheKey, } from './build-skills-state.js';
export { ensureBuildSkillSchema, invalidateBuildGameplayEffectsCache, } from './build-skills-state.js';
function sanitizeLoadout(state) {
    const isLearned = (skillKey) => {
        if (!skillKey)
            return false;
        const key = normalizeSkillKey(skillKey);
        const rank = state.ranksByKey[key] || 0;
        if (rank < 1)
            return false;
        return state.classSkillKeys.has(key) || state.generalSkillKeys.has(key);
    };
    const next = {
        activeSlot1: state.loadout.activeSlot1,
        activeSlot2: state.loadout.activeSlot2,
        activeSlot3: state.loadout.activeSlot3,
        keystoneKey: state.loadout.keystoneKey,
    };
    const activeSlots = ['activeSlot1', 'activeSlot2', 'activeSlot3'];
    const usedActive = new Set();
    for (const slot of activeSlots) {
        const key = normalizeSkillKey(next[slot]);
        const def = key ? getBuildSkillByKey(key) : null;
        const valid = !!def && def.type === 'active' && isLearned(key);
        if (!valid || usedActive.has(key)) {
            next[slot] = null;
            continue;
        }
        usedActive.add(key);
        next[slot] = key;
    }
    const keystoneKey = normalizeSkillKey(next.keystoneKey);
    const keystoneDef = keystoneKey ? getBuildSkillByKey(keystoneKey) : null;
    const validKeystone = !!keystoneDef && keystoneDef.type === 'keystone' && isLearned(keystoneKey);
    if (!validKeystone) {
        next.keystoneKey = null;
    }
    else {
        next.keystoneKey = keystoneKey;
    }
    return next;
}
function getClassSkillKeySet(classKey) {
    const defs = getClassSkillDefinitions(classKey);
    return new Set(defs.map((def) => def.key));
}
function getGeneralSkillKeySet() {
    const defs = getGeneralSkillDefinitions();
    return new Set(defs.map((def) => def.key));
}
export async function getPlayerBuildSkillState(playerId) {
    await ensureBuildSkillSchema();
    const cached = getCachedState(playerId);
    if (cached) {
        return cached;
    }
    const player = await prisma.player.findUnique({
        where: { id: playerId },
        select: {
            id: true,
            class: true,
            level: true,
            silver: true,
        },
    });
    if (!player)
        return null;
    const classKey = player.class ? String(player.class).toLowerCase() : null;
    const classSkills = getClassSkillDefinitions(classKey);
    const generalSkills = getGeneralSkillDefinitions();
    const classSkillKeys = getClassSkillKeySet(classKey);
    const generalSkillKeys = getGeneralSkillKeySet();
    const [skillRows, loadoutRaw] = await Promise.all([readSkillRows(playerId), readLoadout(playerId)]);
    const ranksByKey = rankMap(skillRows);
    const loadout = sanitizeLoadout({
        loadout: loadoutRaw,
        ranksByKey,
        classSkillKeys,
        generalSkillKeys,
    });
    const loadoutChanged = loadout.activeSlot1 !== loadoutRaw.activeSlot1 ||
        loadout.activeSlot2 !== loadoutRaw.activeSlot2 ||
        loadout.activeSlot3 !== loadoutRaw.activeSlot3 ||
        loadout.keystoneKey !== loadoutRaw.keystoneKey;
    if (loadoutChanged) {
        await updateLoadout(playerId, loadout);
    }
    const totalClassPoints = getClassSkillPointsForLevel(player.level);
    const totalGeneralPoints = getGeneralSkillPointsForLevel(player.level);
    const spentClassPoints = getSpentPointsForFamily(ranksByKey, 'class');
    const spentGeneralPoints = getSpentPointsForFamily(ranksByKey, 'general');
    const state = {
        playerId,
        classKey,
        level: player.level,
        silver: player.silver,
        ranksByKey,
        loadout,
        classSkills,
        generalSkills,
        totalClassPoints,
        totalGeneralPoints,
        spentClassPoints,
        spentGeneralPoints,
        freeClassPoints: Math.max(0, totalClassPoints - spentClassPoints),
        freeGeneralPoints: Math.max(0, totalGeneralPoints - spentGeneralPoints),
    };
    setCachedState(playerId, state);
    return state;
}
function getDefForState(state, skillKeyRaw) {
    const skillKey = normalizeSkillKey(skillKeyRaw);
    const def = getBuildSkillByKey(skillKey);
    if (!def)
        return null;
    if (def.family === 'class' && def.classKey !== state.classKey) {
        return null;
    }
    return def;
}
export function canLearnBuildSkill(state, skill) {
    const currentRank = state.ranksByKey[skill.key] || 0;
    if (currentRank >= skill.maxRank) {
        return { ok: false, reason: 'Ya esta al maximo.' };
    }
    if (skill.family === 'class' && skill.classKey !== state.classKey) {
        return { ok: false, reason: 'Skill de otra clase.' };
    }
    if (skill.prerequisites && skill.prerequisites.length > 0) {
        for (const requiredKey of skill.prerequisites) {
            if ((state.ranksByKey[normalizeSkillKey(requiredKey)] || 0) < 1) {
                const req = getBuildSkillByKey(requiredKey);
                return { ok: false, reason: `Requiere ${req?.name.es || requiredKey}.` };
            }
        }
    }
    const freePoints = skill.family === 'class' ? state.freeClassPoints : state.freeGeneralPoints;
    if (freePoints < skill.costPerRank) {
        return { ok: false, reason: 'Puntos insuficientes.' };
    }
    return { ok: true };
}
export async function learnBuildSkillRank(playerId, skillKeyRaw) {
    await ensureBuildSkillSchema();
    const state = await getPlayerBuildSkillState(playerId);
    if (!state)
        return { success: false, message: 'Jugador no encontrado.' };
    const def = getDefForState(state, skillKeyRaw);
    if (!def)
        return { success: false, message: 'Skill no disponible para tu clase.' };
    const canLearn = canLearnBuildSkill(state, def);
    if (!canLearn.ok) {
        return { success: false, message: canLearn.reason || 'No se puede aprender.' };
    }
    const currentRank = state.ranksByKey[def.key] || 0;
    const nextRank = currentRank + 1;
    await upsertSkillRank(playerId, def.key, nextRank);
    invalidateBuildGameplayEffectsCache(playerId);
    await logBuildTelemetry('learn', playerId, def.key, { rank: nextRank, family: def.family });
    const nextState = await getPlayerBuildSkillState(playerId);
    return {
        success: true,
        message: `Aprendiste ${def.name.es} (${nextRank}/${def.maxRank}).`,
        state: nextState || undefined,
    };
}
function normalizeLoadoutSlot(slot) {
    if (slot === 'active2' || slot === 'active3' || slot === 'keystone')
        return slot;
    return 'active1';
}
export async function equipBuildSkill(playerId, skillKeyRaw, slotRaw) {
    await ensureBuildSkillSchema();
    const state = await getPlayerBuildSkillState(playerId);
    if (!state)
        return { success: false, message: 'Jugador no encontrado.' };
    const slot = normalizeLoadoutSlot(slotRaw);
    const def = getDefForState(state, skillKeyRaw);
    if (!def)
        return { success: false, message: 'Skill no disponible para tu clase.' };
    const rank = state.ranksByKey[def.key] || 0;
    if (rank < 1)
        return { success: false, message: 'Primero aprende la skill.' };
    if (slot === 'keystone' && def.type !== 'keystone') {
        return { success: false, message: 'Solo keystone en ese slot.' };
    }
    if (slot !== 'keystone' && def.type !== 'active') {
        return { success: false, message: 'Solo skills activas en ese slot.' };
    }
    const next = { ...state.loadout };
    if (slot === 'active1' || slot === 'active2' || slot === 'active3') {
        if (next.activeSlot1 === def.key)
            next.activeSlot1 = null;
        if (next.activeSlot2 === def.key)
            next.activeSlot2 = null;
        if (next.activeSlot3 === def.key)
            next.activeSlot3 = null;
        if (slot === 'active1')
            next.activeSlot1 = def.key;
        if (slot === 'active2')
            next.activeSlot2 = def.key;
        if (slot === 'active3')
            next.activeSlot3 = def.key;
    }
    else {
        next.keystoneKey = def.key;
    }
    await updateLoadout(playerId, next);
    invalidateBuildGameplayEffectsCache(playerId);
    await logBuildTelemetry('equip', playerId, def.key, { slot });
    const nextState = await getPlayerBuildSkillState(playerId);
    return {
        success: true,
        message: slot === 'keystone' ? `Keystone equipada: ${def.name.es}.` : `Skill activa equipada: ${def.name.es}.`,
        state: nextState || undefined,
    };
}
export async function unequipBuildSkill(playerId, slotRaw) {
    await ensureBuildSkillSchema();
    const state = await getPlayerBuildSkillState(playerId);
    if (!state)
        return { success: false, message: 'Jugador no encontrado.' };
    const slot = normalizeLoadoutSlot(slotRaw);
    const next = { ...state.loadout };
    if (slot === 'active1')
        next.activeSlot1 = null;
    if (slot === 'active2')
        next.activeSlot2 = null;
    if (slot === 'active3')
        next.activeSlot3 = null;
    if (slot === 'keystone')
        next.keystoneKey = null;
    await updateLoadout(playerId, next);
    invalidateBuildGameplayEffectsCache(playerId);
    await logBuildTelemetry('unequip', playerId, null, { slot });
    const nextState = await getPlayerBuildSkillState(playerId);
    return {
        success: true,
        message: 'Slot liberado.',
        state: nextState || undefined,
    };
}
export function getBuildResetCost(spentClassPoints, spentGeneralPoints) {
    const spentTotal = Math.max(0, spentClassPoints) + Math.max(0, spentGeneralPoints);
    if (spentTotal <= 0)
        return 0;
    return 40 + spentTotal * 6;
}
export async function resetBuildSkills(playerId) {
    await ensureBuildSkillSchema();
    const state = await getPlayerBuildSkillState(playerId);
    if (!state)
        return { success: false, message: 'Jugador no encontrado.' };
    const resetCost = getBuildResetCost(state.spentClassPoints, state.spentGeneralPoints);
    if (resetCost <= 0) {
        return {
            success: false,
            message: 'No tienes puntos gastados.',
            state,
        };
    }
    if (state.silver < resetCost) {
        return { success: false, message: `No tienes plata suficiente. Necesitas ${resetCost} plata.` };
    }
    await prisma.$transaction(async (tx) => {
        await tx.player.update({
            where: { id: playerId },
            data: {
                silver: { decrement: resetCost },
                lastActiveAt: new Date(),
                isActive: true,
            },
        });
        await tx.$executeRawUnsafe('DELETE FROM "PlayerBuildSkill" WHERE playerId = ?', playerId);
        await tx.$executeRawUnsafe('UPDATE "PlayerBuildLoadout" SET activeSlot1 = NULL, activeSlot2 = NULL, activeSlot3 = NULL, keystoneKey = NULL, updatedAt = CURRENT_TIMESTAMP WHERE playerId = ?', playerId);
        await tx.$executeRawUnsafe('DELETE FROM "PlayerBuildEffect" WHERE playerId = ?', playerId);
        await tx.$executeRawUnsafe('DELETE FROM "PlayerBuildCooldown" WHERE playerId = ?', playerId);
    });
    invalidateBuildGameplayEffectsCache(playerId);
    await logBuildTelemetry('reset', playerId, null, { cost: resetCost });
    const nextState = await getPlayerBuildSkillState(playerId);
    return {
        success: true,
        message: `Build reiniciado. Costo: ${resetCost} plata.`,
        state: nextState || undefined,
    };
}
export async function getBuildRuntimeStatus(playerId, skillKeyRaw) {
    await ensureBuildSkillSchema();
    const nowMs = Date.now();
    const runtime = await getSkillRowsRuntime(playerId, skillKeyRaw);
    const cooldownReadyAt = toDateMs(runtime.cooldown?.readyAt || null);
    let castSeconds = 0;
    let activeSeconds = 0;
    for (const row of runtime.effects) {
        const startsAt = toDateMs(row.startsAt);
        const endsAt = toDateMs(row.endsAt);
        if (endsAt <= nowMs)
            continue;
        if (startsAt > nowMs) {
            castSeconds = Math.max(castSeconds, Math.ceil((startsAt - nowMs) / 1000));
            continue;
        }
        activeSeconds = Math.max(activeSeconds, Math.ceil((endsAt - nowMs) / 1000));
    }
    const cooldownSeconds = Math.max(0, Math.ceil((cooldownReadyAt - nowMs) / 1000));
    return {
        cooldownSeconds,
        castSeconds,
        activeSeconds,
    };
}
async function getSkillRowsRuntime(playerId, skillKeyRaw) {
    const skillKey = normalizeSkillKey(skillKeyRaw);
    const [cooldowns, effects] = await Promise.all([
        getCooldownRows(playerId),
        getActiveEffectRows(playerId),
    ]);
    return {
        cooldown: cooldowns.find((row) => normalizeSkillKey(row.skillKey) === skillKey) || null,
        effects: effects.filter((row) => normalizeSkillKey(row.skillKey) === skillKey),
    };
}
function isActiveEquipped(loadout, skillKeyRaw) {
    const skillKey = normalizeSkillKey(skillKeyRaw);
    return (normalizeSkillKey(loadout.activeSlot1) === skillKey ||
        normalizeSkillKey(loadout.activeSlot2) === skillKey ||
        normalizeSkillKey(loadout.activeSlot3) === skillKey);
}
function conditionMatches(condition, check) {
    if (!check)
        return true;
    if (typeof check.hpBelowPct === 'number' && !(condition.hpPct < check.hpBelowPct))
        return false;
    if (typeof check.hpAbovePct === 'number' && !(condition.hpPct > check.hpAbovePct))
        return false;
    if (typeof check.staBelowPct === 'number' && !(condition.staPct < check.staBelowPct))
        return false;
    if (typeof check.staAbovePct === 'number' && !(condition.staPct > check.staAbovePct))
        return false;
    return true;
}
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
async function getConditionSnapshot(playerId, override) {
    if (override) {
        return {
            hpPct: clamp(override.hpPct, 0, 200),
            staPct: clamp(override.staPct, 0, 200),
        };
    }
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) {
        return { hpPct: 100, staPct: 100 };
    }
    const stats = calculateCombatStats(player);
    const hpPct = stats.maxHp > 0 ? (player.hp / stats.maxHp) * 100 : 100;
    const staPct = stats.maxEnergy > 0 ? (player.energy / stats.maxEnergy) * 100 : 100;
    return {
        hpPct: clamp(hpPct, 0, 200),
        staPct: clamp(staPct, 0, 200),
    };
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
function getActiveSlotsForSkill(loadout, skillKeyRaw) {
    const key = normalizeSkillKey(skillKeyRaw);
    const slots = [];
    if (normalizeSkillKey(loadout.activeSlot1) === key)
        slots.push('active1');
    if (normalizeSkillKey(loadout.activeSlot2) === key)
        slots.push('active2');
    if (normalizeSkillKey(loadout.activeSlot3) === key)
        slots.push('active3');
    if (normalizeSkillKey(loadout.keystoneKey) === key)
        slots.push('keystone');
    return slots;
}
export async function activateBuildSkill(playerId, skillKeyRaw) {
    await ensureBuildSkillSchema();
    const state = await getPlayerBuildSkillState(playerId);
    if (!state)
        return { success: false, message: 'Jugador no encontrado.' };
    const def = getDefForState(state, skillKeyRaw);
    if (!def)
        return { success: false, message: 'Skill no disponible.' };
    if (def.type !== 'active' || !def.activeConfig) {
        return { success: false, message: 'Esa skill no es activa.' };
    }
    const rank = state.ranksByKey[def.key] || 0;
    if (rank < 1) {
        return { success: false, message: 'Primero aprende la skill.' };
    }
    if (!isActiveEquipped(state.loadout, def.key)) {
        return { success: false, message: 'Debes equiparla en A1/A2/A3 antes de usarla.' };
    }
    const runtimeBefore = await getBuildRuntimeStatus(playerId, def.key);
    if (runtimeBefore.cooldownSeconds > 0) {
        return {
            success: false,
            message: `En cooldown: ${runtimeBefore.cooldownSeconds}s.`,
            runtime: runtimeBefore,
        };
    }
    const nowMs = Date.now();
    const castSeconds = Math.max(0, Math.ceil(def.activeConfig.castSeconds));
    const durationSeconds = Math.max(1, Math.ceil(def.activeConfig.durationSeconds));
    const cooldownSeconds = Math.max(castSeconds, Math.ceil(def.activeConfig.cooldownSeconds));
    const startsAtMs = nowMs + castSeconds * 1000;
    const endsAtMs = startsAtMs + durationSeconds * 1000;
    const readyAtMs = nowMs + cooldownSeconds * 1000;
    await deleteSkillEffects(playerId, def.key);
    await insertSkillEffect({
        playerId,
        skillKey: def.key,
        effectType: 'active',
        sourceFamily: def.family,
        rank,
        startsAtMs,
        endsAtMs,
    });
    await upsertCooldown(playerId, def.key, readyAtMs);
    invalidateBuildGameplayEffectsCache(playerId);
    await logBuildTelemetry('activate', playerId, def.key, {
        rank,
        castSeconds,
        durationSeconds,
        cooldownSeconds,
        slots: getActiveSlotsForSkill(state.loadout, def.key),
    });
    const runtimeAfter = await getBuildRuntimeStatus(playerId, def.key);
    const statusLine = runtimeAfter.castSeconds > 0
        ? `Cast: ${runtimeAfter.castSeconds}s, activo por ${durationSeconds}s.`
        : `Activo por ${runtimeAfter.activeSeconds}s.`;
    return {
        success: true,
        message: `${def.name.es} activada. ${statusLine} Cooldown: ${runtimeAfter.cooldownSeconds}s.`,
        runtime: runtimeAfter,
    };
}
export async function triggerBuildReactions(params) {
    await ensureBuildSkillSchema();
    const state = await getPlayerBuildSkillState(params.playerId);
    if (!state)
        return [];
    const condition = await getConditionSnapshot(params.playerId, params.condition);
    const cooldownRows = await getCooldownRows(params.playerId);
    const cooldownMap = new Map(cooldownRows.map((row) => [normalizeSkillKey(row.skillKey), toDateMs(row.readyAt)]));
    const nowMs = Date.now();
    const triggered = [];
    const allDefs = [...state.classSkills, ...state.generalSkills];
    for (const def of allDefs) {
        if (def.type !== 'reaction' || !def.reactionConfig)
            continue;
        const rank = state.ranksByKey[def.key] || 0;
        if (rank < 1)
            continue;
        if (!isActiveEquipped(state.loadout, def.key))
            continue;
        if (def.reactionConfig.event !== params.event)
            continue;
        if (!conditionMatches(condition, def.reactionConfig.condition))
            continue;
        const readyAt = cooldownMap.get(def.key) || 0;
        if (readyAt > nowMs)
            continue;
        const durationSeconds = Math.max(1, Math.ceil(def.reactionConfig.durationSeconds));
        const cooldownSeconds = Math.max(1, Math.ceil(def.reactionConfig.cooldownSeconds));
        const startsAtMs = nowMs;
        const endsAtMs = startsAtMs + durationSeconds * 1000;
        const readyAtMs = nowMs + cooldownSeconds * 1000;
        await deleteSkillEffects(params.playerId, def.key);
        await insertSkillEffect({
            playerId: params.playerId,
            skillKey: def.key,
            effectType: 'reaction',
            sourceFamily: def.family,
            rank,
            startsAtMs,
            endsAtMs,
        });
        await upsertCooldown(params.playerId, def.key, readyAtMs);
        cooldownMap.set(def.key, readyAtMs);
        triggered.push({
            skillKey: def.key,
            name: def.name.es,
            durationSeconds,
        });
        await logBuildTelemetry('reaction_trigger', params.playerId, def.key, {
            event: params.event,
            durationSeconds,
            cooldownSeconds,
            rank,
        });
    }
    if (triggered.length > 0) {
        invalidateBuildGameplayEffectsCache(params.playerId);
    }
    return triggered;
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
//# sourceMappingURL=build-skills.js.map