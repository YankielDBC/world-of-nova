declare const GENERAL_SKILLS: ({
    key: string;
    family: string;
    type: string;
    category: string;
    maxRank: number;
    costPerRank: number;
    sortOrder: number;
    name: {
        es: string;
        en: string;
        ru: string;
    };
    summary: {
        es: string;
        en: string;
        ru: string;
    };
    passiveEffectsPerRank: {
        combatModifiers: {
            moveSpeedPct: number;
            atkSpeedPct: number;
            defensePct?: undefined;
            resistArcaneFlat?: undefined;
            resistElementalFlat?: undefined;
        };
        travelTimeMultiplierDelta: number;
        actionYieldMultiplierDelta?: undefined;
        actionEnergyCostMultiplierDelta?: undefined;
    };
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    type: string;
    category: string;
    maxRank: number;
    costPerRank: number;
    sortOrder: number;
    name: {
        es: string;
        en: string;
        ru: string;
    };
    summary: {
        es: string;
        en: string;
        ru: string;
    };
    passiveEffectsPerRank: {
        actionYieldMultiplierDelta: {
            gather: number;
            chop: number;
        };
        combatModifiers?: undefined;
        travelTimeMultiplierDelta?: undefined;
        actionEnergyCostMultiplierDelta?: undefined;
    };
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    type: string;
    category: string;
    maxRank: number;
    costPerRank: number;
    sortOrder: number;
    name: {
        es: string;
        en: string;
        ru: string;
    };
    summary: {
        es: string;
        en: string;
        ru: string;
    };
    passiveEffectsPerRank: {
        actionEnergyCostMultiplierDelta: {
            gather: number;
            chop: number;
            mine: number;
        };
        combatModifiers?: undefined;
        travelTimeMultiplierDelta?: undefined;
        actionYieldMultiplierDelta?: undefined;
    };
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    type: string;
    category: string;
    maxRank: number;
    costPerRank: number;
    sortOrder: number;
    name: {
        es: string;
        en: string;
        ru: string;
    };
    summary: {
        es: string;
        en: string;
        ru: string;
    };
    passiveEffectsPerRank: {
        combatModifiers: {
            defensePct: number;
            resistArcaneFlat: number;
            resistElementalFlat: number;
            moveSpeedPct?: undefined;
            atkSpeedPct?: undefined;
        };
        travelTimeMultiplierDelta?: undefined;
        actionYieldMultiplierDelta?: undefined;
        actionEnergyCostMultiplierDelta?: undefined;
    };
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    type: string;
    category: string;
    maxRank: number;
    costPerRank: number;
    sortOrder: number;
    name: {
        es: string;
        en: string;
        ru: string;
    };
    summary: {
        es: string;
        en: string;
        ru: string;
    };
    conditionalEffectsPerRank: {
        condition: {
            staBelowPct: number;
        };
        effects: {
            passiveStaRegenBonusDelta: number;
            travelStaminaCostMultiplierDelta: number;
            actionEnergyCostMultiplierDelta: {
                gather: number;
                chop: number;
                mine: number;
                fish: number;
            };
        };
    }[];
    passiveEffectsPerRank?: undefined;
    activeConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    type: string;
    category: string;
    maxRank: number;
    costPerRank: number;
    sortOrder: number;
    name: {
        es: string;
        en: string;
        ru: string;
    };
    summary: {
        es: string;
        en: string;
        ru: string;
    };
    conditionalEffectsPerRank: {
        condition: {
            hpBelowPct: number;
        };
        effects: {
            combatModifiers: {
                defensePct: number;
                maxHpFlat: number;
            };
        };
    }[];
    passiveEffectsPerRank?: undefined;
    activeConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    type: string;
    category: string;
    maxRank: number;
    costPerRank: number;
    sortOrder: number;
    name: {
        es: string;
        en: string;
        ru: string;
    };
    summary: {
        es: string;
        en: string;
        ru: string;
    };
    activeConfig: {
        cooldownSeconds: number;
        castSeconds: number;
        durationSeconds: number;
        effects: {
            combatModifiers: {
                attackPct: number;
                arcanePct: number;
                critChanceFlat: number;
            };
        };
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    type: string;
    category: string;
    maxRank: number;
    costPerRank: number;
    sortOrder: number;
    name: {
        es: string;
        en: string;
        ru: string;
    };
    summary: {
        es: string;
        en: string;
        ru: string;
    };
    passiveEffectsFlat: {
        combatModifiers: {
            defensePct: number;
            attackPct: number;
            maxEnergyFlat: number;
        };
        passiveStaRegenBonusDelta: number;
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
})[];
export default GENERAL_SKILLS;
