// Static game data extracted from seeds and catalogs for the Vercel dashboard.
// Source of truth remains in prisma/seed-*.ts and src/data/*.ts; sync manually when those change.

export const BIOMES = [
  { name: 'plains', emoji: '🌾', displayName: 'Llanuras', description: 'Extensas llanuras verdes con rica vegetación.', movementFactor: 1.0, color: '#90EE90' },
  { name: 'forest', emoji: '🌲', displayName: 'Bosque', description: 'Bosque denso con árboles altos y sotobosque.', movementFactor: 1.2, color: '#228B22' },
  { name: 'swamp', emoji: '🪷', displayName: 'Pantano', description: 'Terreno fangoso con aguas estancadas.', movementFactor: 1.5, color: '#556B2F' },
  { name: 'volcano', emoji: '🌋', displayName: 'Volcán', description: 'Tierras volcánicas con lava y ceniza.', movementFactor: 1.3, color: '#8B0000' },
  { name: 'ashlands', emoji: '🌫️', displayName: 'Cenizales', description: 'Llanuras cubiertas de ceniza volcánica.', movementFactor: 1.1, color: '#696969' },
  { name: 'highlands', emoji: '🏔️', displayName: 'Tierras Altas', description: 'Montañas escarpadas con aire fino.', movementFactor: 1.4, color: '#A0522D' },
  { name: 'desert', emoji: '🏜️', displayName: 'Desierto', description: 'Arenales infinitos bajo el sol abrasador.', movementFactor: 1.3, color: '#F4A460' },
  { name: 'tundra', emoji: '❄️', displayName: 'Tundra', description: 'Heladas llanuras cubiertas de nieve.', movementFactor: 1.2, color: '#E0FFFF' },
  { name: 'river', emoji: '🌊', displayName: 'Río', description: 'Corrientes de agua que cruzan el territorio.', movementFactor: 0.5, color: '#4169E1' },
  { name: 'lake', emoji: '🏞️', displayName: 'Lago', description: 'Tranquilas aguas lacustres.', movementFactor: 0.3, color: '#1E90FF' },
];

