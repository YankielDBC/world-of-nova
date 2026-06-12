export declare const STATUS_ALIVE = "ALIVE";
export declare const STATUS_DEAD = "DEAD";
export declare const CREATURE_CACHE_TTL_MS = 8000;
export declare const RESOURCE_POOL_TTL_MS = 60000;
export declare const CATEGORY_ORDER: string[];
export declare const CATEGORY_CONFIG: {
    basic: {
        emoji: string;
        levelBonusMin: number;
        levelBonusMax: number;
        hpMultiplier: number;
        attackMultiplier: number;
        defenseMultiplier: number;
        xpMultiplier: number;
        coinChanceMin: number;
        coinChanceMax: number;
        respawnMinSeconds: number;
        respawnMaxSeconds: number;
        dropBonus: number;
    };
    veteran: {
        emoji: string;
        levelBonusMin: number;
        levelBonusMax: number;
        hpMultiplier: number;
        attackMultiplier: number;
        defenseMultiplier: number;
        xpMultiplier: number;
        coinChanceMin: number;
        coinChanceMax: number;
        respawnMinSeconds: number;
        respawnMaxSeconds: number;
        dropBonus: number;
    };
    elite: {
        emoji: string;
        levelBonusMin: number;
        levelBonusMax: number;
        hpMultiplier: number;
        attackMultiplier: number;
        defenseMultiplier: number;
        xpMultiplier: number;
        coinChanceMin: number;
        coinChanceMax: number;
        respawnMinSeconds: number;
        respawnMaxSeconds: number;
        dropBonus: number;
    };
    boss: {
        emoji: string;
        levelBonusMin: number;
        levelBonusMax: number;
        hpMultiplier: number;
        attackMultiplier: number;
        defenseMultiplier: number;
        xpMultiplier: number;
        coinChanceMin: number;
        coinChanceMax: number;
        respawnMinSeconds: number;
        respawnMaxSeconds: number;
        dropBonus: number;
    };
};
export declare const CATEGORY_WEIGHTS_BY_ZONE: {
    core: {
        basic: number;
        veteran: number;
        elite: number;
        boss: number;
    };
    inner: {
        basic: number;
        veteran: number;
        elite: number;
        boss: number;
    };
    middle: {
        basic: number;
        veteran: number;
        elite: number;
        boss: number;
    };
    outer: {
        basic: number;
        veteran: number;
        elite: number;
        boss: number;
    };
    frontier: {
        basic: number;
        veteran: number;
        elite: number;
        boss: number;
    };
};
export declare const BIOME_PRESENCE_CHANCE: {
    forest: number;
    swamp: number;
    plains: number;
    river: number;
    lake: number;
    volcano: number;
    ashlands: number;
    highlands: number;
    desert: number;
    tundra: number;
};
export declare const BIOME_MAX_PACK_SIZE: {
    forest: number;
    swamp: number;
    plains: number;
    river: number;
    lake: number;
    volcano: number;
    ashlands: number;
    highlands: number;
    desert: number;
    tundra: number;
};
export declare const BIOME_SPECIES: {
    forest: string[];
    swamp: string[];
    plains: string[];
    river: string[];
    lake: string[];
    volcano: string[];
    ashlands: string[];
    highlands: string[];
    desert: string[];
    tundra: string[];
};
export declare const CATEGORY_PREFIX: {
    basic: string[];
    veteran: string[];
    elite: string[];
    boss: string[];
};
export declare const BIOME_ATTRIBUTE_BONUS: {
    forest: {
        dex: number;
        agi: number;
        vit: number;
    };
    swamp: {
        vit: number;
        eng: number;
        intelligence: number;
    };
    plains: {
        str: number;
        agi: number;
        dex: number;
    };
    river: {
        dex: number;
        eng: number;
        agi: number;
    };
    lake: {
        dex: number;
        intelligence: number;
        eng: number;
    };
    volcano: {
        str: number;
        vit: number;
        intelligence: number;
    };
    ashlands: {
        vit: number;
        str: number;
        eng: number;
    };
    highlands: {
        vit: number;
        str: number;
        agi: number;
    };
    desert: {
        agi: number;
        dex: number;
        eng: number;
    };
    tundra: {
        vit: number;
        str: number;
        intelligence: number;
    };
};
