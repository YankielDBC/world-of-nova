// @ts-nocheck
import { RUNTIME_CONFIG } from '../lib/runtime-config.js';
export const KIND_EMOJI = {
    calm: '🌤️',
    humid: '🌧️',
    dry: '🏜️',
    mist: '🌫️',
    heat: '🔥',
    storm: '⛈️',
    ash: '🌋',
};
export const EVENT_EMOJI = {
    flood: '🌊',
    wildfire: '🔥',
    quakes: '💥',
    duststorm: '🌪️',
    toxic_fog: '☣️',
};
export const KIND_LABELS = {
    es: {
        calm: 'Calma',
        humid: 'Humedo',
        dry: 'Seco',
        mist: 'Neblina',
        heat: 'Calor',
        storm: 'Tormenta',
        ash: 'Ceniza',
    },
    en: {
        calm: 'Calm',
        humid: 'Humid',
        dry: 'Dry',
        mist: 'Mist',
        heat: 'Heat',
        storm: 'Storm',
        ash: 'Ash',
    },
    ru: {
        calm: 'Spokojno',
        humid: 'Vlagno',
        dry: 'Suho',
        mist: 'Tuman',
        heat: 'Zhar',
        storm: 'Shtorm',
        ash: 'Pepel',
    },
};
export const EVENT_LABELS = {
    es: {
        flood: 'Crecida',
        wildfire: 'Incendio',
        quakes: 'Sismos',
        duststorm: 'Polvareda',
        toxic_fog: 'Niebla toxica',
    },
    en: {
        flood: 'Flooding',
        wildfire: 'Wildfire',
        quakes: 'Quakes',
        duststorm: 'Dust Storm',
        toxic_fog: 'Toxic Fog',
    },
    ru: {
        flood: 'Navodnenie',
        wildfire: 'Pozhar',
        quakes: 'Tolchki',
        duststorm: 'Pylnaya burya',
        toxic_fog: 'Yadovityj tuman',
    },
};
export const CLIMATE_TITLE = {
    es: 'Clima zona',
    en: 'Zone climate',
    ru: 'Klimat zony',
};
export const EVENT_TITLE = {
    es: 'Evento',
    en: 'Event',
    ru: 'Sobytie',
};
export { pickClimateKind, pickIntensity, pickSpecialEvent, getClimateEffectsForBiome } from './climate-core-actions.js';
export function cacheKey(worldMapId, zoneX, zoneY) {
    return `${worldMapId}:${zoneX}:${zoneY}`;
}
export function toRoman(level) {
    if (level >= 3)
        return 'III';
    if (level === 2)
        return 'II';
    return 'I';
}
export function randomInt(min, max) {
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    return Math.floor(Math.random() * (high - low + 1)) + low;
}
export function getDurationMs() {
    const minMinutes = RUNTIME_CONFIG.climateZoneDurationMinMinutes;
    const maxMinutes = RUNTIME_CONFIG.climateZoneDurationMaxMinutes;
    return randomInt(minMinutes, maxMinutes) * 60 * 1000;
}
export function getZoneCoords(valueX, valueY) {
    const size = RUNTIME_CONFIG.climateZoneSize;
    return {
        zoneX: Math.floor(valueX / size),
        zoneY: Math.floor(valueY / size),
    };
}
export function getZoneBounds(zoneX, zoneY) {
    const size = RUNTIME_CONFIG.climateZoneSize;
    const minX = zoneX * size;
    const minY = zoneY * size;
    return {
        minX,
        maxX: minX + size - 1,
        minY,
        maxY: minY + size - 1,
    };
}
export function normalizeLang(lang) {
    if (lang === 'en' || lang === 'ru' || lang === 'es')
        return lang;
    return 'es';
}
export function toSnapshot(row) {
    return {
        worldMapId: row.worldMapId,
        zoneX: row.zoneX,
        zoneY: row.zoneY,
        kind: row.climateKind,
        intensity: row.intensity,
        specialEvent: row.specialEvent ?? null,
        biomeHint: row.biomeHint,
        biomeLabel: row.biomeLabel,
        nextChangeAt: row.nextChangeAt,
    };
}
export function buildAlertText(snapshot) {
    const kindLabel = KIND_LABELS.es[snapshot.kind];
    const kindEmoji = KIND_EMOJI[snapshot.kind];
    const eventLabel = snapshot.specialEvent ? EVENT_LABELS.es[snapshot.specialEvent] : null;
    const eventEmoji = snapshot.specialEvent ? EVENT_EMOJI[snapshot.specialEvent] : null;
    const biomeLabel = snapshot.biomeLabel || 'frontera desconocida';
    return [
        '🔔 Susurro del Reino',
        `Un frente de ${kindEmoji} ${kindLabel.toLowerCase()} se asentó sobre una región de ${biomeLabel}.`,
        eventLabel ? `Se reportan señales de ${eventEmoji} ${eventLabel.toLowerCase()}.` : '',
        'No hay coordenadas oficiales. Explora y confirma el rumor.',
    ]
        .filter((line) => line.length > 0)
        .join('\n');
}
export function formatClimateLine(langRaw, snapshot) {
    const lang = normalizeLang(langRaw);
    const kindLabel = KIND_LABELS[lang][snapshot.kind];
    const kindEmoji = KIND_EMOJI[snapshot.kind];
    const intensity = toRoman(snapshot.intensity);
    if (!snapshot.specialEvent) {
        return `🌦️ ${CLIMATE_TITLE[lang]}: ${kindEmoji} ${kindLabel} ${intensity}`;
    }
    const eventLabel = EVENT_LABELS[lang][snapshot.specialEvent];
    const eventEmoji = EVENT_EMOJI[snapshot.specialEvent];
    return `🌦️ ${CLIMATE_TITLE[lang]}: ${kindEmoji} ${kindLabel} ${intensity} · ${EVENT_TITLE[lang]}: ${eventEmoji} ${eventLabel}`;
}
