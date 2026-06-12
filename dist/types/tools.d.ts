export type ToolType = 'fishing' | 'woodcutting' | 'mining' | 'gathering' | 'harvesting';
export type ToolRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export interface Tool {
    id: string;
    name: string;
    emoji: string;
    type: ToolType;
    rarity: ToolRarity;
    description: string;
    weightKg: number;
    baseValue: number;
    slotCost: number;
    stackable: false;
    maxStack: 1;
    durabilityMax: number;
    targets: string[];
}
export declare const TOOLS: Record<string, Tool>;
export declare function getToolsByType(type: ToolType): Tool[];
export declare function getToolById(toolId: string): Tool | undefined;
