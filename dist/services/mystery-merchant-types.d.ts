import { Prisma } from '@prisma/client';
import { prisma } from '../lib/db.js';
export type DbClient = typeof prisma | Prisma.TransactionClient;
export type MerchantOfferKind = 'resource' | 'tool';
export type MerchantSellEntryKind = 'resource' | 'tool' | 'bag';
export interface MerchantOffer {
    id: string;
    kind: MerchantOfferKind;
    resourceId?: number;
    toolKey?: string;
    emoji: string;
    name: string;
    priceSilver: number;
    stock: number;
    maxStock: number;
}
export interface MerchantSnapshot {
    id: number;
    worldMapId: number;
    mapX: number;
    mapY: number;
    prevX: number | null;
    prevY: number | null;
    arrivedAt: Date;
    departsAt: Date;
    stayToken: string;
    buybackMultiplier: number;
    rumorSentAt: Date | null;
    confirmedAt: Date | null;
    offers: MerchantOffer[];
}
export interface MerchantSellEntry {
    listIndex: number;
    slotUid: number;
    slotIndex: number;
    kind: MerchantSellEntryKind;
    emoji: string;
    name: string;
    quantity: number;
    unitSilver: number;
    totalSilver: number;
}
export interface MerchantRowSnapshotSource {
    id: number;
    worldMapId: number;
    mapX: number;
    mapY: number;
    prevX: number | null;
    prevY: number | null;
    arrivedAt: Date;
    departsAt: Date;
    stayToken: string;
    buybackMultiplier: number;
    rumorSentAt: Date | null;
    confirmedAt: Date | null;
    offersJson: string;
}
export interface MerchantMoveResult {
    snapshot: MerchantSnapshot;
    moved: boolean;
}
export type TelegramApi = {
    sendMessage: (chatId: string | number, text: string, other?: {
        parse_mode?: 'HTML';
    }) => Promise<unknown>;
};
