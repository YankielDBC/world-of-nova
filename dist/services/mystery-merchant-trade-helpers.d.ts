import { Prisma, type Resource } from '@prisma/client';
import { prisma } from '../lib/db.js';
type DbClient = typeof prisma | Prisma.TransactionClient;
type SellableSlot = Prisma.PlayerBagSlotGetPayload<{
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
}>;
type GroundLootResourceLockParams = {
    playerId: number;
    resourceId: number;
    purchasedQty: number;
    beforeSlots: Array<{
        id: number;
        quantity: number;
    }>;
};
export declare function getToolMeta(toolKey?: string | null): import("../types/tools.js").Tool | null;
export declare function getResourceMarketValue(resource: Resource): number;
export declare function getToolMarketValue(toolKey: string, durability: number, maxDurability: number): number;
export declare function getBagMarketValue(slotCapacity: number, weightCapacityKg: number): number;
export declare function getSellableSlots(playerId: number, tx?: DbClient): Promise<SellableSlot[]>;
export declare function markMerchantPurchasedResourceLock(params: GroundLootResourceLockParams): Promise<void>;
export {};
