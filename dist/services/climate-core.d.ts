import type { Language } from '../lib/i18n.js';
export type ClimateKind = 'calm' | 'humid' | 'dry' | 'mist' | 'heat' | 'storm' | 'ash';
export type ClimateEvent = 'flood' | 'wildfire' | 'quakes' | 'duststorm' | 'toxic_fog' | null;
export interface ClimateSnapshot {
    worldMapId: number;
    zoneX: number;
    zoneY: number;
    kind: ClimateKind;
    intensity: number;
    specialEvent: ClimateEvent;
    biomeHint: string | null;
    biomeLabel: string | null;
    nextChangeAt: Date;
}
export interface ClimateEffectModifiers {
    spawnMultiplier: number;
    yieldMultiplier: number;
    energyCostMultiplier: number;
}
export declare const KIND_EMOJI: Record<ClimateKind, string>;
export declare const EVENT_EMOJI: Record<Exclude<ClimateEvent, null>, string>;
export declare const KIND_LABELS: Record<Language, Record<ClimateKind, string>>;
export declare const EVENT_LABELS: Record<Language, Record<Exclude<ClimateEvent, null>, string>>;
export declare const CLIMATE_TITLE: Record<Language, string>;
export declare const EVENT_TITLE: Record<Language, string>;
export declare function cacheKey(worldMapId: number, zoneX: number, zoneY: number): string;
export declare function toRoman(level: number): string;
export declare function randomInt(min: number, max: number): number;
export declare function pickWeighted<T extends {
    weight: number;
}>(items: T[]): T;
export declare function pickClimateKind(previous?: ClimateKind | null, biomeHint?: string | null): ClimateKind;
export declare function pickIntensity(kind: ClimateKind): number;
export declare function pickSpecialEvent(biomeHint: string | null, kind: ClimateKind, intensity: number): ClimateEvent;
export declare function getDurationMs(): number;
export declare function getZoneCoords(valueX: number, valueY: number): {
    zoneX: number;
    zoneY: number;
};
export declare function getZoneBounds(zoneX: number, zoneY: number): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
};
export declare function normalizeLang(lang?: string | null): Language;
export declare function toSnapshot(row: {
    worldMapId: number;
    zoneX: number;
    zoneY: number;
    climateKind: string;
    intensity: number;
    specialEvent: string | null;
    biomeHint: string | null;
    biomeLabel: string | null;
    nextChangeAt: Date;
}): ClimateSnapshot;
export declare function clamp(value: number, min: number, max: number): number;
export declare function buildAlertText(snapshot: ClimateSnapshot): string;
export declare function getClimateEffectsForBiome(biomeName: string, snapshot: ClimateSnapshot): ClimateEffectModifiers;
export declare function formatClimateLine(langRaw: Language | string | null | undefined, snapshot: ClimateSnapshot): string;
