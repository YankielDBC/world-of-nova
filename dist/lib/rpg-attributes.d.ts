export type RaceKey = 'zolk' | 'uren';
export type ClassKey = 'curse_hunter' | 'alchemist_rogue' | 'dark_druid' | 'arcane';
export type PrimaryAttrKey = 'str' | 'dex' | 'int' | 'vit' | 'agi' | 'eng';
export interface PrimaryAttributes {
    str: number;
    dex: number;
    int: number;
    vit: number;
    agi: number;
    eng: number;
}
export declare const CLASS_BONUS_TABLE: Record<ClassKey, PrimaryAttributes>;
export declare function getClassAttributesAtLevel(params: {
    race?: string | null;
    classKey?: string | null;
    level: number;
}): PrimaryAttributes | null;
export declare function getClassGrowthDebug(params: {
    race?: string | null;
    classKey?: string | null;
    level: number;
}): {
    lines: string[];
    attrs: PrimaryAttributes | null;
};
