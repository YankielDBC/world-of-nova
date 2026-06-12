import { Prisma, type WorldMap } from '@prisma/client';
import { prisma } from '../lib/db.js';
type DbClient = typeof prisma | Prisma.TransactionClient;
export declare function invalidateCanonicalWorldMapCache(): void;
export declare function getCanonicalWorldMap(tx?: DbClient): Promise<WorldMap>;
export declare function getCanonicalWorldMapId(tx?: DbClient): Promise<number>;
export declare function ensureSingleCanonicalWorldMap(): Promise<{
    canonicalMapId: number;
    canonicalMapName: string;
    mergedMapIds: number[];
}>;
export {};
