// @ts-nocheck
import { randomUUID } from 'node:crypto';
import { prisma } from '../lib/db.js';
import { RUNTIME_CONFIG } from '../lib/runtime-config.js';
import { addResourceToActiveBag, grantToolToPlayer } from './bags.js';
import { normalizeMerchantDisplayName, randomInt } from './mystery-merchant-utils.js';
import { getBagMarketValue, getResourceMarketValue, getSellableSlots, getToolMarketValue, getToolMeta, markMerchantPurchasedResourceLock, } from './mystery-merchant-trade-helpers.js';
import { getForcedCoordsForMerchant, getOccupiedMerchantCoords, pickNextCoords } from './mystery-merchant-pathing.js';
import { decorateMerchantAlertText, pickRandomText, sendRumorHint, sendStyledChannelAlert, } from './mystery-merchant-alerts.js';
import { clearMerchantSnapshotCache, ensureMerchantState, ensureMerchantStates, generateMerchantOffers, getForcedMerchantCoords, getMerchantSnapshotsForRead, getRandomStaySeconds, getWorldMapId, parseOffers, serializeOffers, toSnapshot, updateMerchantSnapshotCache, } from './mystery-merchant-state.js';
export { getMerchantIntroText } from './mystery-merchant-alerts.js';
const MERCHANT_BASE_ID = 1;
const ACTIVE_STATUS = 'ACTIVE';
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
export async function getMerchantSellEntries(playerId, buybackMultiplier) {
    const slots = await getSellableSlots(playerId);
    const entries = [];
    for (const slot of slots) {
        if (slot.resource) {
            const lockedQty = Math.max(0, Math.min(slot.merchantLockedQty, slot.quantity));
            const sellableQty = Math.max(0, slot.quantity - lockedQty);
            if (sellableQty <= 0) {
                continue;
            }
            const unitSilver = Math.max(1, Math.floor(getResourceMarketValue(slot.resource) * buybackMultiplier));
            entries.push({
                listIndex: entries.length + 1,
                slotUid: slot.id,
                slotIndex: slot.slotIndex,
                kind: 'resource',
                emoji: slot.resource.emoji,
                name: normalizeMerchantDisplayName(slot.resource.name),
                quantity: sellableQty,
                unitSilver,
                totalSilver: unitSilver * sellableQty,
            });
            continue;
        }
        if (slot.playerTool) {
            if (slot.playerTool.merchantLocked) {
                continue;
            }
            const tool = getToolMeta(slot.playerTool.toolKey);
            const unitSilver = Math.max(1, Math.floor(getToolMarketValue(slot.playerTool.toolKey, slot.playerTool.durability, slot.playerTool.maxDurability) *
                buybackMultiplier));
            entries.push({
                listIndex: entries.length + 1,
                slotUid: slot.id,
                slotIndex: slot.slotIndex,
                kind: 'tool',
                emoji: tool?.emoji || '🛠',
                name: normalizeMerchantDisplayName(tool?.name || slot.playerTool.toolKey),
                quantity: 1,
                unitSilver,
                totalSilver: unitSilver,
            });
            continue;
        }
        if (slot.storedBag?.definition) {
            const unitSilver = Math.max(2, Math.floor(getBagMarketValue(slot.storedBag.definition.slotCapacity, slot.storedBag.definition.weightCapacityKg) *
                buybackMultiplier));
            entries.push({
                listIndex: entries.length + 1,
                slotUid: slot.id,
                slotIndex: slot.slotIndex,
                kind: 'bag',
                emoji: slot.storedBag.definition.emoji,
                name: normalizeMerchantDisplayName(slot.storedBag.definition.displayName),
                quantity: 1,
                unitSilver,
                totalSilver: unitSilver,
            });
        }
    }
    return entries;
}
export async function sellToMerchant(params) {
    return prisma.$transaction(async (tx) => {
        const merchant = await tx.mysteryMerchant.findFirst({
            where: { stayToken: params.stayToken },
            select: {
                id: true,
                stayToken: true,
                buybackMultiplier: true,
            },
        });
        if (!merchant || merchant.stayToken !== params.stayToken) {
            return { success: false, message: 'El Comerciante Misterioso ya no esta aqui.' };
        }
        const slot = await tx.playerBagSlot.findFirst({
            where: {
                id: params.slotUid,
                bag: {
                    playerId: params.playerId,
                    status: ACTIVE_STATUS,
                },
            },
            include: {
                resource: true,
                playerTool: true,
                storedBag: {
                    include: {
                        definition: true,
                        slots: {
                            select: { id: true },
                        },
                    },
                },
            },
        });
        if (!slot) {
            return { success: false, message: 'Ese articulo ya no esta en tu mochila.' };
        }
        const equipment = await tx.playerEquipment.findUnique({
            where: { playerId: params.playerId },
            select: { chopToolId: true, mineToolId: true, gatherToolId: true },
        });
        const equippedIds = new Set([equipment?.chopToolId, equipment?.mineToolId, equipment?.gatherToolId].filter((value) => typeof value === 'number'));
        if (slot.playerTool?.id && equippedIds.has(slot.playerTool.id)) {
            return { success: false, message: 'Esa herramienta esta equipada. Desequipala primero.' };
        }
        let gained = 0;
        if (slot.resource) {
            const lockedQty = Math.max(0, Math.min(slot.merchantLockedQty, slot.quantity));
            const sellableQty = Math.max(0, slot.quantity - lockedQty);
            if (sellableQty <= 0) {
                return {
                    success: false,
                    message: 'Ese lote lo compraste al mercader y no acepta recompras.',
                };
            }
            const safeQty = Math.max(1, Math.min(params.quantity, sellableQty));
            const unitSilver = Math.max(1, Math.floor(getResourceMarketValue(slot.resource) * merchant.buybackMultiplier));
            gained = unitSilver * safeQty;
            if (safeQty >= slot.quantity) {
                await tx.playerBagSlot.delete({ where: { id: slot.id } });
            }
            else {
                await tx.playerBagSlot.update({
                    where: { id: slot.id },
                    data: {
                        quantity: { decrement: safeQty },
                        merchantLockedQty: Math.max(0, Math.min(lockedQty, slot.quantity - safeQty)),
                    },
                });
            }
        }
        else if (slot.playerTool) {
            if (slot.playerTool.merchantLocked) {
                return {
                    success: false,
                    message: 'Esa herramienta la compraste aqui y no te la recompro.',
                };
            }
            gained = Math.max(1, Math.floor(getToolMarketValue(slot.playerTool.toolKey, slot.playerTool.durability, slot.playerTool.maxDurability) *
                merchant.buybackMultiplier));
            await tx.playerBagSlot.delete({ where: { id: slot.id } });
            await tx.playerTool.delete({ where: { id: slot.playerTool.id } });
        }
        else if (slot.storedBag?.definition) {
            if (slot.storedBag.slots.length > 0) {
                return { success: false, message: 'No puedes vender una mochila con items dentro.' };
            }
            gained = Math.max(2, Math.floor(getBagMarketValue(slot.storedBag.definition.slotCapacity, slot.storedBag.definition.weightCapacityKg) *
                merchant.buybackMultiplier));
            await tx.playerBagSlot.delete({ where: { id: slot.id } });
            await tx.playerBag.delete({ where: { id: slot.storedBag.id } });
        }
        else {
            return { success: false, message: 'Ese objeto no se puede vender.' };
        }
        await tx.player.update({
            where: { id: params.playerId },
            data: { silver: { increment: gained } },
        });
        return {
            success: true,
            silverGained: gained,
            message: `💰 Trato cerrado: +${gained} 🪙`,
        };
    });
}
export async function buyFromMerchant(params) {
    const quantity = Math.max(1, Math.floor(params.quantity));
    const reserve = await prisma.$transaction(async (tx) => {
        const merchant = await tx.mysteryMerchant.findFirst({
            where: { stayToken: params.stayToken },
            select: {
                id: true,
                stayToken: true,
                offersJson: true,
            },
        });
        if (!merchant || merchant.stayToken !== params.stayToken) {
            return { ok: false, reason: 'El Comerciante Misterioso ya no esta aqui.' };
        }
        const offers = parseOffers(merchant.offersJson);
        const offer = offers.find((entry) => entry.id === params.offerId);
        if (!offer) {
            return { ok: false, reason: 'Esa oferta ya no existe.' };
        }
        if (offer.stock < quantity) {
            return { ok: false, reason: `Solo quedan ${offer.stock} unidades de esa oferta.` };
        }
        const player = await tx.player.findUnique({
            where: { id: params.playerId },
            select: { silver: true },
        });
        if (!player) {
            return { ok: false, reason: 'Jugador no encontrado.' };
        }
        const totalCost = offer.priceSilver * quantity;
        if (player.silver < totalCost) {
            return { ok: false, reason: `Te faltan ${totalCost - player.silver} 🪙.` };
        }
        offer.stock -= quantity;
        await tx.player.update({
            where: { id: params.playerId },
            data: {
                silver: { decrement: totalCost },
            },
        });
        await tx.mysteryMerchant.update({
            where: { id: merchant.id },
            data: {
                offersJson: serializeOffers(offers),
            },
        });
        return {
            ok: true,
            offer,
            totalCost,
        };
    });
    if (!reserve.ok) {
        return { success: false, message: reserve.reason };
    }
    clearMerchantSnapshotCache();
    let deliveryOk = false;
    let deliveryError = '';
    const reservedOffer = reserve.offer;
    if (reservedOffer.kind === 'resource' && reservedOffer.resourceId) {
        const resource = await prisma.resource.findUnique({
            where: { id: reservedOffer.resourceId },
            select: { name: true },
        });
        if (!resource) {
            deliveryError = 'Ese recurso ya no existe.';
        }
        else {
            const beforeSlots = await prisma.playerBagSlot.findMany({
                where: {
                    bag: {
                        playerId: params.playerId,
                        status: ACTIVE_STATUS,
                    },
                    resourceId: reservedOffer.resourceId,
                },
                select: {
                    id: true,
                    quantity: true,
                },
            });
            const delivered = await addResourceToActiveBag(params.playerId, resource.name, quantity);
            deliveryOk = delivered.success;
            deliveryError = delivered.reason || '';
            if (deliveryOk) {
                await markMerchantPurchasedResourceLock({
                    playerId: params.playerId,
                    resourceId: reservedOffer.resourceId,
                    purchasedQty: quantity,
                    beforeSlots,
                });
            }
        }
    }
    else if (reservedOffer.kind === 'tool' && reservedOffer.toolKey) {
        deliveryOk = true;
        for (let i = 0; i < quantity; i += 1) {
            const delivered = await grantToolToPlayer(params.playerId, reservedOffer.toolKey, {
                merchantLocked: true,
            });
            if (!delivered.success) {
                deliveryOk = false;
                deliveryError = delivered.message;
                break;
            }
        }
    }
    if (!deliveryOk) {
        await prisma.$transaction(async (tx) => {
            const merchant = await tx.mysteryMerchant.findFirst({
                where: { stayToken: params.stayToken },
                select: { id: true, offersJson: true, stayToken: true },
            });
            if (!merchant || merchant.stayToken !== params.stayToken) {
                await tx.player.update({
                    where: { id: params.playerId },
                    data: { silver: { increment: reserve.totalCost } },
                });
                return;
            }
            const offers = parseOffers(merchant.offersJson);
            const offer = offers.find((entry) => entry.id === params.offerId);
            if (offer) {
                offer.stock += quantity;
            }
            await tx.player.update({
                where: { id: params.playerId },
                data: { silver: { increment: reserve.totalCost } },
            });
            await tx.mysteryMerchant.update({
                where: { id: merchant.id },
                data: {
                    offersJson: serializeOffers(offers),
                },
            });
        });
        clearMerchantSnapshotCache();
        return {
            success: false,
            message: deliveryError || 'No hubo espacio en la mochila. Se devolvio tu plata.',
        };
    }
    return {
        success: true,
        message: `✅ Compraste ${reservedOffer.emoji} ${reservedOffer.name} x${quantity} por ${reserve.totalCost} 🪙.`,
    };
}
