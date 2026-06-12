// @ts-nocheck
import { prisma } from '../lib/db.js';
import { getBankDepositFeeSilverByValue, toSilverValue } from '../data/price-index.js';
import { EMOJIS } from '../data/emojis.js';
import { VAULT_PROFILE_CONFIG, slotInclude, getActiveBag, getAllFreeSlotIndexes, getFirstFreeSlotIndex, hasAnyItem, getSlotDisplay, getSlotWeightKg, getUsedBagStats, loadEquippedToolIds, mapSlotsToEntries, ensureBankRow, ensureVaultContainer, toSafeInt, } from './crown-bank-core.js';
export async function getVaultBalance(playerId, db = prisma) {
    await ensureBankRow(playerId, db);
    const row = await db.playerBankAccount.findUnique({
        where: { playerId },
        select: { silver: true, gold: true },
    });
    return {
        silver: toSafeInt(row?.silver),
        gold: toSafeInt(row?.gold),
    };
}
export async function getBankSummary(playerId) {
    const [player, vault] = await Promise.all([
        prisma.player.findUnique({
            where: { id: playerId },
            select: { silver: true, gold: true },
        }),
        getVaultBalance(playerId),
    ]);
    const carried = {
        silver: toSafeInt(player?.silver),
        gold: toSafeInt(player?.gold),
    };
    return {
        carried,
        vault,
        total: {
            silver: carried.silver + vault.silver,
            gold: carried.gold + vault.gold,
        },
    };
}
export function calculateDepositFeeSilver(currency, amount) {
    const safeAmount = Math.max(0, Math.floor(amount));
    const silverValue = toSilverValue(currency, safeAmount);
    return getBankDepositFeeSilverByValue(silverValue);
}
export async function getVaultOverview(playerId, profile = 'crown') {
    const [summary, vaultBag] = await Promise.all([getBankSummary(playerId), ensureVaultContainer(playerId, profile)]);
    const entries = mapSlotsToEntries(vaultBag.slots);
    const objectUnits = entries.reduce((sum, entry) => sum + entry.quantity, 0);
    const marketValueSilver = entries.reduce((sum, entry) => sum + entry.marketValueSilver, 0);
    return {
        usedSlots: entries.length,
        totalSlots: vaultBag.definition.slotCapacity,
        objectStacks: entries.length,
        objectUnits,
        marketValueSilver,
        summary,
    };
}
export async function listVaultMoveEntries(playerId, direction, profile = 'crown') {
    const [overview, activeBag, vaultBag, equippedToolIds] = await Promise.all([
        getVaultOverview(playerId, profile),
        getActiveBag(playerId),
        ensureVaultContainer(playerId, profile),
        loadEquippedToolIds(playerId),
    ]);
    if (!activeBag) {
        return { entries: [], overview };
    }
    const sourceSlots = direction === 'bag_to_vault'
        ? activeBag.slots.filter((slot) => !(slot.playerToolId && equippedToolIds.has(slot.playerToolId)))
        : vaultBag.slots;
    return {
        entries: mapSlotsToEntries(sourceSlots),
        overview,
    };
}
export async function moveVaultObject(playerId, direction, slotUid, quantity, profile = 'crown') {
    const profileConfig = VAULT_PROFILE_CONFIG[profile];
    return prisma.$transaction(async (tx) => {
        const [activeBag, vaultBag, equippedToolIds] = await Promise.all([
            getActiveBag(playerId, tx),
            ensureVaultContainer(playerId, profile, tx),
            loadEquippedToolIds(playerId, tx),
        ]);
        if (!activeBag) {
            return { success: false, message: 'No tienes una mochila activa.' };
        }
        const sourceBag = direction === 'bag_to_vault' ? activeBag : vaultBag;
        const targetBag = direction === 'bag_to_vault' ? vaultBag : activeBag;
        const sourceSlot = await tx.playerBagSlot.findFirst({
            where: {
                id: slotUid,
                bagId: sourceBag.id,
            },
            include: slotInclude,
        });
        if (!sourceSlot || !hasAnyItem(sourceSlot)) {
            return { success: false, message: 'Ese objeto ya no está disponible.' };
        }
        if (direction === 'bag_to_vault' && sourceSlot.playerToolId && equippedToolIds.has(sourceSlot.playerToolId)) {
            return { success: false, message: 'No puedes mover una herramienta equipada.' };
        }
        if (sourceSlot.resource) {
            const targetAllowsStack = targetBag.definition.allowResourceStack;
            const targetMaxStack = targetBag.definition.maxResourceStack > 0 ? targetBag.definition.maxResourceStack : 99;
            const requestedQty = Math.max(1, Math.floor(quantity ?? sourceSlot.quantity));
            const moveQty = Math.min(sourceSlot.quantity, requestedQty);
            if (direction === 'vault_to_bag') {
                const currentUsage = getUsedBagStats(activeBag, equippedToolIds);
                const incomingWeight = sourceSlot.resource.weightKg * moveQty;
                if (currentUsage.usedWeightKg + incomingWeight > activeBag.definition.weightCapacityKg + 0.001) {
                    return {
                        success: false,
                        message: `No cabe por peso (${(currentUsage.usedWeightKg + incomingWeight).toFixed(1)}/${activeBag.definition.weightCapacityKg.toFixed(1)} kg).`,
                    };
                }
            }
            const targetResourceSlots = await tx.playerBagSlot.findMany({
                where: {
                    bagId: targetBag.id,
                    resourceId: sourceSlot.resourceId ?? undefined,
                },
                include: slotInclude,
                orderBy: { slotIndex: 'asc' },
            });
            let remaining = moveQty;
            if (targetAllowsStack) {
                for (const targetSlot of targetResourceSlots) {
                    if (remaining <= 0) {
                        break;
                    }
                    const freeCap = Math.max(0, targetMaxStack - targetSlot.quantity);
                    if (freeCap <= 0) {
                        continue;
                    }
                    const addQty = Math.min(remaining, freeCap);
                    await tx.playerBagSlot.update({
                        where: { id: targetSlot.id },
                        data: { quantity: { increment: addQty } },
                    });
                    remaining -= addQty;
                }
            }
            if (remaining > 0) {
                const targetSlots = await tx.playerBagSlot.findMany({
                    where: { bagId: targetBag.id },
                    select: { slotIndex: true },
                });
                const freeIndexes = getAllFreeSlotIndexes(targetSlots, targetBag.definition.slotCapacity);
                const perSlotMax = targetAllowsStack ? targetMaxStack : 1;
                const slotsNeeded = Math.ceil(remaining / perSlotMax);
                if (freeIndexes.length < slotsNeeded) {
                    return {
                        success: false,
                        message: direction === 'bag_to_vault'
                            ? `El ${profileConfig.shortLabel} no tiene espacio suficiente (${targetSlots.length}/${targetBag.definition.slotCapacity}).`
                            : `Tu mochila no tiene slots suficientes (${targetSlots.length}/${targetBag.definition.slotCapacity}).`,
                    };
                }
                let idx = 0;
                while (remaining > 0) {
                    const chunk = Math.min(remaining, perSlotMax);
                    await tx.playerBagSlot.create({
                        data: {
                            bagId: targetBag.id,
                            slotIndex: freeIndexes[idx],
                            resourceId: sourceSlot.resourceId ?? undefined,
                            quantity: chunk,
                        },
                    });
                    remaining -= chunk;
                    idx += 1;
                }
            }
            if (moveQty >= sourceSlot.quantity) {
                await tx.playerBagSlot.delete({ where: { id: sourceSlot.id } });
            }
            else {
                await tx.playerBagSlot.update({
                    where: { id: sourceSlot.id },
                    data: { quantity: { decrement: moveQty } },
                });
            }
            const itemLabel = `${sourceSlot.resource.emoji} ${sourceSlot.resource.name} x${moveQty}`;
            return {
                success: true,
                message: direction === 'bag_to_vault'
                    ? `📦 Enviado a ${profileConfig.shortLabel}: ${itemLabel}.`
                    : `${EMOJIS.ui.bag} Enviado a mochila: ${itemLabel}.`,
            };
        }
        if (direction === 'vault_to_bag') {
            const currentUsage = getUsedBagStats(activeBag, equippedToolIds);
            if (currentUsage.usedSlots + 1 > activeBag.definition.slotCapacity) {
                return {
                    success: false,
                    message: `No hay slots libres en tu mochila (${currentUsage.usedSlots}/${activeBag.definition.slotCapacity}).`,
                };
            }
            const incomingWeight = getSlotWeightKg(sourceSlot);
            if (currentUsage.usedWeightKg + incomingWeight > activeBag.definition.weightCapacityKg + 0.001) {
                return {
                    success: false,
                    message: `No cabe por peso (${(currentUsage.usedWeightKg + incomingWeight).toFixed(1)}/${activeBag.definition.weightCapacityKg.toFixed(1)} kg).`,
                };
            }
        }
        const targetSlots = await tx.playerBagSlot.findMany({
            where: { bagId: targetBag.id },
            select: { slotIndex: true },
        });
        const nextSlot = getFirstFreeSlotIndex(targetSlots, targetBag.definition.slotCapacity);
        if (!nextSlot) {
            return {
                success: false,
                message: direction === 'bag_to_vault'
                    ? `El ${profileConfig.shortLabel} está lleno (${targetSlots.length}/${targetBag.definition.slotCapacity}).`
                    : `Tu mochila está llena (${targetSlots.length}/${targetBag.definition.slotCapacity}).`,
            };
        }
        await tx.playerBagSlot.update({
            where: { id: sourceSlot.id },
            data: {
                bagId: targetBag.id,
                slotIndex: nextSlot,
            },
        });
        const display = getSlotDisplay(sourceSlot);
        const itemLabel = display ? `${display.emoji} ${display.name}${display.quantity > 1 ? ` x${display.quantity}` : ''}` : 'Objeto';
        return {
            success: true,
            message: direction === 'bag_to_vault'
                ? `📦 Enviado a ${profileConfig.shortLabel}: ${itemLabel}.`
                : `${EMOJIS.ui.bag} Enviado a mochila: ${itemLabel}.`,
        };
    });
}
export async function depositToVault(playerId, currency, amount) {
    const qty = Math.max(0, Math.floor(amount));
    if (qty < 1) {
        return { success: false, message: 'Cantidad invalida.' };
    }
    return prisma.$transaction(async (tx) => {
        await ensureBankRow(playerId, tx);
        const player = await tx.player.findUnique({
            where: { id: playerId },
            select: { silver: true, gold: true },
        });
        if (!player) {
            return { success: false, message: 'No pude encontrar al jugador.' };
        }
        const current = currency === 'SILVER' ? player.silver : player.gold;
        if (current < qty) {
            return { success: false, message: `No tienes suficiente ${currency === 'SILVER' ? 'plata' : 'oro'}.` };
        }
        if (currency === 'SILVER') {
            await tx.player.update({
                where: { id: playerId },
                data: { silver: { decrement: qty } },
            });
            await tx.playerBankAccount.update({
                where: { playerId },
                data: { silver: { increment: qty } },
            });
        }
        else {
            await tx.player.update({
                where: { id: playerId },
                data: { gold: { decrement: qty } },
            });
            await tx.playerBankAccount.update({
                where: { playerId },
                data: { gold: { increment: qty } },
            });
        }
        const summary = await getBankSummary(playerId);
        return {
            success: true,
            message: `Depositaste ${qty} ${currency === 'SILVER' ? 'plata' : 'oro'} en la camara.`,
            summary,
        };
    });
}
export async function depositToVaultWithFee(playerId, currency, amount) {
    const qty = Math.max(0, Math.floor(amount));
    if (qty < 1) {
        return { success: false, message: 'Cantidad invalida.' };
    }
    const feeSilver = calculateDepositFeeSilver(currency, qty);
    return prisma.$transaction(async (tx) => {
        await ensureBankRow(playerId, tx);
        const player = await tx.player.findUnique({
            where: { id: playerId },
            select: { silver: true, gold: true },
        });
        if (!player) {
            return { success: false, message: 'No pude encontrar al jugador.' };
        }
        if (currency === 'SILVER') {
            const totalSilverNeeded = qty + feeSilver;
            if (player.silver < totalSilverNeeded) {
                return {
                    success: false,
                    message: `Necesitas ${totalSilverNeeded} plata (${qty} + fee ${feeSilver}).`,
                };
            }
            await tx.player.update({
                where: { id: playerId },
                data: { silver: { decrement: totalSilverNeeded } },
            });
            await tx.playerBankAccount.update({
                where: { playerId },
                data: { silver: { increment: qty } },
            });
        }
        else {
            if (player.gold < qty) {
                return { success: false, message: `No tienes suficiente oro (${qty}).` };
            }
            if (player.silver < feeSilver) {
                return {
                    success: false,
                    message: `Necesitas ${feeSilver} plata para pagar la tarifa del deposito.`,
                };
            }
            await tx.player.update({
                where: { id: playerId },
                data: {
                    gold: { decrement: qty },
                    silver: { decrement: feeSilver },
                },
            });
            await tx.playerBankAccount.update({
                where: { playerId },
                data: { gold: { increment: qty } },
            });
        }
        const summary = await getBankSummary(playerId);
        return {
            success: true,
            message: `Deposito completado. Fee aplicado: ${feeSilver} plata.`,
            summary,
            feeSilver,
        };
    });
}
export async function withdrawFromVault(playerId, currency, amount) {
    const qty = Math.max(0, Math.floor(amount));
    if (qty < 1) {
        return { success: false, message: 'Cantidad invalida.' };
    }
    return prisma.$transaction(async (tx) => {
        await ensureBankRow(playerId, tx);
        const vault = await getVaultBalance(playerId, tx);
        const current = currency === 'SILVER' ? vault.silver : vault.gold;
        if (current < qty) {
            return { success: false, message: `No tienes suficiente ${currency === 'SILVER' ? 'plata' : 'oro'} en la camara.` };
        }
        if (currency === 'SILVER') {
            await tx.playerBankAccount.update({
                where: { playerId },
                data: { silver: { decrement: qty } },
            });
            await tx.player.update({
                where: { id: playerId },
                data: { silver: { increment: qty } },
            });
        }
        else {
            await tx.playerBankAccount.update({
                where: { playerId },
                data: { gold: { decrement: qty } },
            });
            await tx.player.update({
                where: { id: playerId },
                data: { gold: { increment: qty } },
            });
        }
        const summary = await getBankSummary(playerId);
        return {
            success: true,
            message: `Retiraste ${qty} ${currency === 'SILVER' ? 'plata' : 'oro'} de la camara.`,
            summary,
        };
    });
}
