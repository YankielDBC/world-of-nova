// @ts-nocheck
import { randomUUID } from 'node:crypto';
import { prisma } from '../lib/db.js';
import { RUNTIME_CONFIG } from '../lib/runtime-config.js';
import { randomInt } from './mystery-merchant-utils.js';
import { getForcedCoordsForMerchant, getOccupiedMerchantCoords, pickNextCoords } from './mystery-merchant-pathing.js';
import { decorateMerchantAlertText, pickRandomText, sendRumorHint, sendStyledChannelAlert, } from './mystery-merchant-alerts.js';
import { clearMerchantSnapshotCache, ensureMerchantState, ensureMerchantStates, generateMerchantOffers, getForcedMerchantCoords, getMerchantSnapshotsForRead, getRandomStaySeconds, getWorldMapId, serializeOffers, toSnapshot, updateMerchantSnapshotCache, } from './mystery-merchant-state.js';
export { getMerchantIntroText } from './mystery-merchant-alerts.js';
const MERCHANT_BASE_ID = 1;
let merchantTimer = null;
let merchantSweepInFlight = false;
async function rotateMerchantPosition(params) {
    const current = await ensureMerchantState(params.merchantId);
    if (!current) {
        return null;
    }
    const forcedCoords = getForcedMerchantCoords();
    const desiredForced = forcedCoords
        ? getForcedCoordsForMerchant(params.merchantId, forcedCoords, MERCHANT_BASE_ID)
        : null;
    const blockedCoords = await getOccupiedMerchantCoords({
        worldMapId: current.worldMapId,
        excludeId: current.id,
    });
    const next = desiredForced ||
        (await pickNextCoords({
            worldMapId: current.worldMapId,
            currentX: current.mapX,
            currentY: current.mapY,
            prevX: current.prevX,
            prevY: current.prevY,
            blockedCoords,
        }));
    const now = Date.now();
    const staySeconds = getRandomStaySeconds();
    const offers = await generateMerchantOffers();
    const nextToken = randomUUID();
    const updated = await prisma.$transaction(async (tx) => {
        await tx.mysteryMerchantWitness.deleteMany({
            where: {
                stayToken: current.stayToken,
            },
        });
        return tx.mysteryMerchant.update({
            where: { id: current.id },
            data: {
                prevX: current.mapX === next.x && current.mapY === next.y ? current.prevX : current.mapX,
                prevY: current.mapX === next.x && current.mapY === next.y ? current.prevY : current.mapY,
                mapX: next.x,
                mapY: next.y,
                arrivedAt: new Date(now),
                departsAt: new Date(now + staySeconds * 1000),
                stayToken: nextToken,
                buybackMultiplier: randomInt(2, 20),
                offersJson: serializeOffers(offers),
                rumorSentAt: null,
                confirmedAt: null,
            },
        });
    });
    const snapshot = toSnapshot(updated);
    updateMerchantSnapshotCache(snapshot);
    if (params.reason === 'timer' && params.api) {
        const sent = await sendRumorHint(params.api, snapshot);
        if (sent) {
            const rumorSentAt = new Date();
            await prisma.mysteryMerchant.update({
                where: { id: current.id },
                data: { rumorSentAt },
            });
            snapshot.rumorSentAt = rumorSentAt;
            updateMerchantSnapshotCache(snapshot);
        }
    }
    return { snapshot, moved: current.mapX !== next.x || current.mapY !== next.y };
}
async function processMerchantTick(api) {
    if (!RUNTIME_CONFIG.merchantEnabled || merchantSweepInFlight) {
        return;
    }
    merchantSweepInFlight = true;
    try {
        const forcedCoords = getForcedMerchantCoords();
        const snapshots = await ensureMerchantStates();
        if (snapshots.length === 0) {
            return;
        }
        for (const snapshot of snapshots) {
            if (!snapshot.rumorSentAt) {
                const sent = await sendRumorHint(api, snapshot);
                if (sent) {
                    const rumorSentAt = new Date();
                    await prisma.mysteryMerchant.update({
                        where: { id: snapshot.id },
                        data: { rumorSentAt },
                    });
                    snapshot.rumorSentAt = rumorSentAt;
                    updateMerchantSnapshotCache(snapshot);
                }
            }
            if (snapshot.departsAt.getTime() > Date.now()) {
                continue;
            }
            if (forcedCoords) {
                const now = Date.now();
                const offers = await generateMerchantOffers();
                const nextStayToken = randomUUID();
                await prisma.$transaction(async (tx) => {
                    await tx.mysteryMerchantWitness.deleteMany({
                        where: {
                            stayToken: snapshot.stayToken,
                        },
                    });
                    await tx.mysteryMerchant.update({
                        where: { id: snapshot.id },
                        data: {
                            arrivedAt: new Date(now),
                            departsAt: new Date(now + getRandomStaySeconds() * 1000),
                            stayToken: nextStayToken,
                            buybackMultiplier: randomInt(2, 20),
                            offersJson: serializeOffers(offers),
                            rumorSentAt: null,
                            confirmedAt: null,
                        },
                    });
                });
                clearMerchantSnapshotCache();
                continue;
            }
            await rotateMerchantPosition({
                api,
                merchantId: snapshot.id,
                reason: 'timer',
            });
        }
    }
    catch (error) {
        console.error('Mystery merchant sweep error:', error);
    }
    finally {
        merchantSweepInFlight = false;
    }
}
export function startMysteryMerchantWorker(bot) {
    if (!RUNTIME_CONFIG.merchantEnabled || merchantTimer) {
        return;
    }
    merchantTimer = setInterval(() => {
        void processMerchantTick(bot.api);
    }, RUNTIME_CONFIG.merchantSweepIntervalMs);
    void processMerchantTick(bot.api);
}
export async function getMerchantSnapshotAtCoords(params) {
    const snapshots = await getMerchantSnapshotsForRead();
    if (snapshots.length === 0) {
        return null;
    }
    return (snapshots.find((snapshot) => snapshot.worldMapId === params.worldMapId &&
        snapshot.mapX === params.x &&
        snapshot.mapY === params.y) || null);
}
export async function getMerchantSnapshotForPlayer(playerId) {
    const player = await prisma.player.findUnique({
        where: { id: playerId },
        select: {
            mapX: true,
            mapY: true,
        },
    });
    const worldMapId = await getWorldMapId();
    if (!player || !worldMapId) {
        return null;
    }
    const snapshot = await getMerchantSnapshotAtCoords({
        worldMapId,
        x: player.mapX,
        y: player.mapY,
    });
    return snapshot;
}
export async function registerMerchantWitness(playerId, stayToken) {
    await prisma.mysteryMerchantWitness.upsert({
        where: {
            stayToken_playerId: {
                stayToken,
                playerId,
            },
        },
        update: {},
        create: {
            stayToken,
            playerId,
        },
    });
}
export async function confirmRumorAndVanish(api) {
    const snapshots = await ensureMerchantStates();
    if (snapshots.length === 0) {
        return false;
    }
    let snapshot = null;
    let witnesses = 0;
    for (const candidate of snapshots) {
        const count = await prisma.mysteryMerchantWitness.count({
            where: { stayToken: candidate.stayToken },
        });
        if (count > witnesses) {
            snapshot = candidate;
            witnesses = count;
        }
    }
    if (!snapshot || witnesses <= 0) {
        return false;
    }
    const mark = await prisma.mysteryMerchant.updateMany({
        where: {
            id: snapshot.id,
            stayToken: snapshot.stayToken,
            confirmedAt: null,
        },
        data: {
            confirmedAt: new Date(),
            departsAt: new Date(),
        },
    });
    if (mark.count === 0) {
        return false;
    }
    clearMerchantSnapshotCache();
    if (!RUNTIME_CONFIG.communityProgressOnly && RUNTIME_CONFIG.merchantAlertsChannel) {
        const playersLabel = witnesses === 1 ? 'un aventurero' : `${witnesses} aventureros`;
        const text = [
            '📯 Rumor confirmado',
            `${playersLabel} confirmaron la existencia del Comerciante Misterioso.`,
            'Tras unos tratos rapidos, se desvanecio sin dejar rastro.',
        ].join('\n');
        const finalText = pickRandomText([
            [
                '✅ Rumor confirmado',
                `${playersLabel} confirmaron al Comerciante Misterioso.`,
                '🕳️ Tras cerrar tratos, desaparecio entre humo y silencio.',
            ].join('\n'),
            [
                '📜 Confirmacion oficial',
                `${playersLabel} reportaron contacto real con el encapuchado.`,
                '🌫️ Minutos despues, el rastro se corto por completo.',
            ].join('\n'),
            [
                '🔔 Alerta cerrada',
                `${playersLabel} validaron el rumor del mercader errante.`,
                '🚶 Sin despedirse, ya cambio su ruta hacia lo desconocido.',
            ].join('\n'),
        ]) || text;
        await sendStyledChannelAlert(api, RUNTIME_CONFIG.merchantAlertsChannel, decorateMerchantAlertText(finalText));
    }
    await rotateMerchantPosition({
        api,
        merchantId: snapshot.id,
        reason: 'confirmed',
    });
    return true;
}
export { getMerchantSellEntries, sellToMerchant, buyFromMerchant } from './mystery-merchant-actions.js';
//# sourceMappingURL=mystery-merchant.js.map