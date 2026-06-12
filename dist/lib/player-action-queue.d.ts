export declare class PlayerActionQueue {
    private readonly maxConcurrency;
    private readonly maxPending;
    private readonly maxPendingPerKey;
    private readonly queues;
    private readonly activeKeys;
    private running;
    private scheduled;
    constructor(maxConcurrency: number, maxPending: number, maxPendingPerKey: number);
    enqueueForKey<T>(key: string, name: string, run: () => Promise<T>): Promise<T>;
    private getTotalPending;
    private scheduleDrain;
    private drain;
    private takeNextTask;
    private startTask;
}
export declare const playerActionQueue: PlayerActionQueue;
