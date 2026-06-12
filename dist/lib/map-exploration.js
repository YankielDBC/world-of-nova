// ============================================
// WORLD OF NOVA - MAP EXPLORATION SYSTEM
// ============================================
import { PrismaClient } from '@prisma/client';
import { getCanonicalWorldMapId } from '../services/world-map.js';
const prisma = new PrismaClient();
/**
 * Explora un tile en coordenadas específicas (x,y)
 * Maneja el sistema de fog individual por jugador
 *
 * @param playerId - ID del jugador en la base de datos
 * @param tgId - Telegram ID del jugador
 * @param x - Coordenada X del tile
 * @param y - Coordenada Y del tile
 * @returns Objeto con el bioma encontrado y metadata de descubrimiento
 */
export async function exploreTile(playerId, tgId, x, y) {
    const WORLD_MAP_ID = await getCanonicalWorldMapId();
    // ========================================
    // 1. BUSCAR TILE EXISTENTE EN LA DB
    // ========================================
    const existingTile = await prisma.mapTile.findUnique({
        where: {
            worldMapId_x_y: {
                worldMapId: WORLD_MAP_ID,
                x,
                y
            }
        }
    });
    // ========================================
    // 2. DETERMINAR SI ES NUEVO O EXISTENTE
    // ========================================
    let biomeId;
    let isFirstDiscovery = false;
    let firstDiscoveredBy = null;
    let discoveredAt = null;
    if (existingTile?.isGenerated && existingTile.biomeId) {
        // ========================================
        // CASO A: TILE YA GENERADO POR OTRO
        // ========================================
        // El bioma ya existe, usarlo igual
        biomeId = existingTile.biomeId;
        firstDiscoveredBy = existingTile.firstDiscoveredById;
        discoveredAt = existingTile.firstDiscoveredAt ?? null;
        // NO se registra como primer descubridor
    }
    else {
        // ========================================
        // CASO B: TILE NO GENERADO - CREAR NUEVO
        // ========================================
        // Generar bioma según probabilidades
        biomeId = generateBiomeByProbability(x, y);
        // Registrar como primer descubridor
        isFirstDiscovery = true;
        firstDiscoveredBy = tgId;
        discoveredAt = new Date();
        // Crear/actualizar el tile en la DB
        await prisma.mapTile.upsert({
            where: {
                worldMapId_x_y: {
                    worldMapId: WORLD_MAP_ID,
                    x,
                    y
                }
            },
            create: {
                worldMapId: WORLD_MAP_ID,
                x,
                y,
                biomeId,
                isGenerated: true,
                firstDiscoveredById: tgId,
                firstDiscoveredAt: discoveredAt,
                elevation: generateElevation(biomeId),
                isWater: isWaterBiome(biomeId),
            },
            update: {
                biomeId,
                isGenerated: true,
                firstDiscoveredById: tgId,
                firstDiscoveredAt: discoveredAt,
                elevation: generateElevation(biomeId),
                isWater: isWaterBiome(biomeId),
            }
        });
    }
    // ========================================
    // 3. REGISTRAR EN FOG DEL JUGADOR
    // Marcar como explorado PARA ESTE JUGADOR
    // ========================================
    await prisma.playerExploredTile.upsert({
        where: {
            playerId_tileX_tileY: {
                playerId,
                tileX: x,
                tileY: y
            }
        },
        create: {
            playerId,
            tileX: x,
            tileY: y,
            exploredAt: new Date()
        },
        update: {
            exploredAt: new Date() // Actualizar timestamp
        }
    });
    // ========================================
    // 4. OBTENER INFO DEL BIOMA
    // ========================================
    const biome = await prisma.biome.findUnique({
        where: { id: biomeId }
    });
    // ========================================
    // 5. RETORNAR RESULTADO
    // ========================================
    return {
        x,
        y,
        biome: {
            id: biome?.id,
            name: biome?.name,
            emoji: biome?.emoji,
            displayName: biome?.displayName,
        },
        // El pin REEMPLAZA el emoji del bioma cuando el jugador está en el tile
        displayEmoji: '📍', // Pin取代bioma cuando el jugador está aquí
        isFirstDiscovery,
        firstDiscoveredBy,
        discoveredAt,
        fogRemoved: true, // Se eliminó el fog para este jugador
    };
}
/**
 * Obtiene los tiles visibles alrededor del jugador
 * para el mini-mapalocal (radio de visión)
 */
export async function getVisibleArea(playerId, centerX, centerY, radius = 3) {
    const worldMapId = await getCanonicalWorldMapId();
    const tiles = [];
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            const x = centerX + dx;
            const y = centerY + dy;
            // Verificar si el jugador ha explorado este tile
            const explored = await prisma.playerExploredTile.findUnique({
                where: {
                    playerId_tileX_tileY: {
                        playerId,
                        tileX: x,
                        tileY: y
                    }
                }
            });
            const isPlayer = dx === 0 && dy === 0;
            const isFog = !explored;
            // Si es el jugador → mostrar solo 📍 (reemplaza bioma)
            // Si es fog → mostrar 🌫️
            // Si es normal → mostrar bioma (se carga después)
            tiles.push({
                x,
                y,
                emoji: isPlayer ? '📍' : (isFog ? '🌫️' : '⏳'),
                isFog,
                isPlayer
            });
        }
    }
    // Cargar biomas para tiles no-fog y no-player
    for (const tile of tiles) {
        if (!tile.isFog && !tile.isPlayer) {
            const mapTile = await prisma.mapTile.findUnique({
                where: {
                    worldMapId_x_y: {
                        worldMapId,
                        x: tile.x,
                        y: tile.y
                    }
                },
                include: { biome: true }
            });
            if (mapTile?.biome) {
                tile.emoji = mapTile.biome.emoji;
            }
        }
        // Si isPlayer = true, ya tiene 📍 (no mostrar bioma)
    }
    return tiles;
}
// ========================================
// HELPERS ( Placeholder - implementar con biome.ts )
// ========================================
function generateBiomeByProbability(x, y) {
    // TODO: Implementar generación por ruido/perlin + probabilidades
    // Por ahora retorna forest como default
    return 1;
}
function generateElevation(biomeId) {
    // TODO: Basado en tipo de bioma
    return 0;
}
function isWaterBiome(biomeId) {
    // TODO: Verificar si es bioma de agua
    return false;
}
