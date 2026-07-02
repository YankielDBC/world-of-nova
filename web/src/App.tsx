import { useState } from 'react';
import Dashboard from './components/Dashboard';
import GameApp from './GameApp';

type AppMode = 'dashboard' | 'game';

export default function App() {
  const [mode, setMode] = useState<AppMode>('dashboard');

  if (mode === 'game') {
    return <GameApp />;
  }

  return <Dashboard onEnterGame={() => setMode('game')} />;
}
