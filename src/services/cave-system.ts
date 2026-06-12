// @ts-nocheck
import { prisma, getPlayerByTelegramId } from '../lib/db.js';
import { observePerf } from '../lib/perf-metrics.js';
import { t } from '../lib/i18n.js';
import { EMOJIS } from '../data/emojis.js';
import {
    parseExploredJson,
    serializeExploredJson,
    revealAround,
    getCaveCell,
    parseCaveLayout,
    ensureCaveSchema,
    t3,
    coordKey,
    PATH_CELL,
    buildCaveKeyboard,
    ensureCaveInstanceForPlace,
} from './cave-system-actions.js';

const CAVE_VIEW_HALF_WIDTH = 5;
const CAVE_VIEW_HALF_HEIGHT = 8;
const CAVE_STEP_STA_COST = 1;
const CAVE_WALL_TILE = '⬛';
const CAVE_PATH_TILE = '⬜';

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
