import { type Bot } from 'grammy';
import type { Language } from '../../lib/i18n.js';
import type { ActiveRecoveryState } from '../../services/place-recovery.js';
type AnyCtx = any;
interface InstallCoreMiddlewareDeps {
    debugLogsEnabled: boolean;
    observePerf: (metricKey: string, durationMs: number) => void;
    touchPlayerActivity: (tgId: string) => Promise<void>;
    getActivePlaceRecoveryByTgId: (tgId: string) => Promise<ActiveRecoveryState | null>;
    getPlayerByTelegramId: (tgId: string) => Promise<any>;
    getPlayerLanguage: (player?: {
        language?: string | null;
    }) => Language;
    finalizeActiveRecovery: (params: {
        tgId: string;
        interrupted: boolean;
    }) => Promise<void>;
    getRecoveryRemainingSeconds: (active: ActiveRecoveryState) => number;
    t3: (lang: Language, es: string, en: string, ru: string) => string;
    formatRemainingTime: (seconds: number) => string;
    getRecoveryInterruptLabel: (slug: string, lang: Language) => string;
    buildGhostBlockedText: (tgId: string) => Promise<string | null>;
    safeAnswerCallbackQuery: (ctx: AnyCtx, text?: string) => Promise<void>;
    isPlayerGhostByTgId: (tgId: string) => Promise<boolean>;
    getActivePveEncounterByTgId: (tgId: string) => Promise<unknown | null>;
    renderPveBlockedPrompt: (ctx: AnyCtx) => Promise<boolean>;
}
export declare function installCoreMiddleware(bot: Bot, deps: InstallCoreMiddlewareDeps): void;
export {};
