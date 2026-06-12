import type { Bot } from 'grammy';
export declare function formatRemainingTime(seconds: number): string;
export declare function buildCountdownMessage(params: {
    baseText: string;
    remainingSeconds: number;
    totalSeconds: number;
    etaLabel: string;
}): string;
export declare function startTravelCountdownAnimation(bot: Bot, params: {
    chatId: number;
    messageId: number;
    baseText: string;
    totalSeconds: number;
    etaLabel: string;
}): void;
