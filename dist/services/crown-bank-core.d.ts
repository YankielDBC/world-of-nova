import { Prisma } from '@prisma/client';
import { prisma } from '../lib/db.js';
export type DbClient = typeof prisma | Prisma.TransactionClient;
export type VaultProfile = 'crown' | 'village';
export declare const ACTIVE_STATUS = "ACTIVE";
export declare const VAULT_STATUS = "VAULT";
export declare const VAULT_PROFILE_CONFIG: Record<VaultProfile, {
    bagSlug: string;
    displayName: string;
    slotCapacity: number;
    shortLabel: string;
}>;
export declare const slotInclude: {
    resource: true;
    playerTool: true;
    storedBag: {
        include: {
            definition: true;
            slots: {
                select: {
                    id: true;
                };
            };
        };
    };
};
export declare const bagInclude: {
    definition: true;
    slots: {
        include: {
            resource: true;
            playerTool: true;
            storedBag: {
                include: {
                    definition: true;
                    slots: {
                        select: {
                            id: true;
                        };
                    };
                };
            };
        };
        orderBy: {
            slotIndex: "asc";
        };
    };
};
export type SlotRecord = Prisma.PlayerBagSlotGetPayload<{
    include: typeof slotInclude;
}>;
export type BagRecord = Prisma.PlayerBagGetPayload<{
    include: typeof bagInclude;
}>;
export interface BankBalance {
    silver: number;
    gold: number;
}
export interface BankSummary {
    carried: BankBalance;
    vault: BankBalance;
    total: BankBalance;
}
export interface VaultMoveEntry {
    listIndex: number;
    slotUid: number;
    slotIndex: number;
    kind: 'resource' | 'tool' | 'storedBag';
    emoji: string;
    name: string;
    quantity: number;
    marketValueSilver: number;
}
export interface VaultOverview {
    usedSlots: number;
    totalSlots: number;
    objectStacks: number;
    objectUnits: number;
    marketValueSilver: number;
    summary: BankSummary;
}
export interface VaultMoveResult {
    success: boolean;
    message: string;
}
export declare function toSafeInt(value: unknown): number;
export declare function hasAnyItem(slot: SlotRecord): boolean;
export declare function getSlotWeightKg(slot: SlotRecord): number;
export declare function getSlotMarketValueSilver(slot: SlotRecord): number;
export declare function getSlotDisplay(slot: SlotRecord): {
    kind: VaultMoveEntry['kind'];
    emoji: string;
    name: string;
    quantity: number;
} | null;
export declare function getFirstFreeSlotIndex(slots: Array<{
    slotIndex: number;
}>, totalSlots: number): number | null;
export declare function getAllFreeSlotIndexes(slots: Array<{
    slotIndex: number;
}>, totalSlots: number): number[];
export declare function ensureBankRow(playerId: number, db?: DbClient): Promise<void>;
export declare function ensureVaultContainer(playerId: number, profile?: VaultProfile, db?: DbClient): Promise<BagRecord>;
export declare function getActiveBag(playerId: number, db?: DbClient): Promise<BagRecord | null>;
export declare function loadEquippedToolIds(playerId: number, db?: DbClient): Promise<Set<number>>;
export declare function getUsedBagStats(bag: BagRecord, equippedToolIds: Set<number>): {
    usedSlots: number;
    usedWeightKg: number;
};
export declare function mapSlotsToEntries(slots: SlotRecord[]): VaultMoveEntry[];
