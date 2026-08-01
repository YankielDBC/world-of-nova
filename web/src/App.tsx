import { useState } from 'react';
import Dashboard from './components/Dashboard';
import GameApp from './GameApp';

type AppMode = 'dashboard' | 'game';

export default function App() {
  const initialMode: AppMode =
    new URLSearchParams(window.location.search).get('mode') === 'dashboard' ? 'dashboard' : 'game';
  const [mode, setMode] = useState<AppMode>(initialMode);

  if (mode === 'game') {
    return <GameApp />;
  }

  return (
    <Dashboard
      onEnterGame={() => {
        window.history.replaceState({}, '', '/');
        setMode('game');
      }}
    />
  );
}
