export declare function mutateTileResourceState(tileId: any, mutator: any, maxRetries?: number): Promise<{
    ok: boolean;
    result: any;
    attempts: number;
}>;
