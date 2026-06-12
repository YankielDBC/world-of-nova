export declare function getGameplayEffectsForPlayer(playerId: any, condition: any): Promise<{
    combatModifiers: {
        attackPct: any;
        arcanePct: any;
        defensePct: any;
        moveSpeedPct: any;
        atkSpeedPct: any;
        maxHpFlat: number;
        maxEnergyFlat: number;
        attackFlat: any;
        arcaneFlat: any;
        defenseFlat: any;
        critChanceFlat: any;
        evasionFlat: any;
        resistPhysicalFlat: number;
        resistElementalFlat: number;
        resistArcaneFlat: number;
        resistHolyFlat: number;
        resistChemicalFlat: number;
    };
    travelStaminaCostMultiplier: number;
    travelTimeMultiplier: number;
    actionEnergyCostMultiplier: {
        chop: number;
        mine: number;
        gather: number;
        fish: number;
    };
    actionYieldMultiplier: {
        chop: number;
        mine: number;
        gather: number;
        fish: number;
    };
    passiveStaRegenBonus: number;
    counterAttackRatio: number;
}>;
export declare function invalidateGameplayEffectsCache(playerId: any): void;
