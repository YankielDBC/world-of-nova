import { InlineKeyboard } from 'grammy';
export declare function t3(lang: any, es: any, en: any, ru: any): any;
export declare function coordKey(x: any, y: any): string;
export declare function parseExploredJson(rawJson: any): Set<unknown>;
export declare function serializeExploredJson(explored: any): string;
export declare function ensureCaveSchema(): Promise<void>;
export declare function hashSeed(input: any): number;
export declare function createRng(seed: any): () => number;
export declare function shuffleInPlace(items: any, rng: any): any;
export declare function getCaveCell(layout: any, x: any, y: any): "wall" | "path";
export declare function revealAround(layout: any, posX: any, posY: any, explored: any): void;
export declare function getBandCellSize(placeX: any, placeY: any, rng: any): {
    cellsWide: number;
    cellsHigh: number;
};
export declare function buildDeterministicCaveLayout(place: any): {
    width: number;
    height: number;
    startX: number;
    startY: number;
    walkableCount: number;
    rows: string[];
};
export declare function parseCaveLayout(rawJson: any): {
    width: number;
    height: number;
    startX: number;
    startY: number;
    walkableCount: number;
    rows: any;
};
export declare function ensureCaveInstanceForPlace(placeId: any): Promise<{
    instance: {
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
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        placeId: number;
        width: number;
        height: number;
        startX: number;
        startY: number;
        walkableCount: number;
        layoutJson: string;
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
export declare function buildCaveKeyboard(lang: any): InlineKeyboard;
