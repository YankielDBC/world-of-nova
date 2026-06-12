// @ts-nocheck
export const RACE_DICTIONARY = {
    uren: {
        name: 'Uren',
        shortDescription: 'Pueblo sombrio de druidas y arcanos.',
    },
    zolk: {
        name: 'Zolk',
        shortDescription: 'Linaje alquimico experto en toxinas y caceria.',
    },
};
export const CLASS_DICTIONARY = {
    dark_druid: {
        name: 'Dark Druid',
        emoji: '🌿',
        shortDescription: 'Canaliza magia natural corrompida.',
    },
    arcane: {
        name: 'Arcane',
        emoji: '🔮',
        shortDescription: 'Especialista en energia arcana pura.',
    },
    alchemist_rogue: {
        name: 'Alchemist Rogue',
        emoji: '⚗️',
        shortDescription: 'Usa pociones, venenos y movilidad.',
    },
    curse_hunter: {
        name: 'Curse Hunter',
        emoji: '🏹',
        shortDescription: 'Rastrea maldiciones y objetivos oscuros.',
    },
};
export const ITEM_DICTIONARY = {
    wood: { name: 'Wood', shortDescription: 'Madera basica para crafteo inicial.' },
    'pine cone': { name: 'Pine Cone', shortDescription: 'Semilla de pino usada en recetas simples.' },
    apple: { name: 'Apple', shortDescription: 'Fruta que recupera un poco de STA.' },
    orange: { name: 'Orange', shortDescription: 'Fruta citrica que recupera STA.' },
    mango: { name: 'Mango', shortDescription: 'Fruta rara que recupera mas STA.' },
    coconut: { name: 'Coconut', shortDescription: 'Fruta pesada que recupera buena STA.' },
    water: { name: 'Water', shortDescription: 'Agua potable para recuperar STA.' },
    bamboo: { name: 'Bamboo', shortDescription: 'Material flexible para estructuras ligeras.' },
    'ancient wood': { name: 'Ancient Wood', shortDescription: 'Madera rara de alto valor.' },
    champinon: { name: 'Champinon', shortDescription: 'Hongo comun con leve recuperacion de HP.' },
    'baba verde': { name: 'Baba Verde', shortDescription: 'Material viscoso para alquimia.' },
    hierbas: { name: 'Hierbas', shortDescription: 'Planta comun de recoleccion.' },
    insectos: { name: 'Insectos', shortDescription: 'Ingrediente comun de cebo y recetas.' },
    barro: { name: 'Barro', shortDescription: 'Base para mezclas y crafteo.' },
    'champinon magico': { name: 'Champinon Magico', shortDescription: 'Hongo raro con recuperacion alta de HP.' },
    trigo: { name: 'Trigo', shortDescription: 'Grano basico de alimento.' },
    'flor dragon': { name: 'Flor Dragon', shortDescription: 'Flor rara con propiedades curativas.' },
    'flores amarillas': { name: 'Flores Amarillas', shortDescription: 'Flores comunes usadas en preparados.' },
    girasoles: { name: 'Girasoles', shortDescription: 'Flor resistente con usos varios.' },
    'hierbas secas': { name: 'Hierbas Secas', shortDescription: 'Fibra vegetal para mezclas y fuego.' },
    'hojas de viento': { name: 'Hojas de Viento', shortDescription: 'Hoja epica usada en recetas avanzadas.' },
    'roca volcanica': { name: 'Roca Volcanica', shortDescription: 'Mineral pesado de zonas volcanicas.' },
    cenizas: { name: 'Cenizas', shortDescription: 'Residuo ligero de origen volcanico.' },
    carbon: { name: 'Carbon', shortDescription: 'Combustible mineral util en hornos.' },
    'pez amarillo': { name: 'Pez Amarillo', shortDescription: 'Pescado comun que recupera STA.' },
    'pez azul': { name: 'Pez Azul', shortDescription: 'Pescado poco comun con mejor recuperacion de STA.' },
    'hacha de piedra': { name: 'Hacha de Piedra', shortDescription: 'Hacha para talar arboles y obtener madera.' },
    'pico de piedra': { name: 'Pico de Piedra', shortDescription: 'Pico para extraer roca y minerales.' },
    'canasta de paja': { name: 'Tijera de Piedra', shortDescription: 'Herramienta para recolectar recursos.' },
    'tijera de piedra': { name: 'Tijera de Piedra', shortDescription: 'Herramienta para recolectar recursos.' },
    'cana de bambu': { name: 'Cana de Bambu', shortDescription: 'Cana basica para pesca.' },
    'vara de madera': { name: 'Vara de Madera', shortDescription: 'Vara simple para cosecha ligera.' },
};
export const STATUS_DICTIONARY = {
    pvp_off: {
        name: 'PvP Desactivado',
        shortDescription: 'No hay ataques entre jugadores en esta zona.',
    },
    creatures_off: {
        name: 'Criaturas Desactivadas',
        shortDescription: 'Las criaturas no atacan en esta zona.',
    },
};
export const TIME_PERIOD_DICTIONARY = {
    dawn: {
        name: 'Amanecer',
        shortDescription: 'Ventana crepuscular con alta actividad de recoleccion y fauna temprana.',
    },
    day: {
        name: 'Día',
        shortDescription: 'Periodo estable para farmeo continuo y rutas seguras.',
    },
    dusk: {
        name: 'Atardecer',
        shortDescription: 'Franja crepuscular con oportunidades extra antes de la noche.',
    },
    night: {
        name: 'Noche',
        shortDescription: 'Menor presencia comun, mayor riesgo y opciones de botin especial.',
    },
};
function normalizeKey(value) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
}
export function getItemShortDescription(itemName) {
    const key = normalizeKey(itemName);
    return ITEM_DICTIONARY[key]?.shortDescription ?? null;
}
export function getRaceEntry(raceKey) {
    if (!raceKey) {
        return null;
    }
    return RACE_DICTIONARY[normalizeKey(raceKey)] ?? null;
}
export function getClassEntry(classKey) {
    if (!classKey) {
        return null;
    }
    return CLASS_DICTIONARY[normalizeKey(classKey)] ?? null;
}
export function getStatusEntry(statusKey) {
    if (!statusKey) {
        return null;
    }
    return STATUS_DICTIONARY[normalizeKey(statusKey)] ?? null;
}
export function getTimePeriodEntry(periodKey) {
    if (!periodKey) {
        return null;
    }
    return TIME_PERIOD_DICTIONARY[normalizeKey(periodKey)] ?? null;
}
