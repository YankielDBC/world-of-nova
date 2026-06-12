export declare const RACIAL_TALENT_CATEGORIES: {
    key: string;
    label: {
        es: string;
        en: string;
        ru: string;
    };
}[];
export declare function normalizeRace(value: any): "zolk" | "uren";
export declare function getLocalizedText3(text: any, lang: any): any;
export declare function getAllRacialTalents(): ({
    key: string;
    race: string;
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
    prerequisites?: undefined;
} | {
    key: string;
    race: string;
    type: string;
    category: string;
    maxRank: number;
    costPerRank: number;
    sortOrder: number;
    prerequisites: string[];
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
})[];
export declare function getRacialTalentsForRace(race: any): ({
    key: string;
    race: string;
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
    prerequisites?: undefined;
} | {
    key: string;
    race: string;
    type: string;
    category: string;
    maxRank: number;
    costPerRank: number;
    sortOrder: number;
    prerequisites: string[];
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
})[];
export declare function getRacialTalentByKey(key: any): {
    key: string;
    race: string;
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
    prerequisites?: undefined;
} | {
    key: string;
    race: string;
    type: string;
    category: string;
    maxRank: number;
    costPerRank: number;
    sortOrder: number;
    prerequisites: string[];
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
};
export declare function getRacialPointsForLevel(level: any): number;
