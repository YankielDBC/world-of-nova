import type { Bot } from 'grammy';
interface InstallBotErrorHandlerDeps {
    formatErrorForLog: (error: unknown) => string;
    logMapDebug: (event: string, payload?: unknown) => void;
    debugLogsEnabled: boolean;
}
export declare function installBotErrorHandler(bot: Bot, deps: InstallBotErrorHandlerDeps): void;
export {};
