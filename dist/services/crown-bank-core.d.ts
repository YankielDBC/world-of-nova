export declare const ACTIVE_STATUS = "ACTIVE";
export declare const VAULT_STATUS = "VAULT";
export declare const VAULT_PROFILE_CONFIG: {
    crown: {
        bagSlug: string;
        displayName: string;
        slotCapacity: number;
        shortLabel: string;
    };
    village: {
        bagSlug: string;
        displayName: string;
        slotCapacity: number;
        shortLabel: string;
    };
};
export declare const slotInclude: {
    resource: boolean;
    playerTool: boolean;
    storedBag: {
        include: {
            definition: boolean;
            slots: {
                select: {
                    id: boolean;
                };
            };
        };
    };
};
export declare const bagInclude: {
    definition: boolean;
    slots: {
        include: {
            resource: boolean;
            playerTool: boolean;
            storedBag: {
                include: {
                    definition: boolean;
                    slots: {
                        select: {
                            id: boolean;
                        };
                    };
                };
            };
        };
        orderBy: {
            slotIndex: string;
        };
    };
};
export declare function toSafeInt(value: any): number;
export declare function hasAnyItem(slot: any): boolean;
export declare function getSlotWeightKg(slot: any): any;
export declare function getSlotMarketValueSilver(slot: any): number;
export declare function getSlotDisplay(slot: any): {
    kind: string;
    emoji: any;
    name: any;
    quantity: any;
};
export declare function getFirstFreeSlotIndex(slots: any, totalSlots: any): number;
export declare function getAllFreeSlotIndexes(slots: any, totalSlots: any): any[];
export declare function ensureBankRow(playerId: any, db?: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, import("@prisma/client").Prisma.LogLevel, import("@prisma/client/runtime/library").DefaultArgs>): Promise<void>;
export declare function ensureVaultContainer(playerId: any, profile?: string, db?: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, import("@prisma/client").Prisma.LogLevel, import("@prisma/client/runtime/library").DefaultArgs>): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    playerId: number;
    bagDefinitionId: number;
    status: string;
}>;
export declare function getActiveBag(playerId: any, db?: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, import("@prisma/client").Prisma.LogLevel, import("@prisma/client/runtime/library").DefaultArgs>): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    playerId: number;
    bagDefinitionId: number;
    status: string;
}>;
export declare function loadEquippedToolIds(playerId: any, db?: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, import("@prisma/client").Prisma.LogLevel, import("@prisma/client/runtime/library").DefaultArgs>): Promise<Set<number>>;
export declare function getUsedBagStats(bag: any, equippedToolIds: any): {
    usedSlots: any;
    usedWeightKg: number;
};
export declare function mapSlotsToEntries(slots: any): any;
