interface RecoverySweeperDeps {
    recoverySweepIntervalMs: number;
    passiveStaRegenIntervalSeconds: number;
    passiveStaRegenPoints: number;
    passiveStaSweepBatchSize: number;
    observePerf: (metricKey: string, durationMs: number) => void;
    prisma: any;
    getActiveDeathStateByPlayerId: (playerId: number) => Promise<any>;
    getGameplayEffectsForPlayer: (playerId: number) => Promise<any>;
    listDueRecoveryTgIds: (limit?: number) => Promise<string[]>;
    finalizeActiveRecovery: (params: {
        tgId: string;
        interrupted: boolean;
    }) => Promise<any>;
}
export declare function createRecoverySweeper(deps: RecoverySweeperDeps): {
    sweepPassiveStaRecoveryOnce: () => Promise<void>;
    sweepDueRecoveriesOnce: () => Promise<void>;
    startRecoverySweeper: () => void;
};
export {};
