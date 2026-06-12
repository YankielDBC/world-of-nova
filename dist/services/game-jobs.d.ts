import { Bot } from 'grammy';
type MoveArrivalPayload = {
    tgId: string;
    playerId: number;
    chatId: number;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    energyCost: number;
    isNewDiscovery: boolean;
    arrivalMessage?: string;
    placeArrival?: {
        name: string;
        emoji: string;
        buildings: string[];
    };
};
type VentureArrivalPayload = {
    tgId: string;
    playerId: number;
    chatId: number;
    targetX: number;
    targetY: number;
    totalEnergy: number;
    totalSeconds: number;
};
export declare function enqueueMoveArrivalJob(params: MoveArrivalPayload, delaySeconds: number): Promise<void>;
export declare function enqueueVentureArrivalJob(params: VentureArrivalPayload, delaySeconds: number): Promise<void>;
export declare function hasPendingTravelJob(tgId: string): Promise<boolean>;
export declare function startGameJobWorker(bot: Bot): void;
export {};
