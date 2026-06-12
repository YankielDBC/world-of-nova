import { InlineKeyboard } from 'grammy';
import { type Language } from '../../lib/i18n.js';
import type { BankCurrency, VaultMoveDirection, VaultMoveEntry, VaultProfile } from '../../services/crown-bank.js';
export type BankConversationState = {
    phase: 'object_listing';
    placeId: number;
    buildingKey: string;
    vaultProfile: VaultProfile;
    direction: VaultMoveDirection;
    entries: VaultMoveEntry[];
} | {
    phase: 'object_qty';
    placeId: number;
    buildingKey: string;
    vaultProfile: VaultProfile;
    direction: VaultMoveDirection;
    entries: VaultMoveEntry[];
    entry: VaultMoveEntry;
} | {
    phase: 'money_amount';
    placeId: number;
    buildingKey: string;
    direction: 'deposit' | 'withdraw';
} | {
    phase: 'money_confirm';
    placeId: number;
    buildingKey: string;
    direction: 'deposit' | 'withdraw';
    currency: BankCurrency;
    amount: number;
    feeSilver: number;
};
export declare const BANK_SCOPE = "bank";
export declare function getPlayerLanguage(player?: {
    language?: string | null;
}): Language;
export declare function getVaultProfileByBuildingKey(buildingKey: string): VaultProfile;
export declare function isVillageChest(buildingKey: string): boolean;
export declare function isPlayerAtPlaceById(player: {
    mapX: number;
    mapY: number;
}, placeId: number): Promise<boolean>;
export declare function parseBankMoneyInput(text: string): {
    amount: number;
    currency: BankCurrency;
} | null;
export declare function sendBankScreen(ctx: any, mode: 'reply' | 'edit', text: string, keyboard: InlineKeyboard): Promise<void>;
export declare function buildBankHubKeyboard(placeId: number, buildingKey: string, lang: Language): InlineKeyboard;
export declare function buildBankObjectDirectionKeyboard(placeId: number, buildingKey: string): InlineKeyboard;
export declare function buildBankObjectListKeyboard(placeId: number, buildingKey: string): InlineKeyboard;
export declare function buildBankMoneyDirectionKeyboard(placeId: number, buildingKey: string): InlineKeyboard;
export declare function buildBankMoneyAmountKeyboard(placeId: number, buildingKey: string): InlineKeyboard;
export declare function buildBankMoneyConfirmKeyboard(): InlineKeyboard;
