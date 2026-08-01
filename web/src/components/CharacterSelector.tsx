import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ChevronRight, Sparkles } from 'lucide-react';

type PlayableRace = 'uren' | 'zolk';
type Lineage = {
  id: PlayableRace | 'dragen';
  name: string;
  status: 'available' | 'locked';
  epithet: string;
  summary: string;
  flag: string;
  character: string;
  accent: string;
  stats: Record<string, number>;
};

type ClassOption = {
  id: string;
  race: PlayableRace;
  name: string;
  role: string;
  summary: string;
};

const ASSET = '/imagenes/';

const LINEAGES: Lineage[] = [
  {
    id: 'dragen',
    name: 'Dragen',
    status: 'locked',
    epithet: 'Forja de guerra',
    summary: 'Linaje pesado reservado para una fase posterior de Nightfall.',
    flag: `${ASSET}dragen-flag.png`,
    character: `${ASSET}dragen-character.png`,
    accent: 'ember',
    stats: { STR: 10, VIT: 9, AGI: 3, INT: 3 },
  },
  {
    id: 'uren',
    name: 'Uren',
    status: 'available',
    epithet: 'Bosque oscuro',
    summary: 'Herejes de raiz antigua. Resisten, canalizan magia viva y controlan el terreno.',
    flag: `${ASSET}uren-flag.png`,
    character: `${ASSET}uren-character.png`,
    accent: 'frost',
    stats: { STR: 7, VIT: 9, AGI: 4, INT: 5 },
  },
  {
    id: 'zolk',
    name: 'Zolk',
    status: 'available',
    epithet: 'Exilio alquimico',
    summary: 'Supervivientes toxicos. Rapidos, evasivos y precisos con venenos y sabotaje.',
    flag: `${ASSET}zolz-flag.png`,
    character: `${ASSET}zolz-character.png`,
    accent: 'void',
    stats: { STR: 4, VIT: 3, AGI: 9, INT: 6 },
  },
];

const CLASSES: ClassOption[] = [
  {
    id: 'dark_druid',
    race: 'uren',
    name: 'Dark Druid',
    role: 'Aguante / Control',
    summary: 'Un guardia maldito que gana tiempo y domina el bosque corrupto.',
  },
  {
    id: 'arcane',
    race: 'uren',
    name: 'Arcane',
    role: 'Poder / Ruptura',
    summary: 'Canal fragil de energia arcana con dano alto y distancia segura.',
  },
  {
    id: 'alchemist_rogue',
    race: 'zolk',
    name: 'Alchemist Rogue',
    role: 'Velocidad / Toxinas',
    summary: 'Golpea rapido, aplica corrosivos y sale antes de que respondan.',
  },
  {
    id: 'curse_hunter',
    race: 'zolk',
    name: 'Curse Hunter',
    role: 'Precision / Balance',
    summary: 'Cazador estable para maldiciones, presion sostenida y supervivencia.',
  },
];

function isPlayable(lineage: Lineage): lineage is Lineage & { id: PlayableRace } {
  return lineage.status === 'available';
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="lineage-stat">
      <span>{label}</span>
      <div className="lineage-stat__track">
        <div style={{ width: `${Math.min(100, value * 10)}%` }} />
      </div>
      <strong>{value}</strong>
    </div>
  );
}

export default function CharacterSelector({
  onSubmit,
  onLogout,
}: {
  onSubmit: (nickname: string, race: string, classKey: string) => Promise<void>;
  onLogout?: () => void;
}) {
  const [nickname, setNickname] = useState('');
  const [selectedLineage, setSelectedLineage] = useState<Lineage>(LINEAGES[1]);
  const [selectedClass, setSelectedClass] = useState('dark_druid');
  const [notification, setNotification] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const classOptions = useMemo(
    () => CLASSES.filter((option) => option.race === selectedLineage.id),
    [selectedLineage.id],
  );
  const classData = classOptions.find((option) => option.id === selectedClass) || classOptions[0];

  useEffect(() => {
    if (!classOptions.some((option) => option.id === selectedClass)) {
      setSelectedClass(classOptions[0]?.id || '');
    }
  }, [classOptions, selectedClass]);

  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => setNotification(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notification]);

  const selectLineage = (lineage: Lineage) => {
    if (!isPlayable(lineage)) {
      setNotification('Ese linaje aun no esta disponible en Nightfall.');
      return;
    }
    setSelectedLineage(lineage);
  };

  const handleSubmit = async () => {
    const cleanName = nickname.trim();
    if (!isPlayable(selectedLineage)) {
      setNotification('Selecciona un linaje disponible.');
      return;
    }
    if (!cleanName) {
      setNotification('Escribe el nombre de tu linaje.');
      return;
    }
    if (cleanName.length < 3) {
      setNotification('El nombre debe tener al menos 3 caracteres.');
      return;
    }
    if (!classData) {
      setNotification('Selecciona una senda de combate.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(cleanName, selectedLineage.id, classData.id);
    } catch {
      setNotification('No pudimos crear el linaje. Intentalo de nuevo.');
      setSubmitting(false);
    }
  };

  return (
    <div className={`lineage-screen lineage-screen--${selectedLineage.accent}`}>
      <div className="lineage-screen__shade" />

      {notification && (
        <div className="won-toast">
          <AlertCircle size={18} />
          <span>{notification}</span>
        </div>
      )}

      <header className="lineage-topbar">
        <img src={`${ASSET}won-logo.png`} alt="World of Nova Nightfall" />
        <div>
          <span>Nightfall</span>
          <strong>Seleccion de linaje</strong>
        </div>
        {onLogout && (
          <button type="button" className="won-ghost-button" onClick={onLogout}>
            Salir
          </button>
        )}
      </header>

      <main className="lineage-stage">
        <aside className="lineage-rail" aria-label="Linajes">
          {LINEAGES.map((lineage) => (
            <button
              key={lineage.id}
              type="button"
              className={`lineage-flag ${lineage.id === selectedLineage.id ? 'is-active' : ''} ${lineage.status === 'locked' ? 'is-locked' : ''}`}
              onClick={() => selectLineage(lineage)}
            >
              <img src={lineage.flag} alt="" />
              <span>
                <strong>{lineage.name}</strong>
                <small>{lineage.status === 'locked' ? 'Bloqueado' : lineage.epithet}</small>
              </span>
            </button>
          ))}
        </aside>

        <section className="lineage-hero" aria-label={`Linaje ${selectedLineage.name}`}>
          <div className="lineage-hero__glow" />
          <img className={`lineage-hero__character lineage-hero__character--${selectedLineage.id}`} src={selectedLineage.character} alt={selectedLineage.name} />
          <img className="lineage-hero__altar" src={`${ASSET}altar-arcano.png`} alt="" />
        </section>

        <aside className="lineage-panel">
          <div className="lineage-panel__head">
            <span>{selectedLineage.epithet}</span>
            <h1>{selectedLineage.name}</h1>
            <p>{selectedLineage.summary}</p>
          </div>

          <div className="lineage-stats">
            {Object.entries(selectedLineage.stats).map(([stat, value]) => (
              <StatBar key={stat} label={stat} value={value} />
            ))}
          </div>

          <div className="lineage-paths">
            <span className="lineage-label">Senda</span>
            {classOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`lineage-path ${selectedClass === option.id ? 'is-active' : ''}`}
                onClick={() => setSelectedClass(option.id)}
              >
                <span>
                  <strong>{option.name}</strong>
                  <small>{option.role}</small>
                </span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>

          <div className="lineage-name">
            <label htmlFor="lineage-name">Nombre del linaje</label>
            <input
              id="lineage-name"
              maxLength={16}
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="Ej. Kahel"
            />
            <p>{classData?.summary || 'Selecciona un linaje disponible.'}</p>
          </div>

          <button type="button" className="lineage-enter" onClick={handleSubmit} disabled={submitting || !classData}>
            {submitting ? (
              <>
                <Sparkles size={18} className="won-spin" />
                Creando
              </>
            ) : (
              <>
                Crear linaje
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </aside>
      </main>
    </div>
  );
}
