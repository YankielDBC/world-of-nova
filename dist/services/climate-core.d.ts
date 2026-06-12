export declare const KIND_EMOJI: {
    calm: string;
    humid: string;
    dry: string;
    mist: string;
    heat: string;
    storm: string;
    ash: string;
};
export declare const EVENT_EMOJI: {
    flood: string;
    wildfire: string;
    quakes: string;
    duststorm: string;
    toxic_fog: string;
};
export declare const KIND_LABELS: {
    es: {
        calm: string;
        humid: string;
        dry: string;
        mist: string;
        heat: string;
        storm: string;
        ash: string;
    };
    en: {
        calm: string;
        humid: string;
        dry: string;
        mist: string;
        heat: string;
        storm: string;
        ash: string;
    };
    ru: {
        calm: string;
        humid: string;
        dry: string;
        mist: string;
        heat: string;
        storm: string;
        ash: string;
    };
};
export declare const EVENT_LABELS: {
    es: {
        flood: string;
        wildfire: string;
        quakes: string;
        duststorm: string;
        toxic_fog: string;
    };
    en: {
        flood: string;
        wildfire: string;
        quakes: string;
        duststorm: string;
        toxic_fog: string;
    };
    ru: {
        flood: string;
        wildfire: string;
        quakes: string;
        duststorm: string;
        toxic_fog: string;
    };
};
export declare const CLIMATE_TITLE: {
    es: string;
    en: string;
    ru: string;
};
export declare const EVENT_TITLE: {
    es: string;
    en: string;
    ru: string;
};
export declare function cacheKey(worldMapId: any, zoneX: any, zoneY: any): string;
export declare function toRoman(level: any): "III" | "II" | "I";
export declare function randomInt(min: any, max: any): number;
export declare function pickWeighted(items: any): any;
export declare function pickClimateKind(previous: any, biomeHint: any): any;
export declare function pickIntensity(kind: any): any;
export declare function pickSpecialEvent(biomeHint: any, kind: any, intensity: any): "flood" | "wildfire" | "quakes" | "duststorm" | "toxic_fog";
export declare function getDurationMs(): number;
export declare function getZoneCoords(valueX: any, valueY: any): {
    zoneX: number;
    zoneY: number;
};
export declare function getZoneBounds(zoneX: any, zoneY: any): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
};
export declare function normalizeLang(lang: any): any;
export declare function toSnapshot(row: any): {
    worldMapId: any;
    zoneX: any;
    zoneY: any;
    kind: any;
    intensity: any;
    specialEvent: any;
    biomeHint: any;
    biomeLabel: any;
    nextChangeAt: any;
};
export declare function clamp(value: any, min: any, max: any): number;
export declare function buildAlertText(snapshot: any): string;
export declare function getClimateEffectsForBiome(biomeName: any, snapshot: any): {
    spawnMultiplier: number;
    yieldMultiplier: number;
    energyCostMultiplier: number;
};
export declare function formatClimateLine(langRaw: any, snapshot: any): string;
