import { EMOJIS } from '../data/emojis.js';
import { t } from '../lib/i18n.js';
import { getLocalizedText, getPlaceUiConfig } from '../data/place-ui.js';
import { getZoneBandAtCoords } from './world-zones.js';
export function getMovementMode(tile, playerSpeed) {
    if (tile.isWater)
        return 'swimming';
    if (tile.isMountain)
        return 'climbing';
    if (playerSpeed > 1.5)
        return 'running';
    return 'walking';
}
export function getMovementEmoji(mode) {
    const emojis = {
        walking: '🚶',
        swimming: '🏊',
        climbing: '🧗',
        running: '🏃',
        riding: '🐎',
        flying: '🦅',
    };
    return emojis[mode];
}
export function getDirectionLabel(lang, direction) {
    if (direction === 'up')
        return t(lang, 'mapUp');
    if (direction === 'down')
        return t(lang, 'mapDown');
    if (direction === 'left')
        return t(lang, 'mapLeft');
    return t(lang, 'mapRight');
}
export function formatZoneLevelLine(lang, x, y, playerLevel) {
    const zone = getZoneBandAtCoords(x, y);
    const danger = playerLevel < zone.recommendedLevelMin ? ' ⚠️' : '';
    if (lang === 'en') {
        return `🎯 Zone Lv: ${zone.recommendedLevelMin}-${zone.recommendedLevelMax}${danger}`;
    }
    if (lang === 'ru') {
        return `🎯 Zona Lv: ${zone.recommendedLevelMin}-${zone.recommendedLevelMax}${danger}`;
    }
    return `🎯 Zona Lv: ${zone.recommendedLevelMin}-${zone.recommendedLevelMax}${danger}`;
}
export function isSafePlace(place) {
    return !!place && !place.pvpAllowed && !place.combatAllowed;
}
export function getPlaceState(place, lang = 'es') {
    if (!place) {
        return null;
    }
    if (isSafePlace(place)) {
        return {
            stateEmoji: EMOJIS.ui.afk,
            stateLabel: t(lang, 'mapSafePlaceLabel'),
            description: t(lang, 'mapSafePlaceDesc'),
        };
    }
    return {
        stateEmoji: EMOJIS.ui.crossedSwords,
        stateLabel: t(lang, 'mapDangerPlaceLabel'),
        description: t(lang, 'mapDangerPlaceDesc'),
    };
}
function seededRandom(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
}
const TILE_NAME_PARTS = {
    forest: {
        prefixes: ['Runic', 'Briar', 'Elder', 'Moon', 'Cedar', 'Moss', 'Thorn', 'Dusk'],
        suffixes: ['Grove', 'Wood', 'Glade', 'Bough', 'Pines', 'Wilds'],
    },
    swamp: {
        prefixes: ['Lotus', 'Murk', 'Mire', 'Reed', 'Moss', 'Gloom', 'Bog', 'Vile'],
        suffixes: ['Fen', 'Bog', 'Marsh', 'Mire', 'Pools', 'Reeds'],
    },
    plains: {
        prefixes: ['Amber', 'Wind', 'Sun', 'Bloom', 'Wide', 'Gold', 'Dawn', 'Silk'],
        suffixes: ['Field', 'Reach', 'Downs', 'Mead', 'Steppe', 'Grass'],
    },
    volcano: {
        prefixes: ['Ash', 'Cinder', 'Ember', 'Pyre', 'Scoria', 'Magma', 'Sear', 'Obsid'],
        suffixes: ['Crag', 'Vent', 'Spire', 'Peak', 'Mouth', 'Burn'],
    },
    river: {
        prefixes: ['Silver', 'Swift', 'Blue', 'Cold', 'Mist', 'Stone', 'Moon', 'Reed'],
        suffixes: ['Run', 'Ford', 'Brook', 'Flow', 'Wash', 'Rill'],
    },
    lake: {
        prefixes: ['Mirror', 'Still', 'Moon', 'Bright', 'Glass', 'Whisper', 'Deep', 'Silver'],
        suffixes: ['Lake', 'Pool', 'Reach', 'Shore', 'Water', 'Basin'],
    },
    highlands: {
        prefixes: ['Stone', 'Grey', 'Ridge', 'North', 'Wind', 'Granite', 'High', 'Raven'],
        suffixes: ['Heights', 'Crown', 'Rise', 'Spine', 'Range', 'Cliff'],
    },
    ashlands: {
        prefixes: ['Ash', 'Cinder', 'Smolder', 'Soot', 'Dust', 'Ember', 'Scoria', 'Black'],
        suffixes: ['Reach', 'Flats', 'Wastes', 'Fields', 'March', 'Burn'],
    },
    desert: {
        prefixes: ['Sun', 'Dry', 'Amber', 'Saffron', 'Burnt', 'Dune', 'Wind', 'Sand'],
        suffixes: ['Dunes', 'Expanse', 'Run', 'Hollow', 'Waste', 'Trail'],
    },
    tundra: {
        prefixes: ['Frost', 'Ice', 'Snow', 'Pale', 'White', 'Cold', 'Winter', 'Glint'],
        suffixes: ['Tundra', 'Reach', 'Shelf', 'Flats', 'Field', 'Rime'],
    },
};
function pickSeededPart(parts, x, y, offset) {
    const index = Math.floor(seededRandom(x + offset * 17, y - offset * 11) * parts.length);
    return parts[index] || parts[0];
}
export function generateTileLoreName(biomeName, x, y) {
    const parts = TILE_NAME_PARTS[biomeName] || TILE_NAME_PARTS.forest;
    const prefix = pickSeededPart(parts.prefixes, x, y, 1);
    const suffix = pickSeededPart(parts.suffixes, x, y, 2);
    const spaced = `${prefix} ${suffix}`;
    if (spaced.length <= 13) {
        return spaced;
    }
    const compact = `${prefix}${suffix}`;
    if (compact.length <= 13) {
        return compact;
    }
    return compact.slice(0, 13);
}
export function getTileDisplayName(tile, place) {
    return place?.displayName || tile.loreName || tile.biome?.displayName || 'Unknown';
}
export function getTileDisplayLabel(tile, place) {
    const biomeType = tile.biome?.displayName || 'Unknown';
    const baseName = getTileDisplayName(tile, place);
    return `${baseName} (${biomeType})`;
}
export function getLocationDisplayLabel(tile, place, lang = 'es') {
    const localizedPlaceName = place && getLocalizedText(getPlaceUiConfig(place.slug)?.name, lang, place.displayName);
    const placeState = getPlaceState(place, lang);
    if (place && placeState) {
        return `${localizedPlaceName} - ${placeState.stateLabel}`;
    }
    return getTileDisplayLabel(tile, place);
}
export function deterministicRandom(seed) {
    let hash = 2166136261;
    for (let i = 0; i < seed.length; i += 1) {
        hash ^= seed.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return ((hash >>> 0) % 100000) / 100000;
}
// Keep the default forest map rotation faithful to generic forest tiles.
// Palm visuals are reserved for explicit coconut-style content instead of random forest noise.
const FOREST_MAP_EMOJI_POOL = [
    EMOJIS.forest.pine,
    EMOJIS.forest.fruitTree,
    EMOJIS.forest.deadTree,
];
export function getTileMapEmoji(tile, x, y) {
    const biomeName = tile.biome?.name || '';
    if (biomeName === 'forest') {
        const pick = Math.floor(deterministicRandom(`map-forest:${x},${y}`) * FOREST_MAP_EMOJI_POOL.length);
        return FOREST_MAP_EMOJI_POOL[pick] || EMOJIS.forest.pine;
    }
    return tile.biome?.emoji || '?';
}
