import type { Language } from '../lib/i18n.js';
type PlaceInteractionLike = {
    name: string;
    slug: string;
    displayName: string;
    emoji: string;
};
type PlaceLikeForBuildings = {
    slug?: string | null;
    interactions: PlaceInteractionLike[];
};
export declare function getPlaceBuildingEntries(place: PlaceLikeForBuildings, lang: Language): string[];
export declare const getPlaceBuildingEntriesClean: typeof getPlaceBuildingEntries;
export {};
