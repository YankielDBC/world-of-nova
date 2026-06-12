// @ts-nocheck
export const STATUS_ALIVE = 'ALIVE';
export const STATUS_DEAD = 'DEAD';
export const CREATURE_CACHE_TTL_MS = 8000;
export const RESOURCE_POOL_TTL_MS = 60000;
export const CATEGORY_ORDER = ['boss', 'elite', 'veteran', 'basic'];
export const CATEGORY_CONFIG = {
    basic: {
        emoji: 'ðŸ¾',
        levelBonusMin: -1,
        levelBonusMax: 1,
        hpMultiplier: 1,
        attackMultiplier: 1,
        defenseMultiplier: 1,
        xpMultiplier: 6,
        coinChanceMin: 18,
        coinChanceMax: 54,
        respawnMinSeconds: 70,
        respawnMaxSeconds: 220,
        dropBonus: 0,
    },
    veteran: {
        emoji: 'âš”ï¸',
        levelBonusMin: 1,
        levelBonusMax: 3,
        hpMultiplier: 1.34,
        attackMultiplier: 1.2,
        defenseMultiplier: 1.16,
        xpMultiplier: 10,
        coinChanceMin: 40,
        coinChanceMax: 76,
        respawnMinSeconds: 150,
        respawnMaxSeconds: 420,
        dropBonus: 8,
    },
    elite: {
        emoji: 'ðŸ‘¹',
        levelBonusMin: 3,
        levelBonusMax: 6,
        hpMultiplier: 1.72,
        attackMultiplier: 1.42,
        defenseMultiplier: 1.35,
        xpMultiplier: 16,
        coinChanceMin: 65,
        coinChanceMax: 92,
        respawnMinSeconds: 360,
        respawnMaxSeconds: 1200,
        dropBonus: 16,
    },
    boss: {
        emoji: 'â˜ ï¸',
        levelBonusMin: 6,
        levelBonusMax: 10,
        hpMultiplier: 2.55,
        attackMultiplier: 1.86,
        defenseMultiplier: 1.7,
        xpMultiplier: 28,
        coinChanceMin: 100,
        coinChanceMax: 100,
        respawnMinSeconds: 1200,
        respawnMaxSeconds: 7200,
        dropBonus: 28,
    },
};
export const CATEGORY_WEIGHTS_BY_ZONE = {
    core: { basic: 82, veteran: 15, elite: 3, boss: 0 },
    inner: { basic: 70, veteran: 20, elite: 9, boss: 1 },
    middle: { basic: 56, veteran: 25, elite: 15, boss: 4 },
    outer: { basic: 45, veteran: 27, elite: 20, boss: 8 },
    frontier: { basic: 35, veteran: 30, elite: 22, boss: 13 },
};
export const BIOME_PRESENCE_CHANCE = {
    forest: 0.72,
    swamp: 0.67,
    plains: 0.64,
    river: 0.58,
    lake: 0.56,
    volcano: 0.59,
    ashlands: 0.57,
    highlands: 0.63,
    desert: 0.5,
    tundra: 0.55,
};
export const BIOME_MAX_PACK_SIZE = {
    forest: 3,
    swamp: 3,
    plains: 3,
    river: 2,
    lake: 2,
    volcano: 2,
    ashlands: 2,
    highlands: 3,
    desert: 2,
    tundra: 2,
};
export const BIOME_SPECIES = {
    forest: ['Lobo', 'Jabali', 'Cuervo', 'AraÃ±a Corteza', 'Ciervo Gris', 'Bestia Musgo'],
    swamp: ['Sapo Venenoso', 'Babosa Negra', 'Serpiente Fango', 'Acechador Turbio', 'Mosca Daga'],
    plains: ['Zorro de Prado', 'Carnero Salvaje', 'Halcon Bajo', 'Jabalina', 'Lince Dorado'],
    river: ['Pez Diente', 'Anguila de Cauce', 'Nutria Feroz', 'Cangrejo Roca', 'PiraÃ±a Rill'],
    lake: ['Raya Lacustre', 'Carpa Titan', 'Nimbo Escama', 'Garra de Agua', 'Mordedor Azul'],
    volcano: ['Sabueso Ceniza', 'Escorpion Lava', 'Draco Brasa', 'Golem Escoria', 'Murcielago Fuego'],
    ashlands: ['Hiena Ceniza', 'Cuervo Carbon', 'Bestia Escoria', 'Arana Humo', 'Chacal Obsidiana'],
    highlands: ['Cabra Acero', 'Lobo Cumbre', 'Aguila Pedernal', 'Raptor Colina', 'Bisonte Roca'],
    desert: ['Escorpion Seco', 'Coyote Duna', 'Vibora Arena', 'Buitre Sol', 'Reptil Espina'],
    tundra: ['Lobo Nieve', 'Caribu Sombrio', 'Oso Escarcha', 'Raptor Hielo', 'Zorro Blanco'],
};
export const CATEGORY_PREFIX = {
    basic: ['Errante', 'Feral', 'Salvaje', 'HuraÃ±o', 'Rasposo'],
    veteran: ['Veterano', 'Acechante', 'Sombrio', 'Curtido', 'Rencoroso'],
    elite: ['Alfa', 'Ancestral', 'Implacable', 'Sanguinario', 'Voraz'],
    boss: ['SeÃ±or', 'Titan', 'Devorador', 'Archimonstruo', 'Condenador'],
};
export const BIOME_ATTRIBUTE_BONUS = {
    forest: { dex: 2, agi: 2, vit: 1 },
    swamp: { vit: 2, eng: 2, intelligence: 1 },
    plains: { str: 2, agi: 2, dex: 1 },
    river: { dex: 2, eng: 2, agi: 1 },
    lake: { dex: 1, intelligence: 2, eng: 2 },
    volcano: { str: 2, vit: 2, intelligence: 2 },
    ashlands: { vit: 2, str: 2, eng: 1 },
    highlands: { vit: 2, str: 2, agi: 1 },
    desert: { agi: 2, dex: 2, eng: 1 },
    tundra: { vit: 2, str: 1, intelligence: 2 },
};
//# sourceMappingURL=creatures-config.js.map