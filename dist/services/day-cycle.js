// @ts-nocheck
import { getAmbientHint, getDayPeriodEffects, getDayPeriodEmoji, getDayPeriodLabel } from '../data/day-cycle.js';
import { RUNTIME_CONFIG } from '../lib/runtime-config.js';
const MS_PER_MINUTE = 60000;
const FALLBACK_ANCHOR_MS = Date.parse('2026-01-01T00:00:00Z');
function resolveAnchorMs() {
    const parsed = Date.parse(RUNTIME_CONFIG.dayCycleAnchorIso);
    if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
    }
    return Number.isFinite(FALLBACK_ANCHOR_MS) ? FALLBACK_ANCHOR_MS : Date.UTC(2026, 0, 1, 0, 0, 0);
}
function getDurations() {
    const dawnMs = Math.max(1, RUNTIME_CONFIG.dayCycleDawnMinutes) * MS_PER_MINUTE;
    const dayMs = Math.max(1, RUNTIME_CONFIG.dayCycleDayMinutes) * MS_PER_MINUTE;
    const duskMs = Math.max(1, RUNTIME_CONFIG.dayCycleDuskMinutes) * MS_PER_MINUTE;
    const nightMs = Math.max(1, RUNTIME_CONFIG.dayCycleNightMinutes) * MS_PER_MINUTE;
    return {
        dawnMs,
        dayMs,
        duskMs,
        nightMs,
        totalMs: dawnMs + dayMs + duskMs + nightMs,
    };
}
function normalizeLang(lang) {
    if (lang === 'en' || lang === 'ru' || lang === 'es') {
        return lang;
    }
    return 'es';
}
function normalizePositiveModulo(value, modulo) {
    const raw = value % modulo;
    return raw < 0 ? raw + modulo : raw;
}
function formatRemainingShort(lang, remainingMs) {
    const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    if (totalSeconds < 60) {
        return `${totalSeconds}s`;
    }
    const minutes = Math.ceil(totalSeconds / 60);
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
        return lang === 'es' || lang === 'en' ? `${hours}h` : `${hours}ch`;
    }
    return lang === 'es' || lang === 'en' ? `${hours}h ${mins}m` : `${hours}ch ${mins}m`;
}
function hashString(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}
export function getDayCycleSnapshot(nowMs = Date.now()) {
    if (!RUNTIME_CONFIG.dayCycleEnabled) {
        return {
            period: 'day',
            periodIndex: 1,
            cycleIndex: 0,
            elapsedInPeriodMs: 0,
            remainingInPeriodMs: 0,
            nextTransitionAt: new Date(nowMs),
            isEnabled: false,
        };
    }
    const durations = getDurations();
    const anchorMs = resolveAnchorMs();
    const elapsedTotalMs = nowMs - anchorMs;
    const elapsedWithinCycleMs = normalizePositiveModulo(elapsedTotalMs, durations.totalMs);
    const cycleIndex = Math.floor(elapsedTotalMs / durations.totalMs);
    const dawnEdge = durations.dawnMs;
    const dayEdge = dawnEdge + durations.dayMs;
    const duskEdge = dayEdge + durations.duskMs;
    let period = 'night';
    let periodIndex = 3;
    let elapsedInPeriodMs = elapsedWithinCycleMs - duskEdge;
    let periodTotalMs = durations.nightMs;
    if (elapsedWithinCycleMs < dawnEdge) {
        period = 'dawn';
        periodIndex = 0;
        elapsedInPeriodMs = elapsedWithinCycleMs;
        periodTotalMs = durations.dawnMs;
    }
    else if (elapsedWithinCycleMs < dayEdge) {
        period = 'day';
        periodIndex = 1;
        elapsedInPeriodMs = elapsedWithinCycleMs - dawnEdge;
        periodTotalMs = durations.dayMs;
    }
    else if (elapsedWithinCycleMs < duskEdge) {
        period = 'dusk';
        periodIndex = 2;
        elapsedInPeriodMs = elapsedWithinCycleMs - dayEdge;
        periodTotalMs = durations.duskMs;
    }
    const remainingInPeriodMs = Math.max(0, periodTotalMs - elapsedInPeriodMs);
    return {
        period,
        periodIndex,
        cycleIndex: Number.isFinite(cycleIndex) ? cycleIndex : 0,
        elapsedInPeriodMs,
        remainingInPeriodMs,
        nextTransitionAt: new Date(nowMs + remainingInPeriodMs),
        isEnabled: true,
    };
}
export function getDayCycleEffectsForBiome(biomeName, snapshot) {
    return getDayPeriodEffects(biomeName, snapshot.period);
}
export function formatDayCycleLine(langRaw, snapshot) {
    const lang = normalizeLang(langRaw);
    if (!snapshot.isEnabled) {
        return lang === 'en' ? '🕰️ Day cycle: static' : lang === 'ru' ? '🕰️ Cikl dnya: statichnyj' : '🕰️ Ciclo horario: fijo';
    }
    const prefix = lang === 'en' ? 'Cycle' : lang === 'ru' ? 'Smena' : 'Horario';
    const periodEmoji = getDayPeriodEmoji(snapshot.period);
    const periodLabel = getDayPeriodLabel(lang, snapshot.period);
    const remaining = formatRemainingShort(lang, snapshot.remainingInPeriodMs);
    return `🕰️ ${prefix}: ${periodEmoji} ${periodLabel} · ${remaining}`;
}
export function getDayCycleAmbientLine(langRaw, biomeName, snapshot) {
    if (!snapshot.isEnabled) {
        return null;
    }
    const lang = normalizeLang(langRaw);
    const seed = snapshot.cycleIndex + snapshot.periodIndex * 11 + hashString(biomeName || 'default');
    return getAmbientHint(lang, biomeName, snapshot.period, seed);
}
//# sourceMappingURL=day-cycle.js.map