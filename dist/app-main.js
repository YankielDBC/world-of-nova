// @ts-nocheck
// World of Nova - Main Entry Point (DEBUG VERSION)
// Nightfall Patch v1.0
import { Bot } from 'grammy';
import dotenv from 'dotenv';
import { t, SUPPORTED_LANGUAGES } from './lib/i18n.js';
import { connectDB, getPlayerByTelegramId, updatePlayerLanguage, calculateCombatStats, prisma } from './lib/db.js';
import { EMOJIS } from './data/emojis.js';
import { getClassEntry, getRaceEntry } from './data/game-dictionary.js';
import { getPlaceUiConfig, getLocalizedText } from './data/place-ui.js';
import { buildProfileCard, formatClassName, formatTokenName, getRequiredXpForLevel } from './lib/player-ui.js';
import { RUNTIME_CONFIG } from './lib/runtime-config.js';
import { observePerf, startPerfReporter } from './lib/perf-metrics.js';
import { playerActionQueue } from './lib/player-action-queue.js';
import { touchPlayerActivity } from './lib/player-activity.js';
import { formatErrorForLog } from './lib/log-sanitize.js';
import { installCustomEmojiTransformer, primeCustomEmojiAvailability, } from './lib/telegram-custom-emojis.js';
import { logMapDebug } from './lib/map-debug.js';
import { clearConversationState, getConversationState, setConversationState } from './lib/conversation-state.js';
import { listBiomes } from './services/gathering.js';
import { ensurePlayerBagSetup, executeBagSwitch, getActiveBagItemInfoByUid, getActiveBagUsage, getActiveBagView, equipToolFromBagItem, listBagSwitchOptions, previewBagSwitch, useBagSlot, dropBagSlot, equipToolByAlias, unequipToolByAlias, unequipEquipmentByAlias, getEquipmentCard, grantToolToPlayer, } from './services/bags.js';
import { getToolsCard } from './services/tools.js';
import { ensurePlayerProgression, getSkillsCard } from './services/progression.js';
import { executeInspectAction, getInspectNodesForPlayer, renderInspectForPlayer } from './services/inspect.js';
import { renderMap, movePlayer, getOrCreateTile, getLocationDisplayLabel, getPlaceAtCoords, ensureTilesGeneratedForCoords } from './services/map.js';
import { executeCustomPlaceInteraction } from './services/place-custom.js';
import { enqueueMoveArrivalJob, enqueueVentureArrivalJob, hasPendingTravelJob, startGameJobWorker, } from './services/game-jobs.js';
import { startClimateWorker } from './services/climate.js';
import { exitActiveCaveForTgId, getActiveCaveContextByTgId, movePlayerInCave } from './services/cave-system.js';
import { getMerchantSnapshotAtCoords, startMysteryMerchantWorker } from './services/mystery-merchant.js';
import { ensureCreatureSchema, getCreatureSnapshotsAtCoords, } from './services/creatures.js';
import { buildGhostBlockedText, getDeathSummaryForProfile, getGhostHintText, getActiveDeathStateByPlayerId, isPlayerGhostByTgId, moveGhostPlayer, recoverOwnCorpse, setSoulAnchorForPlayer, } from './services/death-system.js';
import { getTilePopulationAtCoords } from './services/population.js';
import { finalizeRecoveryState, FREE_RECOVERY_RATE_PER_SECOND, CUSTOM_PLACE_FREE_SERVICES, getActivePlaceRecoveryByTgId, getTimedPlaceRecoverySeconds, hasActivePlaceRecovery, getRecoveryEffectTypeFromSlug, getRecoveryInterruptLabel, getRecoveryFocusLabel, listDueRecoveryTgIds, getRecoveryRemainingSeconds, upsertActivePlaceRecovery, } from './services/place-recovery.js';
import { requestSosDelivery } from './services/sos.js';
import { consumeLowVitalsAlertByTgId } from './services/vitals-alerts.js';
import { ensureSingleCanonicalWorldMap, getCanonicalWorldMap } from './services/world-map.js';
import { createForgeModule } from './bot/modules/forge-module.js';
import { createBankModule } from './bot/modules/bank-module.js';
import { createPlaceModule } from './bot/modules/place-module.js';
import { createRegistrationModule } from './bot/modules/registration-module.js';
import { createMysteryMerchantModule } from './bot/modules/mystery-merchant-module.js';
import { createMarketModule } from './bot/modules/market-module.js';
import { createRacialModule } from './bot/modules/racial-module.js';
import { createBuildModule } from './bot/modules/build-module.js';
import { createPveModule } from './bot/modules/pve-module.js';
import { registerCoreCommands } from './bot/runtime/register-core-commands.js';
import { registerCallbackRouter } from './bot/runtime/register-callback-router.js';
import { registerMessageRouter } from './bot/runtime/register-message-router.js';
import { installCoreMiddleware } from './bot/middleware/install-core-middleware.js';
import { createGhostHandlers, createMapMoveHandler, createOpenMapInCurrentMessage, createSafeAnswerCallbackQuery, installSafeCallbackAnswerMiddleware, } from './bot/handlers/map-utility-handlers.js';
import { createPlayerMiscHandlers } from './bot/handlers/player-misc-handlers.js';
import { createPlayerProfileHandlers } from './bot/handlers/player-profile-handlers.js';
import { clearCallbackKeyboard, createLowVitalsNotifier, getPlayerLanguage, sleep, t3 } from './bot/handlers/runtime-utility-handlers.js';
import { createVentureFlowHandlers } from './bot/handlers/venture-flow-handlers.js';
import { createBagFlowHandlers } from './bot/handlers/bag-flow-handlers.js';
import { createInspectAndInteractionsHandlers } from './bot/handlers/inspect-and-interactions-handlers.js';
import { createPlaceInteractionHandlers } from './bot/handlers/place-interaction-handlers.js';
import { createConversationScopes } from './bot/state/conversation-scopes.js';
import { sendMapCardSafeViaContext } from './services/map-delivery.js';
import { renderMapCardText } from './services/map-message.js';
import { buildCountdownMessage, formatRemainingTime, startTravelCountdownAnimation, } from './services/travel-countdown.js';
import { ensureNovaMarketEnabled } from './services/market-exchange.js';
import { ensureNovaFishingEnabled } from './services/place-bootstrap.js';
import { ensureBagEmojisEnabled } from './services/bag-bootstrap.js';
import { ensureExpandedWorldGenerationCatalog } from './services/world-bootstrap.js';
import { getDevExplorerState, renderDevExplorerReport, triggerDevExplorer } from './services/dev-explorer.js';
import { ensureRacialTalentSchema } from './services/racial-talents.js';
import { ensureBuildSkillSchema, renderBuildTelemetrySummary } from './services/build-skills.js';
import { getGameplayEffectsForPlayer } from './services/gameplay-effects.js';
import { getPlayerEquipmentCombatModifiers } from './services/equipment.js';
import { publishCommunityPatchNotes } from './services/community-updates.js';
import { getActivePveEncounterByTgId } from './services/pve-combat.js';
import { createRecoverySweeper } from './services/recovery-sweeper.js';
import { asLanguageArg, asOptionalLanguageSecondArg, asOptionalLanguageThirdArg, asStringPlayerTgIdGetter, asStringPlayerTgIdSetter } from './bootstrap/runtime-adapters.js';
import { runStartupSequence } from './bootstrap/startup-sequence.js';
import { installBotErrorHandler } from './bootstrap/install-bot-error-handler.js';
import { runBotTransport } from './bootstrap/run-bot-transport.js';
dotenv.config();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is required');
}
const bot = new Bot(TELEGRAM_BOT_TOKEN);
installCustomEmojiTransformer(bot);
const forgeModule = createForgeModule();
const bankModule = createBankModule();
const marketModule = createMarketModule();
const mysteryMerchantModule = createMysteryMerchantModule();
const racialModule = createRacialModule();
const buildModule = createBuildModule();
const pveModule = createPveModule();
const placeModule = createPlaceModule({
    openBankHub: bankModule.openHub,
    openMarketHub: marketModule.openHub,
});
const registrationModule = createRegistrationModule();
const DEBUG_LOGS_ENABLED = ['1', 'true', 'yes', 'on'].includes((process.env.DEBUG_LOGS || '').toLowerCase());
const RECOVERY_SWEEP_INTERVAL_MS = RUNTIME_CONFIG.recoverySweepIntervalMs;
const PASSIVE_STA_REGEN_INTERVAL_SECONDS = 15 * 60;
const PASSIVE_STA_REGEN_POINTS = 2;
const PASSIVE_STA_SWEEP_BATCH_SIZE = 200;
const TRAVEL_ARRIVAL_BUFFER_SECONDS = 1;
const translate = (lang, key, params) => t(lang, key, params);
const getActiveBagViewForRuntime = asOptionalLanguageSecondArg(getActiveBagView);
const getLocationDisplayLabelForRuntime = asOptionalLanguageThirdArg(getLocationDisplayLabel);
const buildProfileCardForRuntime = asOptionalLanguageSecondArg(buildProfileCard);
const getLocalizedTextForRuntime = asLanguageArg(getLocalizedText);
const getRecoveryInterruptLabelForRuntime = asLanguageArg(getRecoveryInterruptLabel);
const getRecoveryFocusLabelForRuntime = asLanguageArg(getRecoveryFocusLabel);
const renderMapCardTextForRuntime = asLanguageArg(renderMapCardText);
const renderDevExplorerReportForRuntime = asLanguageArg(renderDevExplorerReport);
const renderBuildTelemetrySummaryForRuntime = asLanguageArg(renderBuildTelemetrySummary);
let finalizeActiveRecovery;
let startPlaceRecovery;
let handleCustomRecoveryService;
let handlePlaceInteraction;
const safeAnswerCallbackQuery = createSafeAnswerCallbackQuery(logMapDebug);
const openMapInCurrentMessage = createOpenMapInCurrentMessage({
    renderMap,
    getPlayerByTelegramId,
    getPlayerLanguage,
    renderMapCardText,
    sendMapCardSafeViaContext,
});
const { handleGhostHint, handleGhostRecover } = createGhostHandlers({
    getGhostHintText,
    recoverOwnCorpse,
    getPlayerByTelegramId,
    getPlayerLanguage,
    t,
    safeAnswerCallbackQuery,
});
const handleMapMove = createMapMoveHandler({
    getPlayerByTelegramId,
    getPlayerLanguage,
    t,
    isPlayerGhostByTgId,
    moveGhostPlayer,
    openMapInCurrentMessage,
    getActiveCaveContextByTgId,
    movePlayerInCave,
    hasPendingTravelJob,
    safeAnswerCallbackQuery,
    movePlayer,
    buildCountdownMessage,
    enqueueMoveArrivalJob,
    startTravelCountdownAnimation: (params) => startTravelCountdownAnimation(bot, params),
    travelArrivalBufferSeconds: TRAVEL_ARRIVAL_BUFFER_SECONDS,
});
installCoreMiddleware(bot, {
    debugLogsEnabled: DEBUG_LOGS_ENABLED,
    observePerf,
    touchPlayerActivity,
    getActivePlaceRecoveryByTgId,
    getPlayerByTelegramId,
    getPlayerLanguage,
    finalizeActiveRecovery: async ({ tgId, interrupted }) => finalizeActiveRecovery({ tgId, interrupted }),
    getRecoveryRemainingSeconds,
    t3,
    formatRemainingTime,
    getRecoveryInterruptLabel,
    buildGhostBlockedText,
    safeAnswerCallbackQuery,
    isPlayerGhostByTgId,
    getActivePveEncounterByTgId,
    renderPveBlockedPrompt: (ctx) => pveModule.renderBlockedPrompt(ctx),
});
const { getVentureState, setVentureState, clearVentureState, getBagState, setBagState, clearBagState, getInspectState, setInspectState, clearInspectState, } = createConversationScopes({
    getConversationState,
    setConversationState,
    clearConversationState,
});
const getVentureStateForRuntime = asStringPlayerTgIdGetter(getVentureState);
const clearVentureStateForRuntime = asStringPlayerTgIdGetter(clearVentureState);
const getInspectStateForRuntime = asStringPlayerTgIdGetter(getInspectState);
const clearInspectStateForRuntime = asStringPlayerTgIdGetter(clearInspectState);
const setInspectStateForRuntime = asStringPlayerTgIdSetter(setInspectState);
const getBagStateForRuntime = asStringPlayerTgIdGetter(getBagState);
const clearBagStateForRuntime = asStringPlayerTgIdGetter(clearBagState);
const setBagStateForRuntime = asStringPlayerTgIdSetter(setBagState);
const ventureFlowHandlers = createVentureFlowHandlers({
    bot,
    dbBatchSize: 200,
    travelArrivalBufferSeconds: TRAVEL_ARRIVAL_BUFFER_SECONDS,
    setVentureState: (playerTgId, state) => setVentureState(playerTgId, state),
    clearVentureState: (playerTgId) => clearVentureState(playerTgId),
    getPlayerByTelegramId,
    getPlayerLanguage,
    getCanonicalWorldMap,
    getGameplayEffectsForPlayer,
    ensureTilesGeneratedForCoords,
    getOrCreateTile,
    hasPendingTravelJob,
    enqueueVentureArrivalJob,
    startTravelCountdownAnimation,
    t3,
});
const { handleProfile, handleLanguageChange } = createPlayerProfileHandlers({
    getPlayerByTelegramId,
    ensurePlayerProgression,
    getCanonicalWorldMap,
    getOrCreateTile,
    getPlaceAtCoords,
    prisma,
    getGameplayEffectsForPlayer,
    getPlayerEquipmentCombatModifiers,
    calculateCombatStats,
    getPlayerLanguage,
    getRaceEntry,
    getClassEntry,
    formatTokenName,
    formatClassName,
    t: translate,
    profileEmoji: EMOJIS.ui.profile,
    classEmoji: EMOJIS.ui.class,
    getDeathSummaryForProfile,
    getLocationDisplayLabel: getLocationDisplayLabelForRuntime,
    getActiveBagUsage,
    buildProfileCard: buildProfileCardForRuntime,
    getRequiredXpForLevel,
    supportedLanguages: SUPPORTED_LANGUAGES,
    updateLanguageMessage: async (ctx, text, keyboard) => {
        await ctx.editMessageText(text, { reply_markup: keyboard });
    },
});
const recoverySweeper = createRecoverySweeper({
    recoverySweepIntervalMs: RECOVERY_SWEEP_INTERVAL_MS,
    passiveStaRegenIntervalSeconds: PASSIVE_STA_REGEN_INTERVAL_SECONDS,
    passiveStaRegenPoints: PASSIVE_STA_REGEN_POINTS,
    passiveStaSweepBatchSize: PASSIVE_STA_SWEEP_BATCH_SIZE,
    observePerf,
    prisma,
    getActiveDeathStateByPlayerId,
    getGameplayEffectsForPlayer,
    listDueRecoveryTgIds,
    finalizeActiveRecovery: ({ tgId, interrupted }) => finalizeActiveRecovery({ tgId, interrupted }),
});
const { parsePositiveInt, parseNodeIndex, renderBagResponse, buildBagItemActionConfirmText, buildBagItemActionConfirmKeyboard, openBagItemInfoByUid, startGrabFlow, startDropFlow, startSwitchFlow, } = createBagFlowHandlers({
    getPlayerByTelegramId,
    ensurePlayerBagSetup,
    getPlayerLanguage,
    getActiveBagView: getActiveBagViewForRuntime,
    getActiveBagItemInfoByUid,
    setBagState: setBagStateForRuntime,
    listBagSwitchOptions,
    clearCallbackKeyboard,
    t: translate,
});
const notifyLowVitalsIfNeeded = createLowVitalsNotifier({
    consumeLowVitalsAlertByTgId,
});
const { renderInspectResponse, handleInspectFromMap, buildInspectResultKeyboard, renderCoordinateInteractions, openCoordinateInteractionByIndex, handleCreatureDefeat, showResultMapDecision, startInspectActionFlow, handleInspectNodePick, handleInspectQtyPick, } = createInspectAndInteractionsHandlers({
    t: translate,
    t3,
    getPlayerByTelegramId,
    getPlayerLanguage,
    renderInspectForPlayer,
    getActivePlaceRecoveryByTgId,
    getRecoveryRemainingSeconds,
    formatRemainingTime,
    getRecoveryFocusLabel: getRecoveryFocusLabelForRuntime,
    clearInspectState: clearInspectStateForRuntime,
    setInspectState: setInspectStateForRuntime,
    clearCallbackKeyboard,
    getCanonicalWorldMap,
    getOrCreateTile,
    getMerchantSnapshotAtCoords,
    getTilePopulationAtCoords,
    getCreatureSnapshotsAtCoords,
    openMysteryMerchantByCallback: (ctx) => mysteryMerchantModule.handleCallback(ctx, 'merchant_open'),
    openMysteryMerchantByCommand: (ctx) => mysteryMerchantModule.openByCommand(ctx),
    openPveScout: (ctx, creature, mode) => pveModule.openScout(ctx, creature, mode),
    safeAnswerCallbackQuery,
    openMapInCurrentMessage,
    getInspectNodesForPlayer,
    playerActionQueue,
    executeInspectAction,
    notifyLowVitalsIfNeeded,
});
installSafeCallbackAnswerMiddleware(bot, logMapDebug);
({ finalizeActiveRecovery, startPlaceRecovery, handleCustomRecoveryService, handlePlaceInteraction } = createPlaceInteractionHandlers({
    bot,
    observePerf,
    sleep,
    t: translate,
    t3,
    prisma,
    getPlayerByTelegramId,
    getPlayerLanguage,
    getPlaceUiConfig,
    getLocalizedText: getLocalizedTextForRuntime,
    executeCustomPlaceInteraction,
    getTimedPlaceRecoverySeconds,
    getCanonicalWorldMap,
    setSoulAnchorForPlayer,
    getRecoveryInterruptLabel: getRecoveryInterruptLabelForRuntime,
    getRecoveryFocusLabel: getRecoveryFocusLabelForRuntime,
    getActivePlaceRecoveryByTgId,
    getRecoveryRemainingSeconds,
    formatRemainingTime,
    finalizeRecoveryState,
    upsertActivePlaceRecovery,
    getRecoveryEffectTypeFromSlug,
    CUSTOM_PLACE_FREE_SERVICES,
    FREE_RECOVERY_RATE_PER_SECOND,
    renderMap,
    renderMapCardText: renderMapCardTextForRuntime,
    sendMapCardSafeViaContext,
}));
// ============================================
// CALLBACK QUERY HANDLER
// ============================================
registerCallbackRouter(bot, {
    registrationModule,
    placeModule,
    bankModule,
    marketModule,
    forgeModule,
    mysteryMerchantModule,
    pveModule,
    buildModule,
    racialModule,
    updatePlayerLanguage,
    t: translate,
    t3,
    SUPPORTED_LANGUAGES,
    getPlayerByTelegramId,
    getPlayerLanguage,
    safeAnswerCallbackQuery,
    clearCallbackKeyboard,
    getVentureState: getVentureStateForRuntime,
    clearVentureState: clearVentureStateForRuntime,
    executeVenture: ventureFlowHandlers.executeVenture,
    handleProfile,
    handleLanguageChange,
    handleCustomRecoveryService,
    handlePlaceInteraction,
    handleMapMove,
    handleGhostHint,
    handleGhostRecover,
    renderBagResponse,
    startGrabFlow,
    startDropFlow,
    startSwitchFlow,
    openMapInCurrentMessage,
    exitActiveCaveForTgId,
    getActiveBagItemInfoByUid,
    buildBagItemActionConfirmText,
    buildBagItemActionConfirmKeyboard,
    useBagSlot,
    dropBagSlot,
    openBagItemInfoByUid,
    equipToolFromBagItem,
    previewBagSwitch,
    setBagState: setBagStateForRuntime,
    executeBagSwitch,
    clearBagState: clearBagStateForRuntime,
    handleInspectFromMap,
    getActivePlaceRecoveryByTgId,
    hasActivePlaceRecovery,
    finalizeActiveRecovery,
    startInspectActionFlow,
    clearInspectState: clearInspectStateForRuntime,
    renderInspectResponse,
    showResultMapDecision,
    handleInspectNodePick,
    handleInspectQtyPick,
    startVentureFlow: ventureFlowHandlers.startVentureFlow,
    renderCoordinateInteractions,
    openCoordinateInteractionByIndex,
    handleCreatureDefeat,
});
const { handleTitle, handleDevMode, handleUnequipBag } = createPlayerMiscHandlers({
    getPlayerByTelegramId,
    formatClassName,
    getPlayerLanguage,
    t3,
    triggerDevExplorer,
    getDevExplorerState,
    renderDevExplorerReport: renderDevExplorerReportForRuntime,
    renderBuildTelemetrySummary: renderBuildTelemetrySummaryForRuntime,
    executeBagSwitch,
    renderBagResponse: (ctx, mode = 'reply') => renderBagResponse(ctx, mode),
});
// ============================================
// COMMANDS (must be before message:text handlers)
// ============================================
registerCoreCommands(bot, {
    registrationModule,
    placeModule,
    mysteryMerchantModule,
    pveModule,
    buildModule,
    racialModule,
    handleProfile,
    handleTitle,
    handleUnequipBag,
    handleDevMode,
    renderInspectResponse,
    getPlayerByTelegramId,
    ensurePlayerProgression,
    getEquipmentCard,
    getSkillsCard,
    getPlayerLanguage,
    grantToolToPlayer,
    listBiomes,
    t: translate,
    renderMap,
    renderMapCardText,
    renderCoordinateInteractions,
    requestSosDelivery,
    hasActivePlaceRecovery,
    finalizeActiveRecovery,
    t3,
    startVentureFlow: ventureFlowHandlers.startVentureFlow,
    renderBagResponse,
    getToolsCard,
});
// ============================================
// MESSAGE HANDLER (after commands!)
// ============================================
registerMessageRouter(bot, {
    getVentureState: getVentureStateForRuntime,
    clearVentureState: clearVentureStateForRuntime,
    handleVentureCoords: ventureFlowHandlers.handleVentureCoords,
    executeVenture: ventureFlowHandlers.executeVenture,
    getInspectState: getInspectStateForRuntime,
    clearInspectState: clearInspectStateForRuntime,
    getPlayerByTelegramId,
    parseNodeIndex,
    getInspectNodesForPlayer,
    setInspectState: setInspectStateForRuntime,
    parsePositiveInt,
    sleep,
    playerActionQueue,
    executeInspectAction,
    t3,
    getPlayerLanguage,
    buildInspectResultKeyboard,
    notifyLowVitalsIfNeeded,
    getBagState: getBagStateForRuntime,
    clearBagState: clearBagStateForRuntime,
    getActiveBagView: getActiveBagViewForRuntime,
    setBagState: setBagStateForRuntime,
    EMOJIS,
    useBagSlot,
    dropBagSlot,
    executeBagSwitch,
    renderBagResponse,
    openCoordinateInteractionByIndex,
    bankModule,
    marketModule,
    mysteryMerchantModule,
    forgeModule,
    equipToolByAlias,
    openBagItemInfoByUid,
    unequipToolByAlias,
    unequipEquipmentByAlias,
    registrationModule,
});
// ============================================
// PLACE SYSTEM - Lugares y sus interacciones
// ============================================
// ============================================
// START BOT
// ============================================
async function start() {
    await runStartupSequence(bot, {
        connectDB,
        logMapDebug,
        ensureSingleCanonicalWorldMap,
        ensureExpandedWorldGenerationCatalog,
        ensureBagEmojisEnabled,
        ensureNovaMarketEnabled,
        ensureNovaFishingEnabled,
        ensureRacialTalentSchema,
        ensureBuildSkillSchema,
        ensureCreatureSchema,
        startPerfReporter,
        startRecoverySweeper: recoverySweeper.startRecoverySweeper,
        startGameJobWorker,
        startClimateWorker,
        startMysteryMerchantWorker,
        triggerDevExplorer,
        primeCustomEmojiAvailability,
        publishCommunityPatchNotes,
    });
    installBotErrorHandler(bot, {
        formatErrorForLog,
        logMapDebug,
        debugLogsEnabled: DEBUG_LOGS_ENABLED,
    });
    await runBotTransport(bot);
}
start().catch(console.error);
//# sourceMappingURL=app-main.js.map