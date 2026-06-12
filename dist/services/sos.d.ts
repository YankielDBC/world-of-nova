import { type Language } from '../lib/i18n.js';
export interface SosRequestResult {
    success: boolean;
    message: string;
}
export declare function requestSosDelivery(playerId: number, lang: Language): Promise<SosRequestResult>;
