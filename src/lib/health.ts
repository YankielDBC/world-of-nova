// @ts-nocheck
import { prisma } from './db.js';
export async function healthCheck() {
    const checks = {
        prisma: false,
        memory: null,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    };
    try {
        await prisma.$queryRaw`SELECT 1`;
        checks.prisma = true;
    }
    catch (e) {
        checks.prisma = false;
    }
    const mem = process.memoryUsage();
    checks.memory = {
        rss: Math.round(mem.rss / 1024 / 1024),
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
    };
    return checks;
}
