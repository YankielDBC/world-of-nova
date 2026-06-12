// @ts-nocheck
import { prisma } from '../lib/db.js';
import { cloneEffects, normalizeSkillKey } from './build-skills-utils.js';
let schemaReadyPromise = null;
const stateCache = new Map();
const effectsCache = new Map();
export const STATE_CACHE_TTL_MS = 30_000;
export const EFFECTS_CACHE_TTL_MS = 12_000;
export function clearStateCache(playerId) {
    if (typeof playerId === 'number') {
        stateCache.delete(playerId);
        return;
    }
    stateCache.clear();
}
export function invalidateBuildGameplayEffectsCache(playerId) {
    if (typeof playerId === 'number') {
        clearStateCache(playerId);
        for (const key of effectsCache.keys()) {
            if (key.startsWith(`${playerId}:`)) {
                effectsCache.delete(key);
            }
        }
        return;
    }
    clearStateCache();
    effectsCache.clear();
}
export function getCachedState(playerId) {
    const cached = stateCache.get(playerId);
    if (!cached || cached.expiresAt <= Date.now()) {
        if (cached)
            stateCache.delete(playerId);
        return null;
    }
    return cached.state;
}
export function setCachedState(playerId, state) {
    stateCache.set(playerId, {
        expiresAt: Date.now() + STATE_CACHE_TTL_MS,
        state,
    });
}
export function getCachedEffects(cacheKey) {
    const cached = effectsCache.get(cacheKey);
    if (!cached || cached.expiresAt <= Date.now()) {
        if (cached)
            effectsCache.delete(cacheKey);
        return null;
    }
    return cloneEffects(cached.effects);
}
export function setCachedEffects(cacheKey, effects) {
    effectsCache.set(cacheKey, {
        expiresAt: Date.now() + EFFECTS_CACHE_TTL_MS,
        effects: cloneEffects(effects),
    });
}
export function buildEffectsCacheKey(playerId, condition) {
    return `${playerId}:${Math.round(condition.hpPct)}:${Math.round(condition.staPct)}`;
}
export function logBuildTelemetry(eventType, playerId, skillKey, payload) {
    const payloadJson = payload ? JSON.stringify(payload) : '{}';
    return prisma.$executeRawUnsafe('INSERT INTO "BuildTelemetryEvent" (playerId, eventType, skillKey, payloadJson, createdAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)', playerId ?? null, String(eventType || '').slice(0, 40), skillKey ? normalizeSkillKey(skillKey) : null, payloadJson);
}
export async function readSkillRows(playerId) {
    return prisma.$queryRawUnsafe('SELECT skillKey, rank FROM "PlayerBuildSkill" WHERE playerId = ? AND rank > 0', playerId);
}
export async function ensureLoadoutRow(playerId) {
    await prisma.$executeRawUnsafe('INSERT INTO "PlayerBuildLoadout" (playerId, activeSlot1, activeSlot2, activeSlot3, keystoneKey, createdAt, updatedAt) VALUES (?, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT(playerId) DO NOTHING', playerId);
}
export async function readLoadout(playerId) {
    await ensureLoadoutRow(playerId);
    const rows = await prisma.$queryRawUnsafe('SELECT activeSlot1, activeSlot2, activeSlot3, keystoneKey FROM "PlayerBuildLoadout" WHERE playerId = ? LIMIT 1', playerId);
    const row = rows[0];
    return {
        activeSlot1: normalizeSkillKey(row?.activeSlot1 || '') || null,
        activeSlot2: normalizeSkillKey(row?.activeSlot2 || '') || null,
        activeSlot3: normalizeSkillKey(row?.activeSlot3 || '') || null,
        keystoneKey: normalizeSkillKey(row?.keystoneKey || '') || null,
    };
}
export async function updateLoadout(playerId, loadout) {
    await ensureLoadoutRow(playerId);
    await prisma.$executeRawUnsafe('UPDATE "PlayerBuildLoadout" SET activeSlot1 = ?, activeSlot2 = ?, activeSlot3 = ?, keystoneKey = ?, updatedAt = CURRENT_TIMESTAMP WHERE playerId = ?', loadout.activeSlot1, loadout.activeSlot2, loadout.activeSlot3, loadout.keystoneKey, playerId);
}
export async function upsertSkillRank(playerId, skillKey, rank) {
    await prisma.$executeRawUnsafe('INSERT INTO "PlayerBuildSkill" (playerId, skillKey, rank, createdAt, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT(playerId, skillKey) DO UPDATE SET rank = excluded.rank, updatedAt = CURRENT_TIMESTAMP', playerId, normalizeSkillKey(skillKey), rank);
}
export async function ensureBuildSkillSchema() {
    if (!schemaReadyPromise) {
        schemaReadyPromise = (async () => {
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PlayerBuildSkill" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "playerId" INTEGER NOT NULL,
          "skillKey" TEXT NOT NULL,
          "rank" INTEGER NOT NULL DEFAULT 0,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "PlayerBuildSkill_playerId_fkey"
            FOREIGN KEY ("playerId") REFERENCES "Player" ("id")
            ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
            await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "PlayerBuildSkill_playerId_skillKey_key" ON "PlayerBuildSkill"("playerId","skillKey")');
            await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "PlayerBuildSkill_playerId_idx" ON "PlayerBuildSkill"("playerId")');
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PlayerBuildLoadout" (
          "playerId" INTEGER NOT NULL PRIMARY KEY,
          "activeSlot1" TEXT,
          "activeSlot2" TEXT,
          "activeSlot3" TEXT,
          "keystoneKey" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "PlayerBuildLoadout_playerId_fkey"
            FOREIGN KEY ("playerId") REFERENCES "Player" ("id")
            ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PlayerBuildEffect" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "playerId" INTEGER NOT NULL,
          "skillKey" TEXT NOT NULL,
          "effectType" TEXT NOT NULL,
          "sourceFamily" TEXT NOT NULL,
          "rank" INTEGER NOT NULL DEFAULT 1,
          "startsAt" DATETIME NOT NULL,
          "endsAt" DATETIME NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "PlayerBuildEffect_playerId_fkey"
            FOREIGN KEY ("playerId") REFERENCES "Player" ("id")
            ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
            await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "PlayerBuildEffect_playerId_idx" ON "PlayerBuildEffect"("playerId","endsAt")');
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PlayerBuildCooldown" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "playerId" INTEGER NOT NULL,
          "skillKey" TEXT NOT NULL,
          "readyAt" DATETIME NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "PlayerBuildCooldown_playerId_fkey"
            FOREIGN KEY ("playerId") REFERENCES "Player" ("id")
            ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
            await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "PlayerBuildCooldown_playerId_skillKey_key" ON "PlayerBuildCooldown"("playerId","skillKey")');
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "BuildTelemetryEvent" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "playerId" INTEGER,
          "eventType" TEXT NOT NULL,
          "skillKey" TEXT,
          "payloadJson" TEXT NOT NULL DEFAULT '{}',
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "BuildTelemetryEvent_createdAt_idx" ON "BuildTelemetryEvent"("createdAt")');
        })().catch((error) => {
            schemaReadyPromise = null;
            throw error;
        });
    }
    await schemaReadyPromise;
}
export async function getCooldownRows(playerId) {
    return prisma.$queryRawUnsafe('SELECT skillKey, readyAt FROM "PlayerBuildCooldown" WHERE playerId = ?', playerId);
}
export async function upsertCooldown(playerId, skillKey, readyAtMs) {
    await prisma.$executeRawUnsafe('INSERT INTO "PlayerBuildCooldown" (playerId, skillKey, readyAt, createdAt, updatedAt) VALUES (?, ?, datetime(? / 1000, \'unixepoch\'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT(playerId, skillKey) DO UPDATE SET readyAt = excluded.readyAt, updatedAt = CURRENT_TIMESTAMP', playerId, normalizeSkillKey(skillKey), readyAtMs);
}
export async function deleteSkillEffects(playerId, skillKey) {
    await prisma.$executeRawUnsafe('DELETE FROM "PlayerBuildEffect" WHERE playerId = ? AND skillKey = ?', playerId, normalizeSkillKey(skillKey));
}
export async function insertSkillEffect(params) {
    await prisma.$executeRawUnsafe('INSERT INTO "PlayerBuildEffect" (playerId, skillKey, effectType, sourceFamily, rank, startsAt, endsAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, datetime(? / 1000, \'unixepoch\'), datetime(? / 1000, \'unixepoch\'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', params.playerId, normalizeSkillKey(params.skillKey), params.effectType, params.sourceFamily, params.rank, params.startsAtMs, params.endsAtMs);
}
export async function getActiveEffectRows(playerId) {
    return prisma.$queryRawUnsafe('SELECT skillKey, effectType, sourceFamily, rank, startsAt, endsAt FROM "PlayerBuildEffect" WHERE playerId = ?', playerId);
}
export async function cleanupExpiredEffects(playerId) {
    if (typeof playerId === 'number') {
        await prisma.$executeRawUnsafe('DELETE FROM "PlayerBuildEffect" WHERE playerId = ? AND endsAt <= CURRENT_TIMESTAMP', playerId);
        return;
    }
    await prisma.$executeRawUnsafe('DELETE FROM "PlayerBuildEffect" WHERE endsAt <= CURRENT_TIMESTAMP');
}
export async function readBuildTelemetrySummary(sinceHours) {
    return prisma.$queryRawUnsafe(`SELECT eventType, skillKey, COUNT(*) as count
     FROM "BuildTelemetryEvent"
     WHERE createdAt >= datetime('now', ?)
     GROUP BY eventType, skillKey
     ORDER BY count DESC, eventType ASC`, `-${Math.max(1, sinceHours)} hours`);
}
