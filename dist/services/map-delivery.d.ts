import type { Bot, InlineKeyboard } from 'grammy';
export declare function sendMapCardSafeViaContext(params: {
    ctx: any;
    mode: 'reply' | 'edit';
    text: string;
    keyboard: InlineKeyboard;
    source: string;
}): Promise<void>;
export declare function sendMapCardSafeViaBot(params: {
    bot: Bot;
    chatId: number;
    text: string;
    keyboard: InlineKeyboard;
    source: string;
}): Promise<void>;