export const RESOURCES = [
  { name: 'Wood', emoji: '🪵', type: 'material', rarity: 'common', weightKg: 0.5, baseValue: 1, effect: 'Material básico para crafteo.' },
  { name: 'Pine Cone', emoji: '🌰', type: 'material', rarity: 'rare', weightKg: 0.1, baseValue: 3, effect: 'Semilla de pino.' },
  { name: 'Apple', emoji: '🍎', type: 'consumable', rarity: 'common', weightKg: 0.2, baseValue: 2, effect: 'Recupera 5 STA.' },
  { name: 'Orange', emoji: '🍊', type: 'consumable', rarity: 'uncommon', weightKg: 0.2, baseValue: 4, effect: 'Recupera 8 STA.' },
  { name: 'Mango', emoji: '🥭', type: 'consumable', rarity: 'rare', weightKg: 0.3, baseValue: 8, effect: 'Recupera 15 STA.' },
  { name: 'Coconut', emoji: '🥥', type: 'consumable', rarity: 'common', weightKg: 0.6, baseValue: 5, effect: 'Recupera 12 STA.' },
  { name: 'Water', emoji: '💧', type: 'consumable', rarity: 'common', weightKg: 0.3, baseValue: 2, effect: 'Recupera 6 STA.' },
  { name: 'Bamboo', emoji: '🎋', type: 'material', rarity: 'uncommon', weightKg: 0.4, baseValue: 3, effect: 'Material flexible.' },
  { name: 'Ancient Wood', emoji: '🪵', type: 'material', rarity: 'rare', weightKg: 0.8, baseValue: 10, effect: 'Madera rara de alto valor.' },
  { name: 'Champiñón', emoji: '🍄', type: 'consumable', rarity: 'common', weightKg: 0.1, baseValue: 1, effect: 'Recupera 3 HP.' },
  { name: 'Baba Verde', emoji: '🟢', type: 'material', rarity: 'common', weightKg: 0.3, baseValue: 2, effect: 'Material viscoso para alquimia.' },
  { name: 'Hierbas', emoji: '🌿', type: 'material', rarity: 'common', weightKg: 0.1, baseValue: 1, effect: 'Planta común de recolección.' },
  { name: 'Insectos', emoji: '🐛', type: 'material', rarity: 'uncommon', weightKg: 0.05, baseValue: 2, effect: 'Ingrediente de cebo y recetas.' },
  { name: 'Barro', emoji: '🟤', type: 'material', rarity: 'common', weightKg: 0.5, baseValue: 1, effect: 'Base para mezclas y crafteo.' },
  { name: 'Champiñón Mágico', emoji: '🪻', type: 'consumable', rarity: 'rare', weightKg: 0.1, baseValue: 12, effect: 'Recupera 25 HP.' },
  { name: 'Hueso', emoji: '🦴', type: 'material', rarity: 'rare', weightKg: 0.4, baseValue: 6, effect: 'Resto ancestral.' },
  { name: 'Ámbar', emoji: '🟡', type: 'material', rarity: 'epic', weightKg: 0.2, baseValue: 25, effect: 'Gema fosilizada de gran valor.' },
  { name: 'Ojo Ancestral', emoji: '👁️', type: 'material', rarity: 'legendary', weightKg: 0.1, baseValue: 50, effect: 'Reliquia legendaria.' },
  { name: 'Seda', emoji: '🧵', type: 'material', rarity: 'uncommon', weightKg: 0.1, baseValue: 4, effect: 'Fibra fina para confección.' },
  { name: 'Trigo', emoji: '🌽', type: 'material', rarity: 'common', weightKg: 0.2, baseValue: 1, effect: 'Grano básico.' },
  { name: 'Semillas', emoji: '🌱', type: 'material', rarity: 'common', weightKg: 0.05, baseValue: 1, effect: 'Semillas para plantar o procesar.' },
  { name: 'Hierba', emoji: '🌿', type: 'material', rarity: 'common', weightKg: 0.1, baseValue: 1, effect: 'Hierba común.' },
  { name: 'FlorDragón', emoji: '🌺', type: 'consumable', rarity: 'rare', weightKg: 0.1, baseValue: 8, effect: 'Recupera 15 HP.' },
  { name: 'Flores', emoji: '🌼', type: 'material', rarity: 'common', weightKg: 0.05, baseValue: 1, effect: 'Flores comunes en preparados.' },
  { name: 'Girasol', emoji: '🌻', type: 'material', rarity: 'uncommon', weightKg: 0.15, baseValue: 3, effect: 'Flor resistente.' },
  { name: 'Hierbas Secas', emoji: '🥀', type: 'material', rarity: 'common', weightKg: 0.05, baseValue: 1, effect: 'Fibra vegetal.' },
  { name: 'Hojas de Viento', emoji: '🍁', type: 'material', rarity: 'epic', weightKg: 0.05, baseValue: 20, effect: 'Hoja épica para recetas avanzadas.' },
  { name: 'Roca Volcánica', emoji: '🪨', type: 'material', rarity: 'common', weightKg: 1.0, baseValue: 2, effect: 'Mineral pesado volcánico.' },
  { name: 'Cenizas', emoji: '🌫️', type: 'material', rarity: 'common', weightKg: 0.05, baseValue: 1, effect: 'Residuo ligero volcánico.' },
  { name: 'Carbón', emoji: '⚫', type: 'material', rarity: 'uncommon', weightKg: 0.3, baseValue: 3, effect: 'Combustible mineral.' },
  { name: 'Agua', emoji: '💧', type: 'consumable', rarity: 'common', weightKg: 0.3, baseValue: 1, effect: 'Recupera 4 STA.' },
  { name: 'Pez Amarillo', emoji: '🐠', type: 'consumable', rarity: 'common', weightKg: 0.3, baseValue: 3, effect: 'Recupera 10 STA.' },
  { name: 'Pez Azul', emoji: '🐟', type: 'consumable', rarity: 'uncommon', weightKg: 0.4, baseValue: 6, effect: 'Recupera 18 STA.' },
];

