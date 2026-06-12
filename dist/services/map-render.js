// @ts-nocheck
import { InlineKeyboard } from 'grammy';
import { summarizeCustomEmojiTokenCoverage } from '../data/custom-emojis.js';
import { EMOJIS } from '../data/emojis.js';
import { getLocalizedText, getPlaceUiConfig } from '../data/place-ui.js';
import { prisma, getPlayerByTelegramId } from '../lib/db.js';
import { compactCoordLabel, compactLabel, compactText } from '../lib/ui-compact.js';
import { debugTextPreview, logMapDebug } from '../lib/map-debug.js';
import { observePerf } from '../lib/perf-metrics.js';
import { t } from '../lib/i18n.js';
import { formatClimateLine, getClimateForTile } from './climate.js';
import { renderActiveCaveMap } from './cave-system.js';
import { getCreatureSnapshotsAtCoords } from './creatures.js';
import { isNearCemetery, renderGhostMap } from './death-system.js';
import { formatDayCycleLine, getDayCycleSnapshot } from './day-cycle.js';
import { getMerchantSnapshotAtCoords } from './mystery-merchant.js';
import { formatPopulationLine, getTilePopulationAtCoords } from './population.js';
import { getGatherableResources } from './map-gatherable.js';
import { getCanonicalWorldMap } from './world-map.js';
import { getLocationDisplayLabel, getMovementEmoji, getMovementMode, getPlaceState, getTileMapEmoji, } from './map-utils.js';
import { getOrCreateTile, getPlaceAtCoords, markTileExplored, loadBiomes } from './map-data.js';
import { formatZoneLevelLine } from './map-utils.js';
function extractEmojiLikeTokens(text) {
    return Array.from(text.matchAll(/\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/gu), (match) => match[0]);
}
function coordsKey(x, y) {
    return `${x},${y}`;
}
async function ensureTileInCache(cache, worldMapId, x, y) {
    const key = coordsKey(x, y);
    let tile = cache.get(key);
    if (!tile) {
        tile = await getOrCreateTile(worldMapId, x, y);
        cache.set(key, tile);
    }
    return tile;
}
export async function renderMap(tgId) {
    const startedAt = Date.now();
    try {
        const ghostMap = await renderGhostMap(tgId);
        if (ghostMap) {
            return ghostMap;
        }
        const activeCaveMap = await renderActiveCaveMap(tgId);
        if (activeCaveMap) {
            return activeCaveMap;
        }
        const player = await getPlayerByTelegramId(tgId);
        if (!player)
            return null;
        const lang = player.language ?? 'es';
        const worldMap = await getCanonicalWorldMap();
        await loadBiomes();
        const centerX = player.mapX;
        const centerY = player.mapY;
        const halfSize = 5;
        const minX = centerX - halfSize;
        const maxX = centerX + halfSize;
        const minY = centerY - halfSize;
        const maxY = centerY + halfSize;
        const [exploredTiles, areaTiles, placeRecords] = await Promise.all([
            prisma.playerExploredTile.findMany({
                where: {
                    playerId: player.id,
                    tileX: { gte: minX, lte: maxX },
                    tileY: { gte: minY, lte: maxY },
                },
            }),
            prisma.mapTile.findMany({
                where: {
                    worldMapId: worldMap.id,
                    x: { gte: minX, lte: maxX },
                    y: { gte: minY, lte: maxY },
                },
                include: { biome: true },
            }),
            prisma.place.findMany({
                where: {
                    type: { in: ['FIXED', 'DYNAMIC'] },
                    isActive: true,
                    coordX: { gte: minX, lte: maxX, not: null },
                    coordY: { gte: minY, lte: maxY, not: null },
                },
                include: {
                    interactions: { orderBy: { sortOrder: 'asc' } },
                },
            }),
        ]);
        const exploredSet = new Set(exploredTiles.map((tile) => coordsKey(tile.tileX, tile.tileY)));
        const tileCache = new Map();
        for (const tile of areaTiles)
            tileCache.set(coordsKey(tile.x, tile.y), tile);
        const placeMap = new Map();
        for (const placeItem of placeRecords) {
            if (placeItem.coordX == null || placeItem.coordY == null)
                continue;
            placeMap.set(coordsKey(placeItem.coordX, placeItem.coordY), placeItem);
        }
        const currentKey = coordsKey(centerX, centerY);
        const currentTile = await ensureTileInCache(tileCache, worldMap.id, centerX, centerY);
        let place = placeMap.get(currentKey) ?? null;
        if (!place) {
            const fallback = await getPlaceAtCoords(centerX, centerY, worldMap.id);
            if (fallback && fallback.coordX != null && fallback.coordY != null) {
                placeMap.set(coordsKey(fallback.coordX, fallback.coordY), fallback);
            }
            place = fallback;
        }
        const locationName = getLocationDisplayLabel(currentTile, place);
        const tileInfo = {
            x: centerX,
            y: centerY,
            emoji: place?.emoji || currentTile.biome?.emoji || '?',
            biome: currentTile.biome?.name || 'unknown',
            displayName: locationName,
            isWater: currentTile.isWater,
            isMountain: currentTile.elevation > 0,
            hasPlace: !!place,
            placeEmoji: place?.emoji,
            placeName: place?.displayName,
            isExplored: true,
        };
        const mode = getMovementMode(tileInfo, player.speed || 1);
        const placeState = getPlaceState(place, lang);
        const statusEmoji = placeState?.stateEmoji || getMovementEmoji(mode);
        const header = `${EMOJIS.ui.map} ${t(lang, 'mapYouAreIn')} ${EMOJIS.ui.pin}${compactCoordLabel(centerX, centerY)} - ${statusEmoji}`;
        const localizedPlaceName = place ? getLocalizedText(getPlaceUiConfig(place.slug)?.name, lang, place.displayName) : '';
        const centerMapEmoji = getTileMapEmoji(currentTile, centerX, centerY);
        const biomeNameBase = place
            ? `${place.emoji} ${compactLabel(localizedPlaceName, 24)} - ${placeState?.stateLabel || t(lang, 'mapPlaceLabel')}`
            : `${centerMapEmoji} ${compactLabel(locationName, 32)}`;
        const gridRows = [];
        for (let dy = halfSize; dy >= -halfSize; dy--) {
            const row = [];
            for (let dx = -halfSize; dx <= halfSize; dx++) {
                const tx = centerX + dx;
                const ty = centerY + dy;
                const key = coordsKey(tx, ty);
                const explored = exploredSet.has(key);
                if (!explored) {
                    row.push('⬜');
                    continue;
                }
                const tile = await ensureTileInCache(tileCache, worldMap.id, tx, ty);
                const tilePlace = placeMap.get(key);
                if (dx === 0 && dy === 0) {
                    row.push(EMOJIS.ui.pin);
                }
                else if (tilePlace) {
                    row.push(tilePlace.emoji);
                }
                else {
                    row.push(getTileMapEmoji(tile, tx, ty));
                }
            }
            gridRows.push(row.join(''));
        }
        if (!exploredSet.has(coordsKey(0, 0)))
            await markTileExplored(player.id, player.tgId, 0, 0);
        if (!exploredSet.has(currentKey))
            await markTileExplored(player.id, player.tgId, centerX, centerY);
        const grid = '----------------------------\n' + gridRows.join('\n') + '\n----------------------------';
        const dayCycle = getDayCycleSnapshot();
        const climate = await getClimateForTile({
            worldMapId: worldMap.id,
            x: centerX,
            y: centerY,
            biomeName: currentTile.biome?.name,
            biomeDisplayName: currentTile.biome?.displayName,
        });
        const gatherable = currentTile.biomeId
            ? await getGatherableResources(currentTile.biomeId, currentTile.biome?.name || 'plains', dayCycle, climate, centerX, centerY, currentTile.resourcesJson)
            : [];
        const resourceEmojis = gatherable.map((item) => item.emoji).join(' ');
        const lootPreview = resourceEmojis || EMOJIS.items.nothing;
        const climateLine = formatClimateLine(lang, climate);
        const dayCycleLine = formatDayCycleLine(lang, dayCycle);
        const zoneLevelLine = formatZoneLevelLine(lang, centerX, centerY, player.level);
        const cemeteryLine = isNearCemetery(centerX, centerY)
            ? lang === 'en'
                ? '⚰️ Nearby cemetery'
                : lang === 'ru'
                    ? '⚰️ Kladbishche ryadom'
                    : '⚰️ Cementerio cercano'
            : '';
        const biomeName = [biomeNameBase, climateLine, dayCycleLine, zoneLevelLine, cemeteryLine]
            .filter(Boolean)
            .join('\n');
        const [population, merchantHere, creaturesHere] = await Promise.all([
            getTilePopulationAtCoords({
                currentPlayerId: player.id,
                x: centerX,
                y: centerY,
            }),
            getMerchantSnapshotAtCoords({
                worldMapId: worldMap.id,
                x: centerX,
                y: centerY,
            }),
            getCreatureSnapshotsAtCoords({
                worldMapId: worldMap.id,
                x: centerX,
                y: centerY,
                biomeName: currentTile.biome?.name || 'plains',
                biomeId: currentTile.biomeId ?? null,
                includeDead: false,
            }),
        ]);
        let interactionLine = merchantHere
            ? lang === 'en'
                ? '🧩 Interactions: 🕵️ Mysterious Merchant'
                : lang === 'ru'
                    ? '🧩 Vzaimodeystviya: 🕵️ Tainstvennyy torgovets'
                    : '🧩 Interacciones: 🕵️ Comerciante Misterioso'
            : null;
        const interactionItems = [];
        if (creaturesHere.length > 0) {
            interactionItems.push(lang === 'en'
                ? `👾 Creatures x${creaturesHere.length}`
                : lang === 'ru'
                    ? `👾 Sushchestva x${creaturesHere.length}`
                    : `👾 Criaturas x${creaturesHere.length}`);
        }
        if (merchantHere) {
            interactionItems.push(lang === 'en'
                ? '🕵️ Mysterious Merchant'
                : lang === 'ru'
                    ? '🕵️ Tainstvennyy torgovets'
                    : '🕵️ Comerciante Misterioso');
        }
        if (interactionItems.length > 0) {
            interactionLine =
                lang === 'en'
                    ? `🧩 Interactions: ${interactionItems.join(' · ')}`
                    : lang === 'ru'
                        ? `🧩 Vzaimodeystviya: ${interactionItems.join(' · ')}`
                        : `🧩 Interacciones: ${interactionItems.join(' · ')}`;
        }
        else {
            interactionLine = null;
        }
        const populationLine = formatPopulationLine(lang, population);
        const footerBase = place
            ? `${statusEmoji} ${placeState?.description || 'No PvP, no monster attacks.'}`
            : `${EMOJIS.ui.loot} Loot = ${compactText(lootPreview, 42, '')}`;
        const footer = [footerBase, populationLine, interactionLine].filter(Boolean).join('\n');
        const keyboard = new InlineKeyboard()
            .text(`${EMOJIS.ui.bag} ${t(lang, 'mapBag')}`, 'map_bag')
            .text(`⬆️ ${t(lang, 'mapUp')}`, 'map_up')
            .text(`${EMOJIS.ui.profile} ${t(lang, 'mapProfile')}`, 'map_profile')
            .row()
            .text(`⬅️ ${t(lang, 'mapLeft')}`, 'map_left')
            .text(`🔍 ${t(lang, 'mapInspect')}`, 'map_inspect')
            .text(`➡️ ${t(lang, 'mapRight')}`, 'map_right')
            .row()
            .text(`🧩 ${t(lang, 'mapInteract')}`, 'map_interact')
            .text(`⬇️ ${t(lang, 'mapDown')}`, 'map_down')
            .text(`🚀 ${t(lang, 'mapVenture')}`, 'map_venture');
        const visibleEmojiCounts = {};
        for (const row of gridRows) {
            for (const glyph of Array.from(row)) {
                visibleEmojiCounts[glyph] = (visibleEmojiCounts[glyph] || 0) + 1;
            }
        }
        const visibleEmojiTokens = [
            ...Object.keys(visibleEmojiCounts),
            ...extractEmojiLikeTokens(header),
            ...extractEmojiLikeTokens(biomeName),
            ...extractEmojiLikeTokens(footer),
        ];
        const customEmojiCoverage = summarizeCustomEmojiTokenCoverage(visibleEmojiTokens);
        logMapDebug('renderMap.summary', {
            tgId,
            center: { x: centerX, y: centerY },
            biome: currentTile.biome?.name || null,
            place: place?.slug || null,
            exploredVisibleTiles: Array.from(exploredSet).length,
            visibleEmojiCounts,
            customEmojiCoverage,
            gatherable: gatherable.map((item) => `${item.emoji} ${item.name}`),
            merchantHere: !!merchantHere,
            creatureCount: creaturesHere.length,
            population,
            headerPreview: debugTextPreview(header, 120),
            biomeNamePreview: debugTextPreview(biomeName, 180),
            footerPreview: debugTextPreview(footer, 180),
        });
        return { header, biomeName, grid, footer, keyboard };
    }
    finally {
        observePerf('map.render', Date.now() - startedAt);
    }
}
//# sourceMappingURL=map-render.js.map