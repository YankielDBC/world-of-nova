export declare function safeInt(value: unknown): number;
export declare function clampInt(value: number, min: number, max: number): number;
export declare function aggregateByPrice(rows: Array<{
    priceSilver: number;
    qty: number;
}>, depth: number): Array<{
    priceSilver: number;
    quantity: number;
}>;
export declare function aggregateFxByPrice(rows: Array<{
    priceSilverPerGold: number;
    qty: number;
}>, depth: number, sortMode: 'asc' | 'desc'): Array<{
    priceSilver: number;
    goldAmount: number;
}>;
export declare function getSlotWeightKg(slot: {
    quantity: number;
    resource?: {
        weightKg: number;
    } | null;
    playerTool?: {
        toolKey: string;
    } | null;
    storedBag?: {
        definition: {
            itemWeightKg: number;
        } | null;
    } | null;
    toolKey?: string | null;
}): number;
export declare function getFreeSlotIndexes(slots: Array<{
    slotIndex: number;
}>, capacity: number): number[];
export declare function formatAgoMinutes(createdAt: Date): string;
