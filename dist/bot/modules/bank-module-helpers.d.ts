import { InlineKeyboard } from 'grammy';
export declare const BANK_SCOPE = "bank";
export declare function getPlayerLanguage(player: any): any;
export declare function getVaultProfileByBuildingKey(buildingKey: any): "village" | "crown";
export declare function isVillageChest(buildingKey: any): boolean;
export declare function isPlayerAtPlaceById(player: any, placeId: any): Promise<boolean>;
export declare function parseBankMoneyInput(text: any): {
    amount: number;
    currency: string;
};
export declare function sendBankScreen(ctx: any, mode: any, text: any, keyboard: any): Promise<void>;
export declare function buildBankHubKeyboard(placeId: any, buildingKey: any, lang: any): InlineKeyboard;
export declare function buildBankObjectDirectionKeyboard(placeId: any, buildingKey: any): InlineKeyboard;
export declare function buildBankObjectListKeyboard(placeId: any, buildingKey: any): InlineKeyboard;
export declare function buildBankMoneyDirectionKeyboard(placeId: any, buildingKey: any): InlineKeyboard;
export declare function buildBankMoneyAmountKeyboard(placeId: any, buildingKey: any): InlineKeyboard;
export declare function buildBankMoneyConfirmKeyboard(): InlineKeyboard;
