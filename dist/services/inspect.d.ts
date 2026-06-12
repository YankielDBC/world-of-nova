import { InlineKeyboard } from 'grammy';
export declare function renderInspectForPlayer(playerTgId: any): Promise<{
    isPlace: boolean;
    text: string;
    keyboard: InlineKeyboard;
    nodes: any[];
    tileId?: undefined;
} | {
    isPlace: boolean;
    text: string;
    keyboard: InlineKeyboard;
    tileId: number;
    nodes: ({
        listIndex: any;
        kind: string;
        groundLootId: any;
        nodeType: string;
        emoji: any;
        displayName: any;
        available: any;
        requiredLevel: number;
        requiredSkill: string;
        action: string;
        rarity: string;
        rarityCode: string;
    } | {
        listIndex: number;
        kind: string;
        nodeId: any;
        nodeType: any;
        emoji: any;
        displayName: any;
        available: any;
        requiredLevel: any;
        requiredSkill: string;
        action: string;
        rarity: any;
        rarityCode: string;
    })[];
}>;
export declare function getInspectNodesForPlayer(playerTgId: any): Promise<{
    tileId: number;
    nodes: any[] | ({
        listIndex: any;
        kind: string;
        groundLootId: any;
        nodeType: string;
        emoji: any;
        displayName: any;
        available: any;
        requiredLevel: number;
        requiredSkill: string;
        action: string;
        rarity: string;
        rarityCode: string;
    } | {
        listIndex: number;
        kind: string;
        nodeId: any;
        nodeType: any;
        emoji: any;
        displayName: any;
        available: any;
        requiredLevel: any;
        requiredSkill: string;
        action: string;
        rarity: any;
        rarityCode: string;
    })[];
}>;
export declare function executeInspectAction(params: any): Promise<{
    success: boolean;
    message: string;
    tileId: any;
} | {
    success: boolean;
    message: any;
    tileId?: undefined;
    toolBroken?: undefined;
} | {
    success: boolean;
    message: string;
    tileId: number;
    toolBroken: boolean;
}>;
