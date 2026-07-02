import { useState } from 'react';
import MainMenu from './components/MainMenu';
import GameLayout from './components/GameLayout';

export default function GameApp() {
  const [player, setPlayer] = useState<any>(null);

  if (!player) {
    return <MainMenu onEnter={(p) => setPlayer(p)} />;
  }

  return <GameLayout player={player} onLogout={() => setPlayer(null)} />;
}
