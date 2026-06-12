// @ts-nocheck
import { EMOJIS } from '../data/emojis.js';
import { getLocalizedText, getPlaceUiConfig } from '../data/place-ui.js';
import { getPlayerByTelegramId } from '../lib/db.js';
import { observePerf } from '../lib/perf-metrics.js';
import { t } from '../lib/i18n.js';
import { formatPopulationLine, getTilePopulationAtCoords } from './population.js';
import { getCanonicalWorldMap } from './world-map.js';
import { getGameplayEffectsForPlayer } from './gameplay-effects.js';
import { formatZoneLevelLine, getDirectionLabel, getLocationDisplayLabel, getMovementEmoji, getMovementMode, } from './map-utils.js';
import { getPlaceBuildingEntriesClean } from './map-place-ui.js';
import { finalizePlayerMove as _finalizePlayerMove } from './map-move-finalize.js';
import { getOrCreateTile, getPlaceAtCoords, isTileExplored, markTileExplored } from './map-data.js';
export async function finalizePlayerMove(tgId, playerId, toX, toY, isNewDiscovery, energyCost, expectedFrom) {
    // Delegate keeps this file focused on movement UX while allowing dedicated test surface.
    return _finalizePlayerMove(tgId, playerId, toX, toY, isNewDiscovery, energyCost, expectedFrom, markTileExplored);
}
export async function movePlayer(tgId, direction) {
    const startedAt = Date.now();
    try {
        const player = await getPlayerByTelegramId(tgId);
        if (!player) {
            return {
                success: false,
                fromX: 0,
                fromY: 0,
                toX: 0,
                toY: 0,
                energyCost: 0,
                travelTime: 0,
                mode: 'walking',
                message: 'Player not found',
                isNewDiscovery: false,
            };
        }
        const lang = player.language ?? 'es';
        const worldMap = await getCanonicalWorldMap();
        const fromX = player.mapX;
        const fromY = player.mapY;
        const directions = {
            up: { dx: 0, dy: 1 },
            down: { dx: 0, dy: -1 },
            left: { dx: -1, dy: 0 },
            right: { dx: 1, dy: 0 },
        };
        const { dx, dy } = directions[direction];
        const toX = fromX + dx;
        const toY = fromY + dy;
        const alreadyExplored = await isTileExplored(player.id, toX, toY);
        const destTile = await getOrCreateTile(worldMap.id, toX, toY);
        const place = await getPlaceAtCoords(toX, toY, worldMap.id);
        const placePopulation = place
            ? await getTilePopulationAtCoords({
                currentPlayerId: player.id,
                x: toX,
                y: toY,
            })
            : null;
        const placePopulationLine = placePopulation ? formatPopulationLine(lang, placePopulation) : null;
        const gameplayEffects = await getGameplayEffectsForPlayer(player.id);
        const baseEnergyCost = destTile.elevation > 0 ? 3 : destTile.isWater ? 2 : 1;
        const energyCost = Math.max(1, Math.ceil(baseEnergyCost * gameplayEffects.travelStaminaCostMultiplier));
        if (player.energy < energyCost) {
            return {
                success: false,
                fromX,
                fromY,
                toX,
                toY,
                energyCost,
                travelTime: 0,
                mode: 'walking',
                message: `Necesitas ${energyCost} STA para entrar aqui y solo tienes ${player.energy}.`,
                isNewDiscovery: false,
            };
        }
        const movementFactor = destTile.biome?.movementFactor || 1.0;
        const baseTime = 3;
        let terrainMultiplier = 1;
        if (destTile.isWater)
            terrainMultiplier = 1.5;
        if (destTile.elevation > 0)
            terrainMultiplier = 2;
        const playerSpeed = player.speed || 1;
        const travelTime = Math.round(((baseTime * terrainMultiplier * movementFactor) / playerSpeed) * gameplayEffects.travelTimeMultiplier);
        const tileInfo = {
            x: toX,
            y: toY,
            emoji: place?.emoji || destTile.biome?.emoji || '?',
            biome: destTile.biome?.name || 'unknown',
            displayName: getLocationDisplayLabel(destTile, place, lang),
            isWater: destTile.isWater,
            isMountain: destTile.elevation > 0,
            hasPlace: !!place,
            isExplored: alreadyExplored,
        };
        const mode = getMovementMode(tileInfo, playerSpeed);
        const dirName = getDirectionLabel(lang, direction);
        const zoneLevelLine = formatZoneLevelLine(lang, toX, toY, player.level);
        const newDiscoveryText = alreadyExplored ? '' : `\n🆕 ${t(lang, 'mapNewArea')}`;
        const moveMessage = `${getMovementEmoji(mode)} ${t(lang, 'mapTraveling')} ${dirName}...${newDiscoveryText}\n\n` +
            `${EMOJIS.ui.pin} ${t(lang, 'mapFrom')} (${fromX}, ${fromY}) -> (${toX}, ${toY})\n` +
            `${place?.emoji || destTile.biome?.emoji || '?'} ${getLocationDisplayLabel(destTile, place, lang)} - (${toX}, ${toY})\n` +
            `${zoneLevelLine}\n\n` +
            `${EMOJIS.ui.stamina} ${t(lang, 'mapStaCost')}: -${energyCost}\n` +
            `🕒 ${t(lang, 'mapArrivalIn')}: ${travelTime} sec`;
        let arrivalMessage;
        let placeArrival;
        if (place) {
            const buildings = getPlaceBuildingEntriesClean(place, lang);
            const placeConfig = getPlaceUiConfig(place.slug);
            const placeName = getLocalizedText(placeConfig?.name, lang, place.displayName);
            arrivalMessage = [
                `🏁 ${t(lang, 'mapArrivedAt')} ${EMOJIS.ui.pin}${placeName} (${toX}, ${toY})`,
                `${place.emoji} ${t(lang, 'mapYouAreIn')} ${placeName}`,
                zoneLevelLine,
                '',
                `✧═ ${t(lang, 'mapBuildingsTitle')} ═✧`,
                '┌────────┐',
                ...buildings,
                ...(placePopulationLine ? ['', placePopulationLine] : []),
            ].join('\n');
            placeArrival = {
                name: place.displayName,
                emoji: place.emoji,
                buildings,
            };
        }
        else {
            arrivalMessage = `🏁 ${t(lang, 'mapArrivedAt')} ${EMOJIS.ui.pin}${getLocationDisplayLabel(destTile, place, lang)} (${toX}, ${toY})\n${zoneLevelLine}`;
        }
        return {
            success: true,
            fromX,
            fromY,
            toX,
            toY,
            energyCost,
            travelTime,
            mode,
            message: moveMessage,
            arrivalMessage,
            placeArrival,
            isNewDiscovery: !alreadyExplored,
        };
    }
    finally {
        observePerf('map.move', Date.now() - startedAt);
    }
}
