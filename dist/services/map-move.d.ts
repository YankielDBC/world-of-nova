import { type MovementMode } from './map-utils.js';
export interface MoveResult {
    success: boolean;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    energyCost: number;
    travelTime: number;
    mode: MovementMode;
    message: string;
    arrivalMessage?: string;
    placeArrival?: {
        name: string;
        emoji: string;
        buildings: string[];
    };
    isNewDiscovery: boolean;
}
export declare function finalizePlayerMove(tgId: string, playerId: number, toX: number, toY: number, isNewDiscovery: boolean, energyCost: number, expectedFrom?: {
    x: number;
    y: number;
}): Promise<{
    applied: true;
    alreadyAtDestination: false;
} | {
    applied: false;
    alreadyAtDestination: boolean;
}>;
export declare function movePlayer(tgId: string, direction: 'up' | 'down' | 'left' | 'right'): Promise<MoveResult>;
