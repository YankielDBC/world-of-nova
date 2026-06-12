import { InlineKeyboard } from 'grammy';
import { type PlaceBuilding } from '../data/place-ui.js';
import { type Language } from '../lib/i18n.js';
export declare function formatPlaceOverview(place: any, lang: Language, populationLine?: string | null): {
    message: string;
    keyboard: InlineKeyboard;
};
export declare function formatPlaceBuilding(place: any, building: PlaceBuilding, lang: Language, populationLine?: string | null, options?: {
    learnedSkillKeys?: Set<string>;
}): {
    message: string;
    keyboard: InlineKeyboard;
};
