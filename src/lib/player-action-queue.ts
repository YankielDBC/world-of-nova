// @ts-nocheck
import { observePerf } from './perf-metrics.js';
import { RUNTIME_CONFIG } from './runtime-config.js';
export class PlayerActionQueue {
    maxConcurrency;
    maxPending;
    maxPendingPerKey;
    queues = new Map();
    activeKeys = new Set();
    running = 0;
    scheduled = false;
    constructor(maxConcurrency, maxPending, maxPendingPerKey) {
        this.maxConcurrency = maxConcurrency;
        this.maxPending = maxPending;
        this.maxPendingPerKey = maxPendingPerKey;
    }
    enqueueForKey(key, name, run) {
        const totalPending = this.getTotalPending();
        if (totalPending >= this.maxPending) {
            return Promise.reject(new Error('Queue is full. Try again in a moment.'));
        }
        const keyQueue = this.queues.get(key) || [];
        if (keyQueue.length >= this.maxPendingPerKey) {
            return Promise.reject(new Error('Too many pending actions for this player.'));
        }
        return new Promise((resolve, reject) => {
            const nextQueue = this.queues.get(key) || [];
            nextQueue.push({
                key,
                name,
                run,
                enqueuedAt: Date.now(),
                resolve: (value) => resolve(value),
                reject,
            });
            this.queues.set(key, nextQueue);
            this.scheduleDrain();
        });
    }
    getTotalPending() {
        let total = 0;
        for (const queue of this.queues.values()) {
            total += queue.length;
        }
        return total;
    }
    scheduleDrain() {
        if (this.scheduled) {
            return;
        }
        this.scheduled = true;
        queueMicrotask(() => {
            this.scheduled = false;
            this.drain();
        });
    }
    drain() {
        while (this.running < this.maxConcurrency) {
            const next = this.takeNextTask();
            if (!next) {
                return;
            }
            this.startTask(next);
        }
    }
    takeNextTask() {
        for (const [key, queue] of this.queues.entries()) {
            if (queue.length === 0 || this.activeKeys.has(key)) {
                continue;
            }
            const task = queue.shift() || null;
            if (!task) {
                continue;
            }
            if (queue.length === 0) {
                this.queues.delete(key);
            }
            else {
                this.queues.set(key, queue);
            }
            return task;
        }
        return null;
    }
    startTask(task) {
        this.running += 1;
        this.activeKeys.add(task.key);
        const startedAt = Date.now();
        observePerf(`queue.wait.${task.name}`, startedAt - task.enqueuedAt);
        void task
            .run()
            .then((result) => {
            task.resolve(result);
        })
            .catch((error) => {
            task.reject(error);
        })
            .finally(() => {
            observePerf(`queue.run.${task.name}`, Date.now() - startedAt);
            this.running = Math.max(0, this.running - 1);
            this.activeKeys.delete(task.key);
            this.scheduleDrain();
        });
    }
}
export const playerActionQueue = new PlayerActionQueue(RUNTIME_CONFIG.playerQueueMaxConcurrency, RUNTIME_CONFIG.playerQueueMaxPending, RUNTIME_CONFIG.playerQueueMaxPendingPerPlayer);
