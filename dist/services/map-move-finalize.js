import { prisma } from '../lib/db.js';
import { calculateCombatStats } from '../lib/db.js';
import { triggerBuildReactions } from './build-skills.js';
export async function finalizePlayerMove(tgId, playerId, toX, toY, isNewDiscovery, energyCost, expectedFrom, markTileExplored) {
    if (isNewDiscovery) {
        await markTileExplored(playerId, tgId, toX, toY);
    }
    const where = { tgId };
    if (expectedFrom && Number.isFinite(expectedFrom.x) && Number.isFinite(expectedFrom.y)) {
        where.mapX = expectedFrom.x;
        where.mapY = expectedFrom.y;
    }
    const updated = await prisma.player.updateMany({
        where,
        data: {
            mapX: toX,
            mapY: toY,
            energy: { decrement: energyCost },
            lastActiveAt: new Date(),
            isActive: true,
        },
    });
    if (updated.count > 0) {
        try {
            const player = await prisma.player.findUnique({ where: { id: playerId } });
            if (player) {
                const stats = calculateCombatStats(player);
                const hpPct = stats.maxHp > 0 ? (player.hp / stats.maxHp) * 100 : 100;
                const staPct = stats.maxEnergy > 0 ? (player.energy / stats.maxEnergy) * 100 : 100;
                await triggerBuildReactions({
                    playerId,
                    event: 'on_sta_below_threshold',
                    condition: { hpPct, staPct },
                });
                await triggerBuildReactions({
                    playerId,
                    event: 'on_hp_below_threshold',
                    condition: { hpPct, staPct },
                });
            }
        }
        catch {
            // Ignore reaction trigger failures during movement finalize.
        }
        return {
            applied: true,
            alreadyAtDestination: false,
        };
    }
    const current = await prisma.player.findUnique({
        where: { tgId },
        select: { mapX: true, mapY: true },
    });
    const alreadyAtDestination = !!current && current.mapX === toX && current.mapY === toY;
    return {
        applied: false,
        alreadyAtDestination,
    };
}
