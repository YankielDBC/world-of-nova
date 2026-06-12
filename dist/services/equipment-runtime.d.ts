export declare function parseEquipmentStatsJson(raw: any): {};
export declare function buildEquipmentModifierBreakdown(item: any): {
    itemId: any;
    templateKey: string;
    slot: string;
    rarity: string;
    implicit: {};
    explicit: {};
    combined: {};
};
export declare function collectEquipmentModifiers(items: any): {
    combat: {};
    utility: {};
    breakdown: any;
    gearScore: any;
};
