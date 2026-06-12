export declare function resolvePveAction(params: any): Promise<{
    success: boolean;
    message: any;
    outcome?: undefined;
    text?: undefined;
    reward?: undefined;
    notice?: undefined;
} | {
    success: boolean;
    outcome: string;
    text: string;
    message?: undefined;
    reward?: undefined;
    notice?: undefined;
} | {
    success: boolean;
    outcome: string;
    reward: {
        success: boolean;
        message: any;
        creature?: undefined;
        xpAwarded?: undefined;
        silverAwarded?: undefined;
        xpProgress?: undefined;
        classPointsGained?: undefined;
        generalPointsGained?: undefined;
        racialPointsGained?: undefined;
        storedDrops?: undefined;
        rejectedDrops?: undefined;
        bagUsageAfter?: undefined;
    } | {
        success: boolean;
        creature: {
            id: number;
            worldMapId: number;
            x: number;
            y: number;
            spawnSlot: number;
            biomeName: string;
            displayName: string;
            category: string;
            level: number;
            attributes: {
                str: number;
                dex: number;
                intelligence: number;
                vit: number;
                agi: number;
                eng: number;
            };
            maxHp: number;
            currentHp: number;
            attack: number;
            arcanePower: number;
            defense: number;
            critChance: number;
            evasion: number;
            moveSpeed: number;
            xpReward: number;
            silverMin: number;
            silverMax: number;
            coinDropChance: number;
            respawnSeconds: number;
            drops: any[];
            status: string;
            nextRespawnAt: Date;
        };
        xpAwarded: number;
        silverAwarded: number;
        xpProgress: {
            levelBefore: number;
            levelAfter: number;
            levelsGained: number;
            currentXp: number;
            requiredXp: number;
        };
        classPointsGained: number;
        generalPointsGained: number;
        racialPointsGained: number;
        storedDrops: any[];
        rejectedDrops: any[];
        bagUsageAfter: {
            usedSlots: any;
            totalSlots: any;
            usedWeightKg: number;
            totalWeightKg: any;
        };
        message?: undefined;
    };
    text: string;
    message?: undefined;
    notice?: undefined;
} | {
    success: boolean;
    outcome: string;
    notice: string;
    message?: undefined;
    text?: undefined;
    reward?: undefined;
}>;
