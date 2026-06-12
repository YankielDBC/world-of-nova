import { type InlineKeyboard as InlineKeyboardType } from 'grammy';
import type { AnyCtx, LanguageLike } from '../../types/runtime-contracts.js';
import type { BagUsage } from '../../services/bags-types.js';
interface PlayerProfileHandlersDeps {
    getPlayerByTelegramId: (tgId: string) => Promise<any>;
    ensurePlayerProgression: (playerId: number, grantStarterSkills?: boolean) => Promise<void>;
    getCanonicalWorldMap: () => Promise<{
        id: number;
    }>;
    getOrCreateTile: (worldMapId: number, x: number, y: number) => Promise<any>;
    getPlaceAtCoords: (x: number, y: number) => Promise<any>;
    prisma: any;
    getGameplayEffectsForPlayer: (playerId: number) => Promise<any>;
    getPlayerEquipmentCombatModifiers: (playerId: number) => Promise<any>;
    calculateCombatStats: (player: any, modifiers?: any) => any;
    getPlayerLanguage: (player?: {
        language?: string | null;
    }) => LanguageLike;
    getRaceEntry: (raceKey?: string | null) => any;
    getClassEntry: (classKey?: string | null) => any;
    formatTokenName: (token?: string | null, fallback?: string) => string;
    formatClassName: (className?: string | null, fallback?: string) => string;
    t: (lang: string, key: string, params?: Record<string, unknown>) => string;
    profileEmoji: string;
    classEmoji: string;
    getDeathSummaryForProfile: (tgId: string) => Promise<string | null>;
    getLocationDisplayLabel: (tile: any, place: any, lang?: LanguageLike) => string;
    getActiveBagUsage: (playerId: number) => Promise<BagUsage | null>;
    buildProfileCard: (payload: any, lang?: LanguageLike) => string;
    getRequiredXpForLevel: (level: number) => number;
    supportedLanguages: Record<string, {
        name: string;
        flag: string;
    }>;
    updateLanguageMessage: (ctx: AnyCtx, text: string, keyboard: InlineKeyboardType) => Promise<void>;
}
export declare function createPlayerProfileHandlers(deps: PlayerProfileHandlersDeps): {
    handleProfile: (ctx: AnyCtx) => Promise<void>;
    handleLanguageChange: (ctx: AnyCtx) => Promise<void>;
};
export {};
