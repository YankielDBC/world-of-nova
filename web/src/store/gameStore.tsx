import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

interface GameContextType {
  player: any;
  setPlayer: (p: any) => void;
  currentTile: any;
  setCurrentTile: (t: any) => void;
  gatherable: any;
  setGatherable: (g: any) => void;
  log: string[];
  addLog: (msg: string) => void;
  notifications: string[];
  addNotification: (msg: string) => void;
  clearNotification: (idx: number) => void;
  refreshPlayer: () => Promise<void>;
}

const GameContext = createContext<GameContextType>(null!);

export function GameProvider({ children, initialPlayer, onLogout }: { children: React.ReactNode; initialPlayer: any; onLogout: () => void }) {
  const [player, setPlayer] = useState(initialPlayer);
  const [currentTile, setCurrentTile] = useState<any>(null);
  const [gatherable, setGatherable] = useState<any>(null);
  const [log, setLog] = useState<string[]>(['Bienvenido a World of Nova.']);
  const [notifications, setNotifications] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [...prev.slice(-99), msg]);
  }, []);

  const addNotification = useCallback((msg: string) => {
    setNotifications((prev) => [...prev, msg]);
  }, []);

  const clearNotification = useCallback((idx: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const refreshPlayer = useCallback(async () => {
    try {
      const res = await fetch(`/api/player/${player.id}`);
      if (res.ok) {
        const data = await res.json();
        setPlayer((prev: any) => ({ ...prev, ...data }));
      }
    } catch { /* ignore */ }
  }, [player.id]);

  return (
    <GameContext.Provider value={{
      player, setPlayer,
      currentTile, setCurrentTile,
      gatherable, setGatherable,
      log, addLog,
      notifications, addNotification, clearNotification,
      refreshPlayer,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
