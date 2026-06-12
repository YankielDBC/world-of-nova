import { type BankBalance, type BankSummary, type DbClient, type VaultMoveEntry, type VaultMoveResult, type VaultOverview, type VaultProfile } from './crown-bank-core.js';
export type BankCurrency = 'SILVER' | 'GOLD';
export type VaultMoveDirection = 'bag_to_vault' | 'vault_to_bag';
export type { VaultProfile, VaultMoveEntry, VaultMoveResult, VaultOverview, BankBalance, BankSummary } from './crown-bank-core.js';
export declare function getVaultBalance(playerId: number, db?: DbClient): Promise<BankBalance>;
export declare function getBankSummary(playerId: number): Promise<BankSummary>;
export declare function calculateDepositFeeSilver(currency: BankCurrency, amount: number): number;
export declare function getVaultOverview(playerId: number, profile?: VaultProfile): Promise<VaultOverview>;
export declare function listVaultMoveEntries(playerId: number, direction: VaultMoveDirection, profile?: VaultProfile): Promise<{
    entries: VaultMoveEntry[];
    overview: VaultOverview;
}>;
export declare function moveVaultObject(playerId: number, direction: VaultMoveDirection, slotUid: number, quantity?: number, profile?: VaultProfile): Promise<VaultMoveResult>;
export declare function depositToVault(playerId: number, currency: BankCurrency, amount: number): Promise<{
    success: boolean;
    message: string;
    summary?: BankSummary;
}>;
export declare function depositToVaultWithFee(playerId: number, currency: BankCurrency, amount: number): Promise<{
    success: boolean;
    message: string;
    summary?: BankSummary;
    feeSilver?: number;
}>;
export declare function withdrawFromVault(playerId: number, currency: BankCurrency, amount: number): Promise<{
    success: boolean;
    message: string;
    summary?: BankSummary;
}>;
