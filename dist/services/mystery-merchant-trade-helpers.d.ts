export declare function getToolMeta(toolKey: any): any;
export declare function getResourceMarketValue(resource: any): number;
export declare function getToolMarketValue(toolKey: any, durability: any, maxDurability: any): number;
export declare function getBagMarketValue(slotCapacity: any, weightCapacityKg: any): number;
export declare function getSellableSlots(playerId: any, tx?: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, import("@prisma/client").Prisma.LogLevel, import("@prisma/client/runtime/library").DefaultArgs>): Promise<({
    resource: {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        emoji: string;
        description: string | null;
        rarity: string;
        weightKg: number;
        usable: boolean;
        effectType: string | null;
        effectValue: number | null;
        baseValue: number;
        stackable: boolean;
        maxStack: number;
    };
    playerTool: {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        rarity: string;
        playerId: number;
        toolKey: string;
        merchantLocked: boolean;
        durability: number;
        maxDurability: number;
        isBroken: boolean;
    };
    storedBag: {
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
        slots: {
            id: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        playerId: number;
        bagDefinitionId: number;
        status: string;
    };
} & {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    resourceId: number | null;
    slotIndex: number;
    bagId: number;
    merchantLockedQty: number;
    storedBagId: number | null;
    toolKey: string | null;
    playerToolId: number | null;
    equipmentInstanceId: number | null;
    quantity: number;
})[]>;
export declare function markMerchantPurchasedResourceLock(params: any): Promise<void>;
