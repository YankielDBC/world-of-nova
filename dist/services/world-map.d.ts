import { Prisma } from '@prisma/client';
export declare function invalidateCanonicalWorldMapCache(): void;
export declare function getCanonicalWorldMap(tx?: import("@prisma/client").PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel, import("@prisma/client/runtime/library").DefaultArgs>): Promise<any>;
export declare function getCanonicalWorldMapId(tx?: import("@prisma/client").PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel, import("@prisma/client/runtime/library").DefaultArgs>): Promise<any>;
export declare function ensureSingleCanonicalWorldMap(): Promise<{
    canonicalMapId: number;
    canonicalMapName: string;
    mergedMapIds: any[];
}>;
