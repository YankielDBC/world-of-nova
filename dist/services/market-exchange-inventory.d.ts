import { Prisma } from '@prisma/client';
import { prisma } from '../lib/db.js';
type DbClient = typeof prisma | Prisma.TransactionClient;
export declare function getActiveBagWithSlotsForUpdate(playerId: number, tx: DbClient): Promise<({
    definition: {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        emoji: string;
        displayName: string;
        description: string | null;
        slug: string;
        quickCommand: string | null;
        slotCapacity: number;
        weightCapacityKg: number;
        itemWeightKg: number;
        allowResourceStack: boolean;
        maxResourceStack: number;
        isPocket: boolean;
    };
    slots: ({
        resource: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            rarity: string;
            emoji: string;
            type: string;
            description: string | null;
            weightKg: number;
            usable: boolean;
            effectType: string | null;
            effectValue: number | null;
            baseValue: number;
            stackable: boolean;
            maxStack: number;
        } | null;
        playerTool: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            rarity: string;
            toolKey: string;
            playerId: number;
            merchantLocked: boolean;
            durability: number;
            maxDurability: number;
            isBroken: boolean;
        } | null;
        storedBag: ({
            definition: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                emoji: string;
                displayName: string;
                description: string | null;
                slug: string;
                quickCommand: string | null;
                slotCapacity: number;
                weightCapacityKg: number;
                itemWeightKg: number;
                allowResourceStack: boolean;
                maxResourceStack: number;
                isPocket: boolean;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            playerId: number;
            status: string;
            bagDefinitionId: number;
        }) | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        resourceId: number | null;
        quantity: number;
        toolKey: string | null;
        playerToolId: number | null;
        equipmentInstanceId: number | null;
        slotIndex: number;
        bagId: number;
        merchantLockedQty: number;
        storedBagId: number | null;
    })[];
} & {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    playerId: number;
    status: string;
    bagDefinitionId: number;
}) | null>;
export declare function reserveResourceFromActiveBag(tx: DbClient, playerId: number, resourceId: number, quantity: number): Promise<{
    success: boolean;
    message: string;
}>;
export declare function creditResourceToActiveBag(tx: DbClient, playerId: number, resourceId: number, quantity: number): Promise<{
    success: boolean;
    message: string;
}>;
export {};
