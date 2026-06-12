import { RUNTIME_CONFIG } from './runtime-config.js';
const metricMap = new Map();
let reporterTimer = null;
function getStore(key) {
    let store = metricMap.get(key);
    if (!store) {
        store = {
            count: 0,
            totalMs: 0,
            maxMs: 0,
            samples: [],
        };
        metricMap.set(key, store);
    }
    return store;
}
function percentile(sortedValues, p) {
    if (sortedValues.length === 0) {
        return 0;
    }
    if (sortedValues.length === 1) {
        return sortedValues[0];
    }
    const rank = (p / 100) * (sortedValues.length - 1);
    const lower = Math.floor(rank);
    const upper = Math.ceil(rank);
    if (lower === upper) {
        return sortedValues[lower];
    }
    const weight = rank - lower;
    return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * weight;
}
function formatMs(value) {
    if (value < 1000) {
        return `${value.toFixed(1)}ms`;
    }
    return `${(value / 1000).toFixed(2)}s`;
}
export function observePerf(metricKey, durationMs) {
    if (!RUNTIME_CONFIG.perfMetricsEnabled) {
        return;
    }
    const safeDuration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;
    const store = getStore(metricKey);
    store.count += 1;
    store.totalMs += safeDuration;
    store.maxMs = Math.max(store.maxMs, safeDuration);
    store.samples.push(safeDuration);
    if (store.samples.length > RUNTIME_CONFIG.perfSampleLimit) {
        store.samples.splice(0, store.samples.length - RUNTIME_CONFIG.perfSampleLimit);
    }
}
export async function measurePerf(metricKey, fn) {
    const startedAt = Date.now();
    try {
        return await fn();
    }
    finally {
        observePerf(metricKey, Date.now() - startedAt);
    }
}
function flushPerfReport() {
    if (!RUNTIME_CONFIG.perfMetricsEnabled || metricMap.size === 0) {
        return;
    }
    const rows = [];
    for (const [key, store] of metricMap.entries()) {
        const avg = store.count > 0 ? store.totalMs / store.count : 0;
        const sorted = [...store.samples].sort((a, b) => a - b);
        const p50 = percentile(sorted, 50);
        const p95 = percentile(sorted, 95);
        const p99 = percentile(sorted, 99);
        rows.push(`${key} count=${store.count} avg=${formatMs(avg)} p50=${formatMs(p50)} p95=${formatMs(p95)} p99=${formatMs(p99)} max=${formatMs(store.maxMs)}`);
    }
    rows.sort((a, b) => a.localeCompare(b));
    console.log(`📈 PERF METRICS\n${rows.join('\n')}`);
}
export function startPerfReporter() {
    if (!RUNTIME_CONFIG.perfMetricsEnabled || reporterTimer) {
        return;
    }
    reporterTimer = setInterval(flushPerfReport, RUNTIME_CONFIG.perfReportIntervalMs);
}
