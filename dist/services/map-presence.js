// @ts-nocheck
import { prisma, getPlayerByTelegramId } from '../lib/db.js';
const AFK_TIMEOUT_MS = 5 * 60 * 1000;
export async function checkAFKStatus(tgId) {
    const player = await getPlayerByTelegramId(tgId);
    if (!player)
        return { isAFK: false, wasAway: false };
    const now = new Date();
    const lastActive = new Date(player.lastActiveAt);
    const timeDiff = now.getTime() - lastActive.getTime();
    const isAFK = timeDiff > AFK_TIMEOUT_MS;
    const wasAway = player.isActive === false && isAFK;
    await prisma.player.update({
        where: { tgId },
        data: { isActive: !isAFK },
    });
    return { isAFK, wasAway };
}
export async function updateAFKTimer(tgId) {
    await prisma.player.update({
        where: { tgId },
        data: { isActive: true, lastActiveAt: new Date() },
    });
}
//# sourceMappingURL=map-presence.js.map