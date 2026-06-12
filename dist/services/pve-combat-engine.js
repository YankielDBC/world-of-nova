import { getBuildSkillByKey, getLocalizedText3, } from '../data/skill-trees.js';
import { getRacialTalentByKey } from '../data/racial-talents.js';
import { aggregateEnemyEffects, aggregatePlayerEffects, clamp, effectSetToCombatModifiers, round1, t3, toNumber, turnsFromSeconds, } from './pve-combat-utils.js';
export function buildEncounterLog(existing, additions) {
    return [...existing, ...additions].slice(-8);
}
export function getPvePressurePct(turnNumber) {
    if (turnNumber <= 3)
        return 0;
    return clamp((turnNumber - 3) * 0.04, 0, 0.32);
}
export function tickPlayerEffects(effects) {
    return effects
        .map((effect) => ({
        ...effect,
        remainingTurns: effect.remainingTurns - 1,
    }))
        .filter((effect) => effect.remainingTurns > 0);
}
export function tickEnemyEffects(effects) {
    return effects
        .map((effect) => ({
        ...effect,
        remainingTurns: effect.remainingTurns - 1,
    }))
        .filter((effect) => effect.remainingTurns > 0);
}
export function tickCooldowns(cooldowns) {
    const next = {};
    for (const [key, remaining] of Object.entries(cooldowns)) {
        const turns = Math.max(0, Math.floor(toNumber(remaining)));
        if (turns > 1) {
            next[key] = turns - 1;
        }
    }
    return next;
}
export function buildReactionConditionOk(event, def, hpPct, staPct) {
    if (def.type !== 'reaction' || !def.reactionConfig || def.reactionConfig.event !== event) {
        return false;
    }
    const condition = def.reactionConfig.condition;
    if (!condition)
        return true;
    if (typeof condition.hpBelowPct === 'number' && !(hpPct < condition.hpBelowPct))
        return false;
    if (typeof condition.hpAbovePct === 'number' && !(hpPct > condition.hpAbovePct))
        return false;
    if (typeof condition.staBelowPct === 'number' && !(staPct < condition.staBelowPct))
        return false;
    if (typeof condition.staAbovePct === 'number' && !(staPct > condition.staAbovePct))
        return false;
    return true;
}
export function getBuildReactionDefs(state) {
    return [...state.classSkills, ...state.generalSkills].filter((def) => {
        if (def.type !== 'reaction' || !def.reactionConfig)
            return false;
        return (state.ranksByKey[def.key] || 0) > 0;
    });
}
export function getBuildActiveDefs(state) {
    const orderedKeys = [state.loadout.activeSlot1, state.loadout.activeSlot2, state.loadout.activeSlot3].filter((entry) => !!entry);
    const defs = [];
    const seen = new Set();
    for (const key of orderedKeys) {
        if (seen.has(key))
            continue;
        const def = getBuildSkillByKey(key);
        if (!def || def.type !== 'active' || !def.activeConfig)
            continue;
        if ((state.ranksByKey[def.key] || 0) < 1)
            continue;
        defs.push(def);
        seen.add(def.key);
    }
    return defs;
}
export function getRacialActiveDefs(state) {
    const orderedKeys = [state.loadout.activeSlot1, state.loadout.activeSlot2].filter((entry) => !!entry);
    const defs = [];
    const seen = new Set();
    for (const key of orderedKeys) {
        if (seen.has(key))
            continue;
        const def = getRacialTalentByKey(key);
        if (!def || def.type !== 'active')
            continue;
        if ((state.ranksByKey[def.key] || 0) < 1)
            continue;
        defs.push(def);
        seen.add(def.key);
    }
    return defs;
}
export function getBuildSkillStaminaCost(def) {
    const active = def.activeConfig;
    if (!active)
        return 0;
    return clamp(8 + Math.ceil(active.durationSeconds / 6) + Math.ceil(active.cooldownSeconds / 20), 8, 18);
}
export function rollChance(pct) {
    return Math.random() * 100 <= clamp(pct, 0, 100);
}
export function buildAttackDamage(attacker, target, options) {
    const crit = rollChance((attacker.critChance || 0) + (options?.critBonusPct || 0));
    const effectiveEvasion = Math.max(0, (target.evasion || 0) - (options?.accuracyBonusPct || 0));
    const evaded = rollChance(effectiveEvasion);
    const blockedCrit = !!options?.forceCritBlock && crit && !evaded;
    if (evaded) {
        return { damage: 0, crit, evaded: true, blockedCrit: false };
    }
    const physicalMultiplier = options?.physicalMultiplier ?? 0.8;
    const arcaneMultiplier = options?.arcaneMultiplier ?? 0.28;
    let damage = (attacker.baseDamage || 0) +
        attacker.attack * physicalMultiplier +
        attacker.arcanePower * arcaneMultiplier;
    if (crit && !blockedCrit) {
        damage *= 1.55;
    }
    else if (blockedCrit) {
        damage *= 1.08;
    }
    damage -= target.defense * 0.58;
    damage -= options?.resistFlat || 0;
    damage *= 1 - (options?.damageReductionPct || 0);
    damage *= 1 + (options?.damageBonusPct || 0);
    damage = Math.max(1, Math.round(damage));
    return {
        damage,
        crit,
        evaded: false,
        blockedCrit,
    };
}
export function formatDamageOutcome(params) {
    if (params.evaded) {
        return t3(params.lang, `${params.targetLabel} esquiva y no recibe dano.`, `${params.targetLabel} evades and takes no damage.`, `${params.targetLabel} uklonyaetsya i ne poluchaet urona.`);
    }
    const base = params.targetLabel === 'ti' || params.targetLabel === 'you' || params.targetLabel === 'tebe'
        ? t3(params.lang, `-${params.damage} HP a ti`, `-${params.damage} HP to you`, `-${params.damage} HP po tebe`)
        : t3(params.lang, `-${params.damage} HP a ${params.targetLabel}`, `-${params.damage} HP to ${params.targetLabel}`, `-${params.damage} HP po ${params.targetLabel}`);
    if (params.blockedCrit) {
        return t3(params.lang, `${base} (crit frenado)`, `${base} (crit blunted)`, `${base} (krit sderzhan)`);
    }
    if (params.crit) {
        return t3(params.lang, `${base} (critico)`, `${base} (critical)`, `${base} (krit)`);
    }
    return base;
}
export async function triggerLocalReactions(params) {
    if (!params.buildState) {
        return {
            log: [],
            playerEffects: params.playerEffects,
            cooldowns: params.cooldowns,
            counterAttackRatio: 0,
        };
    }
    const nextEffects = [...params.playerEffects];
    const nextCooldowns = { ...params.cooldowns };
    const log = [];
    let counterAttackRatio = 0;
    for (const def of getBuildReactionDefs(params.buildState)) {
        const rank = params.buildState.ranksByKey[def.key] || 0;
        if (rank < 1 || !def.reactionConfig)
            continue;
        if ((nextCooldowns[def.key] || 0) > 0)
            continue;
        if (!buildReactionConditionOk(params.event, def, params.hpPct, params.staPct))
            continue;
        const durationTurns = turnsFromSeconds(def.reactionConfig.durationSeconds);
        const cooldownTurns = turnsFromSeconds(def.reactionConfig.cooldownSeconds);
        const label = getLocalizedText3(def.name, params.lang);
        nextEffects.push({
            key: def.key,
            label,
            source: 'build_reaction',
            remainingTurns: durationTurns,
            modifiers: effectSetToCombatModifiers(def.reactionConfig.effects, rank),
            counterAttackRatio: (def.reactionConfig.effects.counterAttackRatio || 0) * rank,
        });
        nextCooldowns[def.key] = cooldownTurns;
        counterAttackRatio += (def.reactionConfig.effects.counterAttackRatio || 0) * rank;
        log.push(t3(params.lang, `⚡ ${label} reacciona.`, `⚡ ${label} reacts.`, `⚡ ${label} reagiruet.`));
    }
    return {
        log,
        playerEffects: nextEffects,
        cooldowns: nextCooldowns,
        counterAttackRatio: clamp(counterAttackRatio, 0, 1),
    };
}
export function updateEncounterCreature(state, nextHp) {
    return {
        ...state,
        creatureCurrentHp: Math.max(0, Math.floor(nextHp)),
    };
}
export function buildCurrentPlayerStats(view, extraEffects) {
    const local = aggregatePlayerEffects(extraEffects);
    return {
        ...view.player,
        maxHp: Math.max(1, Math.floor(view.player.maxHp + (local.modifiers.maxHpFlat || 0))),
        maxSta: Math.max(1, Math.floor(view.player.maxSta + (local.modifiers.maxEnergyFlat || 0))),
        attack: round1(view.player.attack * (1 + (local.modifiers.attackPct || 0)) + (local.modifiers.attackFlat || 0)),
        arcanePower: round1(view.player.arcanePower * (1 + (local.modifiers.arcanePct || 0)) + (local.modifiers.arcaneFlat || 0)),
        defense: round1(view.player.defense * (1 + (local.modifiers.defensePct || 0)) + (local.modifiers.defenseFlat || 0)),
        critChance: clamp(round1(view.player.critChance + (local.modifiers.critChanceFlat || 0)), 0, 60),
        evasion: clamp(round1(view.player.evasion + (local.modifiers.evasionFlat || 0)), 0, 60),
        moveSpeed: round1(view.player.moveSpeed * (1 + (local.modifiers.moveSpeedPct || 0))),
        baseDamage: round1(Math.min((view.player.attack * (1 + (local.modifiers.attackPct || 0))) * 0.3, 10)),
        resistPhysical: Math.max(0, Math.floor(view.player.resistPhysical + (local.modifiers.resistPhysicalFlat || 0))),
        resistArcane: Math.max(0, Math.floor(view.player.resistArcane + (local.modifiers.resistArcaneFlat || 0))),
    };
}
export function buildCurrentEnemyStats(view, extraEffects) {
    const local = aggregateEnemyEffects(extraEffects);
    return {
        attack: round1(view.enemy.attack * (1 + (local.attackPct || 0)) + (local.attackFlat || 0)),
        arcanePower: round1(view.enemy.arcanePower * (1 + (local.arcanePct || 0)) + (local.arcaneFlat || 0)),
        defense: round1(view.enemy.defense * (1 + (local.defensePct || 0)) + (local.defenseFlat || 0)),
        critChance: clamp(round1(view.enemy.critChance + (local.critChanceFlat || 0)), 0, 60),
        evasion: clamp(round1(view.enemy.evasion + (local.evasionFlat || 0)), 0, 60),
        moveSpeed: round1(view.enemy.moveSpeed * (1 + (local.moveSpeedPct || 0))),
    };
}
