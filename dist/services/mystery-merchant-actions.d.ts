export declare function getMerchantSellEntries(playerId: any, buybackMultiplier: any): Promise<any[]>;
export declare function sellToMerchant(params: any): Promise<{
    success: boolean;
    message: string;
    silverGained?: undefined;
} | {
    success: boolean;
    silverGained: number;
    message: string;
}>;
export declare function buyFromMerchant(params: any): Promise<{
    success: boolean;
    message: string;
}>;