export const BIOME_RESOURCE_LINKS: Record<string, { resourceName: string; spawnChance: number; minQuantity: number; maxQuantity: number }[]> = {
  forest: [
    { resourceName: 'Wood', spawnChance: 90, minQuantity: 1, maxQuantity: 3 },
    { resourceName: 'Pine Cone', spawnChance: 10, minQuantity: 1, maxQuantity: 1 },
    { resourceName: 'Apple', spawnChance: 12, minQuantity: 1, maxQuantity: 2 },
    { resourceName: 'Orange', spawnChance: 9, minQuantity: 1, maxQuantity: 2 },
    { resourceName: 'Mango', spawnChance: 4, minQuantity: 1, maxQuantity: 1 },
    { resourceName: 'Coconut', spawnChance: 16, minQuantity: 1, maxQuantity: 1 },
    { resourceName: 'Water', spawnChance: 5, minQuantity: 1, maxQuantity: 2 },
    { resourceName: 'Bamboo', spawnChance: 2, minQuantity: 2, maxQuantity: 4 },
    { resourceName: 'Ancient Wood', spawnChance: 1, minQuantity: 1, maxQuantity: 2 },
  ],
  swamp: [
    { resourceName: 'Champiñón', spawnChance: 30, minQuantity: 2, maxQuantity: 4 },
    { resourceName: 'Baba Verde', spawnChance: 25, minQuantity: 1, maxQuantity: 3 },
    { resourceName: 'Hierbas', spawnChance: 20, minQuantity: 2, maxQuantity: 4 },
    { resourceName: 'Insectos', spawnChance: 15, minQuantity: 2, maxQuantity: 4 },
    { resourceName: 'Barro', spawnChance: 5, minQuantity: 1, maxQuantity: 2 },
    { resourceName: 'Champiñón Mágico', spawnChance: 3, minQuantity: 1, maxQuantity: 1 },
    { resourceName: 'Seda', spawnChance: 1, minQuantity: 1, maxQuantity: 3 },
  ],
  plains: [
    { resourceName: 'Trigo', spawnChance: 30, minQuantity: 2, maxQuantity: 5 },
    { resourceName: 'Semillas', spawnChance: 18, minQuantity: 1, maxQuantity: 3 },
    { resourceName: 'Hierbas', spawnChance: 22, minQuantity: 1, maxQuantity: 4 },
    { resourceName: 'FlorDragón', spawnChance: 5, minQuantity: 1, maxQuantity: 2 },
    { resourceName: 'Flores', spawnChance: 15, minQuantity: 3, maxQuantity: 6 },
    { resourceName: 'Girasol', spawnChance: 10, minQuantity: 1, maxQuantity: 3 },
    { resourceName: 'Hierbas Secas', spawnChance: 3, minQuantity: 2, maxQuantity: 4 },
    { resourceName: 'Hojas de Viento', spawnChance: 2, minQuantity: 1, maxQuantity: 2 },
  ],
  volcano: [
    { resourceName: 'Roca Volcánica', spawnChance: 75, minQuantity: 1, maxQuantity: 4 },
    { resourceName: 'Cenizas', spawnChance: 45, minQuantity: 2, maxQuantity: 5 },
    { resourceName: 'Carbón', spawnChance: 8, minQuantity: 1, maxQuantity: 2 },
  ],
  river: [
    { resourceName: 'Agua', spawnChance: 40, minQuantity: 2, maxQuantity: 4 },
    { resourceName: 'Pez Amarillo', spawnChance: 35, minQuantity: 1, maxQuantity: 3 },
    { resourceName: 'Pez Azul', spawnChance: 13, minQuantity: 1, maxQuantity: 2 },
  ],
  lake: [
    { resourceName: 'Agua', spawnChance: 40, minQuantity: 2, maxQuantity: 4 },
    { resourceName: 'Pez Amarillo', spawnChance: 35, minQuantity: 1, maxQuantity: 3 },
    { resourceName: 'Pez Azul', spawnChance: 13, minQuantity: 1, maxQuantity: 2 },
  ],
  ashlands: [
    { resourceName: 'Cenizas', spawnChance: 45, minQuantity: 2, maxQuantity: 5 },
    { resourceName: 'Carbón', spawnChance: 8, minQuantity: 1, maxQuantity: 2 },
    { resourceName: 'Roca Volcánica', spawnChance: 30, minQuantity: 1, maxQuantity: 3 },
  ],
  highlands: [
    { resourceName: 'Wood', spawnChance: 20, minQuantity: 1, maxQuantity: 2 },
    { resourceName: 'Roca Volcánica', spawnChance: 40, minQuantity: 1, maxQuantity: 3 },
    { resourceName: 'Carbón', spawnChance: 10, minQuantity: 1, maxQuantity: 2 },
  ],
  desert: [
    { resourceName: 'Hierbas Secas', spawnChance: 15, minQuantity: 1, maxQuantity: 3 },
    { resourceName: 'Orange', spawnChance: 8, minQuantity: 1, maxQuantity: 2 },
  ],
  tundra: [
    { resourceName: 'Wood', spawnChance: 15, minQuantity: 1, maxQuantity: 2 },
    { resourceName: 'Pine Cone', spawnChance: 10, minQuantity: 1, maxQuantity: 1 },
    { resourceName: 'Hierbas Secas', spawnChance: 10, minQuantity: 1, maxQuantity: 2 },
  ],
};

export const RESOURCE_WINDOWS_GLOBAL: Record<string, string> = {
  wood: 'all', 'pine cone': 'daylight', apple: 'daylight', orange: 'daylight', mango: 'daylight', coconut: 'daylight',
  water: 'all', bamboo: 'daylight', 'ancient wood': 'night', champinon: 'dusk', 'champinon magico': 'night',
  'baba verde': 'night', hierbas: 'daylight', insectos: 'night', barro: 'all', trigo: 'daylight',
  'flor dragon': 'crepuscular', flores: 'daylight', girasoles: 'daylight', 'hierbas secas': 'daylight',
  'hojas de viento': 'night', 'roca volcanica': 'all', cenizas: 'night', carbon: 'night',
  'pez amarillo': 'daylight', 'pez azul': 'night',
};

export const CREATURE_CATEGORIES = {
  basic: { emoji: '🐾', hpMultiplier: 1, attackMultiplier: 1, defenseMultiplier: 1, xpMultiplier: 6, label: 'Básico' },
  veteran: { emoji: '⚔️', hpMultiplier: 1.34, attackMultiplier: 1.2, defenseMultiplier: 1.16, xpMultiplier: 10, label: 'Veterano' },
  elite: { emoji: '👹', hpMultiplier: 1.72, attackMultiplier: 1.42, defenseMultiplier: 1.35, xpMultiplier: 16, label: 'Élite' },
  boss: { emoji: '☠️', hpMultiplier: 2.55, attackMultiplier: 1.86, defenseMultiplier: 1.7, xpMultiplier: 28, label: 'Jefe' },
};

export const BIOME_SPECIES: Record<string, string[]> = {
  forest: ['Lobo', 'Jabalí', 'Cuervo', 'Araña Corteza', 'Ciervo Gris', 'Bestia Musgo'],
  swamp: ['Sapo Venenoso', 'Babosa Negra', 'Serpiente Fango', 'Acechador Turbio', 'Mosca Daga'],
  plains: ['Zorro de Prado', 'Carnero Salvaje', 'Halcón Bajo', 'Jabalina', 'Lince Dorado'],
  river: ['Pez Diente', 'Anguila de Cauce', 'Nutria Feroz', 'Cangrejo Roca', 'Piraña Rill'],
  lake: ['Raya Lacustre', 'Carpa Titán', 'Nimbo Escama', 'Garra de Agua', 'Mordedor Azul'],
  volcano: ['Sabueso Ceniza', 'Escorpión Lava', 'Draco Brasa', 'Golem Escoria', 'Murciélago Fuego'],
  ashlands: ['Hiena Ceniza', 'Cuervo Carbón', 'Bestia Escoria', 'Araña Humo', 'Chacal Obsidiana'],
  highlands: ['Cabra Acero', 'Lobo Cumbre', 'Águila Pedernal', 'Raptor Colina', 'Bisonte Roca'],
  desert: ['Escorpión Seco', 'Coyote Duna', 'Víbora Arena', 'Buitre Sol', 'Reptil Espina'],
  tundra: ['Lobo Nieve', 'Caribú Sombrío', 'Oso Escarcha', 'Raptor Hielo', 'Zorro Blanco'],
};

