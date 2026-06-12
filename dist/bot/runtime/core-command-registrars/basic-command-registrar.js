export const registerBasicCommands = (bot, deps) => {
    bot.command('start', async (ctx) => {
        await deps.registrationModule.handleStartCommand(ctx);
    });
    bot.command('profile', deps.handleProfile);
    bot.command('title', deps.handleTitle);
    bot.command('ub', deps.handleUnequipBag);
    bot.command('devmode', deps.handleDevMode);
    bot.command('racial', async (ctx) => {
        await deps.racialModule.openByCommand(ctx);
    });
    bot.command('bs', async (ctx) => {
        await deps.buildModule.openByCommand(ctx);
    });
    bot.command('combat', async (ctx) => {
        await deps.pveModule.openByCommand(ctx);
    });
    bot.command('inspect', async (ctx) => {
        await deps.renderInspectResponse(ctx, 'reply');
    });
};
