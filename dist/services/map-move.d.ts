export declare function finalizePlayerMove(tgId: any, playerId: any, toX: any, toY: any, isNewDiscovery: any, energyCost: any, expectedFrom: any): Promise<{
    applied: boolean;
    alreadyAtDestination: boolean;
}>;
export declare function movePlayer(tgId: any, direction: any): Promise<{
    success: boolean;
    fromX: number;
    fromY: number;
    toX: any;
    toY: any;
    energyCost: number;
    travelTime: number;
    mode: string;
    message: string;
    isNewDiscovery: boolean;
    arrivalMessage?: undefined;
    placeArrival?: undefined;
} | {
    success: boolean;
    fromX: number;
    fromY: number;
    toX: any;
    toY: any;
    energyCost: number;
    travelTime: number;
    mode: string;
    message: string;
    arrivalMessage: any;
    placeArrival: any;
    isNewDiscovery: boolean;
}>;
