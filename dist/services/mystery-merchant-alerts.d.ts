import type { MerchantSnapshot, TelegramApi } from './mystery-merchant-types.js';
export declare function pickRandomText(options: string[]): string;
export declare function decorateMerchantAlertText(text: string): string;
export declare function sendStyledChannelAlert(api: TelegramApi, chatId: string | number, text: string): Promise<void>;
export declare function sendRumorHint(api: TelegramApi, snapshot: MerchantSnapshot): Promise<boolean>;
export declare function getMerchantIntroText(lang: 'es' | 'en' | 'ru', buybackMultiplier: number): string;
