export declare function coordKey(x: number, y: number): string;
export declare function randomInt(min: number, max: number): number;
export declare function randomFloat(min: number, max: number): number;
export declare function normalizeMerchantDisplayName(name: string): string;
export declare function parseForcedMerchantCoords(raw: string): {
    x: number;
    y: number;
} | null;
export declare function sampleUnique<T>(items: T[], count: number): T[];
export declare function formatEtaFromDistance(distance: number, secondsPerTile: number): string;
export declare function pickRandomText(options: string[]): string;
export declare function decorateMerchantAlertText(text: string): string;
