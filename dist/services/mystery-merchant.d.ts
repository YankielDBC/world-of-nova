export { getMerchantIntroText } from './mystery-merchant-alerts.js';
export declare function startMysteryMerchantWorker(bot: any): void;
export declare function getMerchantSnapshotAtCoords(params: any): Promise<any>;
export declare function getMerchantSnapshotForPlayer(playerId: any): Promise<any>;
export declare function registerMerchantWitness(playerId: any, stayToken: any): Promise<void>;
export declare function confirmRumorAndVanish(api: any): Promise<boolean>;
export { getMerchantSellEntries, sellToMerchant, buyFromMerchant } from './mystery-merchant-actions.js';
