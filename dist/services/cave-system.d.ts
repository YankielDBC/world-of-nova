export declare function getActiveCaveContextByTgId(tgId: any): Promise<{
    player: {
        id: number;
        tgId: string;
        language: string;
        energy: number;
        maxEnergy: number;
    };
    place: {
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
    };
    caveInstanceId: number;
    posX: number;
    posY: number;
    exploredJson: string;
    layout: {
        width: number;
        height: number;
        startX: number;
        startY: number;
        walkableCount: number;
        rows: any;
    };
}>;
export declare function enterCaveForPlayer(params: any): Promise<{
    success: boolean;
    place: {
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
    };
    layout: {
        width: number;
        height: number;
        startX: number;
        startY: number;
        walkableCount: number;
        rows: any;
    };
}>;
export declare function exitActiveCaveForTgId(tgId: any): Promise<{
    success: boolean;
    message: string;
    place?: undefined;
} | {
    success: boolean;
    place: {
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
    };
    message?: undefined;
}>;
export declare function movePlayerInCave(tgId: any, direction: any): Promise<{
    success: boolean;
    message: any;
}>;
export declare function renderActiveCaveMap(tgId: any): Promise<{
    header: string;
    biomeName: string;
    grid: string;
    footer: string;
    keyboard: import("grammy").InlineKeyboard;
}>;
export declare function isPlayerInsideCave(tgId: any): Promise<boolean>;
