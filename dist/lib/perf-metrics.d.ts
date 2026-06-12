export declare function observePerf(metricKey: string, durationMs: number): void;
export declare function measurePerf<T>(metricKey: string, fn: () => Promise<T>): Promise<T>;
export declare function startPerfReporter(): void;
