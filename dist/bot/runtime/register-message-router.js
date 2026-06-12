// @ts-nocheck
import { handleBagConversationMessage, handleInspectConversationMessage, handleVentureConversationMessage, } from './message-handlers/conversation-message-handlers.js';
import { handleBagAliasMessage, handleInteractionAliasMessage, } from './message-handlers/alias-message-handlers.js';
import { handleFeatureModuleMessages, handleRegistrationFallbackMessage, } from './message-handlers/module-message-handlers.js';
const MESSAGE_HANDLERS = [
    handleVentureConversationMessage,
    handleInspectConversationMessage,
    handleBagConversationMessage,
    handleInteractionAliasMessage,
    handleFeatureModuleMessages,
    handleBagAliasMessage,
    handleRegistrationFallbackMessage,
];
export function registerMessageRouter(bot, deps) {
    bot.on('message:text', async (ctx) => {
        const tgId = ctx.from.id;
        const text = ctx.message.text;
        console.log(`💬 Text message: "${text}" from ${tgId}`);
        for (const handler of MESSAGE_HANDLERS) {
            if (await handler(ctx, text, deps)) {
                return;
            }
        }
    });
}
//# sourceMappingURL=register-message-router.js.map