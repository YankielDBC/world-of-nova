export { getMerchantIntroText } from './mystery-merchant-alerts.js';
export declare function startMysteryMerchantWorker(bot: any): void;
export declare function getMerchantSnapshotAtCoords(params: any): Promise<any>;
export declare function getMerchantSnapshotForPlayer(playerId: any): Promise<any>;
export declare function registerMerchantWitness(playerId: any, stayToken: any): Promise<void>;
export declare function confirmRumorAndVanish(api: any): Promise<boolean>;
export declare function getMerchantSellEntries(playerId: any, buybackMultiplier: any): Promise<any[]>;
export declare function sellToMerchant(params: any): Promise<{
    success: boolean;
    message: string;
    silverGained?: undefined;
} | {
    success: boolean;
    silverGained: number;
    message: string;
}>;
export declare function buyFromMerchant(params: any): Promise<{
    success: boolean;
    message: string;
}>;
