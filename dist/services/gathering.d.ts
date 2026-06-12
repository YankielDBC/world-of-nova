export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export interface GatherResultItem {
    item: string;
    emoji: string;
    quantity: number;
    rarity: Rarity;
}
export declare function gather(biomeName: string, options?: {
    x?: number;
    y?: number;
}): Promise<{
    encounter: {
        emoji: string;
        name: string;
    };
    items: GatherResultItem[];
}>;
export declare function formatGatherResult(result: {
    encounter: {
        emoji: string;
        name: string;
    };
    items: GatherResultItem[];
}): string;
export declare function listBiomes(): Promise<{
    id: string;
    name: string;
    emoji: string;
}[]>;
export declare function getBiomeInfo(biomeName: string): Promise<{
    id: number;
    name: string;
    emoji: string;
    displayName: string;
    movementFactor: number;
    resources: {
        name: string;
        emoji: string;
        type: string;
        chance: number;
    }[];
    resourceNodes: {
        nodeType: string;
        displayName: string;
        emoji: string;
        spawnChance: number;
        yields: any;
    }[];
} | null>;
