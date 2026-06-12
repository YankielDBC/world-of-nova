export type ForgeSellEntryKind = 'resource' | 'tool' | 'bag';
export interface ForgeSellEntry {
    listIndex: number;
    slotUid: number;
    slotIndex: number;
    kind: ForgeSellEntryKind;
    emoji: string;
    name: string;
    quantity: number;
    unitSilver: number;
    totalSilver: number;
}
export interface ForgeSaleResult {
    success: boolean;
    message: string;
    silverGained?: number;
}
export declare function getForgeSellEntries(playerId: number): Promise<ForgeSellEntry[]>;
export declare function sellForgeEntry(playerId: number, slotUid: number, quantity: number): Promise<ForgeSaleResult>;
export declare function sellAllForgeEntries(playerId: number): Promise<ForgeSaleResult>;
