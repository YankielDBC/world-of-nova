import type { Language } from '../../lib/i18n.js';
import type { AnyCtx } from '../../types/runtime-contracts.js';
export declare function sleep(ms: number): Promise<void>;
export declare function getPlayerLanguage(player?: {
    language?: string | null;
}): Language;
export declare function clearCallbackKeyboard(ctx: AnyCtx): Promise<void>;
export declare function t3(lang: string, es: string, en: string, ru: string): string;
export declare function createLowVitalsNotifier(deps: {
    consumeLowVitalsAlertByTgId: (tgId: string) => Promise<{
        text: string;
    } | null>;
}): (ctx: AnyCtx, tgId: string) => Promise<void>;
