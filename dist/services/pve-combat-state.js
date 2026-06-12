import { prisma } from '../lib/db.js';
import { safeJsonParse, toNumber } from './pve-combat-utils.js';
let schemaReadyPromise = null;
export function getPlayerFieldsForCombat() {
    return {
        id: true,
        tgId: true,
        nickname: true,
        language: true,
        race: true,
        class: true,
        level: true,
        hp: true,
        maxHp: true,
        energy: true,
        maxEnergy: true,
        mapX: true,
        mapY: true,
        str: true,
        dex: true,
        intelligence: true,
        vit: true,
        agi: true,
        eng: true,
        baseDamage: true,
        critChance: true,
        evasion: true,
        atkSpeed: true,
        defense: true,
        moveSpeed: true,
        resistPhysical: true,
        resistElemental: true,
        resistArcane: true,
        resistHoly: true,
        resistChemical: true,
    };
}
export function serializeState(state) {
    return {
        playerId: state.playerId,
        creatureId: state.creatureId,
        worldMapId: state.worldMapId,
        x: state.x,
        y: state.y,
        creatureJson: JSON.stringify(state.creature),
        creatureCurrentHp: Math.max(0, Math.floor(state.creatureCurrentHp)),
        turnNumber: Math.max(1, Math.floor(state.turnNumber)),
        enemyIntentJson: JSON.stringify(state.enemyIntent),
        playerEffectsJson: JSON.stringify(state.playerEffects),
        enemyEffectsJson: JSON.stringify(state.enemyEffects),
        cooldownsJson: JSON.stringify(state.cooldowns),
        logJson: JSON.stringify(state.log),
    };
}
export function mapEncounterRow(row) {
    return {
        playerId: toNumber(row.playerId),
        creatureId: toNumber(row.creatureId),
        worldMapId: toNumber(row.worldMapId),
        x: toNumber(row.tileX),
        y: toNumber(row.tileY),
        creature: safeJsonParse(row.creatureJson, {}),
        creatureCurrentHp: toNumber(row.creatureCurrentHp, 1),
        turnNumber: toNumber(row.turnNumber, 1),
        enemyIntent: safeJsonParse(row.enemyIntentJson, {
            key: 'strike',
            label: 'Ataque estable',
            hint: 'Golpe directo.',
        }),
        playerEffects: safeJsonParse(row.playerEffectsJson, []),
        enemyEffects: safeJsonParse(row.enemyEffectsJson, []),
        cooldowns: safeJsonParse(row.cooldownsJson, {}),
        log: safeJsonParse(row.logJson, []),
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
    };
}
export async function readEncounterByPlayerId(playerId) {
    const rows = await prisma.$queryRawUnsafe('SELECT * FROM "PlayerPveEncounter" WHERE playerId = ? LIMIT 1', playerId);
    const row = rows[0];
    return row ? mapEncounterRow(row) : null;
}
export async function deleteEncounter(playerId) {
    await prisma.$executeRawUnsafe('DELETE FROM "PlayerPveEncounter" WHERE playerId = ?', playerId);
}
export async function writeEncounter(state) {
    const serialized = serializeState(state);
    await prisma.$executeRawUnsafe(`INSERT INTO "PlayerPveEncounter" (
      playerId, creatureId, worldMapId, tileX, tileY, creatureJson, creatureCurrentHp,
      turnNumber, enemyIntentJson, playerEffectsJson, enemyEffectsJson, cooldownsJson, logJson,
      createdAt, updatedAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    ON CONFLICT(playerId) DO UPDATE SET
      creatureId = excluded.creatureId,
      worldMapId = excluded.worldMapId,
      tileX = excluded.tileX,
      tileY = excluded.tileY,
      creatureJson = excluded.creatureJson,
      creatureCurrentHp = excluded.creatureCurrentHp,
      turnNumber = excluded.turnNumber,
      enemyIntentJson = excluded.enemyIntentJson,
      playerEffectsJson = excluded.playerEffectsJson,
      enemyEffectsJson = excluded.enemyEffectsJson,
      cooldownsJson = excluded.cooldownsJson,
      logJson = excluded.logJson,
      updatedAt = CURRENT_TIMESTAMP`, serialized.playerId, serialized.creatureId, serialized.worldMapId, serialized.x, serialized.y, serialized.creatureJson, serialized.creatureCurrentHp, serialized.turnNumber, serialized.enemyIntentJson, serialized.playerEffectsJson, serialized.enemyEffectsJson, serialized.cooldownsJson, serialized.logJson);
}
export async function ensurePveCombatSchema() {
    if (!schemaReadyPromise) {
        schemaReadyPromise = (async () => {
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PlayerPveEncounter" (
          "playerId" INTEGER NOT NULL PRIMARY KEY,
          "creatureId" INTEGER NOT NULL UNIQUE,
          "worldMapId" INTEGER NOT NULL,
          "tileX" INTEGER NOT NULL,
          "tileY" INTEGER NOT NULL,
          "creatureJson" TEXT NOT NULL,
          "creatureCurrentHp" INTEGER NOT NULL,
          "turnNumber" INTEGER NOT NULL DEFAULT 1,
          "enemyIntentJson" TEXT NOT NULL,
          "playerEffectsJson" TEXT NOT NULL DEFAULT '[]',
          "enemyEffectsJson" TEXT NOT NULL DEFAULT '[]',
          "cooldownsJson" TEXT NOT NULL DEFAULT '{}',
          "logJson" TEXT NOT NULL DEFAULT '[]',
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "PlayerPveEncounter_playerId_fkey"
            FOREIGN KEY ("playerId") REFERENCES "Player" ("id")
            ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
            await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "idx_pve_encounter_creature" ON "PlayerPveEncounter" ("creatureId")');
            await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "idx_pve_encounter_tile" ON "PlayerPveEncounter" ("worldMapId", "tileX", "tileY")');
        })().catch((error) => {
            schemaReadyPromise = null;
            throw error;
        });
    }
    await schemaReadyPromise;
}
export async function getEncounterHolderByCreatureId(creatureId) {
    const rows = await prisma.$queryRawUnsafe('SELECT playerId FROM "PlayerPveEncounter" WHERE creatureId = ? LIMIT 1', creatureId);
    return rows[0] ? toNumber(rows[0].playerId) : null;
}
