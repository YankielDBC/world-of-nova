// @ts-nocheck
import { prisma } from '../lib/db.js';
import { readTileResourceState, serializeTileResourceState } from '../lib/tile-state.js';
export async function mutateTileResourceState(tileId, mutator, maxRetries = 5) {
    let attempts = 0;
    while (attempts < maxRetries) {
        attempts += 1;
        const tile = await prisma.mapTile.findUnique({
            where: { id: tileId },
            select: { id: true, resourcesJson: true, updatedAt: true },
        });
        if (!tile) {
            return { ok: false, result: null, attempts };
        }
        const currentState = readTileResourceState(tile.resourcesJson);
        const { nextState, result } = await mutator(currentState);
        const nextJson = serializeTileResourceState(nextState);
        const currentJson = tile.resourcesJson || '';
        if (nextJson === currentJson) {
            return { ok: true, result, attempts };
        }
        const updated = await prisma.mapTile.updateMany({
            where: {
                id: tile.id,
                updatedAt: tile.updatedAt,
            },
            data: { resourcesJson: nextJson },
        });
        if (updated.count === 1) {
            return { ok: true, result, attempts };
        }
    }
    return { ok: false, result: null, attempts };
}
