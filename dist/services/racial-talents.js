import { prisma } from '../lib/db.js';
import { getRacialPointsForLevel, getRacialTalentByKey, getRacialTalentsForRace, normalizeRace, } from '../data/racial-talents.js';
let racialTalentSchemaReady = null;
function toNumber(value, fallback = 0) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'bigint') {
        return Number(value);
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}
function getSpentPointsFromRanks(ranksByKey) {
    let spent = 0;
    for (const [talentKey, rank] of Object.entries(ranksByKey)) {
        const talent = getRacialTalentByKey(talentKey);
        if (!talent) {
            continue;
        }
        spent += Math.max(0, rank) * talent.costPerRank;
    }
    return spent;
}
function assertRaceOrThrow(raceRaw) {
    const race = normalizeRace(raceRaw);
    if (!race) {
        throw new Error('Race is not selected for this player.');
    }
    return race;
}
function rankMapFromRows(rows) {
    const map = {};
    for (const row of rows) {
        const key = String(row.talentKey || '').trim().toLowerCase();
        if (!key)
            continue;
        map[key] = Math.max(0, Math.floor(toNumber(row.rank)));
    }
    return map;
}
async function queryTalentRows(playerId) {
    return prisma.$queryRawUnsafe('SELECT talentKey, rank FROM "PlayerRacialTalent" WHERE playerId = ? AND rank > 0', playerId);
}
async function ensureLoadoutRow(playerId) {
    await prisma.$executeRawUnsafe('INSERT INTO "PlayerRacialLoadout" (playerId, activeSlot1, activeSlot2, keystoneKey, createdAt, updatedAt) VALUES (?, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT(playerId) DO NOTHING', playerId);
}
async function queryLoadoutRow(playerId) {
    await ensureLoadoutRow(playerId);
    const rows = await prisma.$queryRawUnsafe('SELECT activeSlot1, activeSlot2, keystoneKey FROM "PlayerRacialLoadout" WHERE playerId = ? LIMIT 1', playerId);
    const row = rows[0];
    return {
        activeSlot1: row?.activeSlot1 || null,
        activeSlot2: row?.activeSlot2 || null,
        keystoneKey: row?.keystoneKey || null,
    };
}
async function updateLoadout(playerId, next) {
    await ensureLoadoutRow(playerId);
    await prisma.$executeRawUnsafe('UPDATE "PlayerRacialLoadout" SET activeSlot1 = ?, activeSlot2 = ?, keystoneKey = ?, updatedAt = CURRENT_TIMESTAMP WHERE playerId = ?', next.activeSlot1, next.activeSlot2, next.keystoneKey, playerId);
}
async function upsertTalentRank(playerId, talentKey, rank) {
    await prisma.$executeRawUnsafe('INSERT INTO "PlayerRacialTalent" (playerId, talentKey, rank, createdAt, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT(playerId, talentKey) DO UPDATE SET rank = excluded.rank, updatedAt = CURRENT_TIMESTAMP', playerId, talentKey, rank);
}
async function clearAllTalentRanks(playerId) {
    await prisma.$executeRawUnsafe('DELETE FROM "PlayerRacialTalent" WHERE playerId = ?', playerId);
}
export async function ensureRacialTalentSchema() {
    if (!racialTalentSchemaReady) {
        racialTalentSchemaReady = (async () => {
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PlayerRacialTalent" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "playerId" INTEGER NOT NULL,
          "talentKey" TEXT NOT NULL,
          "rank" INTEGER NOT NULL DEFAULT 0,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "PlayerRacialTalent_playerId_fkey"
            FOREIGN KEY ("playerId") REFERENCES "Player" ("id")
            ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
            await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "PlayerRacialTalent_playerId_talentKey_key" ON "PlayerRacialTalent"("playerId","talentKey")');
            await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "PlayerRacialTalent_playerId_idx" ON "PlayerRacialTalent"("playerId")');
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PlayerRacialLoadout" (
          "playerId" INTEGER NOT NULL PRIMARY KEY,
          "activeSlot1" TEXT,
          "activeSlot2" TEXT,
          "keystoneKey" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "PlayerRacialLoadout_playerId_fkey"
            FOREIGN KEY ("playerId") REFERENCES "Player" ("id")
            ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
        })().catch((error) => {
            racialTalentSchemaReady = null;
            throw error;
        });
    }
    await racialTalentSchemaReady;
}
export async function getPlayerRacialTalentState(playerId) {
    await ensureRacialTalentSchema();
    const player = await prisma.player.findUnique({
        where: { id: playerId },
        select: { id: true, race: true, level: true, silver: true },
    });
    if (!player)
        return null;
    const race = assertRaceOrThrow(player.race);
    const [rows, loadout] = await Promise.all([queryTalentRows(playerId), queryLoadoutRow(playerId)]);
    const ranksByKey = rankMapFromRows(rows);
    const totalPoints = getRacialPointsForLevel(player.level);
    const spentPoints = getSpentPointsFromRanks(ranksByKey);
    const freePoints = Math.max(0, totalPoints - spentPoints);
    return {
        playerId,
        race,
        level: player.level,
        silver: player.silver,
        talents: getRacialTalentsForRace(race),
        ranksByKey,
        loadout,
        totalPoints,
        spentPoints,
        freePoints,
    };
}
export async function learnRacialTalentRank(playerId, talentKeyRaw) {
    await ensureRacialTalentSchema();
    const talentKey = String(talentKeyRaw || '').trim().toLowerCase();
    const talent = getRacialTalentByKey(talentKey);
    if (!talent) {
        return { success: false, message: 'Talento no encontrado.' };
    }
    const state = await getPlayerRacialTalentState(playerId);
    if (!state) {
        return { success: false, message: 'Jugador no encontrado.' };
    }
    if (talent.race !== state.race) {
        return { success: false, message: 'Ese talento no pertenece a tu raza.' };
    }
    const currentRank = state.ranksByKey[talentKey] || 0;
    if (currentRank >= talent.maxRank) {
        return { success: false, message: 'Ese talento ya está al máximo.' };
    }
    if (talent.prerequisites && talent.prerequisites.length > 0) {
        for (const requiredKey of talent.prerequisites) {
            const requiredRank = state.ranksByKey[requiredKey] || 0;
            if (requiredRank < 1) {
                const requiredTalent = getRacialTalentByKey(requiredKey);
                return {
                    success: false,
                    message: `Requiere ${requiredTalent?.name.es || requiredKey} primero.`,
                };
            }
        }
    }
    const nextCost = talent.costPerRank;
    if (state.freePoints < nextCost) {
        return { success: false, message: 'No tienes puntos raciales suficientes.' };
    }
    await upsertTalentRank(playerId, talent.key, currentRank + 1);
    const nextState = await getPlayerRacialTalentState(playerId);
    return {
        success: true,
        message: `Aprendiste ${talent.name.es} (${currentRank + 1}/${talent.maxRank}).`,
        state: nextState || undefined,
    };
}
export async function equipRacialTalent(playerId, talentKeyRaw, slot) {
    await ensureRacialTalentSchema();
    const talentKey = String(talentKeyRaw || '').trim().toLowerCase();
    const talent = getRacialTalentByKey(talentKey);
    if (!talent) {
        return { success: false, message: 'Talento no encontrado.' };
    }
    const state = await getPlayerRacialTalentState(playerId);
    if (!state) {
        return { success: false, message: 'Jugador no encontrado.' };
    }
    if (talent.race !== state.race) {
        return { success: false, message: 'Ese talento no pertenece a tu raza.' };
    }
    const learnedRank = state.ranksByKey[talent.key] || 0;
    if (learnedRank < 1) {
        return { success: false, message: 'Primero debes aprender ese talento.' };
    }
    if (slot === 'keystone' && talent.type !== 'keystone') {
        return { success: false, message: 'Solo un keystone puede ir en ese slot.' };
    }
    if ((slot === 'active1' || slot === 'active2') && talent.type !== 'active') {
        return { success: false, message: 'Solo un talento activo puede ir en ese slot.' };
    }
    const next = { ...state.loadout };
    if (slot === 'active1') {
        next.activeSlot1 = talent.key;
        if (next.activeSlot2 === talent.key) {
            next.activeSlot2 = null;
        }
    }
    else if (slot === 'active2') {
        next.activeSlot2 = talent.key;
        if (next.activeSlot1 === talent.key) {
            next.activeSlot1 = null;
        }
    }
    else {
        next.keystoneKey = talent.key;
    }
    await updateLoadout(playerId, next);
    const nextState = await getPlayerRacialTalentState(playerId);
    return {
        success: true,
        message: slot === 'keystone'
            ? `Keystone equipada: ${talent.name.es}.`
            : `Activa equipada: ${talent.name.es}.`,
        state: nextState || undefined,
    };
}
export async function unequipRacialTalent(playerId, slot) {
    await ensureRacialTalentSchema();
    const state = await getPlayerRacialTalentState(playerId);
    if (!state) {
        return { success: false, message: 'Jugador no encontrado.' };
    }
    const next = { ...state.loadout };
    if (slot === 'active1')
        next.activeSlot1 = null;
    if (slot === 'active2')
        next.activeSlot2 = null;
    if (slot === 'keystone')
        next.keystoneKey = null;
    await updateLoadout(playerId, next);
    const nextState = await getPlayerRacialTalentState(playerId);
    return {
        success: true,
        message: 'Slot liberado.',
        state: nextState || undefined,
    };
}
export function getRacialResetCost(spentPoints) {
    const safeSpent = Math.max(0, Math.floor(spentPoints));
    if (safeSpent <= 0) {
        return 0;
    }
    return 25 + safeSpent * 5;
}
export async function resetRacialTalents(playerId) {
    await ensureRacialTalentSchema();
    const state = await getPlayerRacialTalentState(playerId);
    if (!state) {
        return { success: false, message: 'Jugador no encontrado.' };
    }
    const resetCost = getRacialResetCost(state.spentPoints);
    if (state.spentPoints <= 0) {
        return {
            success: false,
            message: 'No tienes puntos raciales gastados para resetear.',
            state,
        };
    }
    if (state.silver < resetCost) {
        return {
            success: false,
            message: `No tienes plata suficiente. Necesitas ${resetCost} 🪙.`,
        };
    }
    await prisma.$transaction(async (tx) => {
        await tx.player.update({
            where: { id: playerId },
            data: {
                silver: { decrement: resetCost },
                lastActiveAt: new Date(),
                isActive: true,
            },
        });
        await tx.$executeRawUnsafe('DELETE FROM "PlayerRacialTalent" WHERE playerId = ?', playerId);
        await tx.$executeRawUnsafe('INSERT INTO "PlayerRacialLoadout" (playerId, activeSlot1, activeSlot2, keystoneKey, createdAt, updatedAt) VALUES (?, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT(playerId) DO UPDATE SET activeSlot1 = NULL, activeSlot2 = NULL, keystoneKey = NULL, updatedAt = CURRENT_TIMESTAMP', playerId);
    });
    const nextState = await getPlayerRacialTalentState(playerId);
    return {
        success: true,
        message: `Talentos raciales reiniciados. Costo: ${resetCost} 🪙.`,
        state: nextState || undefined,
    };
}
export function getTalentsByCategory(state, category) {
    return state.talents.filter((talent) => talent.category === category);
}
export function canLearnTalent(state, talent) {
    if (talent.race !== state.race) {
        return { ok: false, reason: 'No pertenece a tu raza.' };
    }
    const currentRank = state.ranksByKey[talent.key] || 0;
    if (currentRank >= talent.maxRank) {
        return { ok: false, reason: 'Ya está al máximo.' };
    }
    if (talent.prerequisites && talent.prerequisites.length > 0) {
        for (const requiredKey of talent.prerequisites) {
            if ((state.ranksByKey[requiredKey] || 0) < 1) {
                const required = getRacialTalentByKey(requiredKey);
                return { ok: false, reason: `Requiere ${required?.name.es || requiredKey}.` };
            }
        }
    }
    if (state.freePoints < talent.costPerRank) {
        return { ok: false, reason: 'No hay puntos libres.' };
    }
    return { ok: true };
}
