// @ts-nocheck
import { getBuildGameplayEffectsForPlayer, invalidateBuildGameplayEffectsCache, } from './build-skills.js';
import { getRacialGameplayEffectsForPlayer, invalidateRacialGameplayEffectsCache, } from './racial-effects.js';
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function combineMultipliers(a, b, min, max) {
    return clamp(a * b, min, max);
}
function combineEffects(racial, build) {
    return {
        combatModifiers: {
            attackPct: (racial.combatModifiers.attackPct || 0) + (build.combatModifiers.attackPct || 0),
            arcanePct: (racial.combatModifiers.arcanePct || 0) + (build.combatModifiers.arcanePct || 0),
            defensePct: (racial.combatModifiers.defensePct || 0) + (build.combatModifiers.defensePct || 0),
            moveSpeedPct: (racial.combatModifiers.moveSpeedPct || 0) + (build.combatModifiers.moveSpeedPct || 0),
            atkSpeedPct: (racial.combatModifiers.atkSpeedPct || 0) + (build.combatModifiers.atkSpeedPct || 0),
            maxHpFlat: Math.floor((racial.combatModifiers.maxHpFlat || 0) + (build.combatModifiers.maxHpFlat || 0)),
            maxEnergyFlat: Math.floor((racial.combatModifiers.maxEnergyFlat || 0) + (build.combatModifiers.maxEnergyFlat || 0)),
            attackFlat: (racial.combatModifiers.attackFlat || 0) + (build.combatModifiers.attackFlat || 0),
            arcaneFlat: (racial.combatModifiers.arcaneFlat || 0) + (build.combatModifiers.arcaneFlat || 0),
            defenseFlat: (racial.combatModifiers.defenseFlat || 0) + (build.combatModifiers.defenseFlat || 0),
            critChanceFlat: (racial.combatModifiers.critChanceFlat || 0) + (build.combatModifiers.critChanceFlat || 0),
            evasionFlat: (racial.combatModifiers.evasionFlat || 0) + (build.combatModifiers.evasionFlat || 0),
            resistPhysicalFlat: Math.floor((racial.combatModifiers.resistPhysicalFlat || 0) + (build.combatModifiers.resistPhysicalFlat || 0)),
            resistElementalFlat: Math.floor((racial.combatModifiers.resistElementalFlat || 0) + (build.combatModifiers.resistElementalFlat || 0)),
            resistArcaneFlat: Math.floor((racial.combatModifiers.resistArcaneFlat || 0) + (build.combatModifiers.resistArcaneFlat || 0)),
            resistHolyFlat: Math.floor((racial.combatModifiers.resistHolyFlat || 0) + (build.combatModifiers.resistHolyFlat || 0)),
            resistChemicalFlat: Math.floor((racial.combatModifiers.resistChemicalFlat || 0) + (build.combatModifiers.resistChemicalFlat || 0)),
        },
        travelStaminaCostMultiplier: combineMultipliers(racial.travelStaminaCostMultiplier, build.travelStaminaCostMultiplier, 0.5, 1.5),
        travelTimeMultiplier: combineMultipliers(racial.travelTimeMultiplier, build.travelTimeMultiplier, 0.45, 1.5),
        actionEnergyCostMultiplier: {
            chop: combineMultipliers(racial.actionEnergyCostMultiplier.chop, build.actionEnergyCostMultiplier.chop, 0.5, 1.6),
            mine: combineMultipliers(racial.actionEnergyCostMultiplier.mine, build.actionEnergyCostMultiplier.mine, 0.5, 1.6),
            gather: combineMultipliers(racial.actionEnergyCostMultiplier.gather, build.actionEnergyCostMultiplier.gather, 0.5, 1.6),
            fish: combineMultipliers(racial.actionEnergyCostMultiplier.fish, build.actionEnergyCostMultiplier.fish, 0.5, 1.6),
        },
        actionYieldMultiplier: {
            chop: combineMultipliers(racial.actionYieldMultiplier.chop, build.actionYieldMultiplier.chop, 0.5, 3),
            mine: combineMultipliers(racial.actionYieldMultiplier.mine, build.actionYieldMultiplier.mine, 0.5, 3),
            gather: combineMultipliers(racial.actionYieldMultiplier.gather, build.actionYieldMultiplier.gather, 0.5, 3),
            fish: combineMultipliers(racial.actionYieldMultiplier.fish, build.actionYieldMultiplier.fish, 0.5, 3),
        },
        passiveStaRegenBonus: Math.max(0, racial.passiveStaRegenBonus + build.passiveStaRegenBonus),
        counterAttackRatio: Math.max(0, Math.min(1, build.counterAttackRatio || 0)),
    };
}
export async function getGameplayEffectsForPlayer(playerId, condition) {
    const [racial, build] = await Promise.all([
        getRacialGameplayEffectsForPlayer(playerId),
        getBuildGameplayEffectsForPlayer(playerId, condition),
    ]);
    return combineEffects(racial, build);
}
export function invalidateGameplayEffectsCache(playerId) {
    invalidateRacialGameplayEffectsCache(playerId);
    invalidateBuildGameplayEffectsCache(playerId);
}
//# sourceMappingURL=gameplay-effects.js.map