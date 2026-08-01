import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { ChevronRight } from 'lucide-react';
import { auth } from '../lib/firebase';
import CharacterSelector from './CharacterSelector';
import './AuthGate.css';

const TOKEN_KEY = 'cf_token';
const REMEMBER_KEY = 'cf_remember_email';
const IMAGE_BASE = '/imagenes/';

function lineageAssets(race: string) {
  const key = String(race || '').toLowerCase();
  if (key === 'uren') return { name: 'Uren', flag: `${IMAGE_BASE}uren-flag.png`, character: `${IMAGE_BASE}uren-character.png` };
  if (key === 'zolk') return { name: 'Zolk', flag: `${IMAGE_BASE}zolz-flag.png`, character: `${IMAGE_BASE}zolz-character.png` };
  return { name: 'Linaje', flag: `${IMAGE_BASE}uren-flag.png`, character: `${IMAGE_BASE}uren-character.png` };
}

function publicAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '');
  if (message.includes('auth/email-already-in-use')) return 'Ya existe una cuenta con ese correo.';
  if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password')) {
    return 'Email o contrasena incorrectos.';
  }
  if (message.includes('auth/user-not-found')) return 'No existe una cuenta con ese email.';
  if (message.includes('auth/weak-password')) return 'La contrasena debe tener al menos 6 caracteres.';
  if (message.includes('auth/invalid-email')) return 'El email no tiene un formato valido.';
  if (message.includes('auth/too-many-requests')) return 'Demasiados intentos. Espera un momento.';
  return 'No pudimos completar el acceso. Intentalo de nuevo en unos minutos.';
}

