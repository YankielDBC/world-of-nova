interface CachedBiome {
    id: number;
    name: string;
    emoji: string;
    displayName: string;
    movementFactor: number;
}
declare function loadBiomes(): Promise<CachedBiome[]>;
export declare function invalidateBiomeCache(): void;
export declare function isTileExplored(playerId: number, x: number, y: number): Promise<boolean>;
export declare function markTileExplored(playerId: number, playerTgId: string, x: number, y: number): Promise<void>;
export declare function markTilesExploredBatch(playerId: number, playerTgId: string, coords: Array<{
    x: number;
    y: number;
}>): Promise<void>;
export declare function getOrCreateTile(worldMapId: number, x: number, y: number, forceBiome?: string): Promise<{
    biome: {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        emoji: string;
        displayName: string;
        description: string | null;
        movementFactor: number;
        color: string | null;
    } | null;
} & {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    biomeId: number | null;
    worldMapId: number;
    x: number;
    y: number;
    loreName: string | null;
    elevation: number;
    isWater: boolean;
    isGenerated: boolean;
    firstDiscoveredById: string | null;
    firstDiscoveredAt: Date | null;
    hasNpc: boolean;
    npcId: number | null;
    hasEvent: boolean;
    eventId: number | null;
    resourcesJson: string | null;
}>;
export declare function getPlaceAtCoords(x: number, y: number, worldMapId?: number): Promise<({
    interactions: {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        emoji: string;
        type: string;
        displayName: string;
        description: string | null;
        effectType: string | null;
        effectValue: number | null;
        slug: string;
        costType: string | null;
        costAmount: number | null;
        instantFull: boolean;
        sortOrder: number;
        placeId: number;
    }[];
} & {
    id: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    emoji: string;
    expiresAt: Date | null;
    type: string;
    displayName: string;
    description: string | null;
    pvpAllowed: boolean;
    combatAllowed: boolean;
    slug: string;
    coordX: number | null;
    coordY: number | null;
    triggerType: string | null;
}) | null>;
export declare function ensureTilesGeneratedForCoords(worldMapId: number, coords: Array<{
    x: number;
    y: number;
}>): Promise<void>;
export type TileRecord = Awaited<ReturnType<typeof getOrCreateTile>>;
export type PlaceRecord = NonNullable<Awaited<ReturnType<typeof getPlaceAtCoords>>>;
export { loadBiomes };
