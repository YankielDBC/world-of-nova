import { useState } from 'react';
import { useGame } from '../store/gameStore';
import './ActionPanel.css';

const DIRS: Record<string, { emoji: string; label: string }> = {
  up: { emoji: '⬆️', label: 'Norte' },
  down: { emoji: '⬇️', label: 'Sur' },
  left: { emoji: '⬅️', label: 'Oeste' },
  right: { emoji: '➡️', label: 'Este' },
};

export default function ActionPanel() {
  const { player, setPlayer, currentTile, setCurrentTile, gatherable, setGatherable, addLog, addNotification } = useGame();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<string | null>(null);

  const doMove = async (direction: string) => {
    if (actionLoading) return;
    setActionLoading(direction);
    setActionResult(null);
    try {
      const res = await fetch('/api/map/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id, direction }),
      });
      const data = await res.json();
      if (data.success) {
        setPlayer((prev: any) => ({
          ...prev,
          mapX: data.player.mapX,
          mapY: data.player.mapY,
          energy: data.player.energy,
          maxEnergy: data.player.maxEnergy,
        }));
        setCurrentTile(data.tile);
        setGatherable(data.gatherable);
        const dirLabel = DIRS[direction]?.label || direction;
        addLog(`${DIRS[direction]?.emoji || ''} Moviste hacia ${dirLabel} → (${data.to.x}, ${data.to.y}) [${data.tile.biome || '?'}] -STA ${data.energyCost}`);
        setActionResult(`Movido a (${data.to.x}, ${data.to.y})`);
      } else {
        addLog(`❌ ${data.message}`);
        setActionResult(data.message);
        addNotification(data.message);
      }
    } catch {
      setActionResult('Error de conexion');
    }
    setActionLoading(null);
    setTimeout(() => setActionResult(null), 3000);
  };

  const doGather = async () => {
    if (actionLoading) return;
    setActionLoading('gather');
    setActionResult(null);
    try {
      const res = await fetch('/api/map/gather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id }),
      });
      const data = await res.json();
      if (data.success) {
        addLog(`🎒 Recolectaste: ${data.gathered.emoji} ${data.gathered.resourceName} x${data.gathered.quantity}`);
        setActionResult(`+${data.gathered.quantity} ${data.gathered.resourceName}`);
        addNotification(`Recolectado: ${data.gathered.resourceName} x${data.gathered.quantity}`);
      } else {
        setActionResult('No se pudo recolectar');
        addNotification('No se pudo recolectar');
      }
    } catch {
      setActionResult('Error de conexion');
    }
    setActionLoading(null);
    setTimeout(() => setActionResult(null), 3000);
  };

  return (
    <div className="ap-root">
      {/* Current Location */}
      <div className="ap-location">
        {currentTile ? (
          <>
            <div className="ap-loc-name">
              {currentTile.emoji} {currentTile.name || `(${currentTile.x}, ${currentTile.y})`}
            </div>
            <div className="ap-loc-detail">
              Bioma: {currentTile.biome || 'Desconocido'} | ({currentTile.x}, {currentTile.y})
            </div>
          </>
        ) : (
          <div className="ap-loc-name">
            📍 ({player.mapX}, {player.mapY})
          </div>
        )}
      </div>

      {/* Move Controls */}
      <div className="ap-dpad">
        <div className="ap-dpad-row">
          <button className="ap-dpad-btn" onClick={() => doMove('up')} disabled={actionLoading !== null}>
            ⬆️
          </button>
        </div>
        <div className="ap-dpad-row">
          <button className="ap-dpad-btn" onClick={() => doMove('left')} disabled={actionLoading !== null}>⬅️</button>
          <div className="ap-dpad-center" />
          <button className="ap-dpad-btn" onClick={() => doMove('right')} disabled={actionLoading !== null}>➡️</button>
        </div>
        <div className="ap-dpad-row">
          <button className="ap-dpad-btn" onClick={() => doMove('down')} disabled={actionLoading !== null}>⬇️</button>
        </div>
      </div>

      {/* Gather Button */}
      <button className="ap-gather" onClick={doGather} disabled={actionLoading !== null}>
        🪓 Recolectar
      </button>

      {/* Action Result */}
      {actionResult && (
        <div className="ap-result">{actionResult}</div>
      )}

      {/* Gatherable info */}
      {gatherable && gatherable.length > 0 && (
        <div className="ap-gatherable">
          <div className="ap-gath-title">Recursos disponibles:</div>
          {gatherable.slice(0, 5).map((r: any, i: number) => (
            <div key={i} className="ap-gath-item">
              {r.emoji || '📦'} {r.displayName || r.resourceName || r.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
