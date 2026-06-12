// ============================================
// WORLD OF NOVA - TOOLS SYSTEM
// ============================================
import { EMOJIS } from '../data/emojis.js';
export const TOOLS = {
    canapez: {
        id: 'canapez',
        name: 'Cana de Bambu',
        emoji: EMOJIS.tools.canapez,
        type: 'fishing',
        rarity: 'common',
        description: 'Una cana ligera para sacar presas del rio.',
        weightKg: 1.2,
        baseValue: 22,
        slotCost: 1,
        stackable: false,
        maxStack: 1,
        durabilityMax: 70,
        targets: ['river', 'beach'],
    },
    hachaPiedra: {
        id: 'hachaPiedra',
        name: 'Hacha de Piedra',
        emoji: EMOJIS.tools.hachaPiedra,
        type: 'woodcutting',
        rarity: 'common',
        description: 'Un filo tosco, util para madera joven.',
        weightKg: 2.1,
        baseValue: 28,
        slotCost: 1,
        stackable: false,
        maxStack: 1,
        durabilityMax: 85,
        targets: ['forest'],
    },
    picoPiedra: {
        id: 'picoPiedra',
        name: 'Pico de Piedra',
        emoji: EMOJIS.tools.picoPiedra,
        type: 'mining',
        rarity: 'common',
        description: 'Herramienta pesada para roca y veta rustica.',
        weightKg: 2.8,
        baseValue: 32,
        slotCost: 1,
        stackable: false,
        maxStack: 1,
        durabilityMax: 95,
        targets: ['volcano', 'mountain', 'cave'],
    },
    basket: {
        id: 'basket',
        name: 'Tijera de Piedra',
        emoji: EMOJIS.tools.canastaPaja,
        type: 'gathering',
        rarity: 'common',
        description: 'Herramienta de recoleccion para cortar brotes y plantas.',
        weightKg: 0.7,
        baseValue: 16,
        slotCost: 1,
        stackable: false,
        maxStack: 1,
        durabilityMax: 60,
        targets: ['forest', 'plains', 'swamp'],
    },
    varaMadera: {
        id: 'varaMadera',
        name: 'Vara de Madera',
        emoji: EMOJIS.tools.VaraMadera,
        type: 'harvesting',
        rarity: 'common',
        description: 'Permite alcanzar ramas altas sin trepar.',
        weightKg: 0.9,
        baseValue: 18,
        slotCost: 1,
        stackable: false,
        maxStack: 1,
        durabilityMax: 65,
        targets: ['forest', 'plains'],
    },
};
export function getToolsByType(type) {
    return Object.values(TOOLS).filter((tool) => tool.type === type);
}
export function getToolById(toolId) {
    return TOOLS[toolId];
}
