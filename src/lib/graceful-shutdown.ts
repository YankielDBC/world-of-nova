// @ts-nocheck
import { prisma } from './db.js';
const cleanupFns = [];
export function onShutdown(fn) {
    cleanupFns.push(fn);
}
export function registerShutdownHandlers() {
    const handle = async (signal) => {
        console.log(`[shutdown] ${signal} received. Cleaning up...`);
        for (const fn of cleanupFns) {
            try {
                await fn();
            }
            catch (e) {
                console.error('[shutdown] cleanup error:', e);
            }
        }
        try {
            await prisma.$disconnect();
        }
        catch (e) {
            console.error('[shutdown] prisma disconnect error:', e);
        }
        console.log('[shutdown] Goodbye.');
        process.exit(0);
    };
    process.on('SIGINT', handle);
    process.on('SIGTERM', handle);
    process.on('uncaughtException', (err) => {
        console.error('[fatal] Uncaught exception:', err);
        handle('SIGTERM');
    });
    process.on('unhandledRejection', (reason) => {
        console.error('[fatal] Unhandled rejection:', reason);
    });
}
