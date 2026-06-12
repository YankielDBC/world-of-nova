export declare function gather(biomeName: any, options: any): Promise<{
    encounter: {
        emoji: any;
        name: any;
    };
    items: any[];
}>;
export declare function formatGatherResult(result: any): string;
export declare function listBiomes(): Promise<{
    id: string;
    name: string;
    emoji: string;
}[]>;
export declare function getBiomeInfo(biomeName: any): Promise<{
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
}>;