export const DAY_PERIOD_LABELS = {
  dawn: { es: 'Amanecer', emoji: '🌅' },
  day: { es: 'Día', emoji: '☀️' },
  dusk: { es: 'Atardecer', emoji: '🌇' },
  night: { es: 'Noche', emoji: '🌙' },
};

export const BIOME_DAY_EFFECTS: Record<string, Record<string, { spawn?: string; yield?: string; sta?: string; note?: string }>> = {
  forest: {
    dawn: { spawn: '+10%', yield: '+8%', note: 'Gather y chop favorecidos.' },
    day: { spawn: '+4%', yield: '+2%', note: 'Chop muy favorecido.' },
    dusk: { spawn: '+10%', yield: '+8%', note: 'Gather favorecido.' },
    night: { spawn: '-14%', yield: '+15%', sta: '+14%', note: 'Alto yield, alto costo.' },
  },
  swamp: {
    dawn: { spawn: '+8%', yield: '+8%' },
    day: { spawn: '+2%', yield: '+2%' },
    dusk: { spawn: '+14%', yield: '+14%', note: 'Gather y pesca aumentan.' },
    night: { spawn: '+16%', yield: '+22%', sta: '+14%', note: 'El pantano cobra vida.' },
  },
  plains: {
    dawn: { spawn: '+12%', yield: '+8%', note: 'Gather muy favorecido.' },
    day: { spawn: '+3%', yield: '+1%' },
    dusk: { spawn: '+14%', yield: '+8%' },
    night: { spawn: '-20%', yield: '+16%', sta: '+16%', note: 'Alto riesgo, alto reward.' },
  },
  river: {
    dawn: { spawn: '+15%', yield: '+10%', note: 'Pesca excelente.' },
    day: { spawn: '+5%', yield: '+2%', note: 'Pesca buena.' },
    dusk: { spawn: '+18%', yield: '+12%', note: 'Pesca muy buena.' },
    night: { spawn: '-18%', yield: '+20%', sta: '+15%', note: 'Pesca de noche peligrosa pero rentable.' },
  },
  volcano: {
    dawn: { spawn: '+4%', yield: '+8%' },
    day: { spawn: '+8%', yield: '+14%', sta: '+8%', note: 'Minería excelente.' },
    dusk: { spawn: '+6%', yield: '+10%' },
    night: { spawn: '-16%', yield: '+24%', sta: '+20%', note: 'Minería nocturna de alto riesgo.' },
  },
  lake: {
    dawn: { spawn: '+12%', yield: '+10%' },
    day: { spawn: '+4%', yield: '+2%' },
    dusk: { spawn: '+14%', yield: '+12%' },
    night: { spawn: '-14%', yield: '+20%', sta: '+14%' },
  },
  ashlands: {
    dawn: { spawn: '+2%', yield: '+6%' },
    day: { spawn: '+8%', yield: '+12%', sta: '+8%', note: 'Minería diurna fuerte.' },
    dusk: { spawn: '+10%', yield: '+14%' },
    night: { spawn: '-16%', yield: '+22%', sta: '+20%', note: 'Cenizas y minerales nocturnos.' },
  },
  highlands: {
    dawn: { spawn: '+8%', yield: '+8%' },
    day: { spawn: '+5%', yield: '+4%' },
    dusk: { spawn: '+10%', yield: '+10%' },
    night: { spawn: '-12%', yield: '+16%', sta: '+14%' },
  },
  desert: {
    dawn: { spawn: '+8%', yield: '+6%' },
    day: { spawn: '-8%', yield: '-8%', sta: '+12%', note: 'El calor del día castiga.' },
    dusk: { spawn: '+12%', yield: '+8%' },
    night: { spawn: '-14%', yield: '+14%', sta: '+16%' },
  },
  tundra: {
    dawn: { spawn: '+10%', yield: '+8%' },
    day: { spawn: 'base', yield: 'base' },
    dusk: { spawn: '+12%', yield: '+10%' },
    night: { spawn: '-10%', yield: '+16%', sta: '+15%' },
  },
};

export const TOOLS = [
  { id: 'canapez', name: 'Caña de Bambú', emoji: '🎣', type: 'fishing', durability: 70, weightKg: 1.2, targets: ['river', 'beach'] },
  { id: 'hachaPiedra', name: 'Hacha de Piedra', emoji: '🪓', type: 'woodcutting', durability: 85, weightKg: 2.1, targets: ['forest'] },
  { id: 'picoPiedra', name: 'Pico de Piedra', emoji: '⛏️', type: 'mining', durability: 95, weightKg: 2.8, targets: ['volcano', 'mountain', 'cave'] },
  { id: 'basket', name: 'Tijera de Piedra', emoji: '✂️', type: 'gathering', durability: 60, weightKg: 0.7, targets: ['forest', 'plains', 'swamp'] },
  { id: 'varaMadera', name: 'Vara de Madera', emoji: '🦯', type: 'harvesting', durability: 65, weightKg: 0.9, targets: ['forest', 'plains'] },
];

export const EQUIPMENT_TEMPLATES = [
  { key: 'nova_guard_helm', name: 'Casco de Guardia de Nova', slot: 'head', level: 1, emoji: '🪖', implicit: 'DEF +2, HP +6' },
  { key: 'ashen_hunter_hood', name: 'Capucha del Cazador de Ceniza', slot: 'head', level: 4, emoji: '🎭', class: 'Curse Hunter', implicit: 'CRIT +1.5%, EVA +1' },
  { key: 'briar_stalker_boots', name: 'Botas del Acecho Briar', slot: 'boots', level: 3, emoji: '🥾', implicit: 'MOV +2%, EVA +1' },
  { key: 'reedwash_treads', name: 'Botas de Reed Wash', slot: 'boots', level: 2, emoji: '👢', implicit: 'MOV +1.5%, RES química +1' },
  { key: 'rootbound_vest', name: 'Chaleco de Raíz Firme', slot: 'chest', level: 5, emoji: '🦺', implicit: 'HP +12, DEF +3' },
  { key: 'scoria_plate', name: 'Coraza de Escoria', slot: 'chest', level: 8, emoji: '🛡️', implicit: 'DEF +5, RES elemental +2' },
  { key: 'watcher_gloves', name: 'Guantes del Vigía', slot: 'gloves', level: 4, emoji: '🧤', implicit: 'CRIT +1%, ATK SPD +1.5%' },
  { key: 'bogbound_belt', name: 'Cinturón de Fango Quieto', slot: 'belt', level: 6, emoji: '🎗️', implicit: 'RES química +3, STA +4' },
  { key: 'cursebreaker_blade', name: 'Hoja Rompemaldiciones', slot: 'main_hand', level: 7, emoji: '🗡️', class: 'Curse Hunter', implicit: 'ATK +4, B.DMG +1, CRIT +1.2%' },
  { key: 'riverglass_dagger', name: 'Daga de Cristal de Río', slot: 'main_hand', level: 5, emoji: '🗡️', class: 'Alchemist Rogue', implicit: 'ATK +3, ATK SPD +2%, EVA +1' },
  { key: 'moon_veil_cloak', name: 'Capa del Velo Lunar', slot: 'cloak', level: 6, emoji: '🧥', implicit: 'STA +6, RES arcana +2' },
  { key: 'nova_oath_amulet', name: 'Amuleto del Juramento de Nova', slot: 'amulet', level: 3, emoji: '📿', implicit: 'HP +8, RES sagrada +1' },
  { key: 'scoria_loop', name: 'Anillo de Escoria', slot: 'ring', level: 9, emoji: '💍', implicit: 'ARC +2, RES elemental +2' },
];

