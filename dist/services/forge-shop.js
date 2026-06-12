// @ts-nocheck
import { prisma } from '../lib/db.js';
import { TOOLS } from '../types/tools.js';
import { getResourceSellPrice, getStoredBagSellPrice, getToolSellPrice } from '../data/price-index.js';
const ACTIVE_STATUS = 'ACTIVE';
async function getSellableSlots(playerId, tx = prisma) {
    const [equipment, slots] = await Promise.all([
        tx.playerEquipment.findUnique({
            where: { playerId },
            select: {
                chopToolId: true,
                mineToolId: true,
                gatherToolId: true,
            },
        }),
        tx.playerBagSlot.findMany({
            where: {
                bag: {
                    playerId,
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
            orderBy: {
                slotIndex: 'asc',
            },
        }),
    ]);
    const equippedIds = new Set([equipment?.chopToolId, equipment?.mineToolId, equipment?.gatherToolId].filter((value) => typeof value === 'number'));
    return slots.filter((slot) => {
        if (slot.playerTool?.id && equippedIds.has(slot.playerTool.id)) {
            return false;
        }
        if (slot.storedBag?.slots.length) {
            return false;
        }
        return Boolean(slot.resource || slot.playerTool || slot.storedBag);
    });
}
function buildSellEntry(slot, index) {
    if (slot.resource) {
        const unitSilver = getResourceSellPrice(slot.resource.baseValue);
        return {
            listIndex: index + 1,
            slotUid: slot.id,
            slotIndex: slot.slotIndex,
            kind: 'resource',
            emoji: slot.resource.emoji,
            name: slot.resource.name,
            quantity: slot.quantity,
            unitSilver,
            totalSilver: unitSilver * slot.quantity,
        };
    }
    if (slot.playerTool) {
        const toolMeta = TOOLS[slot.playerTool.toolKey];
        const unitSilver = getToolSellPrice(toolMeta?.baseValue ?? 12, slot.playerTool.durability, slot.playerTool.maxDurability);
        return {
            listIndex: index + 1,
            slotUid: slot.id,
            slotIndex: slot.slotIndex,
            kind: 'tool',
            emoji: toolMeta?.emoji || '🛠',
            name: toolMeta?.name || slot.playerTool.toolKey,
            quantity: 1,
            unitSilver,
            totalSilver: unitSilver,
        };
    }
    if (slot.storedBag?.definition) {
        const unitSilver = getStoredBagSellPrice(slot.storedBag.definition.slotCapacity, slot.storedBag.definition.weightCapacityKg);
        return {
            listIndex: index + 1,
            slotUid: slot.id,
            slotIndex: slot.slotIndex,
            kind: 'bag',
            emoji: slot.storedBag.definition.emoji,
            name: slot.storedBag.definition.displayName,
            quantity: 1,
            unitSilver,
            totalSilver: unitSilver,
        };
    }
    return null;
}
export async function getForgeSellEntries(playerId) {
    const slots = await getSellableSlots(playerId);
    const entries = slots
        .map((slot, index) => buildSellEntry(slot, index))
        .filter((entry) => Boolean(entry));
    return entries;
}
async function sellSlot(params) {
    const slot = await params.tx.playerBagSlot.findFirst({
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
        return { ok: false, gained: 0, message: 'Ese articulo ya no esta disponible.' };
    }
    if (slot.resource) {
        const qty = Math.max(1, Math.min(params.quantity, slot.quantity));
        const unitSilver = getResourceSellPrice(slot.resource.baseValue);
        const gained = unitSilver * qty;
        if (qty >= slot.quantity) {
            await params.tx.playerBagSlot.delete({ where: { id: slot.id } });
        }
        else {
            await params.tx.playerBagSlot.update({
                where: { id: slot.id },
                data: { quantity: { decrement: qty } },
            });
        }
        await params.tx.player.update({
            where: { id: params.playerId },
            data: { silver: { increment: gained } },
        });
        return { ok: true, gained };
    }
    if (slot.playerTool) {
        const equipment = await params.tx.playerEquipment.findUnique({
            where: { playerId: params.playerId },
            select: { chopToolId: true, mineToolId: true, gatherToolId: true },
        });
        const equipped = new Set([equipment?.chopToolId, equipment?.mineToolId, equipment?.gatherToolId].filter((value) => typeof value === 'number'));
        if (equipped.has(slot.playerTool.id)) {
            return { ok: false, gained: 0, message: 'Esa herramienta esta equipada. Desequipala primero.' };
        }
        const toolMeta = TOOLS[slot.playerTool.toolKey];
        const gained = getToolSellPrice(toolMeta?.baseValue ?? 12, slot.playerTool.durability, slot.playerTool.maxDurability);
        await params.tx.playerBagSlot.delete({ where: { id: slot.id } });
        await params.tx.playerTool.delete({ where: { id: slot.playerTool.id } });
        await params.tx.player.update({
            where: { id: params.playerId },
            data: { silver: { increment: gained } },
        });
        return { ok: true, gained };
    }
    if (slot.storedBag?.definition) {
        if (slot.storedBag.slots.length > 0) {
            return { ok: false, gained: 0, message: 'No puedes vender una mochila que tiene items dentro.' };
        }
        const gained = getStoredBagSellPrice(slot.storedBag.definition.slotCapacity, slot.storedBag.definition.weightCapacityKg);
        await params.tx.playerBagSlot.delete({ where: { id: slot.id } });
        await params.tx.playerBag.delete({ where: { id: slot.storedBag.id } });
        await params.tx.player.update({
            where: { id: params.playerId },
            data: { silver: { increment: gained } },
        });
        return { ok: true, gained };
    }
    return { ok: false, gained: 0, message: 'Ese articulo no puede venderse.' };
}
export async function sellForgeEntry(playerId, slotUid, quantity) {
    const result = await prisma.$transaction(async (tx) => sellSlot({ tx, playerId, slotUid, quantity }));
    if (!result.ok) {
        return { success: false, message: result.message || 'No se pudo vender ese articulo.' };
    }
    return {
        success: true,
        message: `💰 Venta completada: +${result.gained} 🪙`,
        silverGained: result.gained,
    };
}
export async function sellAllForgeEntries(playerId) {
    return prisma.$transaction(async (tx) => {
        const entries = await getSellableSlots(playerId, tx);
        if (entries.length === 0) {
            return { success: false, message: 'No tienes articulos vendibles en la mochila activa.' };
        }
        let gainedTotal = 0;
        let soldCount = 0;
        for (const slot of entries) {
            const result = await sellSlot({
                tx,
                playerId,
                slotUid: slot.id,
                quantity: slot.resource ? slot.quantity : 1,
            });
            if (!result.ok) {
                continue;
            }
            gainedTotal += result.gained;
            soldCount += 1;
        }
        if (soldCount === 0) {
            return { success: false, message: 'No se pudo vender ningun articulo.' };
        }
        return {
            success: true,
            message: `💰 Venta total completada: ${soldCount} articulos vendidos (+${gainedTotal} 🪙).`,
            silverGained: gainedTotal,
        };
    });
}
//# sourceMappingURL=forge-shop.js.map