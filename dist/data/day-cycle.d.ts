export declare function getDayPeriodEmoji(period: any): any;
export declare function getDayPeriodLabel(lang: any, period: any): any;
export declare function getDayPeriodEffects(biomeName: any, period: any): {
    spawnMultiplier: any;
    yieldMultiplier: any;
    energyCostMultiplier: any;
    actionSpawnMultiplier: {
        gather: number;
        chop: number;
        mine: number;
        fish: number;
    };
    actionYieldMultiplier: {
        gather: number;
        chop: number;
        mine: number;
        fish: number;
    };
    actionEnergyCostMultiplier: {
        gather: number;
        chop: number;
        mine: number;
        fish: number;
    };
};
export declare function getAmbientHint(lang: any, biomeName: any, period: any, seed?: number): any;
export declare function isResourceAvailableByPeriod(biomeName: any, resourceName: any, period: any): boolean;
