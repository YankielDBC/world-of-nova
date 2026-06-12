// @ts-nocheck
import { debugTextPreview, logMapDebug } from '../lib/map-debug.js';
function hasCoordinateSituations(footer) {
    const normalized = String(footer || '');
    return (normalized.includes('🔍') ||
        normalized.includes('🧩') ||
        normalized.toLowerCase().includes('interacciones') ||
        normalized.toLowerCase().includes('interactions') ||
        normalized.toLowerCase().includes('vzaimodeyst'));
}
export function getMapSituationNotice(lang, footer) {
    if (!hasCoordinateSituations(footer)) {
        return '';
    }
    if (lang === 'en') {
        return '🔔 There is activity on this coordinate. Use 🧩 Interact.';
    }
    if (lang === 'ru') {
        return '🔔 V etoy tochke est aktivnost. Ispolzuy 🧩 Vzaim.';
    }
    return '🔔 Hay actividad en esta coordenada. Usa 🧩 Interactuar.';
}
export function renderMapCardText(mapResult, lang) {
    const notice = getMapSituationNotice(lang, mapResult.footer);
    const text = [mapResult.header, mapResult.biomeName, mapResult.grid, mapResult.footer, notice]
        .filter((line) => !!line)
        .join('\n');
    logMapDebug('map-message.compose', {
        lang,
        headerPreview: debugTextPreview(mapResult.header, 120),
        biomePreview: debugTextPreview(mapResult.biomeName, 160),
        footerPreview: debugTextPreview(mapResult.footer, 160),
        noticePreview: debugTextPreview(notice, 120),
        textPreview: debugTextPreview(text, 260),
    });
    return text;
}
