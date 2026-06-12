export declare function ensureRacialTalentSchema(): Promise<void>;
export declare function getPlayerRacialTalentState(playerId: any): Promise<{
    playerId: any;
    race: string;
    level: number;
    silver: number;
    talents: ({
        key: string;
        race: string;
        type: string;
        category: string;
        maxRank: number;
        costPerRank: number;
        sortOrder: number;
        name: {
            es: string;
            en: string;
            ru: string;
        };
        summary: {
            es: string;
            en: string;
            ru: string;
        };
        prerequisites?: undefined;
    } | {
        key: string;
        race: string;
        type: string;
        category: string;
        maxRank: number;
        costPerRank: number;
        sortOrder: number;
        prerequisites: string[];
        name: {
            es: string;
            en: string;
            ru: string;
        };
        summary: {
            es: string;
            en: string;
            ru: string;
        };
    })[];
    ranksByKey: {};
    loadout: {
        activeSlot1: any;
        activeSlot2: any;
        keystoneKey: any;
    };
    totalPoints: number;
    spentPoints: number;
    freePoints: number;
}>;
export declare function learnRacialTalentRank(playerId: any, talentKeyRaw: any): Promise<{
    success: boolean;
    message: string;
    state?: undefined;
} | {
    success: boolean;
    message: string;
    state: {
        playerId: any;
        race: string;
        level: number;
        silver: number;
        talents: ({
            key: string;
            race: string;
            type: string;
            category: string;
            maxRank: number;
            costPerRank: number;
            sortOrder: number;
            name: {
                es: string;
                en: string;
                ru: string;
            };
            summary: {
                es: string;
                en: string;
                ru: string;
            };
            prerequisites?: undefined;
        } | {
            key: string;
            race: string;
            type: string;
            category: string;
            maxRank: number;
            costPerRank: number;
            sortOrder: number;
            prerequisites: string[];
            name: {
                es: string;
                en: string;
                ru: string;
            };
            summary: {
                es: string;
                en: string;
                ru: string;
            };
        })[];
        ranksByKey: {};
        loadout: {
            activeSlot1: any;
            activeSlot2: any;
            keystoneKey: any;
        };
        totalPoints: number;
        spentPoints: number;
        freePoints: number;
    };
}>;
export declare function equipRacialTalent(playerId: any, talentKeyRaw: any, slot: any): Promise<{
    success: boolean;
    message: string;
    state?: undefined;
} | {
    success: boolean;
    message: string;
    state: {
        playerId: any;
        race: string;
        level: number;
        silver: number;
        talents: ({
            key: string;
            race: string;
            type: string;
            category: string;
            maxRank: number;
            costPerRank: number;
            sortOrder: number;
            name: {
                es: string;
                en: string;
                ru: string;
            };
            summary: {
                es: string;
                en: string;
                ru: string;
            };
            prerequisites?: undefined;
        } | {
            key: string;
            race: string;
            type: string;
            category: string;
            maxRank: number;
            costPerRank: number;
            sortOrder: number;
            prerequisites: string[];
            name: {
                es: string;
                en: string;
                ru: string;
            };
            summary: {
                es: string;
                en: string;
                ru: string;
            };
        })[];
        ranksByKey: {};
        loadout: {
            activeSlot1: any;
            activeSlot2: any;
            keystoneKey: any;
        };
        totalPoints: number;
        spentPoints: number;
        freePoints: number;
    };
}>;
export declare function unequipRacialTalent(playerId: any, slot: any): Promise<{
    success: boolean;
    message: string;
    state?: undefined;
} | {
    success: boolean;
    message: string;
    state: {
        playerId: any;
        race: string;
        level: number;
        silver: number;
        talents: ({
            key: string;
            race: string;
            type: string;
            category: string;
            maxRank: number;
            costPerRank: number;
            sortOrder: number;
            name: {
                es: string;
                en: string;
                ru: string;
            };
            summary: {
                es: string;
                en: string;
                ru: string;
            };
            prerequisites?: undefined;
        } | {
            key: string;
            race: string;
            type: string;
            category: string;
            maxRank: number;
            costPerRank: number;
            sortOrder: number;
            prerequisites: string[];
            name: {
                es: string;
                en: string;
                ru: string;
            };
            summary: {
                es: string;
                en: string;
                ru: string;
            };
        })[];
        ranksByKey: {};
        loadout: {
            activeSlot1: any;
            activeSlot2: any;
            keystoneKey: any;
        };
        totalPoints: number;
        spentPoints: number;
        freePoints: number;
    };
}>;
export declare function getRacialResetCost(spentPoints: any): number;
export declare function resetRacialTalents(playerId: any): Promise<{
    success: boolean;
    message: string;
    state?: undefined;
} | {
    success: boolean;
    message: string;
    state: {
        playerId: any;
        race: string;
        level: number;
        silver: number;
        talents: ({
            key: string;
            race: string;
            type: string;
            category: string;
            maxRank: number;
            costPerRank: number;
            sortOrder: number;
            name: {
                es: string;
                en: string;
                ru: string;
            };
            summary: {
                es: string;
                en: string;
                ru: string;
            };
            prerequisites?: undefined;
        } | {
            key: string;
            race: string;
            type: string;
            category: string;
            maxRank: number;
            costPerRank: number;
            sortOrder: number;
            prerequisites: string[];
            name: {
                es: string;
                en: string;
                ru: string;
            };
            summary: {
                es: string;
                en: string;
                ru: string;
            };
        })[];
        ranksByKey: {};
        loadout: {
            activeSlot1: any;
            activeSlot2: any;
            keystoneKey: any;
        };
        totalPoints: number;
        spentPoints: number;
        freePoints: number;
    };
}>;
export declare function getTalentsByCategory(state: any, category: any): any;
export declare function canLearnTalent(state: any, talent: any): {
    ok: boolean;
    reason: string;
} | {
    ok: boolean;
    reason?: undefined;
};
