export declare function ensureEquipmentCatalogSeeded(tx?: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, import("@prisma/client").Prisma.LogLevel, import("@prisma/client/runtime/library").DefaultArgs>): Promise<void>;
export declare function generateEquipmentInstance(input: any): Promise<any>;
export declare function grantGeneratedEquipmentToActiveBag(input: any): Promise<{
    success: boolean;
    addedQuantity: number;
    equipmentId: any;
    rarityCode: string;
}>;
