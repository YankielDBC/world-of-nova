import type { PlayerTool } from '@prisma/client';
export type EquipmentSlot = 'chopToolId' | 'mineToolId' | 'gatherToolId';
export declare function parseEquipAlias(alias: string): number | null;
export declare function parseUnequipAlias(alias: string): number | null;
export declare function getEquipmentSlotLabel(slot: EquipmentSlot): string;
export declare function formatToolInstanceLine(playerTool: PlayerTool | null, fallback?: string): string;
export declare function getToolRequirement(toolType?: string | null): {
    skill: 'CHOP' | 'MINE' | 'GATHER';
    level: number;
};
