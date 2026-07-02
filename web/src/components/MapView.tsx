import { useState, useEffect } from 'react';
import { useGame } from '../store/gameStore';
import './MapView.css';

const VIEW_RADIUS = 3;
const BIOME_EMOJI: Record<string, string> = {
  forest: '🌲', swamp: '🪷', plains: '🌾', river: '🌊', lake: '🏞️',
  volcano: '🌋', highlands: '🏔️', ashlands: '🌫️', desert: '🏜️',
  snow: '❄️', tundra: '❄️', beach: '🏝️', mountain: '🏔️',
};

export default function MapView() {
  const { player, log } = useGame();
  const [tiles, setTiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTiles();
  }, [player.mapX, player.mapY]);

  const loadTiles = async () => {
    setLoading(true);
    const cx = player.mapX;
    const cy = player.mapY;
    const fetched: any[] = [];

    for (let dy = -VIEW_RADIUS; dy <= VIEW_RADIUS; dy++) {
      for (let dx = -VIEW_RADIUS; dx <= VIEW_RADIUS; dx++) {
        const tx = cx + dx;
        const ty = cy + dy;
        try {
          const res = await fetch(`/api/map/tile/${tx}/${ty}`);
          if (res.ok) {
            const data = await res.json();
            fetched.push({ ...data.tile, dx, dy, place: data.place });
          } else {
            fetched.push({ x: tx, y: ty, dx, dy, biome: 'unknown', baseTile: '❓', emoji: '⬛' });
          }
        } catch {
          fetched.push({ x: tx, y: ty, dx, dy, biome: 'unknown', baseTile: '❓', emoji: '⬛' });
        }
      }
    }
    setTiles(fetched);
    setLoading(false);
  };

  const getEmoji = (tile: any) => {
    if (tile.dx === 0 && tile.dy === 0) return '📍';
    if (tile.biome && BIOME_EMOJI[tile.biome]) return BIOME_EMOJI[tile.biome];
    return tile.emoji || '⬛';
  };

  const isPlayerPos = (tile: any) => tile.dx === 0 && tile.dy === 0;

  return (
    <div className="map-view">
      <div className="map-legend">
        {Object.entries(BIOME_EMOJI).slice(0, 6).map(([key, emoji]) => (
          <span key={key} className="map-legend-item">
            {emoji} {key}
          </span>
        ))}
      </div>

      {loading && <div className="map-loading">Cargando mapa...</div>}

      <div className="map-grid">
        {Array.from({ length: VIEW_RADIUS * 2 + 1 }, (_, row) => (
          <div key={row} className="map-row">
            {Array.from({ length: VIEW_RADIUS * 2 + 1 }, (_, col) => {
              const tile = tiles.find((t) => t.dy === row - VIEW_RADIUS && t.dx === col - VIEW_RADIUS);
              if (!tile) return <div key={col} className="map-cell empty" />;
              return (
                <div
                  key={col}
                  className={`map-cell ${isPlayerPos(tile) ? 'player' : ''}`}
                  title={tile.name || `(${tile.x}, ${tile.y})`}
                >
                  <span className="map-cell-emoji">{getEmoji(tile)}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="map-log">
        {log.slice(-6).map((entry, i) => (
          <div key={i} className="map-log-entry">{entry}</div>
        ))}
      </div>
    </div>
  );
}
