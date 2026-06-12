import type { AnyCtx, LanguageLike } from '../../types/runtime-contracts.js';
interface PlayerMiscHandlersDeps {
    getPlayerByTelegramId: (tgId: string) => Promise<any>;
    formatClassName: (className?: string | null, fallback?: string) => string;
    getPlayerLanguage: (player?: {
        language?: string | null;
    }) => LanguageLike;
    t3: (lang: string, es: string, en: string, ru: string) => string;
    triggerDevExplorer: (force: boolean) => void;
    getDevExplorerState: () => {
        status: 'idle' | 'running' | 'done' | 'error' | 'ready';
        processedTiles: number;
    };
    renderDevExplorerReport: (lang: LanguageLike) => string;
    renderBuildTelemetrySummary: (lang: LanguageLike) => Promise<string>;
    executeBagSwitch: (playerId: number, targetBagId: number | 'pockets') => Promise<{
        success: boolean;
        message: string;
    }>;
    renderBagResponse: (ctx: AnyCtx, mode?: 'reply' | 'edit') => Promise<void>;
}
export declare function resolvePlayerDisplayTitle(rawTitleInput: string | null | undefined, level: number, className?: string | null): string;
export declare function createPlayerMiscHandlers(deps: PlayerMiscHandlersDeps): {
    handleTitle: (ctx: AnyCtx) => Promise<void>;
    handleDevMode: (ctx: AnyCtx) => Promise<void>;
    handleUnequipBag: (ctx: AnyCtx) => Promise<void>;
};
export {};