export default function AuthGate({ onReady }: { onReady: (player: any) => void }) {
  const [step, setStep] = useState<'loading' | 'login' | 'register' | 'characters' | 'create'>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [characters, setCharacters] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [remember, setRemember] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 500);
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBER_KEY);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRemember(true);
    }

    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl) {
      localStorage.setItem(TOKEN_KEY, tokenFromUrl);
      params.delete('token');
      const nextSearch = params.toString();
      const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
      window.history.replaceState({}, document.title, nextUrl);
      validateAndFetch(tokenFromUrl);
      return;
    }

    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      validateAndFetch(storedToken);
    } else {
      setStep('login');
    }
  }, []);

  const exchangeFirebaseToken = async (idToken: string) => {
    const res = await fetch('/api/auth/firebase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error('session_failed');
    return res.json();
  };

  const validateAndFetch = async (jwt: string) => {
    try {
      const charsRes = await fetch('/api/clickforge/characters', {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!charsRes.ok) { localStorage.removeItem(TOKEN_KEY); setStep('login'); return; }
      const charsData = await charsRes.json();
      const chars = charsData.characters || [];
      setCharacters(chars);
      setStep(chars.length === 0 ? 'create' : 'characters');
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setStep('login');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) { setError('Escribe tu email y contrasena.'); triggerShake(); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      if (remember) {
        localStorage.setItem(REMEMBER_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
      if (!userCred.user.emailVerified) {
        await sendEmailVerification(userCred.user).catch(() => undefined);
        await signOut(auth).catch(() => undefined);
        setNotice('Verifica tu correo antes de entrar. Te enviamos un nuevo enlace.');
        setBusy(false);
        return;
      }
      const idToken = await userCred.user.getIdToken();
      const data = await exchangeFirebaseToken(idToken);
      localStorage.setItem(TOKEN_KEY, data.token);
      await validateAndFetch(data.token);
    } catch (err: any) {
      setError(publicAuthError(err));
    }
    setBusy(false);
  };

  const handleRegister = async () => {
    if (!email || !password || !username) { setError('Completa todos los campos.'); triggerShake(); return; }
    if (password.length < 6) { setError('La contrasena debe tener al menos 6 caracteres.'); triggerShake(); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: username });
      await sendEmailVerification(userCred.user).catch(() => undefined);
      await signOut(auth).catch(() => undefined);
      setNotice('Cuenta creada. Revisa tu correo para verificarla antes de entrar.');
      setStep('login');
    } catch (err: any) {
      setError(publicAuthError(err));
    }
    setBusy(false);
  };

  const handleLogout = async () => {
    await signOut(auth).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    setStep('login');
    setCharacters([]);
  };

  const handleCreate = async (nickname: string, race: string, classKey: string) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setStep('login'); return; }

    const res = await fetch('/api/clickforge/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nickname, race, class: classKey, language: 'es', server: 'Novaria' }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create character');
    }
    const data = await res.json();
    onReady(data.character);
  };

  const handleSelect = async (character: any) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      await fetch(`/api/clickforge/characters/${character.id}/select`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    onReady(character);
  };

  if (step === 'loading') {
    return (
      <div className="lineage-screen lineage-auth">
        <div className="lineage-screen__shade" />
        <main className="lineage-auth__stage">
          <span className="lineage-auth__loading">Cargando...</span>
        </main>
      </div>
    );
  }

  if (step === 'login' || step === 'register') {
    const isLogin = step === 'login';
    return (
      <div className="won-login">
        <div className="portal-bg" aria-hidden="true" />

        <header className="top-bar">
          <span className="logo" aria-label="World of Nova">
            <img src={`${IMAGE_BASE}won-logo.png`} alt="World of Nova" className="logo-img" />
          </span>
        </header>

        <main className="login-stage">
          <form
            className={`login-form${shake ? ' shake' : ''}`}
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (!busy) {
                void (isLogin ? handleLogin : handleRegister)();
              }
            }}
          >
            <div className="field-group">
              <label htmlFor="won-email">Email</label>
              <input
                id="won-email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {!isLogin && (
              <div className="field-group">
                <label htmlFor="won-username">Username</label>
                <input
                  id="won-username"
                  placeholder="Choose a username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}

            <div className="field-group">
              <label htmlFor="won-password">Password</label>
              <input
                id="won-password"
                type="password"
                placeholder="••••••••"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="won-login__msg">{error}</div>}
            {notice && <div className="won-login__msg won-login__msg--notice">{notice}</div>}

            <button type="submit" className={`login-btn${busy ? ' loading' : ''}`} disabled={busy}>
              <span className="btn-text">{busy ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}</span>
            </button>

            {isLogin && (
              <label className="remember">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span className="checkmark" />
                <span>Remember Account Name</span>
              </label>
            )}
          </form>
        </main>

        <footer className="bottom-bar">
          <div className="bottom-left">
            <button
              type="button"
              className="create-account"
              onClick={() => { setStep(isLogin ? 'register' : 'login'); setError(''); setNotice(''); }}
            >
              <span className="btn-text">{isLogin ? 'Create Account' : 'Back to Login'}</span>
            </button>
            <div className="socials">
              <a href="#" className="social" aria-label="Discord" onClick={(e) => e.preventDefault()}>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              </a>
              <a href="#" className="social" aria-label="X" onClick={(e) => e.preventDefault()}>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="social" aria-label="YouTube" onClick={(e) => e.preventDefault()}>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="#" className="social" aria-label="Instagram" onClick={(e) => e.preventDefault()}>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
            </div>
          </div>

          <div className="bottom-center">
            <p className="copyright">© 2026 GameClick Entertainment. Todos los derechos reservados.</p>
            <span className="version">v0.0.1</span>
          </div>

          <div className="bottom-right">
            <a href="#" onClick={(e) => e.preventDefault()}>Documents</a>
            <span className="divider">|</span>
            <a href="#" onClick={(e) => e.preventDefault()}>Términos</a>
            <span className="divider">|</span>
            <a href="#" onClick={(e) => e.preventDefault()}>Privacidad</a>
            <span className="divider">|</span>
            <a href="https://clickforge-gamma.vercel.app">Back to website</a>
          </div>
        </footer>
      </div>
    );
  }

  if (step === 'create') {
    return <CharacterSelector onSubmit={handleCreate} onLogout={handleLogout} />;
  }

  return (
    <div className="won-select lineage-select">
      <div className="lineage-screen__shade" />
      <header className="lineage-topbar">
        <div>
          <span>World of Nova: Nightfall</span>
          <strong>Selecciona un linaje</strong>
        </div>
        <button type="button" className="won-ghost-button" onClick={handleLogout}>
          Salir
        </button>
      </header>

      <main className="won-select__grid">
        {characters.map((character: any) => {
          const assets = lineageAssets(character.race);
          return (
            <button
              key={character.id}
              type="button"
              className="won-character-card"
              onClick={() => handleSelect(character)}
            >
              <img className="won-character-card__flag" src={assets.flag} alt="" />
              <div className="won-character-card__portrait">
                <img src={assets.character} alt="" />
              </div>
              <div className="won-character-card__body">
                <strong>{character.nickname}</strong>
                <span>{assets.name} / {character.class}</span>
                <div className="won-character-card__meta">
                  <em>Lv. {character.level || 1}</em>
                  <em>Novaria</em>
                </div>
              </div>
              <ChevronRight size={18} />
            </button>
          );
        })}

        <button type="button" className="won-character-card won-character-card--new" onClick={() => setStep('create')}>
          <div className="won-character-card__portrait">
            <span>+</span>
          </div>
          <div className="won-character-card__body">
            <strong>Crear nuevo linaje</strong>
            <span>Crear un nuevo linaje</span>
            <div className="won-character-card__meta">
              <em>Novaria</em>
              <em>Available</em>
            </div>
          </div>
          <ChevronRight size={18} />
        </button>
      </main>
    </div>
  );
}
