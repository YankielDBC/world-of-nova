import { GameProvider } from '../store/gameStore';
import MapView from './MapView';
import CharacterPanel from './CharacterPanel';
import ActionPanel from './ActionPanel';
import './GameLayout.css';

interface Props {
  player: any;
  onLogout: () => void;
}

export default function GameLayout({ player, onLogout }: Props) {
  return (
    <GameProvider initialPlayer={player} onLogout={onLogout}>
      <div className="game-layout">
        <header className="gl-header">
          <span className="gl-title">World of Nova</span>
          <span className="gl-player-name">{player.nickname}</span>
          <span className="gl-coords">({player.mapX}, {player.mapY})</span>
          <button className="gl-logout" onClick={onLogout}>Salir</button>
        </header>

        <main className="gl-main">
          <section className="gl-panel gl-map">
            <div className="gl-panel-header">Mapa</div>
            <MapView />
          </section>

          <section className="gl-panel gl-actions">
            <div className="gl-panel-header">Acciones</div>
            <ActionPanel />
          </section>

          <section className="gl-panel gl-character">
            <div className="gl-panel-header">Personaje</div>
            <CharacterPanel />
          </section>
        </main>
      </div>
    </GameProvider>
  );
}
