import { InlineKeyboard } from 'grammy';
type Direction = 'up' | 'down' | 'left' | 'right';
type CaveLayout = {
    width: number;
    height: number;
    startX: number;
    startY: number;
    walkableCount: number;
    rows: string[];
};
type ActiveCaveContext = {
    player: {
        id: number;
        tgId: string;
        language: string | null;
        energy: number;
        maxEnergy: number;
    };
    place: {
        id: number;
        slug: string;
        displayName: string;
        emoji: string;
        coordX: number | null;
        coordY: number | null;
    };
    caveInstanceId: number;
    posX: number;
    posY: number;
    exploredJson: string;
    layout: CaveLayout;
};
export declare function getActiveCaveContextByTgId(tgId: string): Promise<ActiveCaveContext | null>;
export declare function enterCaveForPlayer(params: {
    playerId: number;
    tgId: string;
    placeId: number;
}): Promise<{
    success: true;
    place: {
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
    };
    layout: CaveLayout;
}>;
export declare function exitActiveCaveForTgId(tgId: string): Promise<{
    success: false;
    message: string;
    place?: undefined;
} | {
    success: true;
    place: {
        id: number;
        slug: string;
        displayName: string;
        emoji: string;
        coordX: number | null;
        coordY: number | null;
    };
    message?: undefined;
}>;
export declare function movePlayerInCave(tgId: string, direction: Direction): Promise<{
    success: boolean;
    message: string;
}>;
export declare function renderActiveCaveMap(tgId: string): Promise<{
    header: string;
    biomeName: string;
    grid: string;
    footer: string;
    keyboard: InlineKeyboard;
} | null>;
export declare function isPlayerInsideCave(tgId: string): Promise<boolean>;
export {};
