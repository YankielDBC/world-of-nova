// @ts-nocheck
import { prisma } from '../lib/db.js';
import { PRICE_INDEX, getStoredBagSellPrice } from '../data/price-index.js';
import { TOOLS } from '../types/tools.js';
export const ACTIVE_STATUS = 'ACTIVE';
export const VAULT_STATUS = 'VAULT';
export const VAULT_PROFILE_CONFIG = {
    crown: {
        bagSlug: 'vault_chamber',
        displayName: 'Boveda de la Corona',
        slotCapacity: PRICE_INDEX.bank.vaultSlotCapacity,
        shortLabel: 'boveda',
    },
    village: {
        bagSlug: 'village_chest',
        displayName: 'Baul del Pueblo',
        slotCapacity: 10,
        shortLabel: 'baul',
    },
};
export const slotInclude = {
    resource: true,
    playerTool: true,
    storedBag: {
        include: {
            definition: true,
            slots: {
                select: {
                    id: true,
                },
            },
        },
    },
};
export const bagInclude = {
    definition: true,
    slots: {
        include: slotInclude,
        orderBy: { slotIndex: 'asc' },
    },
};
export function toSafeInt(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.floor(value);
    }
    if (typeof value === 'bigint') {
        return Number(value);
    }
    if (typeof value === 'string') {
        const parsed = Number.parseInt(value, 10);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}
