import type { Bot } from 'grammy';
interface WorldMapNormalizationResult {
    canonicalMapName: string;
    canonicalMapId: number;
    mergedMapIds: number[];
}
interface StartupSequenceDeps {
    connectDB: () => Promise<void>;
    logMapDebug: (event: string, payload?: unknown) => void;
    ensureSingleCanonicalWorldMap: () => Promise<WorldMapNormalizationResult>;
    ensureExpandedWorldGenerationCatalog: () => Promise<void>;
    ensureBagEmojisEnabled: () => Promise<void>;
    ensureNovaMarketEnabled: () => Promise<void>;
    ensureNovaFishingEnabled: () => Promise<void>;
    ensureRacialTalentSchema: () => Promise<void>;
    ensureBuildSkillSchema: () => Promise<void>;
    ensureCreatureSchema: () => Promise<void>;
    startPerfReporter: () => void;
    startRecoverySweeper: () => void;
    startGameJobWorker: (bot: Bot) => void;
    startClimateWorker: (bot: Bot) => void;
    startMysteryMerchantWorker: (bot: Bot) => void;
    triggerDevExplorer: (force: boolean) => void;
    primeCustomEmojiAvailability: (bot: Bot) => Promise<void>;
    publishCommunityPatchNotes: (api: Bot['api']) => Promise<{
        posted: number;
        edited: number;
        skipped: number;
        failed: number;
    }>;
}
export declare function runStartupSequence(bot: Bot, deps: StartupSequenceDeps): Promise<void>;
export {};
