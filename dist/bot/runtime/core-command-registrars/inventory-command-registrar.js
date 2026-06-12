import { EMOJIS } from '../../../data/emojis.js';
import { sendMapCardSafeViaContext } from '../../../services/map-delivery.js';
export const registerInventoryCommands = (bot, deps) => {
    bot.command('equip', async (ctx) => {
        const player = await deps.getPlayerByTelegramId(String(ctx.from?.id));
        if (!player) {
            await ctx.reply('❌ No estás registrado. Usa /start');
            return;
        }
        await deps.ensurePlayerProgression(player.id, true);
        const text = await deps.getEquipmentCard(player.id);
        await ctx.reply(text);
    });
    bot.command('skills', async (ctx) => {
        const player = await deps.getPlayerByTelegramId(String(ctx.from?.id));
        if (!player) {
            await ctx.reply('❌ No estás registrado. Usa /start');
            return;
        }
        await deps.ensurePlayerProgression(player.id, true);
        const text = await deps.getSkillsCard(player.id, deps.getPlayerLanguage(player));
        await ctx.reply(text, { parse_mode: 'Markdown' });
    });
    bot.command('starterkit', async (ctx) => {
        const player = await deps.getPlayerByTelegramId(String(ctx.from?.id));
        if (!player) {
            await ctx.reply('❌ No estás registrado. Usa /start');
            return;
        }
        await deps.ensurePlayerProgression(player.id, true);
        const grants = await Promise.all([
            deps.grantToolToPlayer(player.id, 'hachaPiedra'),
            deps.grantToolToPlayer(player.id, 'picoPiedra'),
            deps.grantToolToPlayer(player.id, 'basket'),
        ]);
        const lines = ['🧰 Starter Kit'];
        for (const result of grants) {
            lines.push(result.message);
        }
        await ctx.reply(lines.join('\n'));
    });
    bot.command('bag', async (ctx) => {
        await deps.renderBagResponse(ctx);
    });
    bot.command('tools', async (ctx) => {
        const tgId = String(ctx.from?.id);
        const player = await deps.getPlayerByTelegramId(tgId);
        if (!player) {
            await ctx.reply('❌ No estás registrado. Usa /start');
            return;
        }
        const text = await deps.getToolsCard(player.id);
        await ctx.reply(text);
    });
    bot.command('map', async (ctx) => {
        const tgId = String(ctx.from?.id);
        const player = await deps.getPlayerByTelegramId(tgId);
        if (!player) {
            await ctx.reply('❌ No estás registrado. Usa /start');
            return;
        }
        const mapResult = await deps.renderMap(tgId);
        if (!mapResult) {
            await ctx.reply('❌ Error rendering map');
            return;
        }
        const mapText = deps.renderMapCardText(mapResult, deps.getPlayerLanguage(player));
        await sendMapCardSafeViaContext({
            ctx,
            mode: 'reply',
            text: mapText,
            keyboard: mapResult.keyboard,
            source: 'command:/map',
        });
    });
    bot.command('interact', async (ctx) => {
        const tgId = String(ctx.from?.id);
        const player = await deps.getPlayerByTelegramId(tgId);
        if (!player) {
            await ctx.reply('❌ No estás registrado. Usa /start');
            return;
        }
        await deps.renderCoordinateInteractions(ctx, 'reply');
    });
    bot.command('sos', async (ctx) => {
        const tgId = String(ctx.from?.id || '');
        const player = await deps.getPlayerByTelegramId(tgId);
        if (!player) {
            await ctx.reply('❌ No estás registrado. Usa /start');
            return;
        }
        const lang = deps.getPlayerLanguage(player);
        const result = await deps.requestSosDelivery(player.id, lang);
        await ctx.reply(result.message);
    });
    bot.command('help', async (ctx) => {
        const fromId = ctx.from?.id;
        if (!fromId)
            return;
        const tgId = String(fromId);
        const player = await deps.getPlayerByTelegramId(tgId);
        const lang = (player?.language || 'es');
        await ctx.reply(`📋 *${deps.t(lang, 'cmdHelp')}*\n\n` +
            `⚔️ /start - ${deps.t(lang, 'cmdStart')}\n` +
            `📋 /profile - ${deps.t(lang, 'cmdProfile')}\n` +
            `🧬 /racial - Talentos raciales\n` +
            `🧩 /bs - Build skills\n` +
            `📜 /title - Ver título actual\n` +
            `${EMOJIS.ui.bag} /ub - Quitar mochila activa\n` +
            `🕊️ /sos - Paloma de emergencia (5 ${EMOJIS.ui.silver})\n` +
            `🕵️ /merchant - Buscar al Comerciante Misterioso\n` +
            `🧪 /devmode - Reporte técnico del mundo (200x200)\n` +
            `🧩 /interact - Ver interacciones en tu coordenada\n` +
            `⚔️ /combat - Reanudar combate activo\n` +
            `🗺️ /map - ${deps.t(lang, 'cmdMap') || 'Show map'}\n` +
            `⚙️ /settings - ${deps.t(lang, 'cmdSettings')}`, { parse_mode: 'Markdown' });
    });
};
