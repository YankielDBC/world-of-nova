export declare function ensureDynamicPlaceAtCoords(params: {
    worldMapId: number;
    x: number;
    y: number;
}): Promise<({
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
