type MarkTileExploredFn = (playerId: number, playerTgId: string, x: number, y: number) => Promise<void>;
export declare function finalizePlayerMove(tgId: string, playerId: number, toX: number, toY: number, isNewDiscovery: boolean, energyCost: number, expectedFrom: {
    x: number;
    y: number;
} | undefined, markTileExplored: MarkTileExploredFn): Promise<{
    applied: true;
    alreadyAtDestination: false;
} | {
    applied: false;
    alreadyAtDestination: boolean;
}>;
export {};
