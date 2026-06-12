import { type Bot } from 'grammy';
import type { AnyCtx, LanguageLike } from '../../types/runtime-contracts.js';
interface PlaceInteractionHandlersDeps {
    bot: Bot;
    observePerf: (metricKey: string, durationMs: number) => void;
    sleep: (ms: number) => Promise<void>;
    t: (lang: string, key: string, params?: Record<string, unknown>) => string;
    t3: (lang: string, es: string, en: string, ru: string) => string;
    prisma: any;
    getPlayerByTelegramId: (tgId: string) => Promise<any>;
    getPlayerLanguage: (player?: {
        language?: string | null;
    }) => LanguageLike;
    getPlaceUiConfig: (slug: string) => any;
    getLocalizedText: (entry: any, lang: LanguageLike, fallback?: string) => string;
    executeCustomPlaceInteraction: (params: any) => Promise<any>;
    getTimedPlaceRecoverySeconds: (slug: string) => number | null;
    getCanonicalWorldMap: () => Promise<{
        id: number;
    }>;
    setSoulAnchorForPlayer: (params: any) => Promise<void>;
    getRecoveryInterruptLabel: (slug: string, lang: LanguageLike) => string;
    getRecoveryFocusLabel: (slug: string, lang: LanguageLike) => string;
    getActivePlaceRecoveryByTgId: (tgId: string) => Promise<any>;
    getRecoveryRemainingSeconds: (active: any) => number;
    formatRemainingTime: (seconds: number) => string;
    finalizeRecoveryState: (params: any) => Promise<any>;
    upsertActivePlaceRecovery: (params: any) => Promise<any>;
    getRecoveryEffectTypeFromSlug: (slug: string) => 'ENERGY' | 'HP';
    CUSTOM_PLACE_FREE_SERVICES: Set<string>;
    FREE_RECOVERY_RATE_PER_SECOND: number;
    renderMap: (tgId: string) => Promise<any>;
    renderMapCardText: (mapResult: any, lang: LanguageLike) => string;
    sendMapCardSafeViaContext: (params: any) => Promise<void>;
}
export declare function createPlaceInteractionHandlers(deps: PlaceInteractionHandlersDeps): {
    finalizeActiveRecovery: (params: {
        tgId: string;
        interrupted: boolean;
        expectedToken?: string;
        editCtx?: AnyCtx;
    }) => Promise<void>;
    startPlaceRecovery: (params: {
        ctx: AnyCtx;
        tgId: string;
        playerId: number;
        lang: string;
        placeId: number;
        buildingKey: string;
        slug: string;
        serviceName: string;
        lore: string;
        effectType: "ENERGY" | "HP";
        totalSeconds: number;
        targetGain?: number;
        ratePerSecond?: number;
        costType: "SILVER" | "GOLD" | null;
        costAmount: number;
    }) => Promise<boolean>;
    handleCustomRecoveryService: (ctx: AnyCtx, placeId: number, buildingKey: string, serviceSlug: string) => Promise<void>;
    handlePlaceInteraction: (ctx: AnyCtx, interactionId: number) => Promise<void>;
};
export {};
