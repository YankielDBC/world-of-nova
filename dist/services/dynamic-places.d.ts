export declare function ensureDynamicPlaceAtCoords(params: any): Promise<{
    interactions: {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        emoji: string;
        displayName: string;
        description: string;
        effectType: string;
        effectValue: number;
        slug: string;
        costType: string;
        costAmount: number;
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
    type: string;
    emoji: string;
    displayName: string;
    description: string;
    slug: string;
    coordX: number;
    coordY: number;
    pvpAllowed: boolean;
    combatAllowed: boolean;
    triggerType: string;
    expiresAt: Date;
}>;
