import { useState } from 'react';
import {
  BIOMES, RESOURCES, BIOME_RESOURCE_LINKS, RESOURCE_WINDOWS_GLOBAL,
  CREATURE_CATEGORIES, BIOME_SPECIES, DAY_PERIOD_LABELS, BIOME_DAY_EFFECTS,
  TOOLS, EQUIPMENT_TEMPLATES, ZONE_BANDS, RACES, CLASSES, RACIAL_TALENTS,
  COMBAT_FORMULAS, PROGRESS_TRACKER,
} from '../data/game-data';
import './Dashboard.css';

type Section = 'biomes' | 'resources' | 'creatures' | 'equipment' | 'races' | 'formulas' | 'progress';

const SECTIONS: { key: Section; label: string; emoji: string }[] = [
  { key: 'biomes', label: 'Biomas', emoji: '🌍' },
  { key: 'resources', label: 'Recursos', emoji: '📦' },
  { key: 'creatures', label: 'Criaturas', emoji: '👹' },
  { key: 'equipment', label: 'Equipo', emoji: '🛡️' },
  { key: 'races', label: 'Razas/Clases', emoji: '🧬' },
  { key: 'formulas', label: 'Fórmulas', emoji: '📊' },
  { key: 'progress', label: 'Progreso', emoji: '📈' },
];

