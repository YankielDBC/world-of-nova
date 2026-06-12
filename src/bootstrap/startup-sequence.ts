// @ts-nocheck
import { RUNTIME_CONFIG } from '../lib/runtime-config.js';
export async function runStartupSequence(bot, deps) {
    console.log('⚔️ World of Nova - Nightfall v1.0');
    deps.logMapDebug('startup.begin');
    await deps.connectDB();
    deps.logMapDebug('startup.db.connected');
    const worldMapNormalization = await deps.ensureSingleCanonicalWorldMap();
    deps.logMapDebug('startup.world-map.normalized', worldMapNormalization);
    if (worldMapNormalization.mergedMapIds.length > 0) {
        console.log(`🗺️ World map normalized: canonical=${worldMapNormalization.canonicalMapName} (#${worldMapNormalization.canonicalMapId}), merged=${worldMapNormalization.mergedMapIds.join(', ')}`);
    }
    await deps.ensureExpandedWorldGenerationCatalog();
    deps.logMapDebug('startup.world-catalog.ready');
    await deps.ensureBagEmojisEnabled();
    deps.logMapDebug('startup.bag-emojis.ready');
    await deps.ensureNovaMarketEnabled();
    deps.logMapDebug('startup.market.ready');
    await deps.ensureNovaFishingEnabled();
    deps.logMapDebug('startup.fishing.ready');
    await deps.ensureRacialTalentSchema();
    deps.logMapDebug('startup.racial-talents.ready');
    await deps.ensureBuildSkillSchema();
    deps.logMapDebug('startup.build-skills.ready');
    await deps.ensureCreatureSchema();
    deps.logMapDebug('startup.creatures.ready');
    deps.startPerfReporter();
    deps.logMapDebug('startup.perf-reporter.started');
    if (RUNTIME_CONFIG.enableBackgroundWorkers) {
        deps.startRecoverySweeper();
        deps.startGameJobWorker(bot);
        deps.startClimateWorker(bot);
        deps.startMysteryMerchantWorker(bot);
        deps.logMapDebug('startup.background-workers.started', {
            recovery: true,
            gameJobs: true,
            climate: true,
            merchant: true,
        });
    }
    deps.triggerDevExplorer(false);
    deps.logMapDebug('startup.dev-explorer.triggered');
    console.log('📡 Connecting to Telegram...');
    deps.logMapDebug('startup.telegram.connecting');
    await deps.primeCustomEmojiAvailability(bot);
    deps.logMapDebug('startup.custom-emojis.primed');
    const communityPublishResult = await deps.publishCommunityPatchNotes(bot.api);
    deps.logMapDebug('startup.community-patches.published', communityPublishResult);
    await bot.api.setMyCommands([
        { command: 'start', description: 'Start game' },
        { command: 'help', description: 'Show help' },
        { command: 'interact', description: 'Interactions on current tile' },
        { command: 'merchant', description: 'Talk to Mysterious Merchant' },
        { command: 'racial', description: 'Open racial talents' },
        { command: 'bs', description: 'Open build skills' },
        { command: 'devmode', description: 'Developer world scan report' },
    ]);
    console.log('✅ Bot ready!');
    console.log('👂 Listening for messages...');
}
