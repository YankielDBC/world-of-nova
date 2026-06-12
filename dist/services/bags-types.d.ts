import type { EquipmentInstance, EquipmentTemplate, PlayerEquipment, PlayerTool, Resource } from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { InlineKeyboard } from 'grammy';
import { prisma } from '../lib/db.js';
export declare const ACTIVE_STATUS = "ACTIVE";
export declare const STORED_STATUS = "STORED";
export declare const DORMANT_STATUS = "DORMANT";
export declare const POCKETS_SLUG = "pockets";
export type DbClient = typeof prisma | Prisma.TransactionClient;
export declare const bagInclude: {
    definition: true;
    slots: {
        orderBy: {
            slotIndex: "asc";
        };
        include: {
            resource: true;
            playerTool: true;
            equipmentInstance: {
                include: {
                    template: true;
                };
            };
            storedBag: {
                include: {
                    definition: true;
                };
            };
        };
    };
};
export type BagRecord = Prisma.PlayerBagGetPayload<{
    include: typeof bagInclude;
}>;
export type BagSlotRecord = BagRecord['slots'][number];
export type GatherActionType = 'chop' | 'mine' | 'gather';
export type TransferItem = {
    kind: 'resource';
    resource: Resource;
    quantity: number;
} | {
    kind: 'storedBag';
    bag: Prisma.PlayerBagGetPayload<{
        include: {
            definition: true;
        };
    }>;
} | {
    kind: 'tool';
    toolKey: string;
    playerToolId?: number | null;
} | {
    kind: 'equipment';
    equipment: EquipmentInstance & {
        template: EquipmentTemplate;
    };
};
export interface BagUsage {
    usedSlots: number;
    totalSlots: number;
    usedWeightKg: number;
    totalWeightKg: number;
}
export interface BagSlotView {
    slotUid: number;
    slotIndex: number;
    rarityCode: string;
    emoji: string;
    label: string;
    quantity?: number;
    kind: 'resource' | 'storedBag' | 'tool' | 'equipment';
    usable: boolean;
    toolKey?: string;
    playerToolId?: number;
    equipmentInstanceId?: number;
    durability?: number;
    maxDurability?: number;
    equipAlias?: string;
    isEquipped?: boolean;
    isBroken?: boolean;
}
export type ToolAliasMap = Record<number, string>;
export interface BagItemInfo {
    slotUid: number;
    slotIndex: number;
    bagId: number;
    kind: 'resource' | 'storedBag' | 'tool' | 'equipment';
    emoji: string;
    label: string;
    rarityCode: string;
    quantity: number;
    usable: boolean;
    effectType?: string;
    effectValue?: number;
    description?: string;
    toolKey?: string;
    playerToolId?: number;
    equipmentInstanceId?: number;
    durability?: number;
    maxDurability?: number;
    isBroken?: boolean;
    equipmentSlot?: string;
    bindType?: string;
    itemLevel?: number;
    requiredClass?: string;
    requiredRace?: string;
    specialEffectKey?: string;
    requiredSkill?: 'CHOP' | 'MINE' | 'GATHER';
    requiredLevel?: number;
    uniqueObjectId: string;
}
export interface BagRenderData {
    text: string;
    keyboard?: InlineKeyboard;
    usage: BagUsage;
    slots: BagSlotView[];
    toolAliasMap: ToolAliasMap;
}
export interface AddToBagResult {
    success: boolean;
    reason?: string;
    addedQuantity?: number;
    usage?: BagUsage;
}
export interface GatherStoreResult {
    stored: Array<{
        emoji: string;
        name: string;
        quantity: number;
    }>;
    rejected: Array<{
        emoji: string;
        name: string;
        quantity: number;
        reason: string;
    }>;
}
export interface UseSlotResult {
    success: boolean;
    message: string;
}
export interface DropSlotResult {
    success: boolean;
    message: string;
}
export interface BagSwitchOption {
    bagId: number | 'pockets';
    emoji: string;
    label: string;
    usageLabel: string;
}
export interface BagSwitchPreview {
    success: boolean;
    reason?: string;
    option?: BagSwitchOption;
    targetUsage?: {
        slotUsage: string;
        weightUsage: string;
    };
}
export type DroppedGroundPayload = {
    kind: 'resource';
    emoji: string;
    name: string;
    quantity: number;
    resourceName: string;
    resourceId: number;
} | {
    kind: 'tool';
    emoji: string;
    name: string;
    quantity: number;
    playerToolId?: number;
    toolKey?: string;
} | {
    kind: 'equipment';
    emoji: string;
    name: string;
    quantity: number;
    equipmentInstanceId?: number;
    templateKey?: string;
} | {
    kind: 'bag';
    emoji: string;
    name: string;
    quantity: number;
    bagSlug?: string;
};
export interface DroppedToolPickupInput {
    playerToolId?: number;
    toolKey?: string;
    emoji: string;
    name: string;
}
export type EquippedToolResult = {
    instance: PlayerTool;
    toolKey: string;
} | null;
export type DurabilityDamageResult = {
    brokeNow: boolean;
    nowBroken: boolean;
    durability: number;
    maxDurability: number;
    toolName: string;
    emoji: string;
} | null;
export type EquipmentSource = PlayerEquipment | null | undefined;
