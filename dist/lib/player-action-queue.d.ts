export declare class PlayerActionQueue {
    maxConcurrency: any;
    maxPending: any;
    maxPendingPerKey: any;
    queues: Map<any, any>;
    activeKeys: Set<unknown>;
    running: number;
    scheduled: boolean;
    constructor(maxConcurrency: any, maxPending: any, maxPendingPerKey: any);
    enqueueForKey(key: any, name: any, run: any): Promise<unknown>;
    getTotalPending(): number;
    scheduleDrain(): void;
    drain(): void;
    takeNextTask(): any;
    startTask(task: any): void;
}
export declare const playerActionQueue: PlayerActionQueue;
