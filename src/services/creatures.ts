// @ts-nocheck
import { prisma } from '../lib/db.js';
import { compactText } from '../lib/ui-compact.js';
import { getZoneBandAtCoords } from './world-zones.js';
import { deterministicRandom } from './map-utils.js';
import { BIOME_ATTRIBUTE_BONUS, BIOME_MAX_PACK_SIZE, BIOME_PRESENCE_CHANCE, BIOME_SPECIES, CATEGORY_CONFIG, CATEGORY_ORDER, CATEGORY_PREFIX, CREATURE_CACHE_TTL_MS, RESOURCE_POOL_TTL_MS, STATUS_ALIVE, STATUS_DEAD, } from './creatures-config.js';
import { clamp, floorInt, getCreatureCategoryBadge, normalizeCategory, parseDrops, pickSeededIndex, randomIntSeeded, round1, round3, serializeDrops, tileKey, toNumber, weightedPickCategory, } from './creatures-utils.js';
let schemaReadyPromise = null;
const tileSnapshotCache = new Map();
const biomeResourceCache = new Map();
function mapRowToSnapshot(row) {
    return {
        id: floorInt(toNumber(row.id), 1),
        worldMapId: floorInt(toNumber(row.worldMapId), 1),
        x: toNumber(row.tileX),
        y: toNumber(row.tileY),
        spawnSlot: floorInt(toNumber(row.spawnSlot), 1),
        biomeName: String(row.biomeName || 'plains'),
        displayName: String(row.displayName || 'Creature'),
        category: normalizeCategory(row.category),
        level: floorInt(toNumber(row.level), 1),
        attributes: {
            str: floorInt(toNumber(row.str), 1),
            dex: floorInt(toNumber(row.dex), 1),
            intelligence: floorInt(toNumber(row.intelligence), 1),
            vit: floorInt(toNumber(row.vit), 1),
            agi: floorInt(toNumber(row.agi), 1),
            eng: floorInt(toNumber(row.eng), 1),
        },
        maxHp: floorInt(toNumber(row.maxHp), 1),
        currentHp: floorInt(toNumber(row.currentHp), 0),
        attack: round1(toNumber(row.attack)),
        arcanePower: round1(toNumber(row.arcanePower)),
        defense: round1(toNumber(row.defense)),
        critChance: round1(toNumber(row.critChance)),
        evasion: round1(toNumber(row.evasion)),
        moveSpeed: round3(toNumber(row.moveSpeed)),
        xpReward: floorInt(toNumber(row.xpReward), 1),
        silverMin: floorInt(toNumber(row.silverMin), 0),
        silverMax: floorInt(toNumber(row.silverMax), 0),
        coinDropChance: clamp(round1(toNumber(row.coinDropChance, 0)), 0, 100),
        respawnSeconds: floorInt(toNumber(row.respawnSeconds), 1),
        drops: parseDrops(String(row.dropsJson || '[]')),
        status: String(row.status || STATUS_ALIVE).toUpperCase() === STATUS_DEAD ? STATUS_DEAD : STATUS_ALIVE,
        nextRespawnAt: row.nextRespawnAt ? new Date(row.nextRespawnAt) : null,
    };
}
function computeAttributes(level, category, biomeName, seedBase) {
    const points = Math.max(6, Math.round(level * 1.8 + 8));
    const categoryBonus = category === 'boss' ? 8 : category === 'elite' ? 5 : category === 'veteran' ? 3 : 1;
    const baseline = Math.max(3, Math.floor((points + categoryBonus) / 6));
    const attrs = {
        str: baseline,
        dex: baseline,
        intelligence: baseline,
        vit: baseline,
        agi: baseline,
        eng: baseline,
    };
    const keys = ['str', 'dex', 'intelligence', 'vit', 'agi', 'eng'];
    const distributable = points + categoryBonus * 2;
    for (let i = 0; i < distributable; i += 1) {
        const key = keys[pickSeededIndex(keys.length, `${seedBase}:attr:${i}`)];
        attrs[key] += 1;
    }
    const biomeBonus = BIOME_ATTRIBUTE_BONUS[biomeName] || {};
    for (const key of keys) {
        attrs[key] += floorInt(toNumber(biomeBonus[key], 0), 0);
    }
    return attrs;
}
function computeDerivedStats(attrs, level, category) {
    const cfg = CATEGORY_CONFIG[category];
    const maxHp = floorInt((46 + attrs.vit * 7 + level * 9) * cfg.hpMultiplier, 1);
    const attack = round1((attrs.str * 1.15 + attrs.dex * 0.75 + level * 0.9) * cfg.attackMultiplier);
    const arcanePower = round1((attrs.intelligence * 1.3 + attrs.eng * 0.6 + level * 0.6) * (0.9 + (cfg.attackMultiplier - 1) * 0.7));
    const defense = round1((attrs.vit * 0.7 + attrs.str * 0.25 + level * 0.5) * cfg.defenseMultiplier);
    const critChance = clamp(round1(4 + attrs.dex * 0.55 + attrs.agi * 0.35 + (category === 'boss' ? 4 : category === 'elite' ? 2 : 0)), 1, 35);
    const evasion = clamp(round1(3 + attrs.agi * 0.62 + attrs.dex * 0.28 + (category === 'veteran' ? 1 : 0)), 1, 30);
    const moveSpeed = clamp(round3(0.045 + attrs.agi * 0.0019 + (category === 'boss' ? 0.004 : 0)), 0.04, 0.11);
    return { maxHp, attack, arcanePower, defense, critChance, evasion, moveSpeed };
}
function buildCreatureName(biomeName, category, seedBase) {
    const speciesPool = BIOME_SPECIES[biomeName] || BIOME_SPECIES.forest;
    const prefixPool = CATEGORY_PREFIX[category];
    const species = speciesPool[pickSeededIndex(speciesPool.length, `${seedBase}:species`)];
    const prefix = prefixPool[pickSeededIndex(prefixPool.length, `${seedBase}:prefix`)];
    if (category === 'boss') {
        return `${prefix} ${species}`;
    }
    return `${species} ${prefix}`;
}
async function getBiomeResourcePool(biomeId, tx) {
    if (!biomeId || biomeId < 1) {
        return [];
    }
    const now = Date.now();
    const cached = biomeResourceCache.get(biomeId);
    if (cached && cached.expiresAt > now) {
        return cached.value;
    }
    const rows = await tx.$queryRawUnsafe(`SELECT br.resourceId AS resourceId, br.spawnChance AS spawnChance, r.name AS name, r.emoji AS emoji, r.maxStack AS maxStack
     FROM "BiomeResource" br
     INNER JOIN "Resource" r ON r.id = br.resourceId
     WHERE br.biomeId = ?
     ORDER BY br.spawnChance DESC, br.id ASC
     LIMIT 24`, biomeId);
    biomeResourceCache.set(biomeId, {
        expiresAt: now + RESOURCE_POOL_TTL_MS,
        value: rows,
    });
    return rows;
}
function buildDropTable(resourcePool, category, seedBase) {
    if (resourcePool.length === 0) {
        return [];
    }
    const dropTarget = category === 'boss'
        ? 4
        : category === 'elite'
            ? 3
            : category === 'veteran'
                ? 2
                : 1;
    const maxDrops = Math.min(dropTarget + 1, 5);
    const dropCount = randomIntSeeded(1, maxDrops, `${seedBase}:drop-count`);
    const chosen = new Set();
    const drops = [];
    for (let i = 0; i < dropCount; i += 1) {
        const pickOffset = pickSeededIndex(resourcePool.length, `${seedBase}:drop-pick:${i}`);
        const row = resourcePool[(pickOffset + i) % resourcePool.length];
        const resourceId = floorInt(toNumber(row.resourceId), 1);
        if (chosen.has(resourceId)) {
            continue;
        }
        chosen.add(resourceId);
        const spawnChance = clamp(toNumber(row.spawnChance, 20), 1, 95);
        const chancePct = clamp(round1(22 + spawnChance * 0.58 + CATEGORY_CONFIG[category].dropBonus - i * 6), 8, 100);
        const stackCap = floorInt(toNumber(row.maxStack, 5), 1);
        const minQty = 1;
        const maxQty = clamp(category === 'boss'
            ? Math.min(12, stackCap)
            : category === 'elite'
                ? Math.min(8, stackCap)
                : category === 'veteran'
                    ? Math.min(6, stackCap)
                    : Math.min(4, stackCap), minQty, Math.max(minQty, stackCap));
        drops.push({
            resourceId,
            emoji: String(row.emoji || '📦'),
            name: String(row.name || 'Loot'),
            minQty,
            maxQty,
            chancePct,
        });
    }
    return drops;
}
function getPresenceChance(biomeName, zoneId) {
    const base = BIOME_PRESENCE_CHANCE[biomeName] ?? 0.6;
    if (zoneId === 'core')
        return clamp(base - 0.08, 0.08, 0.95);
    if (zoneId === 'inner')
        return clamp(base, 0.08, 0.95);
    if (zoneId === 'middle')
        return clamp(base + 0.04, 0.08, 0.95);
    if (zoneId === 'outer')
        return clamp(base + 0.08, 0.08, 0.95);
    return clamp(base + 0.12, 0.08, 0.95);
}
function getPackSize(ctx, seedBase) {
    const band = getZoneBandAtCoords(ctx.x, ctx.y);
    const maxPackByBiome = BIOME_MAX_PACK_SIZE[ctx.biomeName] ?? 2;
    const hardCap = band.id === 'core' ? 2 : band.id === 'inner' ? 3 : band.id === 'middle' ? 3 : 4;
    const maxPack = Math.max(1, Math.min(maxPackByBiome, hardCap));
    const roll = deterministicRandom(`${seedBase}:pack-roll`);
    if (maxPack <= 1)
        return 1;
    if (roll < 0.4)
        return 1;
    if (roll < 0.76)
        return Math.min(2, maxPack);
    if (roll < 0.93)
        return Math.min(3, maxPack);
    return maxPack;
}
function estimateXp(level, category, seedBase) {
    const cfg = CATEGORY_CONFIG[category];
    const factor = 0.88 + deterministicRandom(`${seedBase}:xp`) * 0.26;
    return floorInt(level * cfg.xpMultiplier * factor, 2);
}
function estimateCoinRewards(level, category, seedBase) {
    const cfg = CATEGORY_CONFIG[category];
    const chancePct = clamp(round1(cfg.coinChanceMin + deterministicRandom(`${seedBase}:coin-chance`) * (cfg.coinChanceMax - cfg.coinChanceMin)), 0, 100);
    if (chancePct < 12) {
        return { chancePct, min: 0, max: 0 };
    }
    const base = Math.max(1, Math.floor(level * (category === 'boss' ? 2.8 : category === 'elite' ? 1.7 : category === 'veteran' ? 1.2 : 0.8)));
    const min = base;
    const max = Math.max(min, Math.floor(base * (1.25 + deterministicRandom(`${seedBase}:coin-range`) * 1.6)));
    return { chancePct, min, max };
}
function estimateRespawnSeconds(category, seedBase) {
    const cfg = CATEGORY_CONFIG[category];
    return randomIntSeeded(cfg.respawnMinSeconds, cfg.respawnMaxSeconds, `${seedBase}:respawn`);
}
async function queryTileRows(tx, worldMapId, x, y) {
    const rows = await tx.$queryRawUnsafe(`SELECT * FROM "WorldCreatureSpawn"
     WHERE worldMapId = ? AND tileX = ? AND tileY = ?
     ORDER BY CASE category
       WHEN 'boss' THEN 0
       WHEN 'elite' THEN 1
       WHEN 'veteran' THEN 2
       ELSE 3
     END, level DESC, id ASC`, worldMapId, x, y);
    return rows.map(mapRowToSnapshot);
}
async function reviveRespawnedCreatures(tx, worldMapId, x, y) {
    await tx.$executeRawUnsafe(`UPDATE "WorldCreatureSpawn"
     SET status = ?, currentHp = maxHp, lastDefeatedAt = NULL, nextRespawnAt = NULL, updatedAt = CURRENT_TIMESTAMP
     WHERE worldMapId = ? AND tileX = ? AND tileY = ? AND status = ? AND nextRespawnAt IS NOT NULL AND nextRespawnAt <= CURRENT_TIMESTAMP`, STATUS_ALIVE, worldMapId, x, y, STATUS_DEAD);
}
async function insertCreatureRows(tx, context) {
    const band = getZoneBandAtCoords(context.x, context.y);
    const seedBase = `creature:${context.worldMapId}:${context.x},${context.y}`;
    const presenceChance = getPresenceChance(context.biomeName, band.id);
    const presenceRoll = deterministicRandom(`${seedBase}:presence`);
    if (presenceRoll > presenceChance) {
        return;
    }
    const packSize = getPackSize(context, seedBase);
    const resourcePool = await getBiomeResourcePool(context.biomeId, tx);
    let bossUsed = false;
    for (let slot = 1; slot <= packSize; slot += 1) {
        let category = weightedPickCategory(band.id, `${seedBase}:slot:${slot}:category`);
        if (category === 'boss' && bossUsed) {
            category = 'elite';
        }
        if (category === 'boss') {
            bossUsed = true;
        }
        const cfg = CATEGORY_CONFIG[category];
        const levelBase = randomIntSeeded(band.recommendedLevelMin, band.recommendedLevelMax, `${seedBase}:slot:${slot}:lv-base`);
        const levelBonus = randomIntSeeded(cfg.levelBonusMin, cfg.levelBonusMax, `${seedBase}:slot:${slot}:lv-bonus`);
        const level = Math.max(1, levelBase + levelBonus);
        const attrs = computeAttributes(level, category, context.biomeName, `${seedBase}:slot:${slot}`);
        const stats = computeDerivedStats(attrs, level, category);
        const displayName = buildCreatureName(context.biomeName, category, `${seedBase}:slot:${slot}`);
        const xpReward = estimateXp(level, category, `${seedBase}:slot:${slot}`);
        const coinReward = estimateCoinRewards(level, category, `${seedBase}:slot:${slot}`);
        const respawnSeconds = estimateRespawnSeconds(category, `${seedBase}:slot:${slot}`);
        const drops = buildDropTable(resourcePool, category, `${seedBase}:slot:${slot}`);
        await tx.$executeRawUnsafe(`INSERT INTO "WorldCreatureSpawn" (
        worldMapId, tileX, tileY, spawnSlot, biomeName, displayName, category, level,
        str, dex, intelligence, vit, agi, eng,
        maxHp, currentHp, attack, arcanePower, defense, critChance, evasion, moveSpeed,
        xpReward, silverMin, silverMax, coinDropChance, respawnSeconds, dropsJson,
        status, createdAt, updatedAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT(worldMapId, tileX, tileY, spawnSlot) DO NOTHING`, context.worldMapId, context.x, context.y, slot, context.biomeName, displayName, category, level, attrs.str, attrs.dex, attrs.intelligence, attrs.vit, attrs.agi, attrs.eng, stats.maxHp, stats.maxHp, stats.attack, stats.arcanePower, stats.defense, stats.critChance, stats.evasion, stats.moveSpeed, xpReward, coinReward.min, coinReward.max, coinReward.chancePct, respawnSeconds, serializeDrops(drops), STATUS_ALIVE);
    }
}
function clearTileCacheFor(worldMapId, x, y) {
    tileSnapshotCache.delete(tileKey(worldMapId, x, y));
}
export async function ensureCreatureSchema() {
    if (!schemaReadyPromise) {
        schemaReadyPromise = (async () => {
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "WorldCreatureSpawn" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "worldMapId" INTEGER NOT NULL,
          "tileX" INTEGER NOT NULL,
          "tileY" INTEGER NOT NULL,
          "spawnSlot" INTEGER NOT NULL,
          "biomeName" TEXT NOT NULL,
          "displayName" TEXT NOT NULL,
          "category" TEXT NOT NULL,
          "level" INTEGER NOT NULL,
          "str" INTEGER NOT NULL,
          "dex" INTEGER NOT NULL,
          "intelligence" INTEGER NOT NULL,
          "vit" INTEGER NOT NULL,
          "agi" INTEGER NOT NULL,
          "eng" INTEGER NOT NULL,
          "maxHp" INTEGER NOT NULL,
          "currentHp" INTEGER NOT NULL,
          "attack" REAL NOT NULL,
          "arcanePower" REAL NOT NULL,
          "defense" REAL NOT NULL,
          "critChance" REAL NOT NULL,
          "evasion" REAL NOT NULL,
          "moveSpeed" REAL NOT NULL,
          "xpReward" INTEGER NOT NULL,
          "silverMin" INTEGER NOT NULL DEFAULT 0,
          "silverMax" INTEGER NOT NULL DEFAULT 0,
          "coinDropChance" REAL NOT NULL DEFAULT 0,
          "respawnSeconds" INTEGER NOT NULL,
          "dropsJson" TEXT NOT NULL DEFAULT '[]',
          "status" TEXT NOT NULL DEFAULT 'ALIVE',
          "lastDefeatedAt" DATETIME,
          "nextRespawnAt" DATETIME,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE("worldMapId", "tileX", "tileY", "spawnSlot")
        );
      `);
            await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "idx_creature_tile" ON "WorldCreatureSpawn" ("worldMapId", "tileX", "tileY")');
            await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "idx_creature_status_respawn" ON "WorldCreatureSpawn" ("status", "nextRespawnAt")');
        })().catch((error) => {
            schemaReadyPromise = null;
            throw error;
        });
    }
    await schemaReadyPromise;
}
export async function getCreatureSnapshotsAtCoords(params) {
    await ensureCreatureSchema();
    const key = tileKey(params.worldMapId, params.x, params.y);
    const now = Date.now();
    const cached = tileSnapshotCache.get(key);
    if (cached && cached.expiresAt > now) {
        return cached.value.filter((entry) => params.includeDead || entry.status === STATUS_ALIVE);
    }
    const snapshots = await prisma.$transaction(async (tx) => {
        await reviveRespawnedCreatures(tx, params.worldMapId, params.x, params.y);
        let rows = await queryTileRows(tx, params.worldMapId, params.x, params.y);
        if (rows.length === 0) {
            await insertCreatureRows(tx, {
                worldMapId: params.worldMapId,
                x: params.x,
                y: params.y,
                biomeName: params.biomeName,
                biomeId: params.biomeId ?? null,
            });
            rows = await queryTileRows(tx, params.worldMapId, params.x, params.y);
        }
        return rows.sort((a, b) => {
            const ac = CATEGORY_ORDER.indexOf(a.category);
            const bc = CATEGORY_ORDER.indexOf(b.category);
            if (ac !== bc)
                return ac - bc;
            return b.level - a.level;
        });
    });
    tileSnapshotCache.set(key, {
        expiresAt: now + CREATURE_CACHE_TTL_MS,
        value: snapshots,
    });
    return snapshots.filter((entry) => params.includeDead || entry.status === STATUS_ALIVE);
}
export async function getCreatureSnapshotById(creatureId, opts) {
    await ensureCreatureSchema();
    const rows = await prisma.$queryRawUnsafe('SELECT * FROM "WorldCreatureSpawn" WHERE id = ? LIMIT 1', creatureId);
    const row = rows[0];
    if (!row) {
        return null;
    }
    const snapshot = mapRowToSnapshot(row);
    if (opts?.worldMapId && snapshot.worldMapId !== opts.worldMapId)
        return null;
    if (typeof opts?.x === 'number' && snapshot.x !== opts.x)
        return null;
    if (typeof opts?.y === 'number' && snapshot.y !== opts.y)
        return null;
    return snapshot;
}
export async function markCreatureDefeated(params) {
    await ensureCreatureSchema();
    const row = await getCreatureSnapshotById(params.creatureId);
    if (!row) {
        return null;
    }
    if (row.status !== STATUS_ALIVE) {
        return null;
    }
    const now = Date.now();
    const nextRespawnAt = new Date(now + row.respawnSeconds * 1000);
    const updated = await prisma.$executeRawUnsafe(`UPDATE "WorldCreatureSpawn"
     SET status = ?, currentHp = 0, lastDefeatedAt = CURRENT_TIMESTAMP, nextRespawnAt = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ? AND status = ?`, STATUS_DEAD, nextRespawnAt.toISOString(), params.creatureId, STATUS_ALIVE);
    if (toNumber(updated, 0) < 1) {
        return null;
    }
    clearTileCacheFor(row.worldMapId, row.x, row.y);
    return getCreatureSnapshotById(params.creatureId);
}
export function formatCreatureRespawnLabel(seconds, lang) {
    const total = Math.max(1, Math.floor(seconds));
    const m = Math.floor(total / 60);
    const s = total % 60;
    if (lang === 'en') {
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    }
    if (lang === 'ru') {
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    }
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
function formatMoneyDropLine(snapshot, lang) {
    if (snapshot.silverMax <= 0 || snapshot.coinDropChance <= 0) {
        return lang === 'en'
            ? 'No guaranteed coins.'
            : lang === 'ru'
                ? 'Monety ne garantirovany.'
                : 'Sin monedas garantizadas.';
    }
    if (snapshot.coinDropChance >= 99.9) {
        return lang === 'en'
            ? `${snapshot.silverMin}-${snapshot.silverMax} silver guaranteed`
            : lang === 'ru'
                ? `${snapshot.silverMin}-${snapshot.silverMax} serebra garantirovano`
                : `${snapshot.silverMin}-${snapshot.silverMax} de plata garantizadas`;
    }
    return lang === 'en'
        ? `${snapshot.silverMin}-${snapshot.silverMax} silver (${snapshot.coinDropChance}% chance)`
        : lang === 'ru'
            ? `${snapshot.silverMin}-${snapshot.silverMax} serebra (${snapshot.coinDropChance}% shans)`
            : `${snapshot.silverMin}-${snapshot.silverMax} de plata (${snapshot.coinDropChance}% prob.)`;
}
export function buildCreatureInfoCard(snapshot, lang) {
    const categoryBadge = getCreatureCategoryBadge(snapshot.category, lang);
    const biomeLabel = snapshot.biomeName.charAt(0).toUpperCase() + snapshot.biomeName.slice(1);
    const lines = [
        `👾 ${snapshot.displayName}`,
        '✧═══••═══✧',
        `┌ ${categoryBadge}  ·  Lv ${snapshot.level}`,
        `└ 🌍 ${biomeLabel} (${snapshot.x}, ${snapshot.y})`,
        '',
        lang === 'en' ? '📊 Attributes' : lang === 'ru' ? '📊 Atributy' : '📊 Atributos',
        `┌ 💪 STR ${snapshot.attributes.str}   🌀 DEX ${snapshot.attributes.dex}`,
        `├ 🔮 INT ${snapshot.attributes.intelligence}   💚 VIT ${snapshot.attributes.vit}`,
        `└ ⚡ ENG ${snapshot.attributes.eng}   🦶 AGI ${snapshot.attributes.agi}`,
        '',
        lang === 'en' ? '📊 Combat' : lang === 'ru' ? '📊 Boy' : '📊 Combate',
        `┌ ❤️ HP ${snapshot.currentHp}/${snapshot.maxHp}`,
        `├ 🤺 ATK ${snapshot.attack}   🛡 DEF ${snapshot.defense}`,
        `├ 🔮 ARC ${snapshot.arcanePower}   💢 CRIT ${snapshot.critChance}%`,
        `└ 🤸 EVA ${snapshot.evasion}%   🚶 ${snapshot.moveSpeed} t/s`,
        '',
        `🏆 XP: +${snapshot.xpReward}`,
        `🪙 ${lang === 'en' ? 'Coins' : lang === 'ru' ? 'Monety' : 'Monedas'}: ${formatMoneyDropLine(snapshot, lang)}`,
        `⏱️ ${lang === 'en' ? 'Respawn' : lang === 'ru' ? 'Respavn' : 'Respawn'}: ${formatCreatureRespawnLabel(snapshot.respawnSeconds, lang)}`,
    ];
    if (snapshot.drops.length === 0) {
        lines.push('');
        lines.push(lang === 'en' ? '🎁 Drop table: none' : lang === 'ru' ? '🎁 Luty: net' : '🎁 Tabla de drops: vacia');
        return lines.join('\n');
    }
    lines.push('');
    lines.push(lang === 'en' ? '🎁 Drop table' : lang === 'ru' ? '🎁 Tablitsa lut' : '🎁 Tabla de drops');
    snapshot.drops.slice(0, 6).forEach((drop, idx) => {
        const marker = idx === 0 ? '┌' : idx === snapshot.drops.length - 1 || idx === 5 ? '└' : '├';
        lines.push(`${marker} ${drop.emoji} ${compactText(drop.name, 18)} x${drop.minQty}-${drop.maxQty} (${drop.chancePct}%)`);
    });
    if (snapshot.drops.length > 6) {
        lines.push(`└ +${snapshot.drops.length - 6} ...`);
    }
    return lines.join('\n');
}
