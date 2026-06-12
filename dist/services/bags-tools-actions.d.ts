export declare function equipPlayerToolById(playerId: any, playerToolId: any, tx: any): Promise<{
    success: boolean;
    message: string;
}>;
export declare function equipEquipmentFromBagById(playerId: any, equipmentInstanceId: any, bagSlotId: any, tx: any): Promise<{
    success: boolean;
    message: string;
}>;
export declare function unequipToolById(playerId: any, playerToolId: any, tx: any): Promise<{
    success: boolean;
    message: string;
}>;
export declare function unequipEquipmentByAliasImpl(playerId: any, alias: any): Promise<{
    success: boolean;
    message: string;
}>;
