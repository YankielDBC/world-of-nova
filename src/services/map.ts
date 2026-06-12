// @ts-nocheck
// Facade module for map domain.
// Keeps legacy imports stable while implementation lives in focused submodules.
export { checkAFKStatus, updateAFKTimer } from './map-presence.js';
export { getGatherableResources } from './map-gatherable.js';
export { invalidateBiomeCache, isTileExplored, markTileExplored, markTilesExploredBatch, getOrCreateTile, getPlaceAtCoords, ensureTilesGeneratedForCoords, } from './map-data.js';
export { renderMap } from './map-render.js';
export { movePlayer, finalizePlayerMove } from './map-move.js';
export { formatZoneLevelLine, generateTileLoreName, getDirectionLabel, getLocationDisplayLabel, getMovementEmoji, getMovementMode, getPlaceState, getTileDisplayLabel, getTileMapEmoji, isSafePlace, } from './map-utils.js';
