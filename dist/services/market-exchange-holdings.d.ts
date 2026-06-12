export declare function getItemHoldingsForPlayer(playerId: any): Promise<{
    resourceId: any;
    name: any;
    emoji: any;
    quantity: any;
}[]>;
export declare function getResourceStockByContainer(playerId: any, resourceId: any): Promise<{
    bagQty: number;
    vaultQty: number;
    totalQty: number;
}>;
export declare function formatMarketTimeAgo(date: any): string;