export default function Dashboard({ onEnterGame }: { onEnterGame?: () => void }) {
  const [section, setSection] = useState<Section>('biomes');
  const [selectedBiome, setSelectedBiome] = useState<string>('forest');

  const renderBiomes = () => {
    const biome = BIOMES.find((b) => b.name === selectedBiome)!;
    const links = BIOME_RESOURCE_LINKS[biome.name] || [];
    const species = BIOME_SPECIES[biome.name] || [];
    const dayEffects = BIOME_DAY_EFFECTS[biome.name];

    return (
      <div className="dash-biomes">
        <div className="dash-biome-list">
          {BIOMES.map((b) => (
            <button
              key={b.name}
              className={`dash-biome-btn ${b.name === selectedBiome ? 'active' : ''}`}
              onClick={() => setSelectedBiome(b.name)}
              style={{ borderColor: b.color }}
            >
              <span className="dash-biome-btn-emoji">{b.emoji}</span>
              <span className="dash-biome-btn-name">{b.displayName}</span>
            </button>
          ))}
        </div>

        <div className="dash-biome-detail">
          <div className="dash-biome-header" style={{ borderColor: biome.color }}>
            <span className="dash-biome-emoji">{biome.emoji}</span>
            <div>
              <h2>{biome.displayName}</h2>
              <p>{biome.description}</p>
            </div>
          </div>

          <div className="dash-grid-2">
            <div className="dash-card">
              <h3>🚶 Movimiento</h3>
              <p>Factor de movimiento: <strong>{biome.movementFactor}×</strong></p>
              <p>Color UI: <code style={{ color: biome.color }}>{biome.color}</code></p>
            </div>

            <div className="dash-card">
              <h3>🌗 Ciclo día/noche</h3>
              <div className="dash-day-grid">
                {Object.entries(dayEffects || {}).map(([period, eff]) => {
                  const label = DAY_PERIOD_LABELS[period as keyof typeof DAY_PERIOD_LABELS];
                  return (
                    <div key={period} className="dash-day-cell">
                      <strong>{label.emoji} {label.es}</strong>
                      {eff.spawn && <span>Spawn: {eff.spawn}</span>}
                      {eff.yield && <span>Yield: {eff.yield}</span>}
                      {eff.sta && <span>STA: {eff.sta}</span>}
                      {eff.note && <span className="dash-day-note">{eff.note}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="dash-card">
            <h3>🎒 Recursos encontrados</h3>
            {links.length === 0 ? (
              <p className="dash-empty">No hay recursos base definidos para este bioma.</p>
            ) : (
              <div className="dash-resource-grid">
                {links.map((link) => {
                  const res = RESOURCES.find((r) => r.name === link.resourceName);
                  const window = RESOURCE_WINDOWS_GLOBAL[link.resourceName.toLowerCase()] || 'all';
                  return (
                    <div key={link.resourceName} className="dash-resource-item">
                      <span className="dash-resource-emoji">{res?.emoji || '📦'}</span>
                      <div>
                        <strong>{link.resourceName}</strong>
                        <span>{link.spawnChance}% chance · {link.minQuantity}-{link.maxQuantity} uds</span>
                        <span className="dash-resource-meta">Ventana: {window} · {res?.effect || ''}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="dash-card">
            <h3>👹 Criaturas</h3>
            <div className="dash-creature-list">
              {species.map((s) => (
                <span key={s} className="dash-creature-tag">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResources = () => (
    <div className="dash-card">
      <h3>📦 Recursos ({RESOURCES.length})</h3>
      <div className="dash-resource-grid big">
        {RESOURCES.map((r) => (
          <div key={r.name} className={`dash-resource-item rarity-${r.rarity}`}>
            <span className="dash-resource-emoji">{r.emoji}</span>
            <div>
              <strong>{r.name}</strong>
              <span>{r.type} · {r.rarity} · {r.weightKg}kg · ${r.baseValue}</span>
              <span className="dash-resource-meta">{r.effect}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCreatures = () => (
    <div className="dash-creatures">
      <div className="dash-card">
        <h3>👹 Categorías de criaturas</h3>
        <div className="dash-creature-cats">
          {Object.entries(CREATURE_CATEGORIES).map(([key, cat]) => (
            <div key={key} className="dash-cat-card">
              <span className="dash-cat-emoji">{cat.emoji}</span>
              <strong>{cat.label}</strong>
              <span>HP {cat.hpMultiplier}× · ATK {cat.attackMultiplier}× · DEF {cat.defenseMultiplier}×</span>
              <span>XP {cat.xpMultiplier}×</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-card">
        <h3>🗺️ Criaturas por bioma</h3>
        <div className="dash-biome-creatures">
          {Object.entries(BIOME_SPECIES).map(([biome, species]) => {
            const b = BIOMES.find((x) => x.name === biome);
            return (
              <div key={biome} className="dash-biome-creature-group">
                <strong>{b?.emoji} {b?.displayName}</strong>
                <div>{species.map((s) => <span key={s} className="dash-creature-tag">{s}</span>)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="dash-card">
        <h3>🎯 Zonas de dificultad</h3>
        <table className="dash-table">
          <thead>
            <tr><th>Zona</th><th>Distancia</th><th>Nivel</th><th>Básico</th><th>Veterano</th><th>Élite</th><th>Jefe</th></tr>
          </thead>
          <tbody>
            {ZONE_BANDS.map((z) => (
              <tr key={z.id}>
                <td>{z.id}</td><td>{z.distance}</td><td>{z.level}</td>
                <td>{z.basic}%</td><td>{z.veteran}%</td><td>{z.elite}%</td><td>{z.boss}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEquipment = () => (
    <div className="dash-equipment">
      <div className="dash-card">
        <h3>🛡️ Equipamiento base ({EQUIPMENT_TEMPLATES.length})</h3>
        <div className="dash-equip-grid">
          {EQUIPMENT_TEMPLATES.map((eq) => (
            <div key={eq.key} className="dash-equip-item">
              <span className="dash-equip-emoji">{eq.emoji}</span>
              <div>
                <strong>{eq.name}</strong>
                <span>{eq.slot} · Nvl {eq.level}{eq.class ? ` · ${eq.class}` : ''}</span>
                <span className="dash-equip-implicit">{eq.implicit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-card">
        <h3>🔧 Herramientas</h3>
        <div className="dash-equip-grid">
          {TOOLS.map((t) => (
            <div key={t.id} className="dash-equip-item">
              <span className="dash-equip-emoji">{t.emoji}</span>
              <div>
                <strong>{t.name}</strong>
                <span>{t.type} · Durabilidad {t.durability} · {t.weightKg}kg</span>
                <span className="dash-equip-implicit">Usar en: {t.targets.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRaces = () => (
    <div className="dash-races">
      {RACES.map((race) => (
        <div key={race.key} className="dash-card">
          <h3>{race.emoji} {race.name}</h3>
          <p>{race.description}</p>
          <div className="dash-classes">
            {CLASSES.filter((c) => c.race === race.key).map((c) => (
              <div key={c.key} className="dash-class-card">
                <span className="dash-class-emoji">{c.emoji}</span>
                <div>
                  <strong>{c.name}</strong>
                  <span>{c.description}</span>
                </div>
              </div>
            ))}
          </div>

          <h4>Talentos raciales</h4>
          <div className="dash-talent-grid">
            {RACIAL_TALENTS.filter((t) => t.race === race.key).map((t) => (
              <div key={t.name} className={`dash-talent-item type-${t.type}`}>
                <strong>{t.name}</strong>
                <span>{t.type} · {t.category} · Ranks {t.maxRank}</span>
                <span className="dash-talent-effect">{t.effect}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderFormulas = () => (
    <div className="dash-card">
      <h3>📊 Fórmulas de combate</h3>
      <div className="dash-formula-list">
        {COMBAT_FORMULAS.map((f) => (
          <div key={f.name} className="dash-formula-item">
            <strong>{f.name}</strong>
            <code>{f.formula}</code>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="dash-card">
      <h3>📈 Progreso del proyecto</h3>
      <div className="dash-progress-list">
        {PROGRESS_TRACKER.systems.map((s) => (
          <div key={s.name} className={`dash-progress-item status-${s.status}`}>
            <span className="dash-progress-dot" />
            <strong>{s.name}</strong>
            <span className="dash-progress-status">{s.status === 'done' ? 'Listo' : s.status === 'partial' ? 'Parcial' : 'Pendiente'}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <h1>World of Nova</h1>
          <p>Panel de progreso</p>
        </div>
        <nav className="dash-nav">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              className={section === s.key ? 'active' : ''}
              onClick={() => setSection(s.key)}
            >
              <span>{s.emoji}</span> {s.label}
            </button>
          ))}
        </nav>
        {onEnterGame && (
          <button className="dash-game-btn" onClick={onEnterGame}>
            🎮 Jugar (local)
          </button>
        )}
      </aside>

      <main className="dash-content">
        <header className="dash-topbar">
          <h2>{SECTIONS.find((s) => s.key === section)?.label}</h2>
        </header>
        <div className="dash-body">
          {section === 'biomes' && renderBiomes()}
          {section === 'resources' && renderResources()}
          {section === 'creatures' && renderCreatures()}
          {section === 'equipment' && renderEquipment()}
          {section === 'races' && renderRaces()}
          {section === 'formulas' && renderFormulas()}
          {section === 'progress' && renderProgress()}
        </div>
      </main>
    </div>
  );
}
