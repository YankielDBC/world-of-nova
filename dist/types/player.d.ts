export declare const MAX_LEVEL = 49;
export declare const MAX_LEVEL_EXPANDED = 300;
/**
 * XP required per level - CURVA LENTA Y DIFICIL
 * Formula: level² * 50 + level * 50
 * Level 1→2: 100 XP
 * Level 10→11: 5,500 XP
 * Level 20→21: 21,000 XP
 * Level 40→41: 82,000 XP
 * Level 49: Total ~400K XP
 */
export declare function getXpForLevel(level: number): number;
export declare function getTotalXpForLevel(level: number): number;
export declare const LEVEL_TITLES: Record<number, {
    title: string;
    emoji: string;
    description?: string;
}>;
export declare function getTitleForLevel(level: number): {
    title: string;
    emoji: string;
    description?: string;
};
export declare function getXpForNextLevel(currentLevel: number): number;
