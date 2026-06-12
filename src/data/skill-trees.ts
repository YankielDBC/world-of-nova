// @ts-nocheck
const CLASS_SKILLS = [
    {
        key: 'ch_marked_strike',
        family: 'class',
        classKey: 'curse_hunter',
        type: 'passive',
        category: 'offense',
        maxRank: 3,
        costPerRank: 1,
        sortOrder: 10,
        name: { es: 'Marca Letal', en: 'Lethal Mark', ru: 'Smertelnaya Metka' },
        summary: { es: 'Sube ataque y crítico.', en: 'Raises attack and crit.', ru: 'Povyshaet ataku i krit.' },
        passiveEffectsPerRank: {
            combatModifiers: {
                attackPct: 0.015,
                critChanceFlat: 0.4,
            },
        },
    },
    {
        key: 'ch_grim_footwork',
        family: 'class',
        classKey: 'curse_hunter',
        type: 'passive',
        category: 'mobility',
        maxRank: 3,
        costPerRank: 1,
        sortOrder: 20,
        name: { es: 'Juego de Piernas', en: 'Grim Footwork', ru: 'Mrachnaya Rabota Nog' },
        summary: { es: 'Evasión y movilidad.', en: 'Evasion and mobility.', ru: 'Uklonenie i mobilnost.' },
        passiveEffectsPerRank: {
            combatModifiers: {
                evasionFlat: 0.7,
                moveSpeedPct: 0.008,
            },
            travelTimeMultiplierDelta: -0.02,
        },
    },
    {
        key: 'ch_last_stand',
        family: 'class',
        classKey: 'curse_hunter',
        type: 'passive',
        category: 'defense',
        maxRank: 2,
        costPerRank: 1,
        sortOrder: 30,
        name: { es: 'Última Guardia', en: 'Last Stand Guard', ru: 'Poslednyaya Zashchita' },
        summary: { es: 'Al bajar de 50% HP ganas defensa.', en: 'Below 50% HP you gain defense.', ru: 'Nizhe 50% HP poluchaesh zashchitu.' },
        conditionalEffectsPerRank: [
            {
                condition: { hpBelowPct: 50 },
                effects: {
                    combatModifiers: {
                        defensePct: 0.03,
                        resistPhysicalFlat: 1,
                    },
                },
            },
        ],
    },
    {
        key: 'ch_shadow_lunge',
        family: 'class',
        classKey: 'curse_hunter',
        type: 'active',
        category: 'offense',
        maxRank: 1,
        costPerRank: 2,
        sortOrder: 40,
        name: { es: 'Zarpazo Sombrío', en: 'Shadow Lunge', ru: 'Tenevoy Ryvok' },
        summary: { es: 'Buff temporal de daño y velocidad.', en: 'Temporary damage and speed buff.', ru: 'Vremennyy buff urona i skorosti.' },
        activeConfig: {
            cooldownSeconds: 40,
            castSeconds: 2,
            durationSeconds: 18,
            effects: {
                combatModifiers: {
                    attackPct: 0.05,
                    moveSpeedPct: 0.04,
                },
            },
        },
    },
    {
        key: 'ch_counterwire',
        family: 'class',
        classKey: 'curse_hunter',
        type: 'reaction',
        category: 'reaction',
        maxRank: 1,
        costPerRank: 1,
        sortOrder: 50,
        name: { es: 'Cable de Respuesta', en: 'Counterwire', ru: 'Provod Otveta' },
        summary: { es: 'Si esquivas crítico, contraatacas gratis.', en: 'If you evade a crit, free counter response.', ru: 'Pri uklonenii ot krita besplatnaya kontratakа.' },
        reactionConfig: {
            event: 'on_crit_evaded',
            cooldownSeconds: 25,
            durationSeconds: 8,
            effects: {
                combatModifiers: {
                    attackPct: 0.04,
                    critChanceFlat: 1.2,
                },
                counterAttackRatio: 0.35,
            },
        },
    },
    {
        key: 'ch_iron_oath',
        family: 'class',
        classKey: 'curse_hunter',
        type: 'keystone',
        category: 'keystone',
        maxRank: 1,
        costPerRank: 2,
        sortOrder: 60,
        name: { es: 'Juramento de Hierro', en: 'Iron Oath', ru: 'Zheleznaya Klyatva' },
        summary: { es: 'Keystone balanceado de daño/defensa.', en: 'Balanced offense/defense keystone.', ru: 'Sbansirovannyy keystone uron/zashchita.' },
        passiveEffectsFlat: {
            combatModifiers: {
                attackPct: 0.02,
                defensePct: 0.04,
                resistPhysicalFlat: 1,
            },
        },
    },
    {
        key: 'ar_focus_lattice',
        family: 'class',
        classKey: 'arcane',
        type: 'passive',
        category: 'offense',
        maxRank: 3,
        costPerRank: 1,
        sortOrder: 110,
        name: { es: 'Malla de Foco', en: 'Focus Lattice', ru: 'Reshetka Fokusa' },
        summary: { es: 'Potencia arcana y crítico.', en: 'Arcane power and crit.', ru: 'Arkan-sila i krit.' },
        passiveEffectsPerRank: {
            combatModifiers: {
                arcanePct: 0.015,
                critChanceFlat: 0.35,
            },
        },
    },
    {
        key: 'ar_mana_veil',
        family: 'class',
        classKey: 'arcane',
        type: 'passive',
        category: 'defense',
        maxRank: 2,
        costPerRank: 1,
        sortOrder: 120,
        name: { es: 'Velo de Maná', en: 'Mana Veil', ru: 'Mana-Vual' },
        summary: { es: 'Mitigación ligera + resistencia arcana.', en: 'Light mitigation + arcane resist.', ru: 'Legkaya zashchita + arkan-soprota.' },
        passiveEffectsPerRank: {
            combatModifiers: {
                defensePct: 0.015,
                resistArcaneFlat: 1,
            },
        },
    },
    {
        key: 'ar_arcane_overflow',
        family: 'class',
        classKey: 'arcane',
        type: 'passive',
        category: 'offense',
        maxRank: 2,
        costPerRank: 1,
        sortOrder: 130,
        name: { es: 'Desborde Arcano', en: 'Arcane Overflow', ru: 'Arkan-Perepolnenie' },
        summary: { es: 'Con STA alta sube poder arcano.', en: 'With high STA, arcane rises.', ru: 'Pri vysokoy STA arkan-rastet.' },
        conditionalEffectsPerRank: [
            {
                condition: { staAbovePct: 70 },
                effects: {
                    combatModifiers: {
                        arcanePct: 0.02,
                    },
                },
            },
        ],
    },
    {
        key: 'ar_ether_burst',
        family: 'class',
        classKey: 'arcane',
        type: 'active',
        category: 'offense',
        maxRank: 1,
        costPerRank: 2,
        sortOrder: 140,
        name: { es: 'Ráfaga Éter', en: 'Ether Burst', ru: 'Efirnyy Vzryv' },
        summary: { es: 'Impulso arcano temporal.', en: 'Temporary arcane surge.', ru: 'Vremennyy arkan-impuls.' },
        activeConfig: {
            cooldownSeconds: 35,
            castSeconds: 1,
            durationSeconds: 12,
            effects: {
                combatModifiers: {
                    arcanePct: 0.08,
                    atkSpeedPct: 0.03,
                },
            },
        },
    },
    {
        key: 'ar_spell_reflex',
        family: 'class',
        classKey: 'arcane',
        type: 'reaction',
        category: 'reaction',
        maxRank: 1,
        costPerRank: 1,
        sortOrder: 150,
        name: { es: 'Reflejo de Hechizo', en: 'Spell Reflex', ru: 'Refleks Zaklinaniya' },
        summary: { es: 'Al bloquear crítico ganas ventana ofensiva.', en: 'On crit block you gain offense window.', ru: 'Pri bloke krita poluchaesh okno urona.' },
        reactionConfig: {
            event: 'on_crit_blocked',
            cooldownSeconds: 28,
            durationSeconds: 8,
            effects: {
                combatModifiers: {
                    arcanePct: 0.05,
                    attackPct: 0.02,
                },
            },
        },
    },
    {
        key: 'ar_void_pact',
        family: 'class',
        classKey: 'arcane',
        type: 'keystone',
        category: 'keystone',
        maxRank: 1,
        costPerRank: 2,
        sortOrder: 160,
        name: { es: 'Pacto del Vacío', en: 'Void Pact', ru: 'Pakt Pustoty' },
        summary: { es: 'Keystone explosivo arcano.', en: 'Explosive arcane keystone.', ru: 'Vzryvnoy arkan-keystone.' },
        passiveEffectsFlat: {
            combatModifiers: {
                arcanePct: 0.05,
                critChanceFlat: 1.2,
            },
            actionEnergyCostMultiplierDelta: {
                mine: -0.04,
                gather: -0.03,
            },
        },
    },
    {
        key: 'dd_bark_flesh',
        family: 'class',
        classKey: 'dark_druid',
        type: 'passive',
        category: 'defense',
        maxRank: 3,
        costPerRank: 1,
        sortOrder: 210,
        name: { es: 'Carne de Corteza', en: 'Bark Flesh', ru: 'Plot Korы' },
        summary: { es: 'Más vida y defensa base.', en: 'Higher base HP and defense.', ru: 'Bolse bazovykh HP i zashchity.' },
        passiveEffectsPerRank: {
            combatModifiers: {
                maxHpFlat: 7,
                defensePct: 0.01,
            },
        },
    },
    {
        key: 'dd_rooted_stride',
        family: 'class',
        classKey: 'dark_druid',
        type: 'passive',
        category: 'mobility',
        maxRank: 2,
        costPerRank: 1,
        sortOrder: 220,
        name: { es: 'Paso Enraizado', en: 'Rooted Stride', ru: 'Ukorenyonnyy Shag' },
        summary: { es: 'Viaje más estable en STA/tiempo.', en: 'More stable travel STA/time.', ru: 'Stabilnee puteshestvie po STA/vremeni.' },
        passiveEffectsPerRank: {
            travelStaminaCostMultiplierDelta: -0.04,
            travelTimeMultiplierDelta: -0.03,
            combatModifiers: {
                moveSpeedPct: 0.01,
            },
        },
    },
    {
        key: 'dd_thorn_guard',
        family: 'class',
        classKey: 'dark_druid',
        type: 'passive',
        category: 'defense',
        maxRank: 2,
        costPerRank: 1,
        sortOrder: 230,
        name: { es: 'Guardia de Espinas', en: 'Thorn Guard', ru: 'Shypovaya Strazha' },
        summary: { es: 'Con HP bajo, defensa extra.', en: 'At low HP, extra defense.', ru: 'Pri nizkom HP dop. zashchita.' },
        conditionalEffectsPerRank: [
            {
                condition: { hpBelowPct: 50 },
                effects: {
                    combatModifiers: {
                        defensePct: 0.03,
                        resistPhysicalFlat: 1,
                    },
                },
            },
        ],
    },
    {
        key: 'dd_wild_regrowth',
        family: 'class',
        classKey: 'dark_druid',
        type: 'active',
        category: 'utility',
        maxRank: 1,
        costPerRank: 2,
        sortOrder: 240,
        name: { es: 'Regrowth Salvaje', en: 'Wild Regrowth', ru: 'Dikoe Vosstanovlenie' },
        summary: { es: 'Aumenta regeneración y aguante temporal.', en: 'Temporary regen and endurance increase.', ru: 'Vremennyy rost regenki i vyzhivaemosti.' },
        activeConfig: {
            cooldownSeconds: 50,
            castSeconds: 3,
            durationSeconds: 20,
            effects: {
                passiveStaRegenBonusDelta: 1,
                combatModifiers: {
                    maxHpFlat: 10,
                    defensePct: 0.03,
                },
            },
        },
    },
    {
        key: 'dd_thorn_rebound',
        family: 'class',
        classKey: 'dark_druid',
        type: 'reaction',
        category: 'reaction',
        maxRank: 1,
        costPerRank: 1,
        sortOrder: 250,
        name: { es: 'Rebote de Espinas', en: 'Thorn Rebound', ru: 'Shypovyy Otkat' },
        summary: { es: 'Tras recibir golpe crítico, contraefecto.', en: 'After taking a crit, counter effect.', ru: 'Posle polucheniya krita - kontr-эффект.' },
        reactionConfig: {
            event: 'on_crit_taken',
            cooldownSeconds: 32,
            durationSeconds: 10,
            effects: {
                combatModifiers: {
                    defensePct: 0.05,
                },
                counterAttackRatio: 0.25,
            },
        },
    },
    {
        key: 'dd_heartwood_core',
        family: 'class',
        classKey: 'dark_druid',
        type: 'keystone',
        category: 'keystone',
        maxRank: 1,
        costPerRank: 2,
        sortOrder: 260,
        name: { es: 'Núcleo de Duramen', en: 'Heartwood Core', ru: 'Yadro Serdtse-Dereva' },
        summary: { es: 'Keystone tanque/sustain.', en: 'Tank/sustain keystone.', ru: 'Tank/sustain keystone.' },
        passiveEffectsFlat: {
            combatModifiers: {
                maxHpFlat: 18,
                defensePct: 0.04,
            },
            passiveStaRegenBonusDelta: 1,
        },
    },
    {
        key: 'alx_precision_mix',
        family: 'class',
        classKey: 'alchemist_rogue',
        type: 'passive',
        category: 'offense',
        maxRank: 3,
        costPerRank: 1,
        sortOrder: 310,
        name: { es: 'Mezcla Precisa', en: 'Precision Mix', ru: 'Tochnaya Smes' },
        summary: { es: 'Crítico y daño estable.', en: 'Crit and stable damage.', ru: 'Krit i stabilnyy uron.' },
        passiveEffectsPerRank: {
            combatModifiers: {
                critChanceFlat: 0.5,
                attackPct: 0.01,
            },
        },
    },
    {
        key: 'alx_volatile_step',
        family: 'class',
        classKey: 'alchemist_rogue',
        type: 'passive',
        category: 'mobility',
        maxRank: 3,
        costPerRank: 1,
        sortOrder: 320,
        name: { es: 'Paso Volátil', en: 'Volatile Step', ru: 'Volatilnyy Shag' },
        summary: { es: 'Movilidad y evasión.', en: 'Mobility and evasion.', ru: 'Mobilnost i uklonenie.' },
        passiveEffectsPerRank: {
            combatModifiers: {
                moveSpeedPct: 0.01,
                evasionFlat: 0.6,
            },
            travelTimeMultiplierDelta: -0.02,
        },
    },
    {
        key: 'alx_pain_converter',
        family: 'class',
        classKey: 'alchemist_rogue',
        type: 'passive',
        category: 'offense',
        maxRank: 2,
        costPerRank: 1,
        sortOrder: 330,
        name: { es: 'Conversor de Dolor', en: 'Pain Converter', ru: 'Konverter Boli' },
        summary: { es: 'Con HP bajo, sube ofensiva.', en: 'At low HP, offense increases.', ru: 'Pri nizkom HP rastet ofensiva.' },
        conditionalEffectsPerRank: [
            {
                condition: { hpBelowPct: 50 },
                effects: {
                    combatModifiers: {
                        attackPct: 0.02,
                        arcanePct: 0.02,
                    },
                },
            },
        ],
    },
    {
        key: 'alx_smoke_vial',
        family: 'class',
        classKey: 'alchemist_rogue',
        type: 'active',
        category: 'mobility',
        maxRank: 1,
        costPerRank: 2,
        sortOrder: 340,
        name: { es: 'Vial de Humo', en: 'Smoke Vial', ru: 'Dymovoy Flakon' },
        summary: { es: 'Ventana de evasión/movilidad.', en: 'Evasion/mobility window.', ru: 'Okno ukloneniya/mobilnosti.' },
        activeConfig: {
            cooldownSeconds: 30,
            castSeconds: 0,
            durationSeconds: 14,
            effects: {
                combatModifiers: {
                    evasionFlat: 2,
                    moveSpeedPct: 0.05,
                },
            },
        },
    },
    {
        key: 'alx_auto_injector',
        family: 'class',
        classKey: 'alchemist_rogue',
        type: 'reaction',
        category: 'reaction',
        maxRank: 1,
        costPerRank: 1,
        sortOrder: 350,
        name: { es: 'Auto-Inyector', en: 'Auto Injector', ru: 'Avto-Inyektor' },
        summary: { es: 'Al recibir golpe fuerte, activas mitigación.', en: 'On heavy hit, mitigation turns on.', ru: 'Pri silnom udare vklyuchaetsya mitigatsiya.' },
        reactionConfig: {
            event: 'on_hit_taken',
            cooldownSeconds: 26,
            durationSeconds: 9,
            effects: {
                combatModifiers: {
                    defensePct: 0.04,
                    evasionFlat: 1.2,
                },
            },
            condition: {
                hpBelowPct: 70,
            },
        },
    },
    {
        key: 'alx_reactive_catalyst',
        family: 'class',
        classKey: 'alchemist_rogue',
        type: 'keystone',
        category: 'keystone',
        maxRank: 1,
        costPerRank: 2,
        sortOrder: 360,
        name: { es: 'Catalizador Reactivo', en: 'Reactive Catalyst', ru: 'Reaktivnyy Katalizator' },
        summary: { es: 'Keystone híbrido rápido.', en: 'Fast hybrid keystone.', ru: 'Bystryy gibridnyy keystone.' },
        passiveEffectsFlat: {
            combatModifiers: {
                attackPct: 0.03,
                moveSpeedPct: 0.03,
                critChanceFlat: 1,
            },
        },
    },
];
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
const SKILL_MAP = new Map([...CLASS_SKILLS, ...GENERAL_SKILLS].map((skill) => [skill.key, skill]));
export function getClassSkillDefinitions(classKey) {
    const normalized = String(classKey || '').trim().toLowerCase();
    return CLASS_SKILLS.filter((skill) => skill.classKey === normalized).sort((a, b) => a.sortOrder - b.sortOrder);
}
export function getGeneralSkillDefinitions() {
    return GENERAL_SKILLS.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}
export function getBuildSkillByKey(skillKeyRaw) {
    const key = String(skillKeyRaw || '').trim().toLowerCase();
    return SKILL_MAP.get(key) || null;
}
export function getClassSkillPointsForLevel(level) {
    const safeLevel = Math.max(1, Math.floor(level || 1));
    return Math.max(0, safeLevel - 1);
}
export function getGeneralSkillPointsForLevel(level) {
    const safeLevel = Math.max(1, Math.floor(level || 1));
    return safeLevel < 4 ? 0 : Math.floor((safeLevel - 3) / 2);
}
export function getLocalizedText3(text, lang) {
    if (lang === 'en')
        return text.en;
    if (lang === 'ru')
        return text.ru;
    return text.es;
}
