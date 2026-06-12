export declare function mapEnemyStats(base: any, modifiers: any): {
    attack: number;
    arcanePower: number;
    defense: number;
    critChance: number;
    evasion: number;
    moveSpeed: number;
};
export declare function categoryBadge(category: any, lang: any): "Basico" | "Basic" | "Veterano" | "Veteran" | "Elite" | "Elita" | "Boss" | "Bazovyy";
export declare function describeCreatureStyle(snapshot: any, lang: any): any;
export declare function createInitialIntent(snapshot: any, turnNumber: any, lang: any): {
    key: string;
    label: any;
    hint: any;
};
export declare function getRacialSkillSpec(race: any, key: any): {
    durationTurns: number;
    cooldownTurns: number;
    staminaCost: number;
    playerEffect: {
        key: any;
        label: string;
        source: string;
        remainingTurns: number;
        modifiers: {
            attackPct: number;
            arcanePct: number;
            moveSpeedPct?: undefined;
            evasionFlat?: undefined;
            defensePct?: undefined;
        };
        damageReductionPct?: undefined;
    };
    enemyEffect: {
        key: string;
        label: string;
        remainingTurns: number;
        modifiers: {
            defensePct: number;
            evasionFlat?: undefined;
        };
    };
    immediateArcaneMultiplier: number;
    immediateAttackMultiplier?: undefined;
} | {
    durationTurns: number;
    cooldownTurns: number;
    staminaCost: number;
    playerEffect: {
        key: any;
        label: string;
        source: string;
        remainingTurns: number;
        modifiers: {
            moveSpeedPct: number;
            evasionFlat: number;
            attackPct?: undefined;
            arcanePct?: undefined;
            defensePct?: undefined;
        };
        damageReductionPct: number;
    };
    enemyEffect?: undefined;
    immediateArcaneMultiplier?: undefined;
    immediateAttackMultiplier?: undefined;
} | {
    durationTurns: number;
    cooldownTurns: number;
    staminaCost: number;
    playerEffect: {
        key: any;
        label: string;
        source: string;
        remainingTurns: number;
        modifiers: {
            defensePct: number;
            attackPct?: undefined;
            arcanePct?: undefined;
            moveSpeedPct?: undefined;
            evasionFlat?: undefined;
        };
        damageReductionPct?: undefined;
    };
    enemyEffect: {
        key: string;
        label: string;
        remainingTurns: number;
        modifiers: {
            defensePct: number;
            evasionFlat: number;
        };
    };
    immediateAttackMultiplier: number;
    immediateArcaneMultiplier?: undefined;
} | {
    durationTurns: number;
    cooldownTurns: number;
    staminaCost: number;
    playerEffect: {
        key: any;
        label: string;
        source: string;
        remainingTurns: number;
        modifiers: {
            attackPct: number;
            arcanePct: number;
            moveSpeedPct?: undefined;
            evasionFlat?: undefined;
            defensePct?: undefined;
        };
        damageReductionPct?: undefined;
    };
    immediateArcaneMultiplier: number;
    enemyEffect?: undefined;
    immediateAttackMultiplier?: undefined;
};
export declare function getIntentModifiers(intent: any): {
    attackMultiplier: number;
    critBonusPct: number;
    arcaneMultiplier?: undefined;
    enemyDefensePct?: undefined;
    accuracyBonusPct?: undefined;
} | {
    attackMultiplier: number;
    arcaneMultiplier: number;
    critBonusPct: number;
    enemyDefensePct?: undefined;
    accuracyBonusPct?: undefined;
} | {
    attackMultiplier: number;
    enemyDefensePct: number;
    critBonusPct?: undefined;
    arcaneMultiplier?: undefined;
    accuracyBonusPct?: undefined;
} | {
    attackMultiplier: number;
    critBonusPct: number;
    accuracyBonusPct: number;
    arcaneMultiplier?: undefined;
    enemyDefensePct?: undefined;
} | {
    attackMultiplier: number;
    critBonusPct?: undefined;
    arcaneMultiplier?: undefined;
    enemyDefensePct?: undefined;
    accuracyBonusPct?: undefined;
};
export declare function buildFleeText(lang: any, creatureName: any, success: any): string;
export declare function buildDefeatText(lang: any, creatureName: any, log: any): string;
export declare function buildVictoryText(lang: any, reward: any, log: any): string;
export declare function getBuildSkillSpec(def: any, rank: any, lang: any): {
    durationTurns: number;
    cooldownTurns: number;
    staminaCost: number;
    playerEffect: {
        key: any;
        label: any;
        source: string;
        remainingTurns: number;
        modifiers: {
            attackPct: number;
            arcanePct: number;
            defensePct: number;
            moveSpeedPct: number;
            atkSpeedPct: number;
            maxHpPct: number;
            maxEnergyPct: number;
            maxHpFlat: number;
            maxEnergyFlat: number;
            maxSoulFlat: number;
            attackFlat: number;
            arcaneFlat: number;
            baseDamageFlat: number;
            defenseFlat: number;
            critChanceFlat: number;
            evasionFlat: number;
            atkSpeedFlat: number;
            moveSpeedFlat: number;
            resistPhysicalFlat: number;
            resistElementalFlat: number;
            resistArcaneFlat: number;
            resistHolyFlat: number;
            resistChemicalFlat: number;
        };
    };
    immediatePhysicalMultiplier: number;
    immediateArcaneMultiplier: number;
    critBonusPct: number;
    accuracyBonusPct: number;
    narrative: any;
};
export declare function getCreatureScoutText(snapshot: any, lang: any): string;
