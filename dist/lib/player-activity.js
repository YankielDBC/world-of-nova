import { prisma } from './db.js';
// Coalesce frequent bot interactions to reduce write pressure under high concurrency.
const ACTIVITY_TOUCH_COOLDOWN_MS = 30_000;
const ACTIVITY_CACHE_TTL_MS = 30 * 60 * 1000;
const ACTIVITY_CACHE_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const lastTouchByTgId = new Map();
let nextCleanupAt = 0;
function cleanupTouchCache(nowMs) {
    if (nowMs < nextCleanupAt) {
        return;
    }
    nextCleanupAt = nowMs + ACTIVITY_CACHE_CLEANUP_INTERVAL_MS;
    for (const [tgId, touchedAt] of lastTouchByTgId.entries()) {
        if (nowMs - touchedAt > ACTIVITY_CACHE_TTL_MS) {
            lastTouchByTgId.delete(tgId);
        }
    }
}
export async function touchPlayerActivity(tgId, force = false) {
    const nowMs = Date.now();
    cleanupTouchCache(nowMs);
    const lastTouch = lastTouchByTgId.get(tgId) || 0;
    if (!force && nowMs - lastTouch < ACTIVITY_TOUCH_COOLDOWN_MS) {
        return;
    }
    const now = new Date(nowMs);
    await prisma.player.updateMany({
        where: { tgId },
        data: { lastActiveAt: now, isActive: true },
    });
    lastTouchByTgId.set(tgId, nowMs);
}
