import { InlineKeyboard } from 'grammy';
import { EMOJIS } from '../data/emojis.js';
import { EQUIPMENT_SLOT_LABELS } from '../data/equipment.js';
import { prisma } from '../lib/db.js';
import { compactLabel } from '../lib/ui-compact.js';
import { t } from '../lib/i18n.js';
import { addGroundLootEntry } from '../lib/tile-state.js';
import { getOrCreateTile } from './map.js';
import { mutateTileResourceState } from './tile-state-store.js';
import { getCanonicalWorldMap } from './world-map.js';
import { getEffectiveStackLimit, getRarityCode, getToolMeta, getToolWeight, toStrikeText, } from './bags-utils.js';
import { ACTIVE_STATUS, POCKETS_SLUG, STORED_STATUS, bagInclude, } from './bags-types.js';
export function actionToEquipSlot(action) {
    if (action === 'mine')
        return 'mineToolId';
    if (action === 'chop')
        return 'chopToolId';
    return 'gatherToolId';
}
export function getEquippedToolIdsFromEquipment(equipment) {
    return new Set([equipment?.chopToolId, equipment?.mineToolId, equipment?.gatherToolId].filter((value) => typeof value === 'number'));
}
export async function loadEquippedToolIds(playerId, tx = prisma) {
    const equipment = await tx.playerEquipment.findUnique({
        where: { playerId },
    });
    return getEquippedToolIdsFromEquipment(equipment);
}
export function getSlotWeightKg(slot) {
    if (slot.resource)
        return slot.resource.weightKg * slot.quantity;
    if (slot.storedBag?.definition)
        return slot.storedBag.definition.itemWeightKg;
    if (slot.equipmentInstance?.template)
        return slot.equipmentInstance.template.weightKg;
    const toolKey = slot.playerTool?.toolKey || slot.toolKey;
    if (toolKey)
        return getToolWeight(toolKey);
    return 0;
}
export function shouldCountSlotInBagUsage(slot, equippedToolIds) {
    if (slot.playerToolId && equippedToolIds.has(slot.playerToolId)) {
        return false;
    }
    return true;
}
export function buildBagUsage(bag, equippedToolIds = new Set()) {
    const countedSlots = bag.slots.filter((slot) => shouldCountSlotInBagUsage(slot, equippedToolIds));
    return {
        usedSlots: countedSlots.length,
        totalSlots: bag.definition.slotCapacity,
        usedWeightKg: Number(countedSlots.reduce((sum, slot) => sum + getSlotWeightKg(slot), 0).toFixed(2)),
        totalWeightKg: bag.definition.weightCapacityKg,
    };
}
export function buildSlotView(slot, equippedToolIds) {
    if (slot.resource) {
        return {
            slotUid: slot.id,
            slotIndex: slot.slotIndex,
            rarityCode: getRarityCode(slot.resource.rarity),
            emoji: slot.resource.emoji,
            label: slot.resource.name,
            quantity: slot.quantity,
            kind: 'resource',
            usable: slot.resource.usable,
        };
    }
    if (slot.storedBag?.definition) {
        return {
            slotUid: slot.id,
            slotIndex: slot.slotIndex,
            rarityCode: 'C',
            emoji: slot.storedBag.definition.emoji,
            label: slot.storedBag.definition.displayName,
            kind: 'storedBag',
            usable: false,
        };
    }
    if (slot.equipmentInstance?.template) {
        const template = slot.equipmentInstance.template;
        const suffix = template.slot && template.slot in EQUIPMENT_SLOT_LABELS ? ` [${EQUIPMENT_SLOT_LABELS[template.slot]}]` : '';
        return {
            slotUid: slot.id,
            slotIndex: slot.slotIndex,
            rarityCode: getRarityCode(slot.equipmentInstance.rarity),
            emoji: template.emoji,
            label: `${template.shortName || template.name}${suffix}`,
            quantity: 1,
            kind: 'equipment',
            usable: false,
            equipmentInstanceId: slot.equipmentInstance.id,
            durability: slot.equipmentInstance.durability,
            maxDurability: slot.equipmentInstance.maxDurability,
            isBroken: slot.equipmentInstance.isBroken,
        };
    }
    const toolKey = slot.playerTool?.toolKey || slot.toolKey;
    const tool = getToolMeta(toolKey);
    if (!tool)
        return null;
    const isEquipped = !!slot.playerTool?.id && equippedToolIds.has(slot.playerTool.id);
    const isBroken = slot.playerTool?.isBroken ?? false;
    const displayLabel = isBroken ? toStrikeText(tool.name) : tool.name;
    return {
        slotUid: slot.id,
        slotIndex: slot.slotIndex,
        rarityCode: getRarityCode(slot.playerTool?.rarity || tool.rarity),
        emoji: isEquipped ? '🟢' : tool.emoji,
        label: displayLabel,
        quantity: 1,
        kind: 'tool',
        usable: false,
        toolKey: tool.id,
        playerToolId: slot.playerTool?.id,
        durability: slot.playerTool?.durability,
        maxDurability: slot.playerTool?.maxDurability,
        isEquipped,
        isBroken,
    };
}
export function formatUsageLine(usage, lang) {
    return `${t(lang, 'bagSlots')} ${usage.usedSlots}/${usage.totalSlots}   ${EMOJIS.ui.weight} ${usage.usedWeightKg.toFixed(1)}/${usage.totalWeightKg.toFixed(1)} kg`;
}
export function buildBagKeyboard(slotViews, switchOptions, lang) {
    const keyboard = new InlineKeyboard();
    let hasButtons = false;
    if (slotViews.some((slot) => slot.usable)) {
        keyboard.text(`${EMOJIS.ui.grab} ${t(lang, 'bagGrab')}`, 'bag_grab');
        hasButtons = true;
    }
    if (slotViews.length > 0) {
        keyboard.text(`${EMOJIS.ui.drop} ${t(lang, 'bagDrop')}`, 'bag_drop');
        hasButtons = true;
    }
    if (switchOptions.length > 0) {
        keyboard.text(`${EMOJIS.ui.switch} ${t(lang, 'bagSwitch')}`, 'bag_switch');
        hasButtons = true;
    }
    keyboard.row().text(`${EMOJIS.ui.map} ${t(lang, 'inspectViewMap')}`, 'bag_map');
    hasButtons = true;
    return hasButtons ? keyboard : undefined;
}
export async function findBagDefinitionBySlug(slug) {
    return prisma.bagDefinition.findUnique({ where: { slug } });
}
export async function getPocketDefinition() {
    return findBagDefinitionBySlug(POCKETS_SLUG);
}
export async function getActiveBagRecord(playerId, tx = prisma) {
    return tx.playerBag.findFirst({
        where: { playerId, status: ACTIVE_STATUS },
        include: bagInclude,
    });
}
export async function getPocketBagRecord(playerId, tx = prisma) {
    return tx.playerBag.findFirst({
        where: {
            playerId,
            definition: { isPocket: true },
        },
        include: bagInclude,
    });
}
export async function getBagByIdForPlayer(playerId, bagId, tx = prisma) {
    return tx.playerBag.findFirst({
        where: { id: bagId, playerId },
        include: bagInclude,
    });
}
export async function ensurePlayerEquipment(playerId, tx = prisma) {
    const existing = await tx.playerEquipment.findUnique({
        where: { playerId },
    });
    if (existing)
        return existing;
    return tx.playerEquipment.create({
        data: { playerId },
    });
}
export async function ensureLegacyToolInstances(playerId, tx = prisma) {
    const legacyToolSlots = await tx.playerBagSlot.findMany({
        where: {
            bag: { playerId },
            toolKey: { not: null },
            playerToolId: null,
        },
    });
    for (const slot of legacyToolSlots) {
        if (!slot.toolKey)
            continue;
        const meta = getToolMeta(slot.toolKey);
        if (!meta)
            continue;
        const playerTool = await tx.playerTool.create({
            data: {
                playerId,
                toolKey: meta.id,
                rarity: meta.rarity,
                durability: meta.durabilityMax,
                maxDurability: meta.durabilityMax,
                isBroken: false,
            },
        });
        await tx.playerBagSlot.update({
            where: { id: slot.id },
            data: { playerToolId: playerTool.id },
        });
    }
}
export function buildCapacityReason(weightExceeded, slotExceeded, details) {
    if (weightExceeded && slotExceeded) {
        return `No cabe: superarías el peso (${details.weightNeeded.toFixed(1)}/${details.weightCapacity.toFixed(1)} kg) y los slots (${details.slotsNeeded}/${details.slotCapacity}).`;
    }
    if (weightExceeded) {
        return `No cabe: superarías el peso (${details.weightNeeded.toFixed(1)}/${details.weightCapacity.toFixed(1)} kg).`;
    }
    return `No cabe: superarías los slots (${details.slotsNeeded}/${details.slotCapacity}).`;
}
export function buildEmptyBagTransferPlan(definition, items) {
    const groupedResources = new Map();
    const blueprint = [];
    for (const item of items) {
        if (item.kind === 'resource') {
            const existing = groupedResources.get(item.resource.id);
            if (existing) {
                existing.quantity += item.quantity;
            }
            else {
                groupedResources.set(item.resource.id, { resource: item.resource, quantity: item.quantity });
            }
            continue;
        }
        if (item.kind === 'storedBag') {
            blueprint.push({
                kind: 'storedBag',
                storedBagId: item.bag.id,
                weightKg: item.bag.definition.itemWeightKg,
            });
            continue;
        }
        if (item.kind === 'equipment') {
            blueprint.push({
                kind: 'equipment',
                equipmentInstanceId: item.equipment.id,
                weightKg: item.equipment.template.weightKg,
            });
            continue;
        }
        blueprint.push({
            kind: 'tool',
            toolKey: item.toolKey,
            playerToolId: item.playerToolId,
            weightKg: getToolWeight(item.toolKey),
        });
    }
    for (const { resource, quantity } of groupedResources.values()) {
        const stackLimit = getEffectiveStackLimit(definition, resource);
        let remaining = quantity;
        while (remaining > 0) {
            const chunk = Math.min(stackLimit, remaining);
            blueprint.push({
                kind: 'resource',
                resourceId: resource.id,
                quantity: chunk,
                weightKg: resource.weightKg * chunk,
            });
            remaining -= chunk;
        }
    }
    const totalWeightKg = Number(blueprint.reduce((sum, entry) => sum + entry.weightKg, 0).toFixed(2));
    return {
        slotsNeeded: blueprint.length,
        totalWeightKg,
        blueprint,
    };
}
export async function unequipToolIfEquipped(tx, playerId, playerToolId) {
    const equipment = await tx.playerEquipment.findUnique({
        where: { playerId },
    });
    if (!equipment)
        return;
    const updateData = {};
    if (equipment.chopToolId === playerToolId)
        updateData.chopTool = { disconnect: true };
    if (equipment.mineToolId === playerToolId)
        updateData.mineTool = { disconnect: true };
    if (equipment.gatherToolId === playerToolId)
        updateData.gatherTool = { disconnect: true };
    if (Object.keys(updateData).length === 0)
        return;
    await tx.playerEquipment.update({
        where: { playerId },
        data: updateData,
    });
}
export async function persistDroppedLootAtPlayerTile(playerId, payload) {
    const [player, worldMap] = await Promise.all([
        prisma.player.findUnique({ where: { id: playerId } }),
        getCanonicalWorldMap(),
    ]);
    if (!player)
        return false;
    const tile = await getOrCreateTile(worldMap.id, player.mapX, player.mapY);
    const write = await mutateTileResourceState(tile.id, (state) => {
        const updated = addGroundLootEntry(state, {
            kind: payload.kind,
            emoji: payload.emoji,
            name: payload.name,
            quantity: payload.quantity,
            resourceName: payload.kind === 'resource' ? payload.resourceName : undefined,
            resourceId: payload.kind === 'resource' ? payload.resourceId : undefined,
            playerToolId: payload.kind === 'tool' ? payload.playerToolId : undefined,
            toolKey: payload.kind === 'tool' ? payload.toolKey : undefined,
            equipmentInstanceId: payload.kind === 'equipment' ? payload.equipmentInstanceId : undefined,
            templateKey: payload.kind === 'equipment' ? payload.templateKey : undefined,
            bagSlug: payload.kind === 'bag' ? payload.bagSlug : undefined,
            droppedByPlayerId: playerId,
        });
        return {
            nextState: updated.state,
            result: true,
        };
    });
    return write.ok;
}
export async function loadSwitchBags(playerId, targetId, tx = prisma) {
    const sourceBag = await tx.playerBag.findFirst({
        where: { playerId, status: ACTIVE_STATUS },
        include: bagInclude,
    });
    if (!sourceBag) {
        return { sourceBag: null, targetBag: null };
    }
    const targetBag = targetId === 'pockets'
        ? await tx.playerBag.findFirst({
            where: {
                playerId,
                definition: { isPocket: true },
            },
            include: bagInclude,
        })
        : await tx.playerBag.findFirst({
            where: { id: targetId, playerId },
            include: bagInclude,
        });
    return { sourceBag, targetBag };
}
export function buildTransferItemsForSwitch(sourceBag, targetBagId) {
    const items = [];
    for (const slot of sourceBag.slots) {
        if (typeof targetBagId === 'number' && slot.storedBagId === targetBagId) {
            continue;
        }
        if (slot.resource) {
            items.push({ kind: 'resource', resource: slot.resource, quantity: slot.quantity });
            continue;
        }
        if (slot.storedBag?.definition) {
            items.push({ kind: 'storedBag', bag: slot.storedBag });
            continue;
        }
        if (slot.equipmentInstance?.template) {
            items.push({ kind: 'equipment', equipment: slot.equipmentInstance });
            continue;
        }
        const toolKey = slot.playerTool?.toolKey || slot.toolKey;
        if (toolKey) {
            items.push({ kind: 'tool', toolKey, playerToolId: slot.playerToolId });
        }
    }
    if (!sourceBag.definition.isPocket) {
        items.push({
            kind: 'storedBag',
            bag: {
                id: sourceBag.id,
                playerId: sourceBag.playerId,
                bagDefinitionId: sourceBag.bagDefinitionId,
                status: STORED_STATUS,
                createdAt: sourceBag.createdAt,
                updatedAt: sourceBag.updatedAt,
                definition: sourceBag.definition,
            },
        });
    }
    return items;
}
export function buildToolAliasMap(slotViews) {
    const toolAliasMap = {};
    for (const slot of slotViews) {
        if (slot.kind !== 'tool')
            continue;
        if (slot.isBroken || slot.isEquipped)
            continue;
        if (slot.playerToolId) {
            slot.equipAlias = `/eq_${slot.playerToolId}`;
            toolAliasMap[slot.playerToolId] = slot.equipAlias;
        }
    }
    return toolAliasMap;
}
export function formatBagTitle(bag) {
    return `${bag.definition.emoji} ${compactLabel(bag.definition.displayName, 18)} ${bag.definition.quickCommand || '/bag'}`.trim();
}
export function buildBagText(bag, usage, slotViews, lang) {
    const title = formatBagTitle(bag);
    const lines = [title, formatUsageLine(usage, lang), '┌────────┐'];
    if (slotViews.length === 0) {
        lines.push(t(lang, 'bagEmpty'));
    }
    else {
        for (const slot of slotViews) {
            const slotId = `#${String(slot.slotIndex).padStart(2, '0')}`;
            const slotAlias = slot.slotIndex >= 100 ? String(slot.slotIndex) : String(slot.slotIndex).padStart(2, '0');
            const infoAlias = `/i_${slotAlias}`;
            if (slot.kind === 'tool' || slot.kind === 'equipment') {
                lines.push(`${slotId} (${slot.rarityCode}) ${slot.emoji} ${compactLabel(slot.label, 14)}  ${infoAlias}`);
            }
            else {
                const quantityText = typeof slot.quantity === 'number' ? ` x${slot.quantity}` : '';
                lines.push(`${slotId} (${slot.rarityCode}) ${slot.emoji} ${compactLabel(slot.label, 14)}${quantityText}  ${infoAlias}`);
            }
        }
    }
    return lines.join('\n').trim();
}