export function hasAnyItem(slot) {
    return Boolean(slot.resource || slot.playerTool || slot.storedBag);
}
export function getSlotWeightKg(slot) {
    if (slot.resource) {
        return slot.resource.weightKg * slot.quantity;
    }
    if (slot.storedBag?.definition) {
        return slot.storedBag.definition.itemWeightKg;
    }
    const toolKey = slot.playerTool?.toolKey || slot.toolKey;
    if (toolKey && TOOLS[toolKey]) {
        return TOOLS[toolKey].weightKg;
    }
    return 0;
}
export function getSlotMarketValueSilver(slot) {
    if (slot.resource) {
        return Math.max(1, Math.floor(slot.resource.baseValue * slot.quantity));
    }
    if (slot.playerTool) {
        const tool = TOOLS[slot.playerTool.toolKey];
        const baseValue = tool?.baseValue ?? 10;
        const durabilityFactor = slot.playerTool.maxDurability > 0
            ? Math.max(0.25, Math.min(1, slot.playerTool.durability / slot.playerTool.maxDurability))
            : 0.25;
        return Math.max(1, Math.floor(baseValue * durabilityFactor));
    }
    if (slot.storedBag?.definition) {
        return getStoredBagSellPrice(slot.storedBag.definition.slotCapacity, slot.storedBag.definition.weightCapacityKg);
    }
    return 0;
}
export function getSlotDisplay(slot) {
    if (slot.resource) {
        return {
            kind: 'resource',
            emoji: slot.resource.emoji,
            name: slot.resource.name,
            quantity: slot.quantity,
        };
    }
    if (slot.playerTool) {
        const tool = TOOLS[slot.playerTool.toolKey];
        return {
            kind: 'tool',
            emoji: tool?.emoji || '🛠',
            name: tool?.name || slot.playerTool.toolKey,
            quantity: 1,
        };
    }
    if (slot.storedBag?.definition) {
        return {
            kind: 'storedBag',
            emoji: slot.storedBag.definition.emoji,
            name: slot.storedBag.definition.displayName,
            quantity: 1,
        };
    }
    return null;
}
export function getFirstFreeSlotIndex(slots, totalSlots) {
    const taken = new Set(slots.map((slot) => slot.slotIndex));
    for (let idx = 1; idx <= totalSlots; idx += 1) {
        if (!taken.has(idx)) {
            return idx;
        }
    }
    return null;
}
export function getAllFreeSlotIndexes(slots, totalSlots) {
    const taken = new Set(slots.map((slot) => slot.slotIndex));
    const free = [];
    for (let idx = 1; idx <= totalSlots; idx += 1) {
        if (!taken.has(idx)) {
            free.push(idx);
        }
    }
    return free;
}
export async function ensureBankRow(playerId, db = prisma) {
    await db.playerBankAccount.upsert({
        where: { playerId },
        create: { playerId, silver: 0, gold: 0 },
        update: {},
    });
}
export async function ensureVaultContainer(playerId, profile = 'crown', db = prisma) {
    const profileConfig = VAULT_PROFILE_CONFIG[profile];
    const vaultStatus = `${VAULT_STATUS}_${profile.toUpperCase()}`;
    const definition = await db.bagDefinition.upsert({
        where: { slug: profileConfig.bagSlug },
        create: {
            slug: profileConfig.bagSlug,
            name: profile === 'village' ? 'Village Chest' : 'Crown Vault',
            displayName: profileConfig.displayName,
            emoji: profile === 'village' ? '🧰' : '🏦',
            quickCommand: profile === 'village' ? '/chest' : '/vault',
            description: profile === 'village'
                ? 'Baul compacto para guardar objetos durante la ruta.'
                : 'Contenedor seguro para objetos del banco real.',
            slotCapacity: profileConfig.slotCapacity,
            weightCapacityKg: 9999,
            itemWeightKg: 0.5,
            allowResourceStack: true,
            maxResourceStack: 999,
            isPocket: false,
        },
        update: {
            displayName: profileConfig.displayName,
            slotCapacity: profileConfig.slotCapacity,
            weightCapacityKg: 9999,
            itemWeightKg: 0.5,
            allowResourceStack: true,
            maxResourceStack: 999,
            isPocket: false,
        },
    });
    const existing = await db.playerBag.findFirst({
        where: {
            playerId,
            status: vaultStatus,
            bagDefinitionId: definition.id,
        },
        include: bagInclude,
    });
    if (existing) {
        return existing;
    }
    if (profile === 'crown') {
        const legacy = await db.playerBag.findFirst({
            where: {
                playerId,
                status: VAULT_STATUS,
                bagDefinitionId: definition.id,
            },
            include: bagInclude,
        });
        if (legacy) {
            return db.playerBag.update({
                where: { id: legacy.id },
                data: { status: vaultStatus },
                include: bagInclude,
            });
        }
    }
    return db.playerBag.create({
        data: {
            playerId,
            bagDefinitionId: definition.id,
            status: vaultStatus,
        },
        include: bagInclude,
    });
}
export async function getActiveBag(playerId, db = prisma) {
    return db.playerBag.findFirst({
        where: {
            playerId,
            status: ACTIVE_STATUS,
        },
        include: bagInclude,
    });
}
export async function loadEquippedToolIds(playerId, db = prisma) {
    const equipment = await db.playerEquipment.findUnique({
        where: { playerId },
        select: { chopToolId: true, mineToolId: true, gatherToolId: true },
    });
    return new Set([equipment?.chopToolId, equipment?.mineToolId, equipment?.gatherToolId].filter((value) => typeof value === 'number'));
}
export function getUsedBagStats(bag, equippedToolIds) {
    const countedSlots = bag.slots.filter((slot) => {
        if (!hasAnyItem(slot)) {
            return false;
        }
        if (slot.playerToolId && equippedToolIds.has(slot.playerToolId)) {
            return false;
        }
        return true;
    });
    return {
        usedSlots: countedSlots.length,
        usedWeightKg: Number(countedSlots.reduce((sum, slot) => sum + getSlotWeightKg(slot), 0).toFixed(2)),
    };
}
export function mapSlotsToEntries(slots) {
    const entries = slots
        .filter(hasAnyItem)
        .map((slot) => {
        const display = getSlotDisplay(slot);
        if (!display) {
            return null;
        }
        return {
            slotUid: slot.id,
            slotIndex: slot.slotIndex,
            kind: display.kind,
            emoji: display.emoji,
            name: display.name,
            quantity: display.quantity,
            marketValueSilver: getSlotMarketValueSilver(slot),
        };
    })
        .filter((entry) => Boolean(entry));
    return entries.map((entry, index) => ({
        ...entry,
        listIndex: index + 1,
    }));
}
