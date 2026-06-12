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
export declare function exploreTile(playerId: number, tgId: string, x: number, y: number): Promise<{
    x: number;
    y: number;
    biome: {
        id: number | undefined;
        name: string | undefined;
        emoji: string | undefined;
        displayName: string | undefined;
    };
    displayEmoji: string;
    isFirstDiscovery: boolean;
    firstDiscoveredBy: string | null;
    discoveredAt: Date | null;
    fogRemoved: boolean;
}>;
/**
 * Obtiene los tiles visibles alrededor del jugador
 * para el mini-mapalocal (radio de visión)
 */
export declare function getVisibleArea(playerId: number, centerX: number, centerY: number, radius?: number): Promise<{
    x: number;
    y: number;
    emoji: string;
    isFog: boolean;
    isPlayer: boolean;
}[]>;
