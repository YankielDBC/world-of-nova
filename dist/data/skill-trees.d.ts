export declare function getClassSkillDefinitions(classKey: any): ({
    key: string;
    family: string;
    classKey: string;
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
            attackPct: number;
            critChanceFlat: number;
            evasionFlat?: undefined;
            moveSpeedPct?: undefined;
            arcanePct?: undefined;
            defensePct?: undefined;
            resistArcaneFlat?: undefined;
            maxHpFlat?: undefined;
        };
        travelTimeMultiplierDelta?: undefined;
        travelStaminaCostMultiplierDelta?: undefined;
    };
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            evasionFlat: number;
            moveSpeedPct: number;
            attackPct?: undefined;
            critChanceFlat?: undefined;
            arcanePct?: undefined;
            defensePct?: undefined;
            resistArcaneFlat?: undefined;
            maxHpFlat?: undefined;
        };
        travelTimeMultiplierDelta: number;
        travelStaminaCostMultiplierDelta?: undefined;
    };
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
                resistPhysicalFlat: number;
            };
        };
    }[];
    passiveEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
                moveSpeedPct: number;
                arcanePct?: undefined;
                atkSpeedPct?: undefined;
                maxHpFlat?: undefined;
                defensePct?: undefined;
                evasionFlat?: undefined;
            };
            passiveStaRegenBonusDelta?: undefined;
        };
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
    reactionConfig: {
        event: string;
        cooldownSeconds: number;
        durationSeconds: number;
        effects: {
            combatModifiers: {
                attackPct: number;
                critChanceFlat: number;
                arcanePct?: undefined;
                defensePct?: undefined;
                evasionFlat?: undefined;
            };
            counterAttackRatio: number;
        };
        condition?: undefined;
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            attackPct: number;
            defensePct: number;
            resistPhysicalFlat: number;
            arcanePct?: undefined;
            critChanceFlat?: undefined;
            maxHpFlat?: undefined;
            moveSpeedPct?: undefined;
        };
        actionEnergyCostMultiplierDelta?: undefined;
        passiveStaRegenBonusDelta?: undefined;
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            arcanePct: number;
            critChanceFlat: number;
            attackPct?: undefined;
            evasionFlat?: undefined;
            moveSpeedPct?: undefined;
            defensePct?: undefined;
            resistArcaneFlat?: undefined;
            maxHpFlat?: undefined;
        };
        travelTimeMultiplierDelta?: undefined;
        travelStaminaCostMultiplierDelta?: undefined;
    };
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            attackPct?: undefined;
            critChanceFlat?: undefined;
            evasionFlat?: undefined;
            moveSpeedPct?: undefined;
            arcanePct?: undefined;
            maxHpFlat?: undefined;
        };
        travelTimeMultiplierDelta?: undefined;
        travelStaminaCostMultiplierDelta?: undefined;
    };
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            staAbovePct: number;
        };
        effects: {
            combatModifiers: {
                arcanePct: number;
            };
        };
    }[];
    passiveEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
                arcanePct: number;
                atkSpeedPct: number;
                attackPct?: undefined;
                moveSpeedPct?: undefined;
                maxHpFlat?: undefined;
                defensePct?: undefined;
                evasionFlat?: undefined;
            };
            passiveStaRegenBonusDelta?: undefined;
        };
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
    reactionConfig: {
        event: string;
        cooldownSeconds: number;
        durationSeconds: number;
        effects: {
            combatModifiers: {
                arcanePct: number;
                attackPct: number;
                critChanceFlat?: undefined;
                defensePct?: undefined;
                evasionFlat?: undefined;
            };
            counterAttackRatio?: undefined;
        };
        condition?: undefined;
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            arcanePct: number;
            critChanceFlat: number;
            attackPct?: undefined;
            defensePct?: undefined;
            resistPhysicalFlat?: undefined;
            maxHpFlat?: undefined;
            moveSpeedPct?: undefined;
        };
        actionEnergyCostMultiplierDelta: {
            mine: number;
            gather: number;
        };
        passiveStaRegenBonusDelta?: undefined;
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            maxHpFlat: number;
            defensePct: number;
            attackPct?: undefined;
            critChanceFlat?: undefined;
            evasionFlat?: undefined;
            moveSpeedPct?: undefined;
            arcanePct?: undefined;
            resistArcaneFlat?: undefined;
        };
        travelTimeMultiplierDelta?: undefined;
        travelStaminaCostMultiplierDelta?: undefined;
    };
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
        travelStaminaCostMultiplierDelta: number;
        travelTimeMultiplierDelta: number;
        combatModifiers: {
            moveSpeedPct: number;
            attackPct?: undefined;
            critChanceFlat?: undefined;
            evasionFlat?: undefined;
            arcanePct?: undefined;
            defensePct?: undefined;
            resistArcaneFlat?: undefined;
            maxHpFlat?: undefined;
        };
    };
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            passiveStaRegenBonusDelta: number;
            combatModifiers: {
                maxHpFlat: number;
                defensePct: number;
                attackPct?: undefined;
                moveSpeedPct?: undefined;
                arcanePct?: undefined;
                atkSpeedPct?: undefined;
                evasionFlat?: undefined;
            };
        };
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
    reactionConfig: {
        event: string;
        cooldownSeconds: number;
        durationSeconds: number;
        effects: {
            combatModifiers: {
                defensePct: number;
                attackPct?: undefined;
                critChanceFlat?: undefined;
                arcanePct?: undefined;
                evasionFlat?: undefined;
            };
            counterAttackRatio: number;
        };
        condition?: undefined;
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            maxHpFlat: number;
            defensePct: number;
            attackPct?: undefined;
            resistPhysicalFlat?: undefined;
            arcanePct?: undefined;
            critChanceFlat?: undefined;
            moveSpeedPct?: undefined;
        };
        passiveStaRegenBonusDelta: number;
        actionEnergyCostMultiplierDelta?: undefined;
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
                attackPct: number;
                arcanePct: number;
            };
        };
    }[];
    passiveEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
                evasionFlat: number;
                moveSpeedPct: number;
                attackPct?: undefined;
                arcanePct?: undefined;
                atkSpeedPct?: undefined;
                maxHpFlat?: undefined;
                defensePct?: undefined;
            };
            passiveStaRegenBonusDelta?: undefined;
        };
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
    reactionConfig: {
        event: string;
        cooldownSeconds: number;
        durationSeconds: number;
        effects: {
            combatModifiers: {
                defensePct: number;
                evasionFlat: number;
                attackPct?: undefined;
                critChanceFlat?: undefined;
                arcanePct?: undefined;
            };
            counterAttackRatio?: undefined;
        };
        condition: {
            hpBelowPct: number;
        };
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            attackPct: number;
            moveSpeedPct: number;
            critChanceFlat: number;
            defensePct?: undefined;
            resistPhysicalFlat?: undefined;
            arcanePct?: undefined;
            maxHpFlat?: undefined;
        };
        actionEnergyCostMultiplierDelta?: undefined;
        passiveStaRegenBonusDelta?: undefined;
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
})[];
export declare function getGeneralSkillDefinitions(): ({
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
export declare function getBuildSkillByKey(skillKeyRaw: any): {
    key: string;
    family: string;
    classKey: string;
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
            attackPct: number;
            critChanceFlat: number;
            evasionFlat?: undefined;
            moveSpeedPct?: undefined;
            arcanePct?: undefined;
            defensePct?: undefined;
            resistArcaneFlat?: undefined;
            maxHpFlat?: undefined;
        };
        travelTimeMultiplierDelta?: undefined;
        travelStaminaCostMultiplierDelta?: undefined;
    };
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            evasionFlat: number;
            moveSpeedPct: number;
            attackPct?: undefined;
            critChanceFlat?: undefined;
            arcanePct?: undefined;
            defensePct?: undefined;
            resistArcaneFlat?: undefined;
            maxHpFlat?: undefined;
        };
        travelTimeMultiplierDelta: number;
        travelStaminaCostMultiplierDelta?: undefined;
    };
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
                resistPhysicalFlat: number;
            };
        };
    }[];
    passiveEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
                moveSpeedPct: number;
                arcanePct?: undefined;
                atkSpeedPct?: undefined;
                maxHpFlat?: undefined;
                defensePct?: undefined;
                evasionFlat?: undefined;
            };
            passiveStaRegenBonusDelta?: undefined;
        };
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
    reactionConfig: {
        event: string;
        cooldownSeconds: number;
        durationSeconds: number;
        effects: {
            combatModifiers: {
                attackPct: number;
                critChanceFlat: number;
                arcanePct?: undefined;
                defensePct?: undefined;
                evasionFlat?: undefined;
            };
            counterAttackRatio: number;
        };
        condition?: undefined;
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            attackPct: number;
            defensePct: number;
            resistPhysicalFlat: number;
            arcanePct?: undefined;
            critChanceFlat?: undefined;
            maxHpFlat?: undefined;
            moveSpeedPct?: undefined;
        };
        actionEnergyCostMultiplierDelta?: undefined;
        passiveStaRegenBonusDelta?: undefined;
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            arcanePct: number;
            critChanceFlat: number;
            attackPct?: undefined;
            evasionFlat?: undefined;
            moveSpeedPct?: undefined;
            defensePct?: undefined;
            resistArcaneFlat?: undefined;
            maxHpFlat?: undefined;
        };
        travelTimeMultiplierDelta?: undefined;
        travelStaminaCostMultiplierDelta?: undefined;
    };
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            attackPct?: undefined;
            critChanceFlat?: undefined;
            evasionFlat?: undefined;
            moveSpeedPct?: undefined;
            arcanePct?: undefined;
            maxHpFlat?: undefined;
        };
        travelTimeMultiplierDelta?: undefined;
        travelStaminaCostMultiplierDelta?: undefined;
    };
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            staAbovePct: number;
        };
        effects: {
            combatModifiers: {
                arcanePct: number;
            };
        };
    }[];
    passiveEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
                arcanePct: number;
                atkSpeedPct: number;
                attackPct?: undefined;
                moveSpeedPct?: undefined;
                maxHpFlat?: undefined;
                defensePct?: undefined;
                evasionFlat?: undefined;
            };
            passiveStaRegenBonusDelta?: undefined;
        };
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
    reactionConfig: {
        event: string;
        cooldownSeconds: number;
        durationSeconds: number;
        effects: {
            combatModifiers: {
                arcanePct: number;
                attackPct: number;
                critChanceFlat?: undefined;
                defensePct?: undefined;
                evasionFlat?: undefined;
            };
            counterAttackRatio?: undefined;
        };
        condition?: undefined;
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            arcanePct: number;
            critChanceFlat: number;
            attackPct?: undefined;
            defensePct?: undefined;
            resistPhysicalFlat?: undefined;
            maxHpFlat?: undefined;
            moveSpeedPct?: undefined;
        };
        actionEnergyCostMultiplierDelta: {
            mine: number;
            gather: number;
        };
        passiveStaRegenBonusDelta?: undefined;
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            maxHpFlat: number;
            defensePct: number;
            attackPct?: undefined;
            critChanceFlat?: undefined;
            evasionFlat?: undefined;
            moveSpeedPct?: undefined;
            arcanePct?: undefined;
            resistArcaneFlat?: undefined;
        };
        travelTimeMultiplierDelta?: undefined;
        travelStaminaCostMultiplierDelta?: undefined;
    };
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
        travelStaminaCostMultiplierDelta: number;
        travelTimeMultiplierDelta: number;
        combatModifiers: {
            moveSpeedPct: number;
            attackPct?: undefined;
            critChanceFlat?: undefined;
            evasionFlat?: undefined;
            arcanePct?: undefined;
            defensePct?: undefined;
            resistArcaneFlat?: undefined;
            maxHpFlat?: undefined;
        };
    };
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            passiveStaRegenBonusDelta: number;
            combatModifiers: {
                maxHpFlat: number;
                defensePct: number;
                attackPct?: undefined;
                moveSpeedPct?: undefined;
                arcanePct?: undefined;
                atkSpeedPct?: undefined;
                evasionFlat?: undefined;
            };
        };
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
    reactionConfig: {
        event: string;
        cooldownSeconds: number;
        durationSeconds: number;
        effects: {
            combatModifiers: {
                defensePct: number;
                attackPct?: undefined;
                critChanceFlat?: undefined;
                arcanePct?: undefined;
                evasionFlat?: undefined;
            };
            counterAttackRatio: number;
        };
        condition?: undefined;
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            maxHpFlat: number;
            defensePct: number;
            attackPct?: undefined;
            resistPhysicalFlat?: undefined;
            arcanePct?: undefined;
            critChanceFlat?: undefined;
            moveSpeedPct?: undefined;
        };
        passiveStaRegenBonusDelta: number;
        actionEnergyCostMultiplierDelta?: undefined;
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
                attackPct: number;
                arcanePct: number;
            };
        };
    }[];
    passiveEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
                evasionFlat: number;
                moveSpeedPct: number;
                attackPct?: undefined;
                arcanePct?: undefined;
                atkSpeedPct?: undefined;
                maxHpFlat?: undefined;
                defensePct?: undefined;
            };
            passiveStaRegenBonusDelta?: undefined;
        };
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    reactionConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
    reactionConfig: {
        event: string;
        cooldownSeconds: number;
        durationSeconds: number;
        effects: {
            combatModifiers: {
                defensePct: number;
                evasionFlat: number;
                attackPct?: undefined;
                critChanceFlat?: undefined;
                arcanePct?: undefined;
            };
            counterAttackRatio?: undefined;
        };
        condition: {
            hpBelowPct: number;
        };
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    passiveEffectsFlat?: undefined;
} | {
    key: string;
    family: string;
    classKey: string;
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
            attackPct: number;
            moveSpeedPct: number;
            critChanceFlat: number;
            defensePct?: undefined;
            resistPhysicalFlat?: undefined;
            arcanePct?: undefined;
            maxHpFlat?: undefined;
        };
        actionEnergyCostMultiplierDelta?: undefined;
        passiveStaRegenBonusDelta?: undefined;
    };
    passiveEffectsPerRank?: undefined;
    conditionalEffectsPerRank?: undefined;
    activeConfig?: undefined;
    reactionConfig?: undefined;
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
};
export declare function getClassSkillPointsForLevel(level: any): number;
export declare function getGeneralSkillPointsForLevel(level: any): number;
export declare function getLocalizedText3(text: any, lang: any): any;
