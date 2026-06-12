// @ts-nocheck
export const registerWorldCommands = (bot, deps) => {
    bot.command('biomes', async (ctx) => {
        const tgId = String(ctx.from?.id);
        const player = await deps.getPlayerByTelegramId(tgId);
        const lang = (player?.language || 'es');
        try {
            const biomes = await deps.listBiomes();
            const lines = ['🌍 *Biomas del Mundo*\n'];
            for (const biome of biomes) {
                lines.push(`${biome.emoji} ${biome.name}`);
            }
            await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown' });
        }
        catch (error) {
            await ctx.reply('❌ Error al cargar biomas: ' + error.message);
        }
    });
    const interruptRecoveryFromCommand = async (ctx) => {
        const tgId = String(ctx.from?.id);
        const player = await deps.getPlayerByTelegramId(tgId);
        const lang = deps.getPlayerLanguage(player ?? undefined);
        if (!(await deps.hasActivePlaceRecovery(tgId))) {
            await ctx.reply(deps.t3(lang, 'No tienes recuperación activa.', 'No active recovery.', 'Aktivnogo vosstanovleniya net.'));
            return;
        }
        await deps.finalizeActiveRecovery({
            tgId,
            interrupted: true,
        });
    };
    bot.command('despertar', interruptRecoveryFromCommand);
    bot.command('interrumpir', interruptRecoveryFromCommand);
    bot.command('wake', interruptRecoveryFromCommand);
    bot.command('interrupt', interruptRecoveryFromCommand);
    bot.command('castle', async (ctx) => {
        await deps.placeModule.handlePlaceEntry(ctx);
    });
    bot.command('place', async (ctx) => {
        await deps.placeModule.handlePlaceEntry(ctx);
    });
    bot.command('venture', async (ctx) => {
        await deps.startVentureFlow(ctx);
    });
    bot.command('merchant', async (ctx) => {
        await deps.mysteryMerchantModule.openByCommand(ctx);
    });
};
