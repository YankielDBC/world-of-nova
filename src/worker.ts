// @ts-nocheck
import dotenv from 'dotenv';
import { Bot, InlineKeyboard } from 'grammy';
import { connectDB } from './lib/db.js';
import { RUNTIME_CONFIG } from './lib/runtime-config.js';
import { startGameJobWorker } from './services/game-jobs.js';
import { finalizeRecoveryState, listDueRecoveryTgIds, } from './services/place-recovery.js';
import { EMOJIS } from './data/emojis.js';
dotenv.config();
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
let recoverySweepInFlight = false;
function t3(lang, es, en, ru) {
    if (lang === 'en')
        return en;
    if (lang === 'ru')
        return ru;
    return es;
}
async function finalizeActiveRecoveryFromWorker(tgId) {
    const result = await finalizeRecoveryState({
        tgId,
        interrupted: false,
    });
    if (!result) {
        return;
    }
    const lang = result.language;
    const statEmoji = result.active.effectType === 'ENERGY' ? EMOJIS.ui.stamina : EMOJIS.ui.heart;
    const statCode = result.active.effectType === 'ENERGY' ? 'STA' : 'HP';
    const lines = [
        `${result.active.serviceName}`,
        '✧═══••═══✧',
        result.active.lore,
        t3(lang, '✅ Recuperación completada.', '✅ Recovery complete.', '✅ Vosstanovlenie zaversheno.'),
        `${statEmoji} ${statCode}: ${result.previousValue}/${result.active.maxValue} → ${result.nextValue}/${result.active.maxValue}`,
        `${EMOJIS.ui.gold} ${result.gold}  | ${EMOJIS.ui.silver} ${result.silver}`,
    ].filter((line) => line && line.trim().length > 0);
    const keyboard = new InlineKeyboard()
        .text(`🏰 ${t3(lang, 'Edificios', 'Buildings', 'Zdaniya')}`, 'inspect_place_open_buildings')
        .text(`${EMOJIS.ui.map} ${t3(lang, 'Ver mapa', 'View map', 'Karta')}`, 'arrival_map');
    await bot.api.sendMessage(result.chatId, lines.join('\n'), {
        reply_markup: keyboard,
    });
}
async function sweepDueRecoveriesOnce() {
    if (recoverySweepInFlight) {
        return;
    }
    recoverySweepInFlight = true;
    try {
        const dueTgIds = await listDueRecoveryTgIds(100);
        for (const dueTgId of dueTgIds) {
            await finalizeActiveRecoveryFromWorker(dueTgId);
        }
    }
    finally {
        recoverySweepInFlight = false;
    }
}
async function startWorker() {
    await connectDB();
    await bot.init();
    startGameJobWorker(bot);
    setInterval(() => {
        void sweepDueRecoveriesOnce();
    }, RUNTIME_CONFIG.recoverySweepIntervalMs);
    void sweepDueRecoveriesOnce();
    console.log('🛠️ World of Nova worker running');
}
startWorker().catch((error) => {
    console.error('Worker failed to start:', error);
    process.exit(1);
});
