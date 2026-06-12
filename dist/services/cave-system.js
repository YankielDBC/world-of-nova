// @ts-nocheck
import { InlineKeyboard } from 'grammy';
import { prisma, getPlayerByTelegramId } from '../lib/db.js';
import { observePerf } from '../lib/perf-metrics.js';
import { t } from '../lib/i18n.js';
import { EMOJIS } from '../data/emojis.js';
import { getZoneBandAtCoords } from './world-zones.js';
const CAVE_VIEW_HALF_WIDTH = 5;
const CAVE_VIEW_HALF_HEIGHT = 8;
const CAVE_REVEAL_RADIUS = 3;
const CAVE_STEP_STA_COST = 1;
const WALL_CELL = 'wall';
const PATH_CELL = 'path';
const CAVE_WALL_TILE = '⬛';
const CAVE_PATH_TILE = '⬜';
let caveSchemaReady = null;
function t3(lang, es, en, ru) {
    if (lang === 'en')
        return en;
    if (lang === 'ru')
        return ru;
    return es;
}
function coordKey(x, y) {
    return `${x},${y}`;
}
function parseExploredJson(rawJson) {
    if (!rawJson) {
        return new Set();
    }
    try {
        const parsed = JSON.parse(rawJson);
        if (!Array.isArray(parsed)) {
            return new Set();
        }
        return new Set(parsed.map((value) => String(value || '')).filter(Boolean));
    }
    catch {
        return new Set();
    }
}
function serializeExploredJson(explored) {
    return JSON.stringify(Array.from(explored).sort());
}
async function ensureCaveSchema() {
    if (!caveSchemaReady) {
        caveSchemaReady = (async () => {
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "CaveInstance" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "placeId" INTEGER NOT NULL,
          "width" INTEGER NOT NULL,
          "height" INTEGER NOT NULL,
          "startX" INTEGER NOT NULL,
          "startY" INTEGER NOT NULL,
          "walkableCount" INTEGER NOT NULL DEFAULT 0,
          "layoutJson" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "CaveInstance_placeId_fkey"
            FOREIGN KEY ("placeId") REFERENCES "Place" ("id")
            ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
            await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "CaveInstance_placeId_key"
        ON "CaveInstance"("placeId")
      `);
            await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "CaveInstance_placeId_idx"
        ON "CaveInstance"("placeId")
      `);
            await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PlayerCaveState" (
          "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          "playerId" INTEGER NOT NULL,
          "caveInstanceId" INTEGER NOT NULL,
          "isInside" BOOLEAN NOT NULL DEFAULT false,
          "posX" INTEGER NOT NULL DEFAULT 0,
          "posY" INTEGER NOT NULL DEFAULT 0,
          "exploredJson" TEXT NOT NULL DEFAULT '[]',
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "PlayerCaveState_playerId_fkey"
            FOREIGN KEY ("playerId") REFERENCES "Player" ("id")
            ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "PlayerCaveState_caveInstanceId_fkey"
            FOREIGN KEY ("caveInstanceId") REFERENCES "CaveInstance" ("id")
            ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
            await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "PlayerCaveState_playerId_caveInstanceId_key"
        ON "PlayerCaveState"("playerId", "caveInstanceId")
      `);
            await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "PlayerCaveState_playerId_isInside_idx"
        ON "PlayerCaveState"("playerId", "isInside")
      `);
            await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "PlayerCaveState_caveInstanceId_idx"
        ON "PlayerCaveState"("caveInstanceId")
      `);
        })().catch((error) => {
            caveSchemaReady = null;
            throw error;
        });
    }
    await caveSchemaReady;
}
function hashSeed(input) {
    let hash = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}
function createRng(seed) {
    let state = hashSeed(seed) || 1;
    return () => {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        return ((state >>> 0) % 1000000) / 1000000;
    };
}
function shuffleInPlace(items, rng) {
    for (let index = items.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(rng() * (index + 1));
        const current = items[index];
        items[index] = items[swapIndex];
        items[swapIndex] = current;
    }
    return items;
}
function getCaveCell(layout, x, y) {
    if (x < 0 || y < 0 || x >= layout.width || y >= layout.height) {
        return WALL_CELL;
    }
    return layout.rows[y]?.[x] === '.' ? PATH_CELL : WALL_CELL;
}
function revealAround(layout, posX, posY, explored) {
    for (let dy = -CAVE_REVEAL_RADIUS; dy <= CAVE_REVEAL_RADIUS; dy += 1) {
        for (let dx = -CAVE_REVEAL_RADIUS; dx <= CAVE_REVEAL_RADIUS; dx += 1) {
            const tx = posX + dx;
            const ty = posY + dy;
            const chebyshev = Math.max(Math.abs(dx), Math.abs(dy));
            if (chebyshev > CAVE_REVEAL_RADIUS) {
                continue;
            }
            if (getCaveCell(layout, tx, ty) !== PATH_CELL) {
                continue;
            }
            explored.add(coordKey(tx, ty));
        }
    }
}
function getBandCellSize(placeX, placeY, rng) {
    const band = getZoneBandAtCoords(placeX, placeY);
    if (band.id === 'inner') {
        return {
            cellsWide: 18 + Math.floor(rng() * 5),
            cellsHigh: 16 + Math.floor(rng() * 4),
        };
    }
    if (band.id === 'middle') {
        return {
            cellsWide: 22 + Math.floor(rng() * 6),
            cellsHigh: 18 + Math.floor(rng() * 5),
        };
    }
    if (band.id === 'outer') {
        return {
            cellsWide: 28 + Math.floor(rng() * 7),
            cellsHigh: 22 + Math.floor(rng() * 6),
        };
    }
    if (band.id === 'frontier') {
        return {
            cellsWide: 34 + Math.floor(rng() * 10),
            cellsHigh: 26 + Math.floor(rng() * 8),
        };
    }
    return {
        cellsWide: 16 + Math.floor(rng() * 4),
        cellsHigh: 14 + Math.floor(rng() * 3),
    };
}
function buildDeterministicCaveLayout(place) {
    const baseX = place.coordX ?? 0;
    const baseY = place.coordY ?? 0;
    const rng = createRng(`cave-layout:${place.id}:${place.slug}:${baseX}:${baseY}`);
    const { cellsWide, cellsHigh } = getBandCellSize(baseX, baseY, rng);
    const width = cellsWide * 2 + 1;
    const height = cellsHigh * 2 + 1;
    const rows = Array.from({ length: height }, () => Array.from({ length: width }, () => '#'));
    const visited = new Set();
    const startCellY = Math.floor(rng() * cellsHigh);
    const stack = [{ x: 0, y: startCellY }];
    function carveCell(cellX, cellY) {
        rows[cellY * 2 + 1][cellX * 2 + 1] = '.';
    }
    carveCell(0, startCellY);
    visited.add(coordKey(0, startCellY));
    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const directions = shuffleInPlace([
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 },
        ], rng);
        let advanced = false;
        for (const direction of directions) {
            const nextX = current.x + direction.dx;
            const nextY = current.y + direction.dy;
            if (nextX < 0 || nextY < 0 || nextX >= cellsWide || nextY >= cellsHigh) {
                continue;
            }
            const nextKey = coordKey(nextX, nextY);
            if (visited.has(nextKey)) {
                continue;
            }
            const fromGridX = current.x * 2 + 1;
            const fromGridY = current.y * 2 + 1;
            const toGridX = nextX * 2 + 1;
            const toGridY = nextY * 2 + 1;
            rows[toGridY][toGridX] = '.';
            rows[(fromGridY + toGridY) / 2][((fromGridX + toGridX) / 2)] = '.';
            visited.add(nextKey);
            stack.push({ x: nextX, y: nextY });
            advanced = true;
            break;
        }
        if (!advanced) {
            stack.pop();
        }
    }
    const extraLoops = Math.max(8, Math.floor(cellsWide * cellsHigh * 0.035));
    for (let index = 0; index < extraLoops; index += 1) {
        const wallX = 2 + Math.floor(rng() * Math.max(1, width - 4));
        const wallY = 2 + Math.floor(rng() * Math.max(1, height - 4));
        if (rows[wallY]?.[wallX] !== '#') {
            continue;
        }
        const horizontalNeighbors = rows[wallY]?.[wallX - 1] === '.' && rows[wallY]?.[wallX + 1] === '.';
        const verticalNeighbors = rows[wallY - 1]?.[wallX] === '.' && rows[wallY + 1]?.[wallX] === '.';
        if (!horizontalNeighbors && !verticalNeighbors) {
            continue;
        }
        rows[wallY][wallX] = '.';
    }
    const startX = 1;
    const startY = startCellY * 2 + 1;
    let walkableCount = 0;
    for (const row of rows) {
        for (const cell of row) {
            if (cell === '.') {
                walkableCount += 1;
            }
        }
    }
    return {
        width,
        height,
        startX,
        startY,
        walkableCount,
        rows: rows.map((row) => row.join('')),
    };
}
function parseCaveLayout(rawJson) {
    const parsed = JSON.parse(rawJson);
    return {
        width: Math.max(1, Number(parsed.width) || 1),
        height: Math.max(1, Number(parsed.height) || 1),
        startX: Math.max(0, Number(parsed.startX) || 0),
        startY: Math.max(0, Number(parsed.startY) || 0),
        walkableCount: Math.max(0, Number(parsed.walkableCount) || 0),
        rows: Array.isArray(parsed.rows) ? parsed.rows.map((row) => String(row || '')) : [],
    };
}
async function ensureCaveInstanceForPlace(placeId) {
    await ensureCaveSchema();
    const existing = await prisma.caveInstance.findUnique({
        where: { placeId },
        include: {
            place: true,
        },
    });
    if (existing) {
        return {
            instance: existing,
            layout: parseCaveLayout(existing.layoutJson),
        };
    }
    const place = await prisma.place.findUnique({
        where: { id: placeId },
    });
    if (!place) {
        throw new Error(`Cave place ${placeId} not found.`);
    }
    const layout = buildDeterministicCaveLayout(place);
    try {
        const created = await prisma.caveInstance.create({
            data: {
                placeId,
                width: layout.width,
                height: layout.height,
                startX: layout.startX,
                startY: layout.startY,
                walkableCount: layout.walkableCount,
                layoutJson: JSON.stringify(layout),
            },
            include: {
                place: true,
            },
        });
        return {
            instance: created,
            layout,
        };
    }
    catch {
        const raced = await prisma.caveInstance.findUnique({
            where: { placeId },
            include: {
                place: true,
            },
        });
        if (!raced) {
            throw new Error(`Could not create cave instance for place ${placeId}.`);
        }
        return {
            instance: raced,
            layout: parseCaveLayout(raced.layoutJson),
        };
    }
}
async function getActiveCaveContextByPlayerId(playerId) {
    await ensureCaveSchema();
    const row = await prisma.playerCaveState.findFirst({
        where: {
            playerId,
            isInside: true,
        },
        include: {
            player: {
                select: {
                    id: true,
                    tgId: true,
                    language: true,
                    energy: true,
                    maxEnergy: true,
                },
            },
            caveInstance: {
                include: {
                    place: true,
                },
            },
        },
    });
    if (!row) {
        return null;
    }
    return {
        player: row.player,
        place: row.caveInstance.place,
        caveInstanceId: row.caveInstanceId,
        posX: row.posX,
        posY: row.posY,
        exploredJson: row.exploredJson,
        layout: parseCaveLayout(row.caveInstance.layoutJson),
    };
}
export async function getActiveCaveContextByTgId(tgId) {
    const player = await getPlayerByTelegramId(tgId);
    if (!player) {
        return null;
    }
    return getActiveCaveContextByPlayerId(player.id);
}
export async function enterCaveForPlayer(params) {
    const startedAt = Date.now();
    try {
        const { instance, layout } = await ensureCaveInstanceForPlace(params.placeId);
        await prisma.$transaction(async (tx) => {
            await tx.playerCaveState.updateMany({
                where: { playerId: params.playerId, isInside: true },
                data: { isInside: false },
            });
            const current = await tx.playerCaveState.findUnique({
                where: {
                    playerId_caveInstanceId: {
                        playerId: params.playerId,
                        caveInstanceId: instance.id,
                    },
                },
            });
            const mergedExplored = current
                ? parseExploredJson(current.exploredJson)
                : new Set();
            revealAround(layout, layout.startX, layout.startY, mergedExplored);
            await tx.playerCaveState.upsert({
                where: {
                    playerId_caveInstanceId: {
                        playerId: params.playerId,
                        caveInstanceId: instance.id,
                    },
                },
                create: {
                    playerId: params.playerId,
                    caveInstanceId: instance.id,
                    isInside: true,
                    posX: layout.startX,
                    posY: layout.startY,
                    exploredJson: serializeExploredJson(mergedExplored),
                },
                update: {
                    isInside: true,
                    posX: layout.startX,
                    posY: layout.startY,
                    exploredJson: serializeExploredJson(mergedExplored),
                },
            });
            await tx.player.update({
                where: { id: params.playerId },
                data: {
                    lastActiveAt: new Date(),
                    isActive: true,
                },
            });
        });
        return {
            success: true,
            place: instance.place,
            layout,
        };
    }
    finally {
        observePerf('cave.enter', Date.now() - startedAt);
    }
}
export async function exitActiveCaveForTgId(tgId) {
    const startedAt = Date.now();
    try {
        const player = await getPlayerByTelegramId(tgId);
        if (!player) {
            return { success: false, message: 'Player not found.' };
        }
        const active = await getActiveCaveContextByPlayerId(player.id);
        if (!active) {
            return { success: false, message: 'No active cave.' };
        }
        await prisma.$transaction(async (tx) => {
            await tx.playerCaveState.updateMany({
                where: {
                    playerId: player.id,
                    isInside: true,
                },
                data: {
                    isInside: false,
                },
            });
            await tx.player.update({
                where: { id: player.id },
                data: {
                    lastActiveAt: new Date(),
                    isActive: true,
                },
            });
        });
        return {
            success: true,
            place: active.place,
        };
    }
    finally {
        observePerf('cave.exit', Date.now() - startedAt);
    }
}
export async function movePlayerInCave(tgId, direction) {
    const startedAt = Date.now();
    try {
        const player = await getPlayerByTelegramId(tgId);
        if (!player) {
            return { success: false, message: 'Player not found.' };
        }
        const active = await getActiveCaveContextByPlayerId(player.id);
        if (!active) {
            return { success: false, message: 'No active cave.' };
        }
        if (player.energy < CAVE_STEP_STA_COST) {
            return {
                success: false,
                message: t3(player.language ?? 'es', `Necesitas ${CAVE_STEP_STA_COST} STA para avanzar.`, `You need ${CAVE_STEP_STA_COST} STA to advance.`, `Nuzhno ${CAVE_STEP_STA_COST} STA, chtoby prodvinutsya.`),
            };
        }
        const dir = {
            up: { dx: 0, dy: -1 },
            down: { dx: 0, dy: 1 },
            left: { dx: -1, dy: 0 },
            right: { dx: 1, dy: 0 },
        }[direction];
        const nextX = active.posX + dir.dx;
        const nextY = active.posY + dir.dy;
        if (getCaveCell(active.layout, nextX, nextY) !== PATH_CELL) {
            return {
                success: false,
                message: t3(player.language ?? 'es', 'La pared bloquea el paso.', 'A wall blocks the way.', 'Stena pregradaet put.'),
            };
        }
        const explored = parseExploredJson(active.exploredJson);
        revealAround(active.layout, nextX, nextY, explored);
        await prisma.$transaction(async (tx) => {
            await tx.playerCaveState.update({
                where: {
                    playerId_caveInstanceId: {
                        playerId: player.id,
                        caveInstanceId: active.caveInstanceId,
                    },
                },
                data: {
                    posX: nextX,
                    posY: nextY,
                    exploredJson: serializeExploredJson(explored),
                    isInside: true,
                },
            });
            await tx.player.update({
                where: { id: player.id },
                data: {
                    energy: { decrement: CAVE_STEP_STA_COST },
                    lastActiveAt: new Date(),
                    isActive: true,
                },
            });
        });
        return { success: true, message: '' };
    }
    finally {
        observePerf('cave.move', Date.now() - startedAt);
    }
}
function buildCaveKeyboard(lang) {
    return new InlineKeyboard()
        .text(`${EMOJIS.ui.bag} ${t(lang, 'mapBag')}`, 'map_bag')
        .text(`⬆️ ${t(lang, 'mapUp')}`, 'map_up')
        .text(`${EMOJIS.ui.profile} ${t(lang, 'mapProfile')}`, 'map_profile')
        .row()
        .text(`⬅️ ${t(lang, 'mapLeft')}`, 'map_left')
        .text(`🚪 ${t3(lang, 'Salir', 'Exit', 'Vykhod')}`, 'cave_exit')
        .text(`➡️ ${t(lang, 'mapRight')}`, 'map_right')
        .row()
        .text(`⬇️ ${t(lang, 'mapDown')}`, 'map_down');
}
export async function renderActiveCaveMap(tgId) {
    const startedAt = Date.now();
    try {
        const active = await getActiveCaveContextByTgId(tgId);
        if (!active) {
            return null;
        }
        const lang = active.player.language ?? 'es';
        const explored = parseExploredJson(active.exploredJson);
        const gridRows = [];
        for (let dy = -CAVE_VIEW_HALF_HEIGHT; dy <= CAVE_VIEW_HALF_HEIGHT; dy += 1) {
            const row = [];
            for (let dx = -CAVE_VIEW_HALF_WIDTH; dx <= CAVE_VIEW_HALF_WIDTH; dx += 1) {
                const tx = active.posX + dx;
                const ty = active.posY + dy;
                if (dx === 0 && dy === 0) {
                    row.push(EMOJIS.ui.pin);
                    continue;
                }
                const isExploredPath = explored.has(coordKey(tx, ty)) && getCaveCell(active.layout, tx, ty) === PATH_CELL;
                row.push(isExploredPath ? CAVE_PATH_TILE : CAVE_WALL_TILE);
            }
            gridRows.push(row.join(''));
        }
        const header = `${EMOJIS.ui.map} ${t3(lang, 'Explorando', 'Exploring', 'Issledovanie')} ${active.place.emoji} ${active.place.displayName}`;
        const biomeName = [
            `🕳️ ${t3(lang, 'Interior de cueva', 'Cave interior', 'Vnutri peschery')}`,
            `🧭 ${t3(lang, 'Explorado', 'Explored', 'Issledovano')}: ${explored.size}/${active.layout.walkableCount}`,
        ].join('\n');
        const grid = '----------------------------\n' + gridRows.join('\n') + '\n----------------------------';
        const footer = [
            `${EMOJIS.ui.stamina} STA ${active.player.energy}/${active.player.maxEnergy}`,
            `${CAVE_PATH_TILE} ${t3(lang, 'Camino', 'Path', 'Prokhod')}   ${CAVE_WALL_TILE} ${t3(lang, 'Pared', 'Wall', 'Stena')}`,
        ].join('\n');
        return {
            header,
            biomeName,
            grid,
            footer,
            keyboard: buildCaveKeyboard(lang),
        };
    }
    finally {
        observePerf('cave.render_map', Date.now() - startedAt);
    }
}
export async function isPlayerInsideCave(tgId) {
    const active = await getActiveCaveContextByTgId(tgId);
    return Boolean(active);
}
//# sourceMappingURL=cave-system.js.map