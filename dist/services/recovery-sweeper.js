// @ts-nocheck
function buildCoordKey(x, y) {
    return `${x},${y}`;
}
export function createRecoverySweeper(deps) {
    let recoverySweepTimer = null;
    let recoverySweepInFlight = false;
    const sweepPassiveStaRecoveryOnce = async () => {
        const startedAt = Date.now();
        try {
            const nowMs = Date.now();
            const intervalMs = deps.passiveStaRegenIntervalSeconds * 1000;
            const cutoff = new Date(nowMs - intervalMs);
            const candidates = await deps.prisma.player.findMany({
                where: {
                    activeRecovery: { is: null },
                    OR: [{ lastActionAt: null }, { lastActionAt: { lte: cutoff } }],
                },
                select: {
                    id: true,
                    energy: true,
                    maxEnergy: true,
                    mapX: true,
                    mapY: true,
                    lastActionAt: true,
                },
                orderBy: { id: 'asc' },
                take: deps.passiveStaSweepBatchSize,
            });
            if (candidates.length === 0) {
                return;
            }
            const candidateCoordSet = new Set();
            const coordXs = new Set();
            const coordYs = new Set();
            for (const player of candidates) {
                candidateCoordSet.add(buildCoordKey(player.mapX, player.mapY));
                coordXs.add(player.mapX);
                coordYs.add(player.mapY);
            }
            const placesAtCoords = await deps.prisma.place.findMany({
                where: {
                    isActive: true,
                    type: { in: ['FIXED', 'DYNAMIC'] },
                    coordX: { in: Array.from(coordXs) },
                    coordY: { in: Array.from(coordYs) },
                },
                select: {
                    coordX: true,
                    coordY: true,
                    pvpAllowed: true,
                    combatAllowed: true,
                },
            });
            const safeCoordSet = new Set();
            for (const place of placesAtCoords) {
                if (place.coordX == null || place.coordY == null) {
                    continue;
                }
                const key = buildCoordKey(place.coordX, place.coordY);
                if (!candidateCoordSet.has(key)) {
                    continue;
                }
                if (!place.pvpAllowed && !place.combatAllowed) {
                    safeCoordSet.add(key);
                }
            }
            for (const player of candidates) {
                if (await deps.getActiveDeathStateByPlayerId(player.id)) {
                    continue;
                }
                const playerCoordKey = buildCoordKey(player.mapX, player.mapY);
                const inSafeZone = safeCoordSet.has(playerCoordKey);
                if (!player.lastActionAt) {
                    await deps.prisma.player.updateMany({
                        where: {
                            id: player.id,
                            lastActionAt: null,
                        },
                        data: {
                            lastActionAt: new Date(nowMs),
                        },
                    });
                    continue;
                }
                if (inSafeZone || player.energy >= player.maxEnergy) {
                    await deps.prisma.player.updateMany({
                        where: {
                            id: player.id,
                            lastActionAt: player.lastActionAt,
                        },
                        data: {
                            lastActionAt: new Date(nowMs),
                        },
                    });
                    continue;
                }
                const elapsedMs = Math.max(0, nowMs - player.lastActionAt.getTime());
                const ticks = Math.floor(elapsedMs / intervalMs);
                if (ticks <= 0) {
                    continue;
                }
                const maxGain = player.maxEnergy - player.energy;
                if (maxGain <= 0) {
                    continue;
                }
                const gameplayEffects = await deps.getGameplayEffectsForPlayer(player.id);
                const regenPerTick = deps.passiveStaRegenPoints + Math.max(0, gameplayEffects.passiveStaRegenBonus);
                const gainedSta = Math.min(maxGain, ticks * regenPerTick);
                if (gainedSta <= 0) {
                    continue;
                }
                const nextAnchorMs = player.lastActionAt.getTime() + ticks * intervalMs;
                await deps.prisma.player.updateMany({
                    where: {
                        id: player.id,
                        energy: player.energy,
                        lastActionAt: player.lastActionAt,
                    },
                    data: {
                        energy: {
                            increment: gainedSta,
                        },
                        lastActionAt: new Date(nextAnchorMs),
                    },
                });
            }
        }
        catch (error) {
            console.error('❌ Passive STA sweep error:', error);
        }
        finally {
            deps.observePerf('passive_sta.sweep', Date.now() - startedAt);
        }
    };
    const sweepDueRecoveriesOnce = async () => {
        if (recoverySweepInFlight) {
            return;
        }
        const startedAt = Date.now();
        recoverySweepInFlight = true;
        try {
            const dueTgIds = await deps.listDueRecoveryTgIds(100);
            for (const dueTgId of dueTgIds) {
                await deps.finalizeActiveRecovery({
                    tgId: dueTgId,
                    interrupted: false,
                });
            }
            await sweepPassiveStaRecoveryOnce();
        }
        catch (error) {
            console.error('❌ Recovery sweep error:', error);
        }
        finally {
            deps.observePerf('recovery.sweep', Date.now() - startedAt);
            recoverySweepInFlight = false;
        }
    };
    const startRecoverySweeper = () => {
        if (recoverySweepTimer) {
            return;
        }
        recoverySweepTimer = setInterval(() => {
            void sweepDueRecoveriesOnce();
        }, deps.recoverySweepIntervalMs);
        void sweepDueRecoveriesOnce();
    };
    return {
        sweepPassiveStaRecoveryOnce,
        sweepDueRecoveriesOnce,
        startRecoverySweeper,
    };
}
//# sourceMappingURL=recovery-sweeper.js.map