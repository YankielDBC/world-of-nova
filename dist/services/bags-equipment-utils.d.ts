export declare function parseEquipAlias(alias: any): number;
export declare function parseUnequipAlias(alias: any): number;
export declare function getEquipmentSlotLabel(slot: any): "Tala" | "Mineria" | "Recoleccion";
export declare function formatToolInstanceLine(playerTool: any, fallback?: string): string;
export declare function getToolRequirement(toolType: any): {
    skill: string;
    level: number;
};
