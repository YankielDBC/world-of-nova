import { useState } from 'react';
import './MainMenu.css';

interface Props {
  onEnter: (player: any) => void;
}

export default function MainMenu({ onEnter }: Props) {
  const [step, setStep] = useState<'login' | 'nickname' | 'race' | 'class'>('login');
  const [nickname, setNickname] = useState('');
  const [race, setRace] = useState('');
  const [classKey, setClassKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [races, setRaces] = useState<any>(null);
  const [classes, setClasses] = useState<any>(null);

  const fetchConfig = async () => {
    if (races && classes) return;
    const res = await fetch('/api/auth/races');
    const data = await res.json();
    setRaces(data.races);
    setClasses(data.classes);
  };

  const handleLogin = async () => {
    if (!nickname.trim()) { setError('Ingresa tu nickname'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      onEnter(data.player);
    } catch {
      setError('Connection error');
      setLoading(false);
    }
  };

  const startRegister = async () => {
    if (!nickname.trim()) { setError('Ingresa un nickname (3-16 caracteres)'); return; }
    if (nickname.length < 3 || nickname.length > 16) { setError('Nickname: 3-16 caracteres'); return; }
    setError('');
    await fetchConfig();
    setStep('race');
  };

  const handleRacePick = (r: string) => {
    setRace(r);
    setStep('class');
  };

  const handleClassPick = async (ck: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim(), race, class: ck }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      onEnter(data.player);
    } catch {
      setError('Connection error');
      setLoading(false);
    }
  };

  return (
    <div className="main-menu">
      <div className="mm-overlay" />
      <div className="mm-card">
        <h1 className="mm-title">World of Nova</h1>
        <p className="mm-subtitle">Nightfall</p>

        {error && <div className="mm-error">{error}</div>}

        {step === 'login' && (
          <div className="mm-form">
            <input
              className="mm-input"
              placeholder="Nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              maxLength={16}
              autoFocus
            />
            <div className="mm-buttons">
              <button className="mm-btn primary" onClick={handleLogin} disabled={loading}>
                {loading ? '...' : 'Entrar'}
              </button>
              <button className="mm-btn" onClick={startRegister} disabled={loading}>
                Registrar
              </button>
            </div>
          </div>
        )}

        {step === 'race' && races && (
          <div className="mm-race-grid">
            <h2 className="mm-section-title">Elige tu Raza</h2>
            {Object.entries(races).map(([key, data]: any) => (
              <button key={key} className="mm-race-card" onClick={() => handleRacePick(key)}>
                <span className="mm-race-emoji">{data.emoji}</span>
                <div>
                  <strong>{data.name}</strong>
                  <p>{data.description}</p>
                </div>
              </button>
            ))}
            <button className="mm-btn back" onClick={() => setStep('login')}>Volver</button>
          </div>
        )}

        {step === 'class' && classes && race && (
          <div className="mm-class-grid">
            <h2 className="mm-section-title">
              {races?.[race]?.emoji} {races?.[race]?.name} — Elige tu Clase
            </h2>
            {Object.entries(classes[race]).map(([key, data]: any) => (
              <button key={key} className="mm-class-card" onClick={() => handleClassPick(key)} disabled={loading}>
                <span className="mm-class-emoji">{data.emoji}</span>
                <div>
                  <strong>{data.name}</strong>
                  <p>{data.description}</p>
                  <div className="mm-class-bonus">
                    {Object.entries(data.bonus).map(([stat, val]: any) => (
                      <span key={stat} className="mm-stat-badge">{stat.toUpperCase()}+{val}</span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
            <button className="mm-btn back" onClick={() => setStep('race')} disabled={loading}>Volver</button>
          </div>
        )}
      </div>
    </div>
  );
}
