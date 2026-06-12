// @ts-nocheck
function parseIntEnv(value, fallback, min = 1) {
    if (!value) {
        return fallback;
    }
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    return Math.max(min, parsed);
}
function parseBoolEnv(value, fallback) {
    if (!value) {
        return fallback;
    }
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) {
        return true;
    }
    if (['0', 'false', 'no', 'off'].includes(normalized)) {
        return false;
    }
    return fallback;
}
function parseStringEnv(value, fallback) {
    if (!value) {
        return fallback;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
}
export const RUNTIME_CONFIG = {
    botTransportMode: parseStringEnv(process.env.BOT_TRANSPORT_MODE, 'polling'),
    mapDebugEnabled: parseBoolEnv(process.env.MAP_DEBUG_ENABLED, false),
    customEmojiDebugEnabled: parseBoolEnv(process.env.CUSTOM_EMOJI_DEBUG_ENABLED, false),
    webhookUrl: parseStringEnv(process.env.WEBHOOK_URL, ''),
    webhookPort: parseIntEnv(process.env.WEBHOOK_PORT, 3000, 1),
    enableBackgroundWorkers: parseBoolEnv(process.env.ENABLE_BACKGROUND_WORKERS, true),
    dayCycleEnabled: parseBoolEnv(process.env.DAY_CYCLE_ENABLED, true),
    dayCycleAnchorIso: parseStringEnv(process.env.DAY_CYCLE_ANCHOR_ISO, '2026-01-01T00:00:00Z'),
    dayCycleDawnMinutes: parseIntEnv(process.env.DAY_CYCLE_DAWN_MINUTES, 20, 1),
    dayCycleDayMinutes: parseIntEnv(process.env.DAY_CYCLE_DAY_MINUTES, 280, 1),
    dayCycleDuskMinutes: parseIntEnv(process.env.DAY_CYCLE_DUSK_MINUTES, 20, 1),
    dayCycleNightMinutes: parseIntEnv(process.env.DAY_CYCLE_NIGHT_MINUTES, 160, 1),
    climateZoneSize: parseIntEnv(process.env.CLIMATE_ZONE_SIZE, 10, 2),
    climateZoneDurationMinMinutes: parseIntEnv(process.env.CLIMATE_ZONE_DURATION_MIN_MINUTES, 20, 1),
    climateZoneDurationMaxMinutes: parseIntEnv(process.env.CLIMATE_ZONE_DURATION_MAX_MINUTES, 60, 2),
    climateSweepIntervalMs: parseIntEnv(process.env.CLIMATE_SWEEP_INTERVAL_MS, 30_000, 1_000),
    climateTransitionBatchSize: parseIntEnv(process.env.CLIMATE_TRANSITION_BATCH_SIZE, 12, 1),
    climateUpdateConcurrency: parseIntEnv(process.env.CLIMATE_UPDATE_CONCURRENCY, 4, 1),
    climateAlertsEnabled: parseBoolEnv(process.env.CLIMATE_ALERTS_ENABLED, true),
    climateAlertsMaxPerSweep: parseIntEnv(process.env.CLIMATE_ALERTS_MAX_PER_SWEEP, 4, 0),
    climateAlertsChannel: parseStringEnv(process.env.CLIMATE_ALERTS_CHANNEL, '@rpgalert'),
    communityProgressOnly: parseBoolEnv(process.env.COMMUNITY_PROGRESS_ONLY, true),
    communityProgressFeedEnabled: parseBoolEnv(process.env.COMMUNITY_PROGRESS_FEED_ENABLED, true),
    communityUpdatesChannel: parseStringEnv(process.env.COMMUNITY_UPDATES_CHANNEL, '@rpgalert'),
    merchantEnabled: parseBoolEnv(process.env.MERCHANT_ENABLED, true),
    merchantCount: parseIntEnv(process.env.MERCHANT_COUNT, 2, 1),
    merchantSweepIntervalMs: parseIntEnv(process.env.MERCHANT_SWEEP_INTERVAL_MS, 15_000, 1_000),
    merchantStayMinSeconds: parseIntEnv(process.env.MERCHANT_STAY_MIN_SECONDS, 300, 30),
    merchantStayMaxSeconds: parseIntEnv(process.env.MERCHANT_STAY_MAX_SECONDS, 3600, 60),
    merchantRumorRadius: parseIntEnv(process.env.MERCHANT_RUMOR_RADIUS, 18, 3),
    merchantEtaSecondsPerTile: parseIntEnv(process.env.MERCHANT_ETA_SECONDS_PER_TILE, 3, 1),
    merchantAlertsChannel: parseStringEnv(process.env.MERCHANT_ALERTS_CHANNEL, '@rpgalert'),
    merchantForceCoords: parseStringEnv(process.env.MERCHANT_FORCE_COORDS, ''),
    merchantPerimeterMargin: parseIntEnv(process.env.MERCHANT_PERIMETER_MARGIN, 10, 0),
    merchantMaxDistanceToDiscovered: parseIntEnv(process.env.MERCHANT_MAX_DISTANCE_TO_DISCOVERED, 12, 1),
    merchantFallbackRadius: parseIntEnv(process.env.MERCHANT_FALLBACK_RADIUS, 25, 3),
    inspectNodeCacheTtlMs: parseIntEnv(process.env.INSPECT_NODE_CACHE_TTL_MS, 30_000, 1_000),
    gatherableCacheTtlMs: parseIntEnv(process.env.GATHERABLE_CACHE_TTL_MS, 30_000, 1_000),
    recoverySweepIntervalMs: parseIntEnv(process.env.RECOVERY_SWEEP_INTERVAL_MS, 10_000, 1_000),
    jobSweepIntervalMs: parseIntEnv(process.env.JOB_SWEEP_INTERVAL_MS, 1_000, 250),
    jobSweepBatchSize: parseIntEnv(process.env.JOB_SWEEP_BATCH_SIZE, 50, 1),
    jobRunningLockTimeoutMs: parseIntEnv(process.env.JOB_RUNNING_LOCK_TIMEOUT_MS, 90_000, 5_000),
    perfMetricsEnabled: parseBoolEnv(process.env.PERF_METRICS_ENABLED, true),
    perfReportIntervalMs: parseIntEnv(process.env.PERF_REPORT_INTERVAL_MS, 60_000, 5_000),
    perfSampleLimit: parseIntEnv(process.env.PERF_SAMPLE_LIMIT, 300, 30),
    playerQueueMaxConcurrency: parseIntEnv(process.env.PLAYER_QUEUE_MAX_CONCURRENCY, 24, 1),
    playerQueueMaxPending: parseIntEnv(process.env.PLAYER_QUEUE_MAX_PENDING, 2000, 10),
    playerQueueMaxPendingPerPlayer: parseIntEnv(process.env.PLAYER_QUEUE_MAX_PENDING_PER_PLAYER, 6, 1),
};
