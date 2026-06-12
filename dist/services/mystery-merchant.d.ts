import { Bot } from 'grammy';
import type { MerchantSellEntry, MerchantSnapshot, TelegramApi } from './mystery-merchant-types.js';
export type { MerchantMoveResult, MerchantOffer, MerchantSellEntry, MerchantSnapshot, TelegramApi, } from './mystery-merchant-types.js';
export { getMerchantIntroText } from './mystery-merchant-alerts.js';
export declare function startMysteryMerchantWorker(bot: Bot): void;
export declare function getMerchantSnapshotAtCoords(params: {
    worldMapId: number;
    x: number;
    y: number;
}): Promise<MerchantSnapshot | null>;
export declare function getMerchantSnapshotForPlayer(playerId: number): Promise<MerchantSnapshot | null>;
export declare function registerMerchantWitness(playerId: number, stayToken: string): Promise<void>;
export declare function confirmRumorAndVanish(api: TelegramApi): Promise<boolean>;
export declare function getMerchantSellEntries(playerId: number, buybackMultiplier: number): Promise<MerchantSellEntry[]>;
export declare function sellToMerchant(params: {
    playerId: number;
    stayToken: string;
    slotUid: number;
    quantity: number;
}): Promise<{
    success: boolean;
    message: string;
    silverGained?: number;
}>;
export declare function buyFromMerchant(params: {
    playerId: number;
    stayToken: string;
    offerId: string;
    quantity: number;
}): Promise<{
    success: boolean;
    message: string;
}>;
