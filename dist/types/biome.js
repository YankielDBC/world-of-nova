// ============================================
// WORLD OF NOVA - BIOME SYSTEM TYPES
// ============================================
import { EMOJIS } from '../data/emojis';
// ============================================
// BIOME CONFIGURATION
// ============================================
export const BIOMES = {
    // ============================================
    // FOREST BIOME
    // ============================================
    forest: {
        id: 'forest',
        name: 'Forest',
        emoji: EMOJIS.biome.forest,
        dropTable: [
            // Pine (40%)
            { item: 'Wood', emoji: EMOJIS.items.wood, minQty: 1, maxQty: 3, chance: 90, rarity: 'common' },
            { item: 'Pine Cone', emoji: EMOJIS.items.pineCone, minQty: 1, maxQty: 1, chance: 10, rarity: 'rare' },
            // Fruit Tree (30%)
            { item: 'Wood', emoji: EMOJIS.items.wood, minQty: 1, maxQty: 1, chance: 100, rarity: 'common' },
            { item: 'Apple', emoji: EMOJIS.items.apple, minQty: 1, maxQty: 2, chance: 40, rarity: 'common' },
            { item: 'Orange', emoji: EMOJIS.items.orange, minQty: 1, maxQty: 2, chance: 30, rarity: 'uncommon' },
            { item: 'Mango', emoji: EMOJIS.items.mango, minQty: 1, maxQty: 1, chance: 20, rarity: 'rare' },
            // Palm (20%)
            { item: 'Wood', emoji: EMOJIS.items.wood, minQty: 2, maxQty: 3, chance: 100, rarity: 'common' },
            { item: 'Coconut', emoji: EMOJIS.items.coconut, minQty: 1, maxQty: 1, chance: 80, rarity: 'common' },
            // Cactus (5%)
            { item: 'Water', emoji: EMOJIS.items.water, minQty: 1, maxQty: 2, chance: 100, rarity: 'uncommon' },
            // Bamboo (2%)
            { item: 'Bamboo', emoji: EMOJIS.items.bamboo, minQty: 2, maxQty: 4, chance: 100, rarity: 'uncommon' },
            // Dead Tree (3%)
            { item: 'Wood', emoji: EMOJIS.items.wood, minQty: 2, maxQty: 4, chance: 70, rarity: 'common' },
            { item: 'Ancient Wood', emoji: EMOJIS.items.ancientWood, minQty: 1, maxQty: 2, chance: 30, rarity: 'rare' },
        ],
    },
    // ============================================
    // SWAMP BIOME
    // ============================================
    swamp: {
        id: 'swamp',
        name: 'Swamp',
        emoji: EMOJIS.biome.swamp,
        dropTable: [
            // Hongos (30%)
            { item: 'Champiñón', emoji: EMOJIS.items.champinon, minQty: 2, maxQty: 4, chance: 100, rarity: 'common' },
            // Charco Baba (25%)
            { item: 'Baba Verde', emoji: EMOJIS.items.babaVerde, minQty: 1, maxQty: 3, chance: 100, rarity: 'common' },
            // Hierbas (20%)
            { item: 'Hierbas', emoji: EMOJIS.items.hierba, minQty: 2, maxQty: 4, chance: 100, rarity: 'common' },
            // Insectos (15%)
            { item: 'Insectos', emoji: EMOJIS.items.insectos, minQty: 2, maxQty: 4, chance: 100, rarity: 'uncommon' },
            // Barro (5%)
            { item: 'Barro', emoji: EMOJIS.items.barro, minQty: 1, maxQty: 2, chance: 100, rarity: 'common' },
            // Hongos Mágicos (3%)
            { item: 'Champiñón Mágico', emoji: EMOJIS.items.champinonMagico, minQty: 1, maxQty: 1, chance: 100, rarity: 'rare' },
            // Restos Ancestrales (1%)
            { item: 'Hueso', emoji: EMOJIS.items.huesped, minQty: 1, maxQty: 1, chance: 50, rarity: 'rare' },
            { item: 'Ámbar', emoji: EMOJIS.items.ambar, minQty: 1, maxQty: 1, chance: 30, rarity: 'epic' },
            { item: 'Ojo Ancestral', emoji: EMOJIS.items.ojoAncestral, minQty: 1, maxQty: 1, chance: 20, rarity: 'legendary' },
            // Nido Arañas (1%)
            { item: 'Seda', emoji: EMOJIS.items.seda, minQty: 1, maxQty: 3, chance: 100, rarity: 'uncommon' },
        ],
    },
    // ============================================
    // PLAINS BIOME
    // ============================================
    plains: {
        id: 'plains',
        name: 'Plains',
        emoji: EMOJIS.biome.plains,
        dropTable: [
            // Campo de Trigo (30%)
            { item: 'Trigo', emoji: EMOJIS.items.trigo, minQty: 2, maxQty: 5, chance: 100, rarity: 'common' },
            { item: 'Semillas', emoji: EMOJIS.items.semillas, minQty: 1, maxQty: 3, chance: 60, rarity: 'common' },
            { item: 'Hierbas', emoji: EMOJIS.items.hierba, minQty: 1, maxQty: 2, chance: 40, rarity: 'common' },
            // Hierbazal (25%)
            { item: 'Hierba', emoji: EMOJIS.items.hierba, minQty: 2, maxQty: 4, chance: 90, rarity: 'common' },
            { item: 'FlorDragón', emoji: EMOJIS.items.florDragon, minQty: 1, maxQty: 1, chance: 10, rarity: 'rare' },
            // Flor Dragón (15%)
            { item: 'FlorDragón', emoji: EMOJIS.items.florDragon, minQty: 1, maxQty: 2, chance: 100, rarity: 'rare' },
            // Flores Amarillas (15%)
            { item: 'Flores', emoji: EMOJIS.items.flores, minQty: 3, maxQty: 6, chance: 100, rarity: 'common' },
            // Girasoles (10%)
            { item: 'Girasol', emoji: EMOJIS.items.girasol, minQty: 1, maxQty: 3, chance: 100, rarity: 'uncommon' },
            // Hierbas Secas (3%)
            { item: 'Hierbas Secas', emoji: EMOJIS.items.hierbasSecas, minQty: 2, maxQty: 4, chance: 100, rarity: 'common' },
            // Hojas de Viento (2%)
            { item: 'Hojas de Viento', emoji: EMOJIS.items.hojasViento, minQty: 1, maxQty: 2, chance: 100, rarity: 'epic' },
        ],
    },
    // ============================================
    // VOLCANO BIOME
    // ============================================
    volcano: {
        id: 'volcano',
        name: 'Volcano',
        emoji: EMOJIS.biome.volcano,
        dropTable: [
            // Lava Flow (40%)
            { item: 'Roca Volcánica', emoji: EMOJIS.items.rocaVolcanica, minQty: 1, maxQty: 3, chance: 80, rarity: 'common' },
            { item: 'Cenizas', emoji: EMOJIS.items.cenizas, minQty: 2, maxQty: 4, chance: 20, rarity: 'common' },
            // Volcanic Rock (35%)
            { item: 'Roca Volcánica', emoji: EMOJIS.items.rocaVolcanica, minQty: 2, maxQty: 4, chance: 100, rarity: 'common' },
            // Volcanic Ash (25%)
            { item: 'Cenizas', emoji: EMOJIS.items.cenizas, minQty: 3, maxQty: 5, chance: 70, rarity: 'common' },
            { item: 'Carbón', emoji: EMOJIS.items.carbon, minQty: 1, maxQty: 2, chance: 30, rarity: 'uncommon' },
        ],
    },
    // ============================================
    // RIVER BIOME
    // ============================================
    river: {
        id: 'river',
        name: 'River',
        emoji: '🌊',
        dropTable: [
            // Shallow Water (40%)
            { item: 'Agua', emoji: EMOJIS.items.water, minQty: 2, maxQty: 4, chance: 100, rarity: 'common' },
            // Yellow Fish School (35%)
            { item: 'Pez Amarillo', emoji: EMOJIS.items.pezAmarillo, minQty: 1, maxQty: 3, chance: 100, rarity: 'common' },
            // Blue Fish School (25%)
            { item: 'Pez Azul', emoji: EMOJIS.items.pezAzul, minQty: 1, maxQty: 2, chance: 50, rarity: 'uncommon' },
            { item: 'Agua', emoji: EMOJIS.items.water, minQty: 1, maxQty: 2, chance: 50, rarity: 'common' },
        ],
    },
};
export const BIOME_ENCOUNTERS = {
    forest: [
        { emoji: EMOJIS.forest.pine, name: 'Pine', biomeId: 'forest', chance: 40 },
        { emoji: EMOJIS.forest.fruitTree, name: 'Fruit Tree', biomeId: 'forest', chance: 30 },
        { emoji: EMOJIS.forest.palm, name: 'Palm', biomeId: 'forest', chance: 20 },
        { emoji: EMOJIS.forest.cactus, name: 'Cactus', biomeId: 'forest', chance: 5 },
        { emoji: EMOJIS.forest.bamboo, name: 'Bamboo', biomeId: 'forest', chance: 2 },
        { emoji: EMOJIS.forest.deadTree, name: 'Dead Tree', biomeId: 'forest', chance: 3 },
    ],
    swamp: [
        { emoji: EMOJIS.swamp.hongos, name: 'Hongos', biomeId: 'swamp', chance: 30 },
        { emoji: EMOJIS.swamp.charcoBaba, name: 'Charco Baba', biomeId: 'swamp', chance: 25 },
        { emoji: EMOJIS.swamp.hierbas, name: 'Hierbas', biomeId: 'swamp', chance: 20 },
        { emoji: EMOJIS.swamp.insectos, name: 'Insectos', biomeId: 'swamp', chance: 15 },
        { emoji: EMOJIS.swamp.barro, name: 'Barro', biomeId: 'swamp', chance: 5 },
        { emoji: EMOJIS.swamp.hongosMagicos, name: 'Hongos Mágicos', biomeId: 'swamp', chance: 3 },
        { emoji: EMOJIS.swamp.restosAncestrales, name: 'Restos Ancestrales', biomeId: 'swamp', chance: 1 },
        { emoji: EMOJIS.swamp.nidoAranas, name: 'Nido Arañas', biomeId: 'swamp', chance: 1 },
    ],
    plains: [
        { emoji: EMOJIS.plains.campoTrigo, name: 'Campo de Trigo', biomeId: 'plains', chance: 30 },
        { emoji: EMOJIS.plains.herbazal, name: 'Hierbazal', biomeId: 'plains', chance: 25 },
        { emoji: EMOJIS.plains.florDragon, name: 'Flor Dragón', biomeId: 'plains', chance: 15 },
        { emoji: EMOJIS.plains.floresAmarillas, name: 'Flores Amarillas', biomeId: 'plains', chance: 15 },
        { emoji: EMOJIS.plains.girasoles, name: 'Girasoles', biomeId: 'plains', chance: 10 },
        { emoji: EMOJIS.plains.hierbasSecas, name: 'Hierbas Secas', biomeId: 'plains', chance: 3 },
        { emoji: EMOJIS.plains.hojasViento, name: 'Hojas de Viento', biomeId: 'plains', chance: 2 },
    ],
    volcano: [
        { emoji: EMOJIS.biome.volcano, name: 'Lava Flow', biomeId: 'volcano', chance: 40 },
        { emoji: EMOJIS.volcano.volcanicRock, name: 'Volcanic Rock', biomeId: 'volcano', chance: 35 },
        { emoji: EMOJIS.volcano.volcanicAsh, name: 'Volcanic Ash', biomeId: 'volcano', chance: 25 },
    ],
    river: [
        { emoji: EMOJIS.river.shallowWater, name: 'Shallow Water', biomeId: 'river', chance: 40 },
        { emoji: EMOJIS.river.yellowFish, name: 'Yellow Fish', biomeId: 'river', chance: 35 },
        { emoji: EMOJIS.river.blueFish, name: 'Blue Fish', biomeId: 'river', chance: 25 },
    ],
};
