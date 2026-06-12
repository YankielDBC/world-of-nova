export declare function getExploredBounds(worldMapId: any, tx?: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, import("@prisma/client").Prisma.LogLevel, import("@prisma/client/runtime/library").DefaultArgs>): Promise<{
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    discoveredCount: number;
}>;
export declare function isInsideMerchantPerimeter(x: any, y: any, bounds: any): boolean;
export declare function hasDiscoveredTileNearby(params: any): Promise<any>;
export declare function distanceOutsidePerimeter(x: any, y: any, bounds: any): number;
export declare function pickNextCoords(params: any): Promise<any>;
export declare function getOccupiedMerchantCoords(params: any): Promise<Set<unknown>>;
export declare function findNearestDiscoveredTile(params: any): Promise<any>;
export declare function getDefaultInitialCoords(merchantId: any, merchantBaseId: any): {
    x: number;
    y: number;
};
export declare function getForcedCoordsForMerchant(merchantId: any, forced: any, merchantBaseId: any): any;
