import type { Language } from '../lib/i18n.js';
export type RecoveryEffectType = 'ENERGY' | 'HP';
export type ActiveRecoveryState = {
    token: string;
    slug: string;
    placeId: number;
    buildingKey: string;
    serviceName: string;
    lore: string;
    effectType: RecoveryEffectType;
    startValue: number;
    maxValue: number;
    ratePerSecond: number;
    startedAt: number;
    endsAt: number;
    chatId: number;
};
export type FinalizedRecoveryState = {
    active: ActiveRecoveryState;
    previousValue: number;
    nextValue: number;
    gold: number;
    silver: number;
    language: Language;
    chatId: number;
};
export declare const TIMED_PLACE_RECOVERY_SECONDS: Record<string, number>;
export declare const FREE_RECOVERY_PER_15_MIN = 1.0416;
export declare const FREE_RECOVERY_RATE_PER_SECOND: number;
export declare const CUSTOM_PLACE_FREE_SERVICES: Set<string>;
export declare function getActivePlaceRecoveryByTgId(tgId: string): Promise<ActiveRecoveryState | null>;
export declare function hasActivePlaceRecovery(tgId: string): Promise<boolean>;
export declare function upsertActivePlaceRecovery(params: {
    playerId: number;
    tgId: string;
    state: ActiveRecoveryState;
}): Promise<ActiveRecoveryState>;
export declare function listDueRecoveryTgIds(limit?: number): Promise<string[]>;
export declare function finalizeRecoveryState(params: {
    tgId: string;
    interrupted: boolean;
    expectedToken?: string;
}): Promise<FinalizedRecoveryState | null>;
export declare function getTimedPlaceRecoverySeconds(slug: string): number | null;
export declare function getRecoveryEffectTypeFromSlug(slug: string): RecoveryEffectType;
export declare function getRecoveryInterruptLabel(slug: string, lang: Language): string;
export declare function getRecoveryFocusLabel(slug: string, lang: Language): string;
export declare function getRecoveryRemainingSeconds(state: ActiveRecoveryState): number;
export declare function getRecoveryProjectedValue(state: ActiveRecoveryState): number;
