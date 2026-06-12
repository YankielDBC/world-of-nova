// @ts-nocheck
import { novaCastlePlace } from './place-ui/nova-castle.js';
import { frontierVillagePlace } from './place-ui/frontier-village.js';
import { ancientCavePlace } from './place-ui/ancient-cave.js';
import { ancientRuinsPlace } from './place-ui/ancient-ruins.js';
export const PLACE_UI_CONFIG = {
    'nova-castle': novaCastlePlace,
    'frontier-village': frontierVillagePlace,
    'ancient-cave': ancientCavePlace,
    'ancient-ruins': ancientRuinsPlace,
};
export function getLocalizedText(value, lang, fallback = '') {
    if (!value) {
        return fallback;
    }
    return value[lang] || value.es || value.en || fallback;
}
export function getPlaceUiConfig(placeSlug) {
    if (!placeSlug) {
        return null;
    }
    if (PLACE_UI_CONFIG[placeSlug]) {
        return PLACE_UI_CONFIG[placeSlug];
    }
    if (placeSlug.startsWith('frontier-village-')) {
        return PLACE_UI_CONFIG['frontier-village'];
    }
    if (placeSlug.startsWith('ancient-cave-')) {
        return PLACE_UI_CONFIG['ancient-cave'];
    }
    if (placeSlug.startsWith('ancient-ruins-')) {
        return PLACE_UI_CONFIG['ancient-ruins'];
    }
    return null;
}
