export declare function getItemHoldingsForPlayer(playerId: number): Promise<Array<{
    resourceId: number;
    name: string;
    emoji: string;
    quantity: number;
}>>;
export declare function getResourceStockByContainer(playerId: number, resourceId: number): Promise<{
    bagQty: number;
    vaultQty: number;
    totalQty: number;
}>;
export declare function formatMarketTimeAgo(date: Date): string;
