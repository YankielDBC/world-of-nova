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
export declare function exploreTile(playerId: any, tgId: any, x: any, y: any): Promise<{
    x: any;
    y: any;
    biome: {
        id: number;
        name: string;
        emoji: string;
        displayName: string;
    };
    displayEmoji: string;
    isFirstDiscovery: boolean;
    firstDiscoveredBy: any;
    discoveredAt: any;
    fogRemoved: boolean;
}>;
/**
 * Obtiene los tiles visibles alrededor del jugador
 * para el mini-mapalocal (radio de visión)
 */
export declare function getVisibleArea(playerId: any, centerX: any, centerY: any, radius?: number): Promise<any[]>;
