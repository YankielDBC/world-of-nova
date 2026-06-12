// @ts-nocheck
import { prisma } from '../lib/db.js';
import { withPrismaRetry } from '../lib/prisma-retry.js';
import { toMillis, toNumber } from './death-system-utils.js';
let deathSchemaReady = null;
export async function ensureDeathSystemSchema() {
    if (!deathSchemaReady) {
        deathSchemaReady = (async () => {
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PlayerSoulAnchor" (
          "playerId" INTEGER NOT NULL PRIMARY KEY,
          "worldMapId" INTEGER NOT NULL,
          "mapX" INTEGER NOT NULL,
          "mapY" INTEGER NOT NULL,
          "placeId" INTEGER,
          "placeLabel" TEXT NOT NULL DEFAULT '',
          "sourceSlug" TEXT NOT NULL DEFAULT '',
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "PlayerSoulAnchor_playerId_fkey"
            FOREIGN KEY ("playerId") REFERENCES "Player" ("id")
            ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PlayerCorpse" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "playerId" INTEGER NOT NULL,
          "tgId" TEXT NOT NULL,
          "worldMapId" INTEGER NOT NULL,
          "mapX" INTEGER NOT NULL,
          "mapY" INTEGER NOT NULL,
          "snapshotJson" TEXT NOT NULL DEFAULT '[]',
          "silverDropped" INTEGER NOT NULL DEFAULT 0,
          "silverRemaining" INTEGER NOT NULL DEFAULT 0,
          "graceUntil" DATETIME NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'ACTIVE',
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "recoveredAt" DATETIME,
          CONSTRAINT "PlayerCorpse_playerId_fkey"
            FOREIGN KEY ("playerId") REFERENCES "Player" ("id")
            ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PlayerDeathState" (
          "playerId" INTEGER NOT NULL PRIMARY KEY,
          "tgId" TEXT NOT NULL UNIQUE,
          "corpseId" INTEGER NOT NULL UNIQUE,
          "worldMapId" INTEGER NOT NULL,
          "deathX" INTEGER NOT NULL,
          "deathY" INTEGER NOT NULL,
          "cemeteryX" INTEGER NOT NULL,
          "cemeteryY" INTEGER NOT NULL,
          "anchorWorldMapId" INTEGER,
          "anchorX" INTEGER,
          "anchorY" INTEGER,
          "anchorLabel" TEXT NOT NULL DEFAULT '',
          "status" TEXT NOT NULL DEFAULT 'GHOST',
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "PlayerDeathState_playerId_fkey"
            FOREIGN KEY ("playerId") REFERENCES "Player" ("id")
            ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "PlayerDeathState_corpseId_fkey"
            FOREIGN KEY ("corpseId") REFERENCES "PlayerCorpse" ("id")
            ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
            await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "idx_corpse_status_coords" ON "PlayerCorpse" ("status", "worldMapId", "mapX", "mapY")');
            await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "idx_corpse_player_status" ON "PlayerCorpse" ("playerId", "status", "createdAt")');
        })().catch((error) => {
            deathSchemaReady = null;
            throw error;
        });
    }
    await deathSchemaReady;
}
export async function setSoulAnchorForPlayer(params) {
    await ensureDeathSystemSchema();
    await withPrismaRetry('death.anchor.upsert', () => prisma.$executeRawUnsafe(`INSERT INTO "PlayerSoulAnchor" (
        playerId, worldMapId, mapX, mapY, placeId, placeLabel, sourceSlug, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(playerId) DO UPDATE SET
        worldMapId = excluded.worldMapId,
        mapX = excluded.mapX,
        mapY = excluded.mapY,
        placeId = excluded.placeId,
        placeLabel = excluded.placeLabel,
        sourceSlug = excluded.sourceSlug,
        updatedAt = CURRENT_TIMESTAMP`, params.playerId, params.worldMapId, params.mapX, params.mapY, params.placeId ?? null, String(params.placeLabel || ''), String(params.sourceSlug || '')));
}
export function mapDeathStateRow(row) {
    return {
        playerId: toNumber(row.playerId),
        tgId: row.tgId,
        corpseId: toNumber(row.corpseId),
        worldMapId: toNumber(row.worldMapId),
        deathX: toNumber(row.deathX),
        deathY: toNumber(row.deathY),
        cemeteryX: toNumber(row.cemeteryX),
        cemeteryY: toNumber(row.cemeteryY),
        anchorWorldMapId: row.anchorWorldMapId == null ? null : toNumber(row.anchorWorldMapId),
        anchorX: row.anchorX == null ? null : toNumber(row.anchorX),
        anchorY: row.anchorY == null ? null : toNumber(row.anchorY),
        anchorLabel: String(row.anchorLabel || ''),
        status: 'GHOST',
        createdAt: toMillis(row.createdAt),
        updatedAt: toMillis(row.updatedAt),
    };
}
export function mapCorpseRow(row) {
    let snapshot = [];
    try {
        const parsed = JSON.parse(row.snapshotJson || '[]');
        if (Array.isArray(parsed)) {
            snapshot = parsed;
        }
    }
    catch {
        snapshot = [];
    }
    return {
        id: toNumber(row.id),
        playerId: toNumber(row.playerId),
        tgId: row.tgId,
        worldMapId: toNumber(row.worldMapId),
        mapX: toNumber(row.mapX),
        mapY: toNumber(row.mapY),
        snapshot,
        silverDropped: toNumber(row.silverDropped),
        silverRemaining: toNumber(row.silverRemaining),
        graceUntil: toMillis(row.graceUntil),
        status: row.status,
        createdAt: toMillis(row.createdAt),
        updatedAt: toMillis(row.updatedAt),
        recoveredAt: row.recoveredAt ? toMillis(row.recoveredAt) : null,
    };
}
export async function getActiveDeathStateByPlayerId(playerId) {
    await ensureDeathSystemSchema();
    const rows = await withPrismaRetry('death.state.by-player', () => prisma.$queryRawUnsafe('SELECT * FROM "PlayerDeathState" WHERE playerId = ? AND status = ? LIMIT 1', playerId, 'GHOST'));
    return rows[0] ? mapDeathStateRow(rows[0]) : null;
}
export async function getActiveDeathStateByTgId(tgId) {
    await ensureDeathSystemSchema();
    const rows = await withPrismaRetry('death.state.by-tgid', () => prisma.$queryRawUnsafe('SELECT * FROM "PlayerDeathState" WHERE tgId = ? AND status = ? LIMIT 1', tgId, 'GHOST'));
    return rows[0] ? mapDeathStateRow(rows[0]) : null;
}
export async function isPlayerGhostByTgId(tgId) {
    const state = await getActiveDeathStateByTgId(tgId);
    return !!state;
}
export async function getActiveCorpseById(corpseId) {
    await ensureDeathSystemSchema();
    const rows = await withPrismaRetry('death.corpse.by-id', () => prisma.$queryRawUnsafe('SELECT * FROM "PlayerCorpse" WHERE id = ? AND status = ? LIMIT 1', corpseId, 'ACTIVE'));
    return rows[0] ? mapCorpseRow(rows[0]) : null;
}
export async function getActiveCorpseForPlayer(playerId) {
    await ensureDeathSystemSchema();
    const rows = await withPrismaRetry('death.corpse.by-player', () => prisma.$queryRawUnsafe('SELECT * FROM "PlayerCorpse" WHERE playerId = ? AND status = ? ORDER BY createdAt DESC LIMIT 1', playerId, 'ACTIVE'));
    return rows[0] ? mapCorpseRow(rows[0]) : null;
}
