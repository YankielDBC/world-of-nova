// @ts-nocheck
import { observePerf } from '../lib/perf-metrics.js';
import { RACIAL_EFFECT_LIMITS, RACIAL_TALENT_BALANCE } from '../data/racial-balance.js';
import { getPlayerRacialTalentState } from './racial-talents.js';
const CACHE_TTL_MS = 5 * 60 * 1000;
const effectsCache = new Map();
const DEFAULT_EFFECTS = {
    combatModifiers: {
        attackPct: 0,
        arcanePct: 0,
        defensePct: 0,
        moveSpeedPct: 0,
        atkSpeedPct: 0,
        maxHpFlat: 0,
        maxEnergyFlat: 0,
        attackFlat: 0,
        arcaneFlat: 0,
        defenseFlat: 0,
        critChanceFlat: 0,
        evasionFlat: 0,
        resistPhysicalFlat: 0,
        resistElementalFlat: 0,
        resistArcaneFlat: 0,
        resistHolyFlat: 0,
        resistChemicalFlat: 0,
    },
    travelStaminaCostMultiplier: 1,
    travelTimeMultiplier: 1,
    actionEnergyCostMultiplier: {
        chop: 1,
        mine: 1,
        gather: 1,
        fish: 1,
    },
    actionYieldMultiplier: {
        chop: 1,
        mine: 1,
        gather: 1,
        fish: 1,
    },
    passiveStaRegenBonus: 0,
};
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function cloneEffects(input) {
    return {
        combatModifiers: { ...input.combatModifiers },
        travelStaminaCostMultiplier: input.travelStaminaCostMultiplier,
        travelTimeMultiplier: input.travelTimeMultiplier,
        actionEnergyCostMultiplier: { ...input.actionEnergyCostMultiplier },
        actionYieldMultiplier: { ...input.actionYieldMultiplier },
        passiveStaRegenBonus: input.passiveStaRegenBonus,
    };
}
function rankOf(state, key) {
    return Math.max(0, state.ranksByKey[key] || 0);
}
function hasActiveEquipped(state, key) {
    return state.loadout.activeSlot1 === key || state.loadout.activeSlot2 === key;
}
function hasKeystoneEquipped(state, key) {
    return state.loadout.keystoneKey === key;
}
function addPct(modifiers, key, amount) {
    modifiers[key] = (modifiers[key] || 0) + amount;
}
function addFlat(modifiers, key, amount) {
    modifiers[key] = (modifiers[key] || 0) + amount;
}
function computeEffectsFromState(state) {
    const effects = cloneEffects(DEFAULT_EFFECTS);
    const mods = effects.combatModifiers;
    if (state.race === 'zolk') {
        const tuning = RACIAL_TALENT_BALANCE.zolk;
        const toxicBlood = rankOf(state, 'zolk_toxic_blood');
        if (toxicBlood > 0) {
            addFlat(mods, 'critChanceFlat', toxicBlood * tuning.toxicBlood.critChanceFlatPerRank);
            addFlat(mods, 'resistChemicalFlat', toxicBlood * tuning.toxicBlood.resistChemicalFlatPerRank);
        }
        const labReflexes = rankOf(state, 'zolk_lab_reflexes');
        if (labReflexes > 0) {
            addFlat(mods, 'evasionFlat', labReflexes * tuning.labReflexes.evasionFlatPerRank);
            addPct(mods, 'moveSpeedPct', labReflexes * tuning.labReflexes.moveSpeedPctPerRank);
            addPct(mods, 'atkSpeedPct', labReflexes * tuning.labReflexes.atkSpeedPctPerRank);
        }
        const unstableMetabolism = rankOf(state, 'zolk_unstable_metabolism');
        if (unstableMetabolism > 0) {
            addFlat(mods, 'maxEnergyFlat', unstableMetabolism * tuning.unstableMetabolism.maxEnergyFlatPerRank);
            effects.passiveStaRegenBonus += unstableMetabolism * tuning.unstableMetabolism.passiveStaRegenPerRank;
        }
        const alchemicalSkin = rankOf(state, 'zolk_alchemical_skin');
        if (alchemicalSkin > 0) {
            addPct(mods, 'defensePct', alchemicalSkin * tuning.alchemicalSkin.defensePctPerRank);
            addFlat(mods, 'resistChemicalFlat', alchemicalSkin * tuning.alchemicalSkin.resistChemicalFlatPerRank);
        }
        const delicateHand = rankOf(state, 'zolk_delicate_hand');
        if (delicateHand > 0) {
            effects.actionYieldMultiplier.gather += delicateHand * tuning.delicateHand.gatherYieldPctPerRank;
        }
        const quickEscape = rankOf(state, 'zolk_quick_escape');
        if (quickEscape > 0) {
            effects.travelStaminaCostMultiplier -= quickEscape * tuning.quickEscape.travelStaminaCostPctPerRank;
        }
        if (rankOf(state, 'zolk_venom_glands') > 0) {
            addFlat(mods, 'critChanceFlat', tuning.venomGlands.critChanceFlat);
            addPct(mods, 'attackPct', tuning.venomGlands.attackPct);
        }
        if (hasActiveEquipped(state, 'zolk_toxic_cloud')) {
            addPct(mods, 'attackPct', tuning.toxicCloudActive.attackPct);
            addPct(mods, 'arcanePct', tuning.toxicCloudActive.arcanePct);
        }
        if (hasActiveEquipped(state, 'zolk_mutation_dash')) {
            effects.travelTimeMultiplier -= tuning.mutationDashActive.travelTimePct;
            addPct(mods, 'moveSpeedPct', tuning.mutationDashActive.moveSpeedPct);
            if (rankOf(state, 'zolk_chemical_legs') > 0) {
                effects.travelTimeMultiplier -= tuning.chemicalLegsUpgrade.travelTimePct;
                effects.travelStaminaCostMultiplier -= tuning.chemicalLegsUpgrade.travelStaminaCostPct;
            }
        }
        if (hasKeystoneEquipped(state, 'zolk_toxic_shadow')) {
            addFlat(mods, 'evasionFlat', tuning.keystoneToxicShadow.evasionFlat);
            addFlat(mods, 'critChanceFlat', tuning.keystoneToxicShadow.critChanceFlat);
        }
        else if (hasKeystoneEquipped(state, 'zolk_reactor_blood')) {
            addPct(mods, 'arcanePct', tuning.keystoneReactorBlood.arcanePct);
            addPct(mods, 'attackPct', tuning.keystoneReactorBlood.attackPct);
        }
        else if (hasKeystoneEquipped(state, 'zolk_chemical_survivor')) {
            addPct(mods, 'defensePct', tuning.keystoneChemicalSurvivor.defensePct);
            addFlat(mods, 'resistChemicalFlat', tuning.keystoneChemicalSurvivor.resistChemicalFlat);
            addFlat(mods, 'maxHpFlat', tuning.keystoneChemicalSurvivor.maxHpFlat);
            effects.passiveStaRegenBonus += tuning.keystoneChemicalSurvivor.passiveStaRegenBonus;
        }
    }
    else if (state.race === 'uren') {
        const tuning = RACIAL_TALENT_BALANCE.uren;
        const deepRoot = rankOf(state, 'uren_deep_root');
        if (deepRoot > 0) {
            addPct(mods, 'defensePct', deepRoot * tuning.deepRoot.defensePctPerRank);
            addFlat(mods, 'resistPhysicalFlat', deepRoot * tuning.deepRoot.resistPhysicalFlatPerRank);
        }
        const calmSap = rankOf(state, 'uren_calm_sap');
        if (calmSap > 0) {
            addFlat(mods, 'maxHpFlat', calmSap * tuning.calmSap.maxHpFlatPerRank);
            addFlat(mods, 'maxEnergyFlat', calmSap * tuning.calmSap.maxEnergyFlatPerRank);
        }
        const livingBark = rankOf(state, 'uren_living_bark');
        if (livingBark > 0) {
            addPct(mods, 'defensePct', livingBark * tuning.livingBark.defensePctPerRank);
            addFlat(mods, 'resistPhysicalFlat', livingBark * tuning.livingBark.resistPhysicalFlatPerRank);
        }
        const naturalPulse = rankOf(state, 'uren_natural_pulse');
        if (naturalPulse > 0) {
            addPct(mods, 'arcanePct', naturalPulse * tuning.naturalPulse.arcanePctPerRank);
            addFlat(mods, 'resistArcaneFlat', naturalPulse * tuning.naturalPulse.resistArcaneFlatPerRank);
        }
        const wildStride = rankOf(state, 'uren_wild_stride');
        if (wildStride > 0) {
            addPct(mods, 'moveSpeedPct', wildStride * tuning.wildStride.moveSpeedPctPerRank);
            effects.travelTimeMultiplier -= wildStride * tuning.wildStride.travelTimePctPerRank;
        }
        const forageEye = rankOf(state, 'uren_forage_eye');
        if (forageEye > 0) {
            effects.actionYieldMultiplier.gather += forageEye * tuning.forageEye.gatherYieldPctPerRank;
            effects.actionYieldMultiplier.chop += forageEye * tuning.forageEye.chopYieldPctPerRank;
        }
        const forestBreath = rankOf(state, 'uren_forest_breath');
        if (forestBreath > 0) {
            effects.passiveStaRegenBonus += forestBreath * tuning.forestBreath.passiveStaRegenPerRank;
            effects.actionEnergyCostMultiplier.gather -= forestBreath * tuning.forestBreath.gatherEnergyPctPerRank;
            effects.actionEnergyCostMultiplier.chop -= forestBreath * tuning.forestBreath.chopEnergyPctPerRank;
        }
        if (rankOf(state, 'uren_reflect_thorns') > 0) {
            addFlat(mods, 'defenseFlat', tuning.reflectThorns.defenseFlat);
            addFlat(mods, 'resistPhysicalFlat', tuning.reflectThorns.resistPhysicalFlat);
        }
        if (rankOf(state, 'uren_green_channel') > 0) {
            addPct(mods, 'arcanePct', tuning.greenChannel.arcanePct);
        }
        if (hasActiveEquipped(state, 'uren_vine_snare')) {
            addPct(mods, 'defensePct', tuning.vineSnareActive.defensePct);
            effects.actionEnergyCostMultiplier.chop -= tuning.vineSnareActive.chopEnergyPct;
        }
        if (hasActiveEquipped(state, 'uren_arcane_bud')) {
            addPct(mods, 'attackPct', tuning.arcaneBudActive.attackPct);
            addPct(mods, 'arcanePct', tuning.arcaneBudActive.arcanePct);
        }
        if (hasKeystoneEquipped(state, 'uren_forest_heart')) {
            addFlat(mods, 'maxHpFlat', tuning.keystoneForestHeart.maxHpFlat);
            addPct(mods, 'defensePct', tuning.keystoneForestHeart.defensePct);
            effects.passiveStaRegenBonus += tuning.keystoneForestHeart.passiveStaRegenBonus;
        }
        else if (hasKeystoneEquipped(state, 'uren_arcane_pact')) {
            addPct(mods, 'arcanePct', tuning.keystoneArcanePact.arcanePct);
            addFlat(mods, 'critChanceFlat', tuning.keystoneArcanePact.critChanceFlat);
        }
        else if (hasKeystoneEquipped(state, 'uren_wild_spine')) {
            addPct(mods, 'attackPct', tuning.keystoneWildSpine.attackPct);
            addPct(mods, 'defensePct', tuning.keystoneWildSpine.defensePct);
            addFlat(mods, 'resistPhysicalFlat', tuning.keystoneWildSpine.resistPhysicalFlat);
        }
    }
    mods.attackPct = clamp(mods.attackPct || 0, RACIAL_EFFECT_LIMITS.combatPctMin, RACIAL_EFFECT_LIMITS.combatPctMax);
    mods.arcanePct = clamp(mods.arcanePct || 0, RACIAL_EFFECT_LIMITS.combatPctMin, RACIAL_EFFECT_LIMITS.combatPctMax);
    mods.defensePct = clamp(mods.defensePct || 0, RACIAL_EFFECT_LIMITS.combatPctMin, RACIAL_EFFECT_LIMITS.combatPctMax);
    mods.moveSpeedPct = clamp(mods.moveSpeedPct || 0, RACIAL_EFFECT_LIMITS.combatPctMin, RACIAL_EFFECT_LIMITS.combatPctMax);
    mods.atkSpeedPct = clamp(mods.atkSpeedPct || 0, RACIAL_EFFECT_LIMITS.combatPctMin, RACIAL_EFFECT_LIMITS.combatPctMax);
    effects.travelStaminaCostMultiplier = clamp(effects.travelStaminaCostMultiplier, RACIAL_EFFECT_LIMITS.travelStaminaMultiplierMin, RACIAL_EFFECT_LIMITS.travelStaminaMultiplierMax);
    effects.travelTimeMultiplier = clamp(effects.travelTimeMultiplier, RACIAL_EFFECT_LIMITS.travelTimeMultiplierMin, RACIAL_EFFECT_LIMITS.travelTimeMultiplierMax);
    effects.actionEnergyCostMultiplier.chop = clamp(effects.actionEnergyCostMultiplier.chop, RACIAL_EFFECT_LIMITS.actionEnergyMultiplierMin, RACIAL_EFFECT_LIMITS.actionEnergyMultiplierMax);
    effects.actionEnergyCostMultiplier.mine = clamp(effects.actionEnergyCostMultiplier.mine, RACIAL_EFFECT_LIMITS.actionEnergyMultiplierMin, RACIAL_EFFECT_LIMITS.actionEnergyMultiplierMax);
    effects.actionEnergyCostMultiplier.gather = clamp(effects.actionEnergyCostMultiplier.gather, RACIAL_EFFECT_LIMITS.actionEnergyMultiplierMin, RACIAL_EFFECT_LIMITS.actionEnergyMultiplierMax);
    effects.actionEnergyCostMultiplier.fish = clamp(effects.actionEnergyCostMultiplier.fish, RACIAL_EFFECT_LIMITS.actionEnergyMultiplierMin, RACIAL_EFFECT_LIMITS.actionEnergyMultiplierMax);
    effects.actionYieldMultiplier.chop = clamp(effects.actionYieldMultiplier.chop, RACIAL_EFFECT_LIMITS.actionYieldMultiplierMin, RACIAL_EFFECT_LIMITS.actionYieldMultiplierMax);
    effects.actionYieldMultiplier.mine = clamp(effects.actionYieldMultiplier.mine, RACIAL_EFFECT_LIMITS.actionYieldMultiplierMin, RACIAL_EFFECT_LIMITS.actionYieldMultiplierMax);
    effects.actionYieldMultiplier.gather = clamp(effects.actionYieldMultiplier.gather, RACIAL_EFFECT_LIMITS.actionYieldMultiplierMin, RACIAL_EFFECT_LIMITS.actionYieldMultiplierMax);
    effects.actionYieldMultiplier.fish = clamp(effects.actionYieldMultiplier.fish, RACIAL_EFFECT_LIMITS.actionYieldMultiplierMin, RACIAL_EFFECT_LIMITS.actionYieldMultiplierMax);
    effects.passiveStaRegenBonus = clamp(Math.floor(effects.passiveStaRegenBonus), 0, RACIAL_EFFECT_LIMITS.passiveStaRegenBonusMax);
    return effects;
}
export function invalidateRacialGameplayEffectsCache(playerId) {
    if (typeof playerId === 'number') {
        effectsCache.delete(playerId);
        return;
    }
    effectsCache.clear();
}
export async function getRacialGameplayEffectsForPlayer(playerId) {
    const now = Date.now();
    const cached = effectsCache.get(playerId);
    if (cached && cached.expiresAt > now) {
        return cloneEffects(cached.effects);
    }
    const startedAt = Date.now();
    try {
        const state = await getPlayerRacialTalentState(playerId);
        const effects = state ? computeEffectsFromState(state) : cloneEffects(DEFAULT_EFFECTS);
        effectsCache.set(playerId, {
            effects: cloneEffects(effects),
            expiresAt: now + CACHE_TTL_MS,
        });
        return effects;
    }
    finally {
        observePerf('racial.effects.resolve', Date.now() - startedAt);
    }
}
//# sourceMappingURL=racial-effects.js.map