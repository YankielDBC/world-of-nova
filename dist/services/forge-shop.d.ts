export declare function getForgeSellEntries(playerId: any): Promise<{
    listIndex: any;
    slotUid: any;
    slotIndex: any;
    kind: string;
    emoji: any;
    name: any;
    quantity: any;
    unitSilver: number;
    totalSilver: number;
}[]>;
export declare function sellForgeEntry(playerId: any, slotUid: any, quantity: any): Promise<{
    success: boolean;
    message: string;
    silverGained?: undefined;
} | {
    success: boolean;
    message: string;
    silverGained: number;
}>;
export declare function sellAllForgeEntries(playerId: any): Promise<{
    success: boolean;
    message: string;
    silverGained?: undefined;
} | {
    success: boolean;
    message: string;
    silverGained: number;
}>;
