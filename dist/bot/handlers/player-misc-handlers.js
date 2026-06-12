import { getTitleForLevel } from '../../types/player.js';
export function resolvePlayerDisplayTitle(rawTitleInput, level, className) {
    const fallbackTitle = getTitleForLevel(level).title;
    const rawTitle = (rawTitleInput || '').trim();
    if (!rawTitle) {
        return fallbackTitle;
    }
    const normalizedTitle = rawTitle.toLowerCase();
    const normalizedClass = (className || '').trim().toLowerCase();
    if (normalizedClass &&
        (normalizedTitle === normalizedClass || normalizedTitle.endsWith(` ${normalizedClass}`))) {
        return fallbackTitle;
    }
    return rawTitle;
}
export function createPlayerMiscHandlers(deps) {
    return {
        handleTitle: async (ctx) => {
            const tgId = String(ctx.from?.id);
            const player = await deps.getPlayerByTelegramId(tgId);
            if (!player) {
                await ctx.reply('❌ No estás registrado. Usa /start');
                return;
            }
            const classDisplay = deps.formatClassName(player.class, '');
            const activeTitle = resolvePlayerDisplayTitle(player.title, player.level, classDisplay);
            const lines = [
                `📜 Título actual: ${activeTitle}`,
                '🔓 Títulos desbloqueados: 1',
                'ℹ️ Por ahora solo tienes un título.',
                'Más adelante podrás desbloquear más y cambiarlo.',
            ];
            await ctx.reply(lines.join('\n'));
        },
        handleDevMode: async (ctx) => {
            const tgId = String(ctx.from?.id || '');
            const player = tgId ? await deps.getPlayerByTelegramId(tgId) : null;
            const lang = deps.getPlayerLanguage(player ?? undefined);
            const rawText = String(ctx.message?.text || '').trim();
            const force = /\b(run|refresh|force|reset|rerun)\b/i.test(rawText);
            deps.triggerDevExplorer(force);
            const initial = deps.getDevExplorerState();
            const text = deps.renderDevExplorerReport(lang);
            const buildTelemetry = await deps.renderBuildTelemetrySummary(lang);
            await ctx.reply(`${text}\n\n${buildTelemetry}`);
            if (initial.status === 'running' && initial.processedTiles === 0) {
                await ctx.reply(deps.t3(lang, '⏳ Escaneo iniciado. Usa /devmode en unos segundos para ver el progreso.', '⏳ Scan started. Use /devmode again in a few seconds to see progress.', '⏳ Сканирование запущено. Повторите /devmode через пару секунд для прогресса.'));
            }
        },
        handleUnequipBag: async (ctx) => {
            const tgId = String(ctx.from?.id);
            const player = await deps.getPlayerByTelegramId(tgId);
            if (!player) {
                await ctx.reply('❌ No estás registrado. Usa /start');
                return;
            }
            const result = await deps.executeBagSwitch(player.id, 'pockets');
            await ctx.reply(result.message);
            if (result.success) {
                await deps.renderBagResponse(ctx);
            }
        },
    };
}
