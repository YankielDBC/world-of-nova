export type RacialActionKey = 'chop' | 'mine' | 'gather' | 'fish';
export interface RacialCombatModifiers {
    attackPct?: number;
    arcanePct?: number;
    defensePct?: number;
    moveSpeedPct?: number;
    atkSpeedPct?: number;
    maxHpFlat?: number;
    maxEnergyFlat?: number;
    attackFlat?: number;
    arcaneFlat?: number;
    defenseFlat?: number;
    critChanceFlat?: number;
    evasionFlat?: number;
    resistPhysicalFlat?: number;
    resistElementalFlat?: number;
    resistArcaneFlat?: number;
    resistHolyFlat?: number;
    resistChemicalFlat?: number;
}
export interface RacialGameplayEffects {
    combatModifiers: RacialCombatModifiers;
    travelStaminaCostMultiplier: number;
    travelTimeMultiplier: number;
    actionEnergyCostMultiplier: Record<RacialActionKey, number>;
    actionYieldMultiplier: Record<RacialActionKey, number>;
    passiveStaRegenBonus: number;
}
export declare function invalidateRacialGameplayEffectsCache(playerId?: number): void;
export declare function getRacialGameplayEffectsForPlayer(playerId: number): Promise<RacialGameplayEffects>;
