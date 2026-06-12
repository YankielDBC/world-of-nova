// @ts-nocheck
import { createServer } from 'node:http';
import { webhookCallback } from 'grammy';
import { RUNTIME_CONFIG } from '../lib/runtime-config.js';
export async function runBotTransport(bot) {
    const transportMode = String(RUNTIME_CONFIG.botTransportMode || 'polling').toLowerCase();
    if (transportMode === 'webhook') {
        const webhookBaseUrl = String(RUNTIME_CONFIG.webhookUrl || '').trim().replace(/\/+$/, '');
        if (!webhookBaseUrl) {
            throw new Error('WEBHOOK_URL is required when BOT_TRANSPORT_MODE=webhook');
        }
        const webhookPath = '/telegram/webhook';
        const webhookFullUrl = `${webhookBaseUrl}${webhookPath}`;
        const handler = webhookCallback(bot, 'http');
        await bot.init();
        await bot.api.setWebhook(webhookFullUrl);
        const server = createServer((req, res) => {
            if (req.url?.startsWith(webhookPath)) {
                void handler(req, res);
                return;
            }
            res.statusCode = 200;
            res.end('ok');
        });
        server.listen(RUNTIME_CONFIG.webhookPort, () => {
            console.log(`🤖 Bot webhook active on port ${RUNTIME_CONFIG.webhookPort}`);
            console.log(`🔗 Webhook: ${webhookFullUrl}`);
        });
        return;
    }
    await bot.api.deleteWebhook({ drop_pending_updates: false });
    await bot.start({
        onStart: (me) => {
            console.log(`🤖 Bot started as @${me.username}`);
        },
    });
}
//# sourceMappingURL=run-bot-transport.js.map