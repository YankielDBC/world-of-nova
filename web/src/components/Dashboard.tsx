import { useState } from 'react';
import {
  BIOMES, RESOURCES, BIOME_RESOURCE_LINKS, RESOURCE_WINDOWS_GLOBAL,
  CREATURE_CATEGORIES, BIOME_SPECIES, DAY_PERIOD_LABELS, BIOME_DAY_EFFECTS,
  TOOLS, EQUIPMENT_TEMPLATES, ZONE_BANDS, RACES, CLASSES, RACIAL_TALENTS,
  COMBAT_FORMULAS, PROGRESS_TRACKER, PROFILE_FIELDS, BAG_DEFINITIONS,
  ACTION_LIST, COMBAT_DETAILS, PLACE_SERVICES, ECONOMY_SUMMARY,
  DEATH_CAVE_SUMMARY, DAY_NIGHT_PERIODS, CLIMATE_TYPES,
  WOW_CREATURE_TYPES, WOW_BEASTS, WOW_RACES, WOW_CREATURE_DROPS,
  WOW_PROFESSIONS, WOW_ACHIEVEMENT_CATEGORIES, WOW_DUNGEON_DESIGN,
  WOW_ITEM_DISTRIBUTION,
} from '../data/game-data';
import './Dashboard.css';

type Section = 'biomes' | 'resources' | 'creatures' | 'equipment' | 'races' | 'formulas' | 'progress'
  | 'profile' | 'bags' | 'actions' | 'combat' | 'places' | 'economy' | 'death' | 'daynight' | 'wow';

const SECTIONS: { key: Section; label: string; emoji: string }[] = [
  { key: 'biomes', label: 'Biomas', emoji: '🌍' },
  { key: 'resources', label: 'Recursos', emoji: '📦' },
  { key: 'creatures', label: 'Criaturas', emoji: '👹' },
  { key: 'equipment', label: 'Equipo', emoji: '🛡️' },
  { key: 'races', label: 'Razas/Clases', emoji: '🧬' },
  { key: 'formulas', label: 'Fórmulas', emoji: '📊' },
  { key: 'profile', label: 'Perfil', emoji: '👤' },
  { key: 'bags', label: 'Mochilas', emoji: '🎒' },
  { key: 'actions', label: 'Acciones', emoji: '⚡' },
  { key: 'combat', label: 'Combate', emoji: '⚔️' },
  { key: 'places', label: 'Lugares', emoji: '🏰' },
  { key: 'economy', label: 'Economía', emoji: '💰' },
  { key: 'death', label: 'Muerte/Cuevas', emoji: '💀' },
  { key: 'daynight', label: 'Día/Clima', emoji: '🌗' },
  { key: 'progress', label: 'Progreso', emoji: '📈' },
  { key: 'wow', label: 'Inspiración WoW', emoji: '🐉' },
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

  const renderProfile = () => (
    <div className="dash-card">
      <h3>👤 Campos del perfil</h3>
      <p className="dash-intro">Cada campo del perfil se calcula o se obtiene de estas fuentes:</p>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr><th>Campo</th><th>Fuente / Cálculo</th></tr>
          </thead>
          <tbody>
            {PROFILE_FIELDS.map((p) => (
              <tr key={p.field}><td>{p.field}</td><td>{p.source}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBags = () => (
    <div className="dash-card">
      <h3>🎒 Tipos de mochila</h3>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr><th>Tipo</th><th>Slots</th><th>Peso máx.</th><th>Peso propio</th><th>Stack</th><th>Comando</th></tr>
          </thead>
          <tbody>
            {BAG_DEFINITIONS.map((b) => (
              <tr key={b.slug}>
                <td>{b.emoji} {b.name}{b.isPocket ? ' (bolsillo)' : ''}</td>
                <td>{b.slots}</td>
                <td>{b.weightKg} kg</td>
                <td>{b.ownWeightKg} kg</td>
                <td>{b.maxStack}</td>
                <td>{b.command}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="dash-card" style={{ marginTop: 16 }}>
        <h4>Reglas de uso</h4>
        <ul className="dash-list">
          <li>Solo una bolsa puede estar ACTIVE; las demás se almacenan o quedan DORMANT.</li>
          <li>Las herramientas equipadas no cuentan para el peso ni los slots.</li>
          <li>Al cambiar de bolsa, la destino debe estar vacía y debe caber todo el contenido.</li>
          <li>Los bolsillos siempre existen y actúan como fallback si no hay otra bolsa.</li>
        </ul>
      </div>
    </div>
  );

  const renderActions = () => (
    <div className="dash-card">
      <h3>⚡ Acciones del juego</h3>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr><th>Acción</th><th>Costo</th><th>Efecto</th></tr>
          </thead>
          <tbody>
            {ACTION_LIST.map((a) => (
              <tr key={a.action}><td>{a.action}</td><td>{a.cost}</td><td>{a.effect}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCombat = () => (
    <div className="dash-combat">
      <div className="dash-card">
        <h3>⚔️ Categorías de criaturas</h3>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr><th>Categoría</th><th>HP</th><th>ATK</th><th>DEF</th><th>XP</th></tr>
            </thead>
            <tbody>
              {COMBAT_DETAILS.categories.map((c) => (
                <tr key={c.key}><td>{c.label}</td><td>{c.hp}</td><td>{c.atk}</td><td>{c.def}</td><td>{c.xp}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="dash-card">
        <h3>🎯 Fórmula de daño paso a paso</h3>
        <ol className="dash-list numbered">
          {COMBAT_DETAILS.damageSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
      <div className="dash-card">
        <h3>🔥 Presión de combate</h3>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>Turno</th><th>Bonus daño</th></tr></thead>
            <tbody>
              {COMBAT_DETAILS.pressure.map((p) => (
                <tr key={p.turn}><td>{p.turn}</td><td>{p.bonus}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPlaces = () => (
    <div className="dash-card">
      <h3>🏰 Servicios de Nova Castle</h3>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr><th>Edificio</th><th>Servicio</th><th>Costo</th><th>Efecto</th></tr>
          </thead>
          <tbody>
            {PLACE_SERVICES.map((p, i) => (
              <tr key={i}><td>{p.building}</td><td>{p.service}</td><td>{p.cost}</td><td>{p.effect}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="dash-card" style={{ marginTop: 16 }}>
        <h4>Reglas de recuperación</h4>
        <ul className="dash-list">
          <li>El plan gratuito recupera aproximadamente 1.04 puntos cada 15 minutos.</li>
          <li>Al interrumpir una recuperación se conserva el progreso.</li>
          <li>Durante recuperación no se pueden realizar otras acciones.</li>
        </ul>
      </div>
    </div>
  );

  const renderEconomy = () => (
    <div className="dash-card">
      <h3>💰 Conceptos económicos</h3>
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr><th>Concepto</th><th>Valor / Regla</th></tr>
          </thead>
          <tbody>
            {ECONOMY_SUMMARY.map((e, i) => (
              <tr key={i}><td>{e.concept}</td><td>{e.value}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDeath = () => (
    <div className="dash-card">
      <h3>💀 Muerte y cuevas</h3>
      <div className="dash-death-grid">
        {DEATH_CAVE_SUMMARY.map((d, i) => (
          <div key={i} className="dash-death-item">
            <strong>{d.topic}</strong>
            <span>{d.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDayNight = () => (
    <div className="dash-daynight">
      <div className="dash-card">
        <h3>🌗 Ciclo día/noche</h3>
        <div className="dash-daynight-grid">
          {DAY_NIGHT_PERIODS.map((p) => (
            <div key={p.period} className="dash-daynight-cell">
              <span className="dash-daynight-emoji">{p.emoji}</span>
              <strong>{p.label}</strong>
              <span>{p.durationMin} min</span>
            </div>
          ))}
        </div>
        <p className="dash-note">Ciclo total: 480 minutos (8 horas). La duración es configurable por variables de entorno.</p>
      </div>
      <div className="dash-card">
        <h3>🌦️ Tipos de clima</h3>
        <div className="dash-climate-grid">
          {CLIMATE_TYPES.map((c) => (
            <div key={c.type} className="dash-climate-cell">
              <span>{c.emoji}</span>
              <strong>{c.label}</strong>
            </div>
          ))}
        </div>
        <p className="dash-note">El clima modifica spawn, yield y coste de energía de las acciones de recolección.</p>
      </div>
    </div>
  );

  const renderWow = () => (
    <div className="dash-wow">
      <div className="dash-card">
        <h3>🐺 Tipos de criatura en WoW</h3>
        <div className="dash-wow-types">
          {WOW_CREATURE_TYPES.map((t) => (
            <div key={t.key} className="dash-wow-type">
              <span className="dash-wow-emoji">{t.emoji}</span>
              <strong>{t.label}</strong>
              <span>{t.summary}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-card">
        <h3>🎒 Drops por tipo de criatura</h3>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr><th>Tipo</th><th>Drops típicos</th><th>Profesiones</th></tr>
            </thead>
            <tbody>
              {WOW_CREATURE_DROPS.map((d) => (
                <tr key={d.type}><td>{d.type}</td><td>{d.drops}</td><td>{d.professions}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dash-card">
        <h3>🐻 Bestias como inspiración</h3>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr><th>Bestia</th><th>Hábitat típico</th><th>Idea para WoN</th></tr>
            </thead>
            <tbody>
              {WOW_BEASTS.map((b) => (
                <tr key={b.name}><td>{b.name}</td><td>{b.climate}</td><td>{b.idea}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dash-card">
        <h3>🧬 Razas jugables de WoW</h3>
        {(['alliance', 'horde', 'neutral'] as const).map((faction) => (
          <div key={faction} className="dash-wow-faction">
            <h4>{faction === 'alliance' ? '⚔️ Alianza' : faction === 'horde' ? '🐗 Horda' : '🐼 Neutral'}</h4>
            <div className="dash-wow-races">
              {WOW_RACES[faction].map((r) => (
                <div key={r.name} className="dash-wow-race">
                  <strong>{r.name}</strong>
                  <span>{r.concept}</span>
                  <span className="dash-wow-race-idea">{r.idea}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="dash-card">
        <h3>⚒️ Profesiones de WoW</h3>
        <h4>Recolección</h4>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>Profesión</th><th>Recolecta</th><th>Alimenta</th></tr></thead>
            <tbody>
              {WOW_PROFESSIONS.gathering.map((p) => (
                <tr key={p.name}><td>{p.name}</td><td>{p.collects}</td><td>{p.feeds}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <h4>Producción</h4>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>Profesión</th><th>Crea</th><th>Especializaciones</th></tr></thead>
            <tbody>
              {WOW_PROFESSIONS.production.map((p) => (
                <tr key={p.name}><td>{p.name}</td><td>{p.creates}</td><td>{p.specs}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <h4>Secundarias</h4>
        <div className="dash-wow-types small">
          {WOW_PROFESSIONS.secondary.map((p) => (
            <div key={p.name} className="dash-wow-type">
              <strong>{p.name}</strong>
              <span>{p.effect}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-card">
        <h3>🏆 Categorías de logros</h3>
        <div className="dash-wow-types">
          {WOW_ACHIEVEMENT_CATEGORIES.map((a) => (
            <div key={a.name} className="dash-wow-type">
              <strong>{a.name}</strong>
              <span>{a.examples}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-card">
        <h3>🏰 Diseño de mazmorras</h3>
        <h4>Elementos de una instancia</h4>
        <div className="dash-wow-types">
          {WOW_DUNGEON_DESIGN.elements.map((e) => (
            <div key={e.element} className="dash-wow-type">
              <strong>{e.element}</strong>
              <span>{e.detail}</span>
            </div>
          ))}
        </div>
        <h4>Reglas generales</h4>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>Aspecto</th><th>Patrón típico</th></tr></thead>
            <tbody>
              {WOW_DUNGEON_DESIGN.rules.map((r) => (
                <tr key={r.aspect}><td>{r.aspect}</td><td>{r.pattern}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dash-card">
        <h3>📦 Distribución de ítems en WoW (muestra ~1000)</h3>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>Categoría</th><th>Ítems</th><th>%</th></tr></thead>
            <tbody>
              {WOW_ITEM_DISTRIBUTION.map((i) => (
                <tr key={i.category}><td>{i.category}</td><td>{i.count}</td><td>{i.pct}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="dash-note">La lista completa de ~1000 ítems muestra está en docs/WOW_ITEMS.md.</p>
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
          {section === 'profile' && renderProfile()}
          {section === 'bags' && renderBags()}
          {section === 'actions' && renderActions()}
          {section === 'combat' && renderCombat()}
          {section === 'places' && renderPlaces()}
          {section === 'economy' && renderEconomy()}
          {section === 'death' && renderDeath()}
          {section === 'daynight' && renderDayNight()}
          {section === 'progress' && renderProgress()}
          {section === 'wow' && renderWow()}
        </div>
      </main>
    </div>
  );
}
