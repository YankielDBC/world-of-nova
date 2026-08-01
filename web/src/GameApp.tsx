import { useState } from 'react';
import AuthGate from './components/AuthGate';
import GameLayout from './components/GameLayout';

export default function GameApp() {
  const [player, setPlayer] = useState<any>(null);

  if (!player) {
    return <AuthGate onReady={(p) => setPlayer(p)} />;
  }

  return <GameLayout player={player} onLogout={() => setPlayer(null)} />;
}
