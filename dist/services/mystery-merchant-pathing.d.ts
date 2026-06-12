import { Prisma } from '@prisma/client';
import { prisma } from '../lib/db.js';
type DbClient = typeof prisma | Prisma.TransactionClient;
export interface ExploredBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    discoveredCount: number;
}
export declare function getExploredBounds(worldMapId: number, tx?: DbClient): Promise<ExploredBounds | null>;
export declare function isInsideMerchantPerimeter(x: number, y: number, bounds: ExploredBounds | null): boolean;
export declare function hasDiscoveredTileNearby(params: {
    worldMapId: number;
    x: number;
    y: number;
    radius: number;
    tx?: DbClient;
}): Promise<boolean>;
export declare function distanceOutsidePerimeter(x: number, y: number, bounds: ExploredBounds | null): number;
export declare function pickNextCoords(params: {
    worldMapId: number;
    currentX: number;
    currentY: number;
    prevX: number | null;
    prevY: number | null;
    blockedCoords?: Set<string>;
}): Promise<{
    x: number;
    y: number;
}>;
export declare function getOccupiedMerchantCoords(params: {
    worldMapId: number;
    excludeId?: number;
    tx?: DbClient;
}): Promise<Set<string>>;
export declare function findNearestDiscoveredTile(params: {
    worldMapId: number;
    x: number;
    y: number;
    radius: number;
}): Promise<{
    x: number;
    y: number;
    distance: number;
} | null>;
export declare function getDefaultInitialCoords(merchantId: number, merchantBaseId: number): {
    x: number;
    y: number;
};
export declare function getForcedCoordsForMerchant(merchantId: number, forced: {
    x: number;
    y: number;
}, merchantBaseId: number): {
    x: number;
    y: number;
};
export {};
