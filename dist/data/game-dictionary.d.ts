export interface GameEntry {
    name: string;
    shortDescription: string;
}
export declare const RACE_DICTIONARY: Record<string, GameEntry>;
export declare const CLASS_DICTIONARY: Record<string, GameEntry & {
    emoji: string;
}>;
export declare const ITEM_DICTIONARY: Record<string, GameEntry>;
export declare const STATUS_DICTIONARY: Record<string, GameEntry>;
export declare const TIME_PERIOD_DICTIONARY: Record<string, GameEntry>;
export declare function getItemShortDescription(itemName: string): string | null;
export declare function getRaceEntry(raceKey?: string | null): GameEntry | null;
export declare function getClassEntry(classKey?: string | null): (GameEntry & {
    emoji: string;
}) | null;
export declare function getStatusEntry(statusKey?: string | null): GameEntry | null;
export declare function getTimePeriodEntry(periodKey?: string | null): GameEntry | null;
