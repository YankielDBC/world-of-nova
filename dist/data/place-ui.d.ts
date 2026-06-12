import { type Language } from '../lib/i18n.js';
type LocalizedText = Record<Language, string>;
export type PlaceBuildingService = {
    slug: string;
    emoji: string;
    name: LocalizedText;
    duration: LocalizedText;
    resultLore?: LocalizedText;
};
export type PlaceBuilding = {
    key: string;
    emoji: string;
    name: LocalizedText;
    typeLabel?: LocalizedText;
    description: LocalizedText;
    hint: LocalizedText;
    services: PlaceBuildingService[];
};
export type PlaceUiConfig = {
    name?: LocalizedText;
    hint?: LocalizedText;
    rulesLabel?: LocalizedText;
    buildingsLabel?: LocalizedText;
    rules: {
        pvpOff: LocalizedText;
        creaturesOff: LocalizedText;
    };
    buildings: PlaceBuilding[];
};
export declare const PLACE_UI_CONFIG: Record<string, PlaceUiConfig>;
export declare function getLocalizedText(value: LocalizedText | undefined, lang: Language, fallback?: string): string;
export declare function getPlaceUiConfig(placeSlug?: string | null): PlaceUiConfig | null;
export {};
