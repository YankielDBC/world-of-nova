export declare function addResourceToActiveBag(playerId: any, resourceName: any, quantity: any): Promise<{
    success: boolean;
    reason: string;
    addedQuantity?: undefined;
    usage?: undefined;
} | {
    success: boolean;
    addedQuantity: any;
    usage: {
        usedSlots: any;
        totalSlots: any;
        usedWeightKg: number;
        totalWeightKg: any;
    };
    reason?: undefined;
}>;
export declare function storeGatheredItems(playerId: any, items: any): Promise<{
    stored: any[];
    rejected: any[];
}>;
export declare function useBagSlot(playerId: any, slotIndex: any, quantity: any): Promise<{
    success: boolean;
    message: string;
    groundPayload?: undefined;
} | {
    success: boolean;
    message: string;
    groundPayload: {
        kind: string;
        emoji: any;
        name: any;
        quantity: number;
        equipmentInstanceId: any;
        templateKey: any;
    };
}>;
export declare function dropBagSlot(playerId: any, slotIndex: any, quantity: any): Promise<{
    success: boolean;
    message: string;
    groundPayload?: undefined;
} | {
    success: boolean;
    message: string;
    groundPayload: {
        kind: string;
        emoji: any;
        name: any;
        quantity: number;
        playerToolId: any;
        toolKey: any;
        resourceName?: undefined;
        resourceId?: undefined;
    };
} | {
    success: boolean;
    message: string;
    groundPayload: {
        kind: string;
        emoji: any;
        name: any;
        quantity: any;
        resourceName: any;
        resourceId: any;
        playerToolId?: undefined;
        toolKey?: undefined;
    };
}>;
export declare function grantBagToPlayer(playerId: any, bagSlug: any): Promise<{
    success: boolean;
    message: string;
}>;
export declare function pickupDroppedEquipment(playerId: any, input: any): Promise<{
    success: boolean;
    message: string;
}>;
