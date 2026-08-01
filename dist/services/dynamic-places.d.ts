export declare function ensureDynamicPlaceAtCoords(params: any): Promise<{
    interactions: {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        emoji: string;
        displayName: string;
        description: string | null;
        effectType: string | null;
        effectValue: number | null;
        slug: string;
        sortOrder: number;
        placeId: number;
        costType: string | null;
        costAmount: number | null;
        instantFull: boolean;
    }[];
} & {
    id: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    type: string;
    emoji: string;
    displayName: string;
    description: string | null;
    slug: string;
    coordX: number | null;
    coordY: number | null;
    pvpAllowed: boolean;
    combatAllowed: boolean;
    triggerType: string | null;
    expiresAt: Date | null;
}>;