export const ZONE_BANDS = [
  { id: 'core', distance: '0–10', level: '1–3', basic: 82, veteran: 15, elite: 3, boss: 0 },
  { id: 'inner', distance: '10–35', level: '4–8', basic: 70, veteran: 20, elite: 9, boss: 1 },
  { id: 'middle', distance: '35–60', level: '9–14', basic: 56, veteran: 25, elite: 15, boss: 4 },
  { id: 'outer', distance: '60–90', level: '15–22', basic: 45, veteran: 27, elite: 20, boss: 8 },
  { id: 'frontier', distance: '90+', level: '23+', basic: 35, veteran: 30, elite: 22, boss: 13 },
];

export const RACES = [
  { key: 'uren', name: 'Uren', emoji: '🌑', description: 'Herejes del bosque oscuro. Druidas y arcanos que mezclan naturaleza corrupta con magia primordial.' },
  { key: 'zolk', name: 'Zolk', emoji: '🧪', description: 'Parias alquímicos supervivientes. Dominan toxinas, sabotaje y cacería adaptativa.' },
];

export const CLASSES = [
  { key: 'dark_druid', race: 'uren', name: 'Dark Druid', emoji: '🌿', description: 'Guardianes malditos del bosque. Resisten mucho, pero se mueven lento.' },
  { key: 'arcane', race: 'uren', name: 'Arcane', emoji: '🔮', description: 'Canales de energía pura. Frágiles, pero con poder mágico devastador.' },
  { key: 'alchemist_rogue', race: 'zolk', name: 'Alchemist Rogue', emoji: '🗡️', description: 'Sombras tóxicas y técnicas. Atacan rápido con viales y corrosivos.' },
  { key: 'curse_hunter', race: 'zolk', name: 'Curse Hunter', emoji: '🏹', description: 'Cazadores de maldiciones. Balanceados, resistentes y precisos.' },
];

