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
export declare function getXpForLevel(level: any): number;
export declare function getTotalXpForLevel(level: any): number;
export declare const LEVEL_TITLES: {
    1: {
        emoji: string;
        title: string;
        description: string;
    };
    2: {
        emoji: string;
        title: string;
        description: string;
    };
    3: {
        emoji: string;
        title: string;
        description: string;
    };
    4: {
        emoji: string;
        title: string;
        description: string;
    };
    5: {
        emoji: string;
        title: string;
        description: string;
    };
    6: {
        emoji: string;
        title: string;
        description: string;
    };
    7: {
        emoji: string;
        title: string;
        description: string;
    };
    8: {
        emoji: string;
        title: string;
        description: string;
    };
    9: {
        emoji: string;
        title: string;
        description: string;
    };
    10: {
        emoji: string;
        title: string;
        description: string;
    };
    11: {
        emoji: string;
        title: string;
        description: string;
    };
    12: {
        emoji: string;
        title: string;
        description: string;
    };
    13: {
        emoji: string;
        title: string;
        description: string;
    };
    14: {
        emoji: string;
        title: string;
        description: string;
    };
    15: {
        emoji: string;
        title: string;
        description: string;
    };
    16: {
        emoji: string;
        title: string;
        description: string;
    };
    17: {
        emoji: string;
        title: string;
        description: string;
    };
    18: {
        emoji: string;
        title: string;
        description: string;
    };
    19: {
        emoji: string;
        title: string;
        description: string;
    };
    20: {
        emoji: string;
        title: string;
        description: string;
    };
    21: {
        emoji: string;
        title: string;
        description: string;
    };
    22: {
        emoji: string;
        title: string;
        description: string;
    };
    23: {
        emoji: string;
        title: string;
        description: string;
    };
    24: {
        emoji: string;
        title: string;
        description: string;
    };
    25: {
        emoji: string;
        title: string;
        description: string;
    };
    26: {
        emoji: string;
        title: string;
        description: string;
    };
    27: {
        emoji: string;
        title: string;
        description: string;
    };
    28: {
        emoji: string;
        title: string;
        description: string;
    };
    29: {
        emoji: string;
        title: string;
        description: string;
    };
    30: {
        emoji: string;
        title: string;
        description: string;
    };
    31: {
        emoji: string;
        title: string;
        description: string;
    };
    32: {
        emoji: string;
        title: string;
        description: string;
    };
    33: {
        emoji: string;
        title: string;
        description: string;
    };
    34: {
        emoji: string;
        title: string;
        description: string;
    };
    35: {
        emoji: string;
        title: string;
        description: string;
    };
    36: {
        emoji: string;
        title: string;
        description: string;
    };
    37: {
        emoji: string;
        title: string;
        description: string;
    };
    38: {
        emoji: string;
        title: string;
        description: string;
    };
    39: {
        emoji: string;
        title: string;
        description: string;
    };
    40: {
        emoji: string;
        title: string;
        description: string;
    };
    41: {
        emoji: string;
        title: string;
        description: string;
    };
    42: {
        emoji: string;
        title: string;
        description: string;
    };
    43: {
        emoji: string;
        title: string;
        description: string;
    };
    44: {
        emoji: string;
        title: string;
        description: string;
    };
    45: {
        emoji: string;
        title: string;
        description: string;
    };
    46: {
        emoji: string;
        title: string;
        description: string;
    };
    47: {
        emoji: string;
        title: string;
        description: string;
    };
    48: {
        emoji: string;
        title: string;
        description: string;
    };
    49: {
        emoji: string;
        title: string;
        description: string;
    };
};
export declare function getTitleForLevel(level: any): any;
export declare function getXpForNextLevel(currentLevel: any): number;
