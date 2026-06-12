// @ts-nocheck
import { calculateCombatStats, prisma } from '../lib/db.js';
import { getBuildSkillByKey, getClassSkillDefinitions, getClassSkillPointsForLevel, getGeneralSkillDefinitions, getGeneralSkillPointsForLevel, } from '../data/skill-trees.js';
import { clamp, conditionMatches, getSpentPointsForFamily, normalizeSkillKey, rankMap, toDateMs, } from './build-skills-utils.js';
import { deleteSkillEffects, ensureBuildSkillSchema, getActiveEffectRows, getCachedState, getCooldownRows, insertSkillEffect, invalidateBuildGameplayEffectsCache, logBuildTelemetry, readLoadout, readSkillRows, setCachedState, updateLoadout, upsertCooldown, upsertSkillRank, } from './build-skills-state.js';
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
function isActiveEquipped(loadout, skillKeyRaw) {
    const skillKey = normalizeSkillKey(skillKeyRaw);
    return (normalizeSkillKey(loadout.activeSlot1) === skillKey ||
        normalizeSkillKey(loadout.activeSlot2) === skillKey ||
        normalizeSkillKey(loadout.activeSlot3) === skillKey);
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
//# sourceMappingURL=build-skills-actions.js.map