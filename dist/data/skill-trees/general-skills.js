// @ts-nocheck
const GENERAL_SKILLS = [
    {
        key: 'gen_athletic_form',
        family: 'general',
        type: 'passive',
        category: 'mobility',
        maxRank: 3,
        costPerRank: 1,
        sortOrder: 10,
        name: { es: 'Forma Atlética', en: 'Athletic Form', ru: 'Atleticheskaya Forma' },
        summary: { es: 'Velocidad y ritmo de combate.', en: 'Speed and combat rhythm.', ru: 'Skorost i temp boya.' },
        passiveEffectsPerRank: {
            combatModifiers: {
                moveSpeedPct: 0.008,
                atkSpeedPct: 0.01,
            },
            travelTimeMultiplierDelta: -0.015,
        },
    },
    {
        key: 'gen_pack_instinct',
        family: 'general',
        type: 'passive',
        category: 'utility',
        maxRank: 3,
        costPerRank: 1,
        sortOrder: 20,
        name: { es: 'Instinto de Carga', en: 'Pack Instinct', ru: 'Instinkt Gruza' },
        summary: { es: 'Más rendimiento de farmeo.', en: 'Higher farming output.', ru: 'Bolshiy vykhod farma.' },
        passiveEffectsPerRank: {
            actionYieldMultiplierDelta: {
                gather: 0.03,
                chop: 0.03,
            },
        },
    },
    {
        key: 'gen_stamina_discipline',
        family: 'general',
        type: 'passive',
        category: 'utility',
        maxRank: 3,
        costPerRank: 1,
        sortOrder: 30,
        name: { es: 'Disciplina de STA', en: 'Stamina Discipline', ru: 'Disciplinа STA' },
        summary: { es: 'Reduce coste STA de acciones.', en: 'Reduces action STA costs.', ru: 'Snizhaet rashod STA na deystviya.' },
        passiveEffectsPerRank: {
            actionEnergyCostMultiplierDelta: {
                gather: -0.03,
                chop: -0.02,
                mine: -0.02,
            },
        },
    },
    {
        key: 'gen_guarded_mind',
        family: 'general',
        type: 'passive',
        category: 'defense',
        maxRank: 2,
        costPerRank: 1,
        sortOrder: 40,
        name: { es: 'Mente Guardada', en: 'Guarded Mind', ru: 'Zashchishchennyy Razum' },
        summary: { es: 'Defensa y resistencias básicas.', en: 'Baseline defense and resistances.', ru: 'Bazovaya zashchita i soprotivleniya.' },
        passiveEffectsPerRank: {
            combatModifiers: {
                defensePct: 0.015,
                resistArcaneFlat: 1,
                resistElementalFlat: 1,
            },
        },
    },
    {
        key: 'gen_second_wind',
        family: 'general',
        type: 'passive',
        category: 'utility',
        maxRank: 2,
        costPerRank: 1,
        sortOrder: 50,
        name: { es: 'Segundo Aire', en: 'Second Wind', ru: 'Vtoroye Dykhanie' },
        summary: { es: 'Con STA baja, recuperas y gastas menos.', en: 'At low STA, recover and spend less.', ru: 'Pri nizkoy STA regenka i ekonomiya.' },
        conditionalEffectsPerRank: [
            {
                condition: { staBelowPct: 30 },
                effects: {
                    passiveStaRegenBonusDelta: 1,
                    travelStaminaCostMultiplierDelta: -0.04,
                    actionEnergyCostMultiplierDelta: {
                        gather: -0.03,
                        chop: -0.03,
                        mine: -0.03,
                        fish: -0.03,
                    },
                },
            },
        ],
    },
    {
        key: 'gen_emergency_shell',
        family: 'general',
        type: 'passive',
        category: 'defense',
        maxRank: 2,
        costPerRank: 1,
        sortOrder: 60,
        name: { es: 'Caparazón de Emergencia', en: 'Emergency Shell', ru: 'Avariynyy Panzir' },
        summary: { es: 'Al caer HP, escudo defensivo.', en: 'At low HP, defensive shell.', ru: 'Pri padeniи HP zashchitnyy panzir.' },
        conditionalEffectsPerRank: [
            {
                condition: { hpBelowPct: 35 },
                effects: {
                    combatModifiers: {
                        defensePct: 0.03,
                        maxHpFlat: 6,
                    },
                },
            },
        ],
    },
    {
        key: 'gen_battle_focus',
        family: 'general',
        type: 'active',
        category: 'offense',
        maxRank: 1,
        costPerRank: 2,
        sortOrder: 70,
        name: { es: 'Foco de Batalla', en: 'Battle Focus', ru: 'Boevoy Fokus' },
        summary: { es: 'Ventana ofensiva universal.', en: 'Universal offensive window.', ru: 'Universalnoe okno urona.' },
        activeConfig: {
            cooldownSeconds: 45,
            castSeconds: 1,
            durationSeconds: 15,
            effects: {
                combatModifiers: {
                    attackPct: 0.04,
                    arcanePct: 0.04,
                    critChanceFlat: 0.8,
                },
            },
        },
    },
    {
        key: 'gen_steady_heart',
        family: 'general',
        type: 'keystone',
        category: 'keystone',
        maxRank: 1,
        costPerRank: 2,
        sortOrder: 80,
        name: { es: 'Corazón Firme', en: 'Steady Heart', ru: 'Tverdoe Serdtse' },
        summary: { es: 'Keystone de estabilidad total.', en: 'Total stability keystone.', ru: 'Keystone polnoy stabilnosti.' },
        passiveEffectsFlat: {
            combatModifiers: {
                defensePct: 0.02,
                attackPct: 0.02,
                maxEnergyFlat: 8,
            },
            passiveStaRegenBonusDelta: 1,
        },
    },
];
export default GENERAL_SKILLS;
//# sourceMappingURL=general-skills.js.map