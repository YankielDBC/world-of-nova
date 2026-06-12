// @ts-nocheck
import { InlineKeyboard } from 'grammy';
import { prisma } from '../../lib/db.js';
import { EMOJIS } from '../../data/emojis.js';
import { buildCountdownMessage } from '../../services/travel-countdown.js';
function parseCoords(text) {
    const match = text.trim().match(/(-?\d+)\s*,\s*(-?\d+)/);
    if (!match)
        return null;
    return { x: Number.parseInt(match[1], 10), y: Number.parseInt(match[2], 10) };
}
async function hasExplored(playerId, x, y) {
    const explored = await prisma.playerExploredTile.findUnique({
        where: { playerId_tileX_tileY: { playerId, tileX: x, tileY: y } },
    });
    return !!explored;
}
function energyCostForTile(tile) {
    if (tile.elevation > 0)
        return 3;
    if (tile.isWater)
        return 2;
    return 1;
}
function applyTravelStaminaMultiplier(baseCost, multiplier) {
    return Math.max(1, Math.ceil(baseCost * Math.max(0.7, Math.min(1.35, multiplier))));
}
function travelTimeSeconds(tile, playerSpeed, travelTimeMultiplier = 1) {
    const baseTime = 3;
    let terrainMultiplier = 1;
    if (tile.isWater)
        terrainMultiplier = 1.5;
    if (tile.elevation > 0)
        terrainMultiplier = 2;
    const movementFactor = tile.biome?.movementFactor ?? 1;
    return (((baseTime * terrainMultiplier * movementFactor) / Math.max(playerSpeed, 0.1)) *
        Math.max(0.75, Math.min(1.35, travelTimeMultiplier)));
}
function manhattanPath(fromX, fromY, toX, toY) {
    const path = [];
    let x = fromX;
    let y = fromY;
    while (x !== toX) {
        x += x < toX ? 1 : -1;
        path.push({ x, y });
    }
    while (y !== toY) {
        y += y < toY ? 1 : -1;
        path.push({ x, y });
    }
    return path;
}
function buildVentureCancelKeyboard() {
    return new InlineKeyboard().text('❌ Cancelar viaje', 'venture_cancel');
}
function buildVentureConfirmKeyboard() {
    return new InlineKeyboard()
        .text('✅ Sí', 'venture_confirm')
        .text('❌ No', 'venture_decline')
        .row()
        .text('🚫 Cancelar viaje', 'venture_cancel');
}
function chunkCoords(coords, size) {
    const chunks = [];
    for (let i = 0; i < coords.length; i += size) {
        chunks.push(coords.slice(i, i + size));
    }
    return chunks;
}
async function loadVentureTiles(worldMapId, path, deps) {
    if (path.length === 0)
        return [];
    await deps.ensureTilesGeneratedForCoords(worldMapId, path);
    const tileByCoord = new Map();
    for (const chunk of chunkCoords(path, deps.dbBatchSize)) {
        const rows = await prisma.mapTile.findMany({
            where: {
                worldMapId,
                OR: chunk.map((coord) => ({
                    x: coord.x,
                    y: coord.y,
                })),
            },
            select: {
                x: true,
                y: true,
                isWater: true,
                elevation: true,
                biome: {
                    select: {
                        movementFactor: true,
                    },
                },
            },
        });
        for (const row of rows) {
            tileByCoord.set(`${row.x},${row.y}`, {
                x: row.x,
                y: row.y,
                isWater: row.isWater,
                elevation: row.elevation,
                biome: row.biome ? { movementFactor: row.biome.movementFactor } : null,
            });
        }
    }
    const orderedTiles = [];
    for (const coord of path) {
        const key = `${coord.x},${coord.y}`;
        let tile = tileByCoord.get(key);
        if (!tile) {
            const fallback = await deps.getOrCreateTile(worldMapId, coord.x, coord.y);
            tile = {
                x: fallback.x,
                y: fallback.y,
                isWater: fallback.isWater,
                elevation: fallback.elevation,
                biome: { movementFactor: fallback.biome?.movementFactor ?? 1 },
            };
            tileByCoord.set(key, tile);
        }
        orderedTiles.push(tile);
    }
    return orderedTiles;
}
export function createVentureFlowHandlers(deps) {
    const startVentureFlow = async (ctx) => {
        const tgId = ctx.from?.id;
        if (!tgId)
            return;
        await deps.setVentureState(String(tgId), { phase: 'awaiting_coords' });
        await ctx.reply('🚶‍♂️ ¿Hacia dónde marchamos? Envía coordenadas como "x,y" de un punto que ya hayas pisado.', {
            reply_markup: buildVentureCancelKeyboard(),
        });
    };
    const handleVentureCoords = async (ctx, coordsText) => {
        const tgId = ctx.from?.id;
        if (!tgId)
            return;
        const parsed = parseCoords(coordsText);
        if (!parsed) {
            await ctx.reply('Formato inválido. Usa "x,y" (ej: 1,2).', {
                reply_markup: buildVentureCancelKeyboard(),
            });
            return;
        }
        const player = await deps.getPlayerByTelegramId(String(tgId));
        if (!player) {
            await ctx.reply('❌ No estás registrado. Usa /start');
            return;
        }
        if (player.mapX === parsed.x && player.mapY === parsed.y) {
            await ctx.reply('Ya estás en esas coordenadas.');
            await deps.clearVentureState(String(tgId));
            return;
        }
        const exploredTarget = await hasExplored(player.id, parsed.x, parsed.y);
        if (!exploredTarget) {
            await ctx.reply('Solo puedes ir a coordenadas que ya exploraste antes.');
            return;
        }
        const worldMap = await deps.getCanonicalWorldMap();
        const path = manhattanPath(player.mapX, player.mapY, parsed.x, parsed.y);
        const pathTiles = await loadVentureTiles(worldMap.id, path, deps);
        const gameplayEffects = await deps.getGameplayEffectsForPlayer(player.id);
        let totalEnergy = 0;
        let totalSeconds = 0;
        for (const tile of pathTiles) {
            totalEnergy += applyTravelStaminaMultiplier(energyCostForTile(tile), gameplayEffects.travelStaminaCostMultiplier);
            totalSeconds += travelTimeSeconds(tile, player.speed || 1, gameplayEffects.travelTimeMultiplier);
        }
        if (totalEnergy > player.energy) {
            await ctx.reply(`Necesitas ${totalEnergy} STA, solo tienes ${player.energy}. Tiempo estimado: ${Math.ceil(totalSeconds)}s.`, { reply_markup: buildVentureCancelKeyboard() });
            return;
        }
        await deps.setVentureState(String(tgId), {
            phase: 'confirming',
            plan: {
                targetX: parsed.x,
                targetY: parsed.y,
                totalEnergy,
                totalSeconds,
            },
        });
        await ctx.reply(`🧭 Rumbo: (${player.mapX}, ${player.mapY}) → (${parsed.x}, ${parsed.y})\n` +
            `${EMOJIS.ui.stamina} STA Cost: -${totalEnergy}\n` +
            `⌛ Tiempo: ${Math.ceil(totalSeconds)}s\n` +
            `¿Emprendemos el viaje?`, { reply_markup: buildVentureConfirmKeyboard() });
    };
    const executeVenture = async (ctx, plan) => {
        const tgId = ctx.from?.id;
        if (!tgId)
            return;
        const player = await deps.getPlayerByTelegramId(String(tgId));
        if (!player) {
            await ctx.reply('❌ No estás registrado. Usa /start');
            return;
        }
        const lang = deps.getPlayerLanguage(player);
        if (player.energy < plan.totalEnergy) {
            await ctx.reply(`⚠️ Te faltan ${plan.totalEnergy - player.energy} STA (requiere ${plan.totalEnergy}, tienes ${player.energy}). Tiempo estimado: ${Math.ceil(plan.totalSeconds)}s.`);
            return;
        }
        if (await deps.hasPendingTravelJob(String(tgId))) {
            await ctx.reply('⏳ Ya tienes un viaje en progreso.');
            return;
        }
        const travelSeconds = Math.max(1, Math.ceil(plan.totalSeconds));
        const ventureBaseMessage = `🚶‍♂️ Emprendes la marcha hacia (${plan.targetX}, ${plan.targetY}).\n` +
            `${EMOJIS.ui.stamina} El viaje consumirá -${plan.totalEnergy} STA.\n` +
            `⌛ Llegada estimada en ${travelSeconds}s.`;
        const ventureMessage = buildCountdownMessage({
            baseText: ventureBaseMessage,
            remainingSeconds: travelSeconds,
            totalSeconds: travelSeconds,
            etaLabel: deps.t3(lang, '⌛ Llegada estimada', '⌛ Estimated arrival', '⌛ Примерное прибытие'),
        });
        const sentMessage = await ctx.reply(ventureMessage);
        const chatId = ctx.chat?.id;
        if (typeof chatId === 'number') {
            await deps.enqueueVentureArrivalJob({
                tgId: String(tgId),
                playerId: player.id,
                chatId,
                targetX: plan.targetX,
                targetY: plan.targetY,
                totalEnergy: plan.totalEnergy,
                totalSeconds: plan.totalSeconds,
            }, travelSeconds + deps.travelArrivalBufferSeconds);
            if (sentMessage?.message_id) {
                deps.startTravelCountdownAnimation(deps.bot, {
                    chatId,
                    messageId: sentMessage.message_id,
                    baseText: ventureBaseMessage,
                    totalSeconds: travelSeconds,
                    etaLabel: deps.t3(lang, '⌛ Llegada estimada', '⌛ Estimated arrival', '⌛ Примерное прибытие'),
                });
            }
        }
    };
    return {
        startVentureFlow,
        handleVentureCoords,
        executeVenture,
    };
}
