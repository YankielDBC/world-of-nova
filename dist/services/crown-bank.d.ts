export declare function getVaultBalance(playerId: any, db?: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, import("@prisma/client").Prisma.LogLevel, import("@prisma/client/runtime/library").DefaultArgs>): Promise<{
    silver: number;
    gold: number;
}>;
export declare function getBankSummary(playerId: any): Promise<{
    carried: {
        silver: number;
        gold: number;
    };
    vault: {
        silver: number;
        gold: number;
    };
    total: {
        silver: number;
        gold: number;
    };
}>;
export declare function calculateDepositFeeSilver(currency: any, amount: any): number;
export declare function getVaultOverview(playerId: any, profile?: string): Promise<{
    usedSlots: any;
    totalSlots: any;
    objectStacks: any;
    objectUnits: any;
    marketValueSilver: any;
    summary: {
        carried: {
            silver: number;
            gold: number;
        };
        vault: {
            silver: number;
            gold: number;
        };
        total: {
            silver: number;
            gold: number;
        };
    };
}>;
export declare function listVaultMoveEntries(playerId: any, direction: any, profile?: string): Promise<{
    entries: any;
    overview: {
        usedSlots: any;
        totalSlots: any;
        objectStacks: any;
        objectUnits: any;
        marketValueSilver: any;
        summary: {
            carried: {
                silver: number;
                gold: number;
            };
            vault: {
                silver: number;
                gold: number;
            };
            total: {
                silver: number;
                gold: number;
            };
        };
    };
}>;
export declare function moveVaultObject(playerId: any, direction: any, slotUid: any, quantity: any, profile?: string): Promise<{
    success: boolean;
    message: string;
}>;
export declare function depositToVault(playerId: any, currency: any, amount: any): Promise<{
    success: boolean;
    message: string;
    summary: {
        carried: {
            silver: number;
            gold: number;
        };
        vault: {
            silver: number;
            gold: number;
        };
        total: {
            silver: number;
            gold: number;
        };
    };
} | {
    success: boolean;
    message: string;
}>;
export declare function depositToVaultWithFee(playerId: any, currency: any, amount: any): Promise<{
    success: boolean;
    message: string;
    summary: {
        carried: {
            silver: number;
            gold: number;
        };
        vault: {
            silver: number;
            gold: number;
        };
        total: {
            silver: number;
            gold: number;
        };
    };
    feeSilver: number;
} | {
    success: boolean;
    message: string;
}>;
export declare function withdrawFromVault(playerId: any, currency: any, amount: any): Promise<{
    success: boolean;
    message: string;
    summary: {
        carried: {
            silver: number;
            gold: number;
        };
        vault: {
            silver: number;
            gold: number;
        };
        total: {
            silver: number;
            gold: number;
        };
    };
} | {
    success: boolean;
    message: string;
}>;
