export declare function createRecoverySweeper(deps: any): {
    sweepPassiveStaRecoveryOnce: () => Promise<void>;
    sweepDueRecoveriesOnce: () => Promise<void>;
    startRecoverySweeper: () => void;
};
