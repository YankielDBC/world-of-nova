export declare const RACIAL_EFFECT_LIMITS: {
    readonly combatPctMin: -0.2;
    readonly combatPctMax: 0.2;
    readonly travelStaminaMultiplierMin: 0.7;
    readonly travelStaminaMultiplierMax: 1.35;
    readonly travelTimeMultiplierMin: 0.75;
    readonly travelTimeMultiplierMax: 1.35;
    readonly actionEnergyMultiplierMin: 0.75;
    readonly actionEnergyMultiplierMax: 1.35;
    readonly actionYieldMultiplierMin: 0.85;
    readonly actionYieldMultiplierMax: 1.8;
    readonly passiveStaRegenBonusMax: 3;
};
export declare const RACIAL_TALENT_BALANCE: {
    readonly zolk: {
        readonly toxicBlood: {
            readonly critChanceFlatPerRank: 0.5;
            readonly resistChemicalFlatPerRank: 1;
        };
        readonly labReflexes: {
            readonly evasionFlatPerRank: 0.8;
            readonly moveSpeedPctPerRank: 0.01;
            readonly atkSpeedPctPerRank: 0.01;
        };
        readonly unstableMetabolism: {
            readonly maxEnergyFlatPerRank: 5;
            readonly passiveStaRegenPerRank: 1;
        };
        readonly alchemicalSkin: {
            readonly defensePctPerRank: 0.01;
            readonly resistChemicalFlatPerRank: 1;
        };
        readonly delicateHand: {
            readonly gatherYieldPctPerRank: 0.04;
        };
        readonly quickEscape: {
            readonly travelStaminaCostPctPerRank: 0.07;
        };
        readonly venomGlands: {
            readonly critChanceFlat: 1.1;
            readonly attackPct: 0.01;
        };
        readonly toxicCloudActive: {
            readonly attackPct: 0.02;
            readonly arcanePct: 0.01;
        };
        readonly mutationDashActive: {
            readonly travelTimePct: 0.09;
            readonly moveSpeedPct: 0.02;
        };
        readonly chemicalLegsUpgrade: {
            readonly travelTimePct: 0.05;
            readonly travelStaminaCostPct: 0.04;
        };
        readonly keystoneToxicShadow: {
            readonly evasionFlat: 2.2;
            readonly critChanceFlat: 1.4;
        };
        readonly keystoneReactorBlood: {
            readonly arcanePct: 0.04;
            readonly attackPct: 0.02;
        };
        readonly keystoneChemicalSurvivor: {
            readonly defensePct: 0.03;
            readonly resistChemicalFlat: 2;
            readonly maxHpFlat: 10;
            readonly passiveStaRegenBonus: 1;
        };
    };
    readonly uren: {
        readonly deepRoot: {
            readonly defensePctPerRank: 0.011;
            readonly resistPhysicalFlatPerRank: 1;
        };
        readonly calmSap: {
            readonly maxHpFlatPerRank: 7;
            readonly maxEnergyFlatPerRank: 4;
        };
        readonly livingBark: {
            readonly defensePctPerRank: 0.01;
            readonly resistPhysicalFlatPerRank: 1;
        };
        readonly naturalPulse: {
            readonly arcanePctPerRank: 0.011;
            readonly resistArcaneFlatPerRank: 1;
        };
        readonly wildStride: {
            readonly moveSpeedPctPerRank: 0.014;
            readonly travelTimePctPerRank: 0.045;
        };
        readonly forageEye: {
            readonly gatherYieldPctPerRank: 0.035;
            readonly chopYieldPctPerRank: 0.035;
        };
        readonly forestBreath: {
            readonly passiveStaRegenPerRank: 1;
            readonly gatherEnergyPctPerRank: 0.018;
            readonly chopEnergyPctPerRank: 0.014;
        };
        readonly reflectThorns: {
            readonly defenseFlat: 1.4;
            readonly resistPhysicalFlat: 1;
        };
        readonly greenChannel: {
            readonly arcanePct: 0.02;
        };
        readonly vineSnareActive: {
            readonly defensePct: 0.01;
            readonly chopEnergyPct: 0.03;
        };
        readonly arcaneBudActive: {
            readonly attackPct: 0.01;
            readonly arcanePct: 0.02;
        };
        readonly keystoneForestHeart: {
            readonly maxHpFlat: 15;
            readonly defensePct: 0.04;
            readonly passiveStaRegenBonus: 1;
        };
        readonly keystoneArcanePact: {
            readonly arcanePct: 0.05;
            readonly critChanceFlat: 1.1;
        };
        readonly keystoneWildSpine: {
            readonly attackPct: 0.03;
            readonly defensePct: 0.02;
            readonly resistPhysicalFlat: 1;
        };
    };
};
