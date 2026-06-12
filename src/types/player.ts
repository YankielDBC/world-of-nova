// @ts-nocheck
// ============================================
// WORLD OF NOVA - PLAYER SYSTEM TYPES
// ============================================
// Level configuration (49 levels, luego expandemos hasta 300)
export const MAX_LEVEL = 49;
export const MAX_LEVEL_EXPANDED = 300;
/**
 * XP required per level - CURVA LENTA Y DIFICIL
 * Formula: level² * 50 + level * 50
 * Level 1→2: 100 XP
 * Level 10→11: 5,500 XP
 * Level 20→21: 21,000 XP
 * Level 40→41: 82,000 XP
 * Level 49: Total ~400K XP
 */
export function getXpForLevel(level) {
    return Math.floor(level * level * 50 + level * 50);
}
// Total XP needed to reach a level (sum of XP for all previous levels)
export function getTotalXpForLevel(level) {
    // Σ(50n² + 50n) from n=1 to level-1 = 50 * Σ(n² + n)
    // Using formula: n(n+1)(n+2)/6 for Σn² and n(n+1)/2 for Σn
    if (level <= 1)
        return 0;
    const n = level - 1;
    return Math.floor(50 * (n * (n + 1) * (n + 2) / 6 + n * (n + 1) / 2));
}
// ============================================
// TÍTULOS POR LEVEL
// ============================================
export const LEVEL_TITLES = {
    1: { emoji: '🌱', title: 'Novato', description: 'Acaba de comenzar su viaje' },
    2: { emoji: '🌿', title: 'Aprendiz', description: 'Aprendiendo lo básico' },
    3: { emoji: '🌳', title: 'Explorador', description: 'Explorando el mundo' },
    4: { emoji: '🍃', title: 'Cazador', description: 'Cazando presas' },
    5: { emoji: '🎯', title: 'Tirador', description: 'Destreza con armas' },
    6: { emoji: '🗡️', title: 'Espadachín', description: 'Maestro de la espada' },
    7: { emoji: '🛡️', title: 'Guerrero', description: 'Veterano de batallas' },
    8: { emoji: '⚔️', title: 'Combatiente', description: 'Luchador experimentado' },
    9: { emoji: '💪', title: 'Soldado', description: 'Soldado entrenado' },
    10: { emoji: '🏆', title: 'Héroe', description: 'Héroe局部' },
    11: { emoji: '⭐', title: 'Estrella', description: 'Brillando en el campo' },
    12: { emoji: '🌟', title: 'Leyenda', description: 'Una leyenda en ascenso' },
    13: { emoji: '🔥', title: 'Guerrero de Fuego', description: 'Espíritu ardiente' },
    14: { emoji: '❄️', title: 'Guerrero de Hielo', description: 'Frío como el acero' },
    15: { emoji: '⚡', title: 'Rayo', description: 'Rápido como el rayo' },
    16: { emoji: '🌩️', title: 'Tormenta', description: 'Fuerza de la naturaleza' },
    17: { emoji: '🌪️', title: 'Viento', description: 'Movimiento etéreo' },
    18: { emoji: '🌊', title: 'Oleaje', description: 'Poder del océano' },
    19: { emoji: '🏔️', title: 'Montañés', description: 'Conquistador de alturas' },
    20: { emoji: '👑', title: 'Caballero', description: 'Noble guerrero' },
    21: { emoji: '🛡️', title: 'Paladín', description: 'Guardián sagrado' },
    22: { emoji: '⚜️', title: 'Templario', description: 'Orden de caballeros' },
    23: { emoji: '🔱', title: 'Centurión', description: 'Líder de cohortes' },
    24: { emoji: '🎖️', title: 'Legado', description: 'Legado de batalla' },
    25: { emoji: '🦅', title: 'Águila', description: 'Ojos de águila' },
    26: { emoji: '🐺', title: 'Lobo', description: 'Espíritu de manada' },
    27: { emoji: '🦁', title: 'León', description: 'Rey de la selva' },
    28: { emoji: '🐉', title: 'Dragón', description: 'Poder dracónico' },
    29: { emoji: '🦅', title: 'Fénix', description: 'Renacimiento de fuego' },
    30: { emoji: '💎', title: 'Diamante', description: 'Duro como el diamante' },
    31: { emoji: '💠', title: 'Esmeralda', description: 'Verde como la hope' },
    32: { emoji: '🔷', title: 'Zafiro', description: 'Azul como el cielo' },
    33: { emoji: '🔴', title: 'Rubí', description: 'Rojo como la sangre' },
    34: { emoji: '🟡', title: 'Topacio', description: 'Dorado como el sol' },
    35: { emoji: '🟣', title: 'Amatista', description: 'Púrpura mística' },
    36: { emoji: '⚫', title: 'Obsidiana', description: 'Oscuridad.black' },
    37: { emoji: '⚪', title: 'Perla', description: 'Pureza brillante' },
    38: { emoji: '🌙', title: 'Luna', description: 'Luz de la noche' },
    39: { emoji: '☀️', title: 'Sol', description: 'Luz del día' },
    40: { emoji: '🌌', title: 'Galaxia', description: 'Cosmos en persona' },
    41: { emoji: '🪐', title: 'Universo', description: 'Señor del tiempo' },
    42: { emoji: '🎭', title: 'Mago', description: 'Maestro de artes mágicas' },
    43: { emoji: '🔮', title: 'Hechicero', description: 'Sabio arcano' },
    44: { emoji: '📚', title: 'Archimago', description: 'Bibliotecario místico' },
    45: { emoji: '🏰', title: 'Gran mago', description: 'Poder sin límites' },
    46: { emoji: '✨', title: 'Elemental', description: 'Elemento primordial' },
    47: { emoji: '🌈', title: 'Arcoíris', description: 'Todos los colores' },
    48: { emoji: '💫', title: 'Estrella Fugaz', description: 'Deseo cumplido' },
    49: { emoji: '🏅', title: 'Legendario', description: 'Leyenda vivas' },
};
// Helper function
export function getTitleForLevel(level) {
    return LEVEL_TITLES[level] || { emoji: '🏅', title: `Nivel ${level}` };
}
export function getXpForNextLevel(currentLevel) {
    return getXpForLevel(currentLevel + 1);
}
