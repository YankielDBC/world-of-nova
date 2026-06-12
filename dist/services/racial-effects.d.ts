export declare function invalidateRacialGameplayEffectsCache(playerId: any): void;
export declare function getRacialGameplayEffectsForPlayer(playerId: any): Promise<{
    combatModifiers: any;
    travelStaminaCostMultiplier: any;
    travelTimeMultiplier: any;
    actionEnergyCostMultiplier: any;
    actionYieldMultiplier: any;
    passiveStaRegenBonus: any;
}>;
