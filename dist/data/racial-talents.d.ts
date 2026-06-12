import type { Language } from '../lib/i18n.js';
export type RacialRace = 'zolk' | 'uren';
export type RacialTalentType = 'passive' | 'active' | 'keystone';
export type RacialTalentCategory = 'offense' | 'defense' | 'mobility' | 'utility' | 'active' | 'keystone';
export interface LocalizedText3 {
    es: string;
    en: string;
    ru: string;
}
export interface RacialTalentDefinition {
    key: string;
    race: RacialRace;
    type: RacialTalentType;
    category: RacialTalentCategory;
    maxRank: number;
    costPerRank: number;
    sortOrder: number;
    name: LocalizedText3;
    summary: LocalizedText3;
    prerequisites?: string[];
}
export declare const RACIAL_TALENT_CATEGORIES: Array<{
    key: RacialTalentCategory;
    label: LocalizedText3;
}>;
export declare function normalizeRace(value: string | null | undefined): RacialRace | null;
export declare function getLocalizedText3(text: LocalizedText3, lang: Language): string;
export declare function getAllRacialTalents(): RacialTalentDefinition[];
export declare function getRacialTalentsForRace(race: RacialRace): RacialTalentDefinition[];
export declare function getRacialTalentByKey(key: string): RacialTalentDefinition | null;
export declare function getRacialPointsForLevel(level: number): number;
