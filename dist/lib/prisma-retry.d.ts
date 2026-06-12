export declare function isRetryablePrismaError(error: unknown): boolean;
export declare function withPrismaRetry<T>(label: string, fn: () => Promise<T>, options?: {
    attempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
}): Promise<T>;
