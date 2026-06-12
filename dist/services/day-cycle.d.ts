export declare function getDayCycleSnapshot(nowMs?: number): {
    period: string;
    periodIndex: number;
    cycleIndex: number;
    elapsedInPeriodMs: number;
    remainingInPeriodMs: number;
    nextTransitionAt: Date;
    isEnabled: boolean;
};
export declare function getDayCycleEffectsForBiome(biomeName: any, snapshot: any): {
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
export declare function formatDayCycleLine(langRaw: any, snapshot: any): string;
export declare function getDayCycleAmbientLine(langRaw: any, biomeName: any, snapshot: any): any;
