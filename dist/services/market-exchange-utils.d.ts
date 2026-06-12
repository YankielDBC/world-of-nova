export declare function safeInt(value: any): number;
export declare function clampInt(value: any, min: any, max: any): number;
export declare function aggregateByPrice(rows: any, depth: any): {
    priceSilver: any;
    quantity: any;
}[];
export declare function aggregateFxByPrice(rows: any, depth: any, sortMode: any): {
    priceSilver: any;
    goldAmount: any;
}[];
export declare function getSlotWeightKg(slot: any): any;
export declare function getFreeSlotIndexes(slots: any, capacity: any): any[];
export declare function formatAgoMinutes(createdAt: any): string;