export const RACIAL_TALENTS = [
  { race: 'zolk', name: 'Sangre Tóxica', type: 'passive', category: 'offense', maxRank: 3, effect: '+RES química y crítico leve.' },
  { race: 'zolk', name: 'Reflejos de Laboratorio', type: 'passive', category: 'mobility', maxRank: 3, effect: '+Evasión y movilidad.' },
  { race: 'zolk', name: 'Metabolismo Inestable', type: 'passive', category: 'utility', maxRank: 2, effect: 'Más STA máxima y regen pasiva.' },
  { race: 'zolk', name: 'Piel Alquímica', type: 'passive', category: 'defense', maxRank: 3, effect: '+Defensa y resistencia química.' },
  { race: 'zolk', name: 'Mano Delicada', type: 'passive', category: 'utility', maxRank: 3, effect: 'Mejora drops en Gather.' },
  { race: 'zolk', name: 'Fuga Rápida', type: 'passive', category: 'mobility', maxRank: 2, effect: 'Reduce costo STA al viajar.' },
  { race: 'zolk', name: 'Nube Tóxica', type: 'active', category: 'active', maxRank: 1, effect: 'Activa racial ofensiva en combate.' },
  { race: 'zolk', name: 'Glándulas Venenosas', type: 'passive', category: 'offense', maxRank: 1, effect: 'Mejora Nube Tóxica.' },
  { race: 'zolk', name: 'Mutación de Escape', type: 'active', category: 'active', maxRank: 1, effect: 'Activa racial de movilidad.' },
  { race: 'zolk', name: 'Piernas Químicas', type: 'passive', category: 'mobility', maxRank: 1, effect: 'Mejora Mutación de Escape.' },
  { race: 'zolk', name: 'Sombra Tóxica', type: 'keystone', category: 'keystone', maxRank: 1, effect: 'Keystone evasiva agresiva.' },
  { race: 'zolk', name: 'Sangre de Reactor', type: 'keystone', category: 'keystone', maxRank: 1, effect: 'Keystone daño arcano-crítico.' },
  { race: 'zolk', name: 'Superviviente Químico', type: 'keystone', category: 'keystone', maxRank: 1, effect: 'Keystone aguante y resistencia.' },
  { race: 'uren', name: 'Raíz Profunda', type: 'passive', category: 'defense', maxRank: 3, effect: 'Más VIT y defensa.' },
  { race: 'uren', name: 'Savia Serena', type: 'passive', category: 'defense', maxRank: 3, effect: 'Más HP/STA máxima.' },
  { race: 'uren', name: 'Corteza Viva', type: 'passive', category: 'defense', maxRank: 3, effect: 'Resistencia física y defensa.' },
  { race: 'uren', name: 'Pulso Arcano Natural', type: 'passive', category: 'offense', maxRank: 3, effect: 'Más INT y resistencia arcana.' },
  { race: 'uren', name: 'Paso Silvestre', type: 'passive', category: 'mobility', maxRank: 2, effect: 'Más velocidad de movimiento.' },
  { race: 'uren', name: 'Ojo de Forraje', type: 'passive', category: 'utility', maxRank: 3, effect: 'Mejora drops Gather/Chop.' },
  { race: 'uren', name: 'Respiro del Bosque', type: 'passive', category: 'utility', maxRank: 2, effect: 'Regeneración pasiva ligera.' },
  { race: 'uren', name: 'Enredadera', type: 'active', category: 'active', maxRank: 1, effect: 'Activa racial de control en combate.' },
  { race: 'uren', name: 'Espinas Reflejas', type: 'passive', category: 'defense', maxRank: 1, effect: 'Mejora Enredadera.' },
  { race: 'uren', name: 'Brote Arcano', type: 'active', category: 'active', maxRank: 1, effect: 'Activa racial de impulso arcano.' },
  { race: 'uren', name: 'Canal Verde', type: 'passive', category: 'offense', maxRank: 1, effect: 'Mejora Brote Arcano.' },
  { race: 'uren', name: 'Corazón del Bosque', type: 'keystone', category: 'keystone', maxRank: 1, effect: 'Keystone tanque/sustain.' },
  { race: 'uren', name: 'Pacto Arcano', type: 'keystone', category: 'keystone', maxRank: 1, effect: 'Keystone ofensivo arcano.' },
  { race: 'uren', name: 'Espina Salvaje', type: 'keystone', category: 'keystone', maxRank: 1, effect: 'Keystone balanceado ataque/defensa.' },
];

export const COMBAT_FORMULAS = [
  { name: 'HP máximo', formula: '40 + (VIT × 8) + (nivel × 10)' },
  { name: 'STA máxima', formula: '30 + (AGI × 5) + (ENG × 4) + (nivel × 5)' },
  { name: 'Ataque', formula: '(STR × 1.2) + (DEX × 0.8) + nivel' },
  { name: 'Poder Arcano', formula: '(INT × 1.5) + (ENG × 0.5) + nivel' },
  { name: 'Daño Bonus', formula: 'min(Ataque × 0.3, 10)' },
  { name: 'Velocidad Ataque', formula: '150 + (AGI × 30) + (DEX × 15)' },
  { name: 'Velocidad Movimiento', formula: '0.05 + (AGI × 0.0025), cap 0.1' },
  { name: 'Crítico', formula: '(DEX × 1.2) + (AGI × 0.3) + 2.5%, cap 35%' },
  { name: 'Evasión', formula: '(AGI × 1.0) + (DEX × 0.5) + 1%, cap 30%' },
  { name: 'Defensa', formula: '(VIT × 0.8) + (STR × 0.3) + (nivel × 0.5)' },
];

export const PROGRESS_TRACKER = {
  systems: [
    { name: 'Onboarding web', status: 'done' },
    { name: 'Mapa y movimiento', status: 'done' },
    { name: 'Recolección', status: 'done' },
    { name: 'Inventario/equipo', status: 'partial' },
    { name: 'Combate PvE', status: 'partial' },
    { name: 'Economía (market/bank)', status: 'partial' },
    { name: 'Crafteo', status: 'pending' },
    { name: 'Quests/misiones', status: 'pending' },
    { name: 'PvP', status: 'pending' },
    { name: 'Cuentas/autenticación real', status: 'pending' },
  ],
};
