// @ts-nocheck
import { compactLabel } from '../lib/ui-compact.js';
import { addGroundLootEntry, applyHarvestCooldown, takeGroundLootQuantity, } from '../lib/tile-state.js';
import { mutateTileResourceState } from './tile-state-store.js';
import { pickupDroppedBag, pickupDroppedEquipment, pickupDroppedTool, storeGatheredItems } from './bags.js';
import { randomInt } from './inspect-utils.js';
import { saveTileState } from './inspect-state.js';
export function rollNodeLoot(yields, repeats) {
    const loot = new Map();
    for (let i = 0; i < repeats; i += 1) {
        for (const entry of yields) {
            const roll = Math.random() * 100;
            if (roll > entry.chance) {
                continue;
            }
            const qty = randomInt(entry.minQty, entry.maxQty);
            const existing = loot.get(entry.resource);
            if (existing) {
                existing.quantity += qty;
            }
            else {
                loot.set(entry.resource, {
                    item: entry.resource,
                    emoji: entry.emoji,
                    quantity: qty,
                });
            }
        }
    }
    return Array.from(loot.values());
}
export function applyLootMultiplier(loot, multiplier) {
    if (!Number.isFinite(multiplier) || Math.abs(multiplier - 1) < 0.0001) {
        return loot;
    }
    return loot
        .map((entry) => {
        const scaled = Math.max(0, entry.quantity * multiplier);
        const whole = Math.floor(scaled);
        const fractional = scaled - whole;
        const qty = whole + (Math.random() < fractional ? 1 : 0);
        return {
            ...entry,
            quantity: qty,
        };
    })
        .filter((entry) => entry.quantity > 0);
}
export async function applyNodeHarvest(tileId, nodeId, quantityUsed) {
    const write = await mutateTileResourceState(tileId, (state) => {
        let recoveredInMs = 0;
        const nextNodes = state.nodes.map((node) => {
            if (node.nodeId !== nodeId) {
                return node;
            }
            const result = applyHarvestCooldown(node, quantityUsed);
            recoveredInMs = result.recoveredInMs;
            return result.updatedNode;
        });
        return {
            nextState: {
                ...state,
                nodes: nextNodes,
            },
            result: recoveredInMs,
        };
    });
    return { recoveredInMs: write.result ?? 0 };
}
export async function restoreTakenGroundLoot(tileId, loot) {
    await saveTileState(tileId, (state) => addGroundLootEntry(state, {
        kind: loot.kind,
        emoji: loot.emoji,
        name: loot.name,
        quantity: loot.quantity,
        resourceName: loot.resourceName,
        resourceId: loot.resourceId,
        toolKey: loot.toolKey,
        playerToolId: loot.playerToolId,
        equipmentInstanceId: loot.equipmentInstanceId,
        templateKey: loot.templateKey,
        bagSlug: loot.bagSlug,
        droppedByPlayerId: loot.droppedByPlayerId,
    }).state);
}
export async function executeGroundLootPickup(params) {
    if (!params.selected.groundLootId) {
        return { success: false, message: 'Ese loot no es valido.' };
    }
    const pulled = await mutateTileResourceState(params.tileId, (state) => {
        const taken = takeGroundLootQuantity(state, params.selected.groundLootId, params.quantity);
        return {
            nextState: taken.state,
            result: taken.taken,
        };
    });
    if (!pulled.ok) {
        return { success: false, message: 'No pude actualizar el tile ahora mismo. Intenta de nuevo.' };
    }
    if (!pulled.result) {
        return { success: false, message: 'Ese loot ya no esta disponible.' };
    }
    const taken = pulled.result;
    if (taken.kind === 'resource') {
        const storage = await storeGatheredItems(params.playerId, [
            {
                item: taken.resourceName || taken.name,
                emoji: taken.emoji,
                quantity: taken.quantity,
            },
        ]);
        const storedQty = storage.stored.reduce((sum, item) => sum + item.quantity, 0);
        const rejectedQty = storage.rejected.reduce((sum, item) => sum + item.quantity, 0);
        if (rejectedQty > 0) {
            await restoreTakenGroundLoot(params.tileId, {
                ...taken,
                quantity: rejectedQty,
            });
        }
        if (storedQty <= 0) {
            return { success: false, message: 'No hubo espacio en tu bolsa. El loot sigue en el suelo.' };
        }
        return {
            success: true,
            message: `Recogiste ${taken.emoji} ${compactLabel(taken.name, 16)} x${storedQty}.`,
            tileId: params.tileId,
        };
    }
    if (taken.kind === 'tool') {
        const result = await pickupDroppedTool(params.playerId, {
            playerToolId: taken.playerToolId,
            toolKey: taken.toolKey,
            emoji: taken.emoji,
            name: taken.name,
        });
        if (!result.success) {
            await restoreTakenGroundLoot(params.tileId, taken);
            return { success: false, message: result.message };
        }
        return {
            success: true,
            message: result.message,
            tileId: params.tileId,
        };
    }
    if (taken.kind === 'bag') {
        const result = await pickupDroppedBag(params.playerId, taken.bagSlug);
        if (!result.success) {
            await restoreTakenGroundLoot(params.tileId, taken);
            return { success: false, message: result.message };
        }
        return {
            success: true,
            message: result.message,
            tileId: params.tileId,
        };
    }
    if (taken.kind === 'equipment') {
        const result = await pickupDroppedEquipment(params.playerId, {
            equipmentInstanceId: taken.equipmentInstanceId,
            templateKey: taken.templateKey,
            emoji: taken.emoji,
            name: taken.name,
        });
        if (!result.success) {
            await restoreTakenGroundLoot(params.tileId, taken);
            return { success: false, message: result.message };
        }
        return {
            success: true,
            message: result.message,
            tileId: params.tileId,
        };
    }
    await restoreTakenGroundLoot(params.tileId, taken);
    return { success: false, message: 'No pude recoger ese loot.' };
}
