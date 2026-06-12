// @ts-nocheck
import { InlineKeyboard } from 'grammy';
import { randomUUID } from 'node:crypto';
import { prisma, getPlayerByTelegramId } from '../lib/db.js';
import { RUNTIME_CONFIG } from '../lib/runtime-config.js';
import { t } from '../lib/i18n.js';
import { ensureTilesGeneratedForCoords, finalizePlayerMove, getLocationDisplayLabel, getOrCreateTile, getPlaceAtCoords, markTilesExploredBatch, renderMap, } from './map.js';
import { EMOJIS } from '../data/emojis.js';
import { sendMapCardSafeViaBot } from './map-delivery.js';
import { renderMapCardText } from './map-message.js';
import { consumeLowVitalsAlertByTgId } from './vitals-alerts.js';
import { getCanonicalWorldMap } from './world-map.js';
import { withPrismaRetry } from '../lib/prisma-retry.js';
function toBigIntChatId(chatId) {
    return BigInt(Math.trunc(chatId));
}
function getLang(player) {
    return player?.language ?? 'es';
}
function parsePayload(payloadJson) {
    try {
        return JSON.parse(payloadJson);
    }
    catch {
        return null;
    }
}
function getStaleLockCutoff() {
    return new Date(Date.now() - RUNTIME_CONFIG.jobRunningLockTimeoutMs);
}
async function recoverStaleRunningJobs(filter) {
    const staleCutoff = getStaleLockCutoff();
    await withPrismaRetry('game-jobs.recover-stale', () => prisma.gameJob.updateMany({
        where: {
            kind: { in: ['move_arrival', 'venture_arrival'] },
            status: 'RUNNING',
            ...(filter?.tgId ? { tgId: filter.tgId } : {}),
            OR: [{ lockedAt: null }, { lockedAt: { lte: staleCutoff } }],
        },
        data: {
            status: 'PENDING',
            executeAt: new Date(),
            lockToken: null,
            lockedAt: null,
            lastError: 'Recovered stale RUNNING lock',
        },
    }));
}
async function notifyLowVitalsByBot(bot, tgId, chatId) {
    try {
        const alert = await consumeLowVitalsAlertByTgId(tgId);
        if (!alert) {
            return;
        }
        await bot.api.sendMessage(chatId, alert.text);
    }
    catch (error) {
        console.error('❌ Low vitals job notify error:', error);
    }
}
async function safeSendMessage(bot, chatId, text, extra) {
    try {
        await bot.api.sendMessage(chatId, text, extra);
    }
    catch (error) {
        console.error('❌ Game job sendMessage failed:', error);
    }
}
async function claimDueJobs(limit) {
    await recoverStaleRunningJobs();
    const due = await withPrismaRetry('game-jobs.claim.find-due', () => prisma.gameJob.findMany({
        where: {
            status: 'PENDING',
            executeAt: { lte: new Date() },
        },
        orderBy: [{ executeAt: 'asc' }, { id: 'asc' }],
        take: limit,
    }));
    const claimed = [];
    for (const job of due) {
        const lockToken = randomUUID();
        const updated = await withPrismaRetry('game-jobs.claim.lock', () => prisma.gameJob.updateMany({
            where: { id: job.id, status: 'PENDING' },
            data: {
                status: 'RUNNING',
                lockToken,
                lockedAt: new Date(),
                attempts: { increment: 1 },
            },
        }));
        if (updated.count === 1) {
            claimed.push({
                id: job.id,
                kind: job.kind,
                payloadJson: job.payloadJson,
                lockToken,
                attempts: job.attempts + 1,
                maxAttempts: job.maxAttempts,
            });
        }
    }
    return claimed;
}
async function markDone(jobId, lockToken) {
    await withPrismaRetry('game-jobs.mark-done', () => prisma.gameJob.updateMany({
        where: { id: jobId, status: 'RUNNING', lockToken },
        data: { status: 'DONE', lockToken: null, lockedAt: null },
    }));
}
async function markRetryOrFailed(jobId, lockToken, attempts, maxAttempts, error) {
    const message = error instanceof Error ? error.message : String(error);
    if (attempts >= maxAttempts) {
        await withPrismaRetry('game-jobs.mark-failed', () => prisma.gameJob.updateMany({
            where: { id: jobId, status: 'RUNNING', lockToken },
            data: {
                status: 'FAILED',
                lastError: message.slice(0, 1000),
                lockToken: null,
                lockedAt: null,
            },
        }));
        return;
    }
    const retryInMs = Math.min(30000, attempts * 2000);
    await withPrismaRetry('game-jobs.mark-retry', () => prisma.gameJob.updateMany({
        where: { id: jobId, status: 'RUNNING', lockToken },
        data: {
            status: 'PENDING',
            executeAt: new Date(Date.now() + retryInMs),
            lastError: message.slice(0, 1000),
            lockToken: null,
            lockedAt: null,
        },
    }));
}
async function processMoveArrival(bot, payload) {
    const moveResult = await finalizePlayerMove(payload.tgId, payload.playerId, payload.toX, payload.toY, payload.isNewDiscovery, payload.energyCost, {
        x: payload.fromX,
        y: payload.fromY,
    });
    const player = await getPlayerByTelegramId(payload.tgId);
    const lang = getLang(player ?? undefined);
    let arrivalText = payload.arrivalMessage || `🏁 ${t(lang, 'mapArrivedAt')} (${payload.toX}, ${payload.toY})`;
    if (!moveResult.applied && !moveResult.alreadyAtDestination) {
        arrivalText = `⚠️ ${t(lang, 'uiErrorOccurred')}. ${t(lang, 'mapYouAreIn')} (${payload.toX}, ${payload.toY})`;
    }
    if (payload.placeArrival) {
        const keyboard = new InlineKeyboard()
            .text(`🔍 ${t(lang, 'mapInspect')}`, 'map_inspect')
            .text(`🗺 ${t(lang, 'inspectViewMap')}`, 'arrival_map');
        await safeSendMessage(bot, payload.chatId, arrivalText, { reply_markup: keyboard });
        return;
    }
    await safeSendMessage(bot, payload.chatId, arrivalText);
    const mapResult = await renderMap(payload.tgId);
    if (mapResult) {
        try {
            await sendMapCardSafeViaBot({
                bot,
                chatId: payload.chatId,
                text: renderMapCardText(mapResult, lang),
                keyboard: mapResult.keyboard,
                source: 'job:move-arrival-map',
            });
        }
        catch (error) {
            console.error('❌ Move arrival map send failed:', error);
            await safeSendMessage(bot, payload.chatId, renderMapCardText(mapResult, lang), {
                reply_markup: mapResult.keyboard,
            });
        }
    }
    await notifyLowVitalsByBot(bot, payload.tgId, payload.chatId);
}
function manhattanPath(fromX, fromY, toX, toY) {
    const path = [];
    let x = fromX;
    let y = fromY;
    while (x !== toX || y !== toY) {
        if (x < toX)
            x += 1;
        else if (x > toX)
            x -= 1;
        else if (y < toY)
            y += 1;
        else if (y > toY)
            y -= 1;
        path.push({ x, y });
    }
    return path;
}
async function processVentureArrival(bot, payload) {
    const latestPlayer = await getPlayerByTelegramId(payload.tgId);
    if (!latestPlayer) {
        return;
    }
    const lang = getLang(latestPlayer);
    const alreadyAtTarget = latestPlayer.mapX === payload.targetX && latestPlayer.mapY === payload.targetY;
    if (!alreadyAtTarget && latestPlayer.energy < payload.totalEnergy) {
        await safeSendMessage(bot, payload.chatId, `⚠️ ${t(lang, 'mapTraveling')} cancelado. STA ${latestPlayer.energy}/${latestPlayer.maxEnergy}.`);
        return;
    }
    if (!alreadyAtTarget) {
        const worldMap = await getCanonicalWorldMap();
        const path = manhattanPath(latestPlayer.mapX, latestPlayer.mapY, payload.targetX, payload.targetY);
        await ensureTilesGeneratedForCoords(worldMap.id, path);
        await markTilesExploredBatch(latestPlayer.id, latestPlayer.tgId, path.map((step) => ({ x: step.x, y: step.y })));
        await prisma.player.update({
            where: { tgId: payload.tgId },
            data: {
                mapX: payload.targetX,
                mapY: payload.targetY,
                energy: { decrement: payload.totalEnergy },
                lastActiveAt: new Date(),
                isActive: true,
            },
        });
    }
    const worldMap = await getCanonicalWorldMap();
    const arrivalTile = await getOrCreateTile(worldMap.id, payload.targetX, payload.targetY);
    const arrivalPlace = await getPlaceAtCoords(payload.targetX, payload.targetY);
    const arrivalText = `✅ ${t(lang, 'mapArrivedAt')}.\n` +
        `🧭 Destino: (${payload.targetX}, ${payload.targetY})\n` +
        `${EMOJIS.ui.stamina} STA: -${payload.totalEnergy}\n` +
        `⌛ ${Math.max(1, Math.ceil(payload.totalSeconds))}s\n` +
        `📍 ${getLocationDisplayLabel(arrivalTile, arrivalPlace, lang)}`;
    await safeSendMessage(bot, payload.chatId, arrivalText);
    const mapResult = await renderMap(payload.tgId);
    if (mapResult) {
        try {
            await sendMapCardSafeViaBot({
                bot,
                chatId: payload.chatId,
                text: renderMapCardText(mapResult, lang),
                keyboard: mapResult.keyboard,
                source: 'job:venture-arrival-map',
            });
        }
        catch (error) {
            console.error('❌ Venture arrival map send failed:', error);
            await safeSendMessage(bot, payload.chatId, renderMapCardText(mapResult, lang), {
                reply_markup: mapResult.keyboard,
            });
        }
    }
    await notifyLowVitalsByBot(bot, payload.tgId, payload.chatId);
}
export async function enqueueMoveArrivalJob(params, delaySeconds) {
    await withPrismaRetry('game-jobs.enqueue-move', () => prisma.gameJob.create({
        data: {
            kind: 'move_arrival',
            status: 'PENDING',
            playerId: params.playerId,
            tgId: params.tgId,
            chatId: toBigIntChatId(params.chatId),
            payloadJson: JSON.stringify(params),
            executeAt: new Date(Date.now() + Math.max(1, Math.ceil(delaySeconds)) * 1000),
        },
    }));
}
export async function enqueueVentureArrivalJob(params, delaySeconds) {
    await withPrismaRetry('game-jobs.enqueue-venture', () => prisma.gameJob.create({
        data: {
            kind: 'venture_arrival',
            status: 'PENDING',
            playerId: params.playerId,
            tgId: params.tgId,
            chatId: toBigIntChatId(params.chatId),
            payloadJson: JSON.stringify(params),
            executeAt: new Date(Date.now() + Math.max(1, Math.ceil(delaySeconds)) * 1000),
        },
    }));
}
export async function hasPendingTravelJob(tgId) {
    await recoverStaleRunningJobs({ tgId });
    const staleCutoff = getStaleLockCutoff();
    const exists = await withPrismaRetry('game-jobs.has-pending', () => prisma.gameJob.findFirst({
        where: {
            tgId,
            kind: { in: ['move_arrival', 'venture_arrival'] },
            OR: [{ status: 'PENDING' }, { status: 'RUNNING', lockedAt: { gt: staleCutoff } }],
        },
        select: { id: true },
    }));
    return !!exists;
}
let gameJobTimer = null;
let gameJobSweepInFlight = false;
async function processDueGameJobsOnce(bot) {
    if (gameJobSweepInFlight) {
        return;
    }
    gameJobSweepInFlight = true;
    try {
        const jobs = await claimDueJobs(RUNTIME_CONFIG.jobSweepBatchSize);
        for (const job of jobs) {
            try {
                const payload = parsePayload(job.payloadJson);
                if (!payload) {
                    throw new Error('Invalid job payload');
                }
                if (job.kind === 'move_arrival') {
                    await processMoveArrival(bot, payload);
                }
                else if (job.kind === 'venture_arrival') {
                    await processVentureArrival(bot, payload);
                }
                else {
                    throw new Error(`Unsupported job kind: ${job.kind}`);
                }
                await markDone(job.id, job.lockToken);
            }
            catch (error) {
                await markRetryOrFailed(job.id, job.lockToken, job.attempts, job.maxAttempts, error);
            }
        }
    }
    catch (error) {
        console.error('❌ Game job sweep error:', error);
    }
    finally {
        gameJobSweepInFlight = false;
    }
}
export function startGameJobWorker(bot) {
    if (gameJobTimer) {
        return;
    }
    gameJobTimer = setInterval(() => {
        void processDueGameJobsOnce(bot);
    }, RUNTIME_CONFIG.jobSweepIntervalMs);
    void processDueGameJobsOnce(bot);
}
//# sourceMappingURL=game-jobs.js.map