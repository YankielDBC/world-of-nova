const ACTIONS = ['gather', 'chop', 'mine', 'fish'];
const PERIOD_EMOJI = {
    dawn: '🌅',
    day: '☀️',
    dusk: '🌇',
    night: '🌙',
};
const PERIOD_LABELS = {
    es: { dawn: 'Amanecer', day: 'Dia', dusk: 'Atardecer', night: 'Noche' },
    en: { dawn: 'Dawn', day: 'Day', dusk: 'Dusk', night: 'Night' },
    ru: { dawn: 'Rassvet', day: 'Den', dusk: 'Sumerki', night: 'Noch' },
};
const DEFAULT_PERIOD_EFFECTS = {
    dawn: {
        spawnMultiplier: 1.06,
        yieldMultiplier: 1.05,
        energyCostMultiplier: 1.0,
        actionSpawnMultiplier: { gather: 1.08, fish: 1.08 },
    },
    day: {
        spawnMultiplier: 1.0,
        yieldMultiplier: 1.0,
        energyCostMultiplier: 1.0,
    },
    dusk: {
        spawnMultiplier: 1.07,
        yieldMultiplier: 1.05,
        energyCostMultiplier: 1.0,
        actionSpawnMultiplier: { gather: 1.1, fish: 1.1 },
    },
    night: {
        spawnMultiplier: 0.9,
        yieldMultiplier: 1.1,
        energyCostMultiplier: 1.12,
        actionYieldMultiplier: { gather: 1.12, fish: 1.12 },
    },
};
const BIOME_PERIOD_EFFECTS = {
    river: {
        dawn: { spawnMultiplier: 1.15, yieldMultiplier: 1.1, actionSpawnMultiplier: { fish: 1.2, gather: 1.1 } },
        day: { spawnMultiplier: 1.05, yieldMultiplier: 1.02, actionSpawnMultiplier: { fish: 1.12, gather: 1.08 } },
        dusk: { spawnMultiplier: 1.18, yieldMultiplier: 1.12, actionSpawnMultiplier: { fish: 1.24, gather: 1.1 } },
        night: {
            spawnMultiplier: 0.82,
            yieldMultiplier: 1.2,
            energyCostMultiplier: 1.15,
            actionSpawnMultiplier: { fish: 0.88, gather: 0.9 },
            actionYieldMultiplier: { fish: 1.25, gather: 1.14 },
            actionEnergyCostMultiplier: { fish: 1.08, gather: 1.08 },
        },
    },
    lake: {
        dawn: { spawnMultiplier: 1.12, yieldMultiplier: 1.1, actionSpawnMultiplier: { fish: 1.2, gather: 1.1 } },
        day: { spawnMultiplier: 1.04, yieldMultiplier: 1.02, actionSpawnMultiplier: { fish: 1.08, gather: 1.04 } },
        dusk: { spawnMultiplier: 1.14, yieldMultiplier: 1.12, actionSpawnMultiplier: { fish: 1.24, gather: 1.08 } },
        night: {
            spawnMultiplier: 0.86,
            yieldMultiplier: 1.2,
            energyCostMultiplier: 1.14,
            actionSpawnMultiplier: { fish: 0.9, gather: 0.92 },
            actionYieldMultiplier: { fish: 1.24, gather: 1.1 },
        },
    },
    forest: {
        dawn: { spawnMultiplier: 1.1, yieldMultiplier: 1.08, actionSpawnMultiplier: { gather: 1.16, chop: 1.04 } },
        day: { spawnMultiplier: 1.04, yieldMultiplier: 1.02, actionSpawnMultiplier: { chop: 1.12, gather: 1.02 } },
        dusk: { spawnMultiplier: 1.1, yieldMultiplier: 1.08, actionSpawnMultiplier: { gather: 1.12, chop: 1.04 } },
        night: {
            spawnMultiplier: 0.86,
            yieldMultiplier: 1.15,
            energyCostMultiplier: 1.14,
            actionSpawnMultiplier: { chop: 0.84, gather: 0.94 },
            actionYieldMultiplier: { gather: 1.2, chop: 1.08 },
        },
    },
    plains: {
        dawn: { spawnMultiplier: 1.12, yieldMultiplier: 1.08, actionSpawnMultiplier: { gather: 1.2 }, actionYieldMultiplier: { gather: 1.12 } },
        day: { spawnMultiplier: 1.03, yieldMultiplier: 1.01, actionSpawnMultiplier: { gather: 1.06 } },
        dusk: { spawnMultiplier: 1.14, yieldMultiplier: 1.08, actionSpawnMultiplier: { gather: 1.2 }, actionYieldMultiplier: { gather: 1.1 } },
        night: { spawnMultiplier: 0.8, yieldMultiplier: 1.16, energyCostMultiplier: 1.16, actionSpawnMultiplier: { gather: 0.86, chop: 0.9 }, actionYieldMultiplier: { gather: 1.2 } },
    },
    swamp: {
        dawn: { spawnMultiplier: 1.08, yieldMultiplier: 1.08, actionSpawnMultiplier: { gather: 1.12, fish: 1.1 } },
        day: { spawnMultiplier: 1.02, yieldMultiplier: 1.02, actionSpawnMultiplier: { gather: 1.04 } },
        dusk: { spawnMultiplier: 1.14, yieldMultiplier: 1.14, actionSpawnMultiplier: { gather: 1.18, fish: 1.14 }, actionYieldMultiplier: { gather: 1.12 } },
        night: {
            spawnMultiplier: 1.16,
            yieldMultiplier: 1.22,
            energyCostMultiplier: 1.14,
            actionSpawnMultiplier: { gather: 1.24, fish: 1.2 },
            actionYieldMultiplier: { gather: 1.2, fish: 1.16 },
            actionEnergyCostMultiplier: { gather: 1.08, fish: 1.08 },
        },
    },
    volcano: {
        dawn: { spawnMultiplier: 1.04, yieldMultiplier: 1.08, actionSpawnMultiplier: { mine: 1.1 }, actionYieldMultiplier: { mine: 1.12 } },
        day: {
            spawnMultiplier: 1.08,
            yieldMultiplier: 1.14,
            energyCostMultiplier: 1.08,
            actionSpawnMultiplier: { mine: 1.2 },
            actionYieldMultiplier: { mine: 1.16 },
            actionEnergyCostMultiplier: { mine: 1.1 },
        },
        dusk: { spawnMultiplier: 1.06, yieldMultiplier: 1.1, actionSpawnMultiplier: { mine: 1.12 }, actionYieldMultiplier: { mine: 1.1 } },
        night: {
            spawnMultiplier: 0.84,
            yieldMultiplier: 1.24,
            energyCostMultiplier: 1.2,
            actionSpawnMultiplier: { mine: 0.9 },
            actionYieldMultiplier: { mine: 1.28 },
            actionEnergyCostMultiplier: { mine: 1.15 },
        },
    },
    highlands: {
        dawn: { spawnMultiplier: 1.08, yieldMultiplier: 1.08, actionSpawnMultiplier: { mine: 1.14, chop: 1.06 } },
        day: { spawnMultiplier: 1.05, yieldMultiplier: 1.04, actionSpawnMultiplier: { mine: 1.12, chop: 1.06 } },
        dusk: { spawnMultiplier: 1.1, yieldMultiplier: 1.1, actionSpawnMultiplier: { mine: 1.16, gather: 1.06 } },
        night: { spawnMultiplier: 0.88, yieldMultiplier: 1.16, energyCostMultiplier: 1.14, actionYieldMultiplier: { mine: 1.2, gather: 1.1 } },
    },
    ashlands: {
        dawn: { spawnMultiplier: 1.02, yieldMultiplier: 1.06, actionSpawnMultiplier: { mine: 1.12 } },
        day: { spawnMultiplier: 1.08, yieldMultiplier: 1.12, energyCostMultiplier: 1.08, actionSpawnMultiplier: { mine: 1.2 } },
        dusk: { spawnMultiplier: 1.1, yieldMultiplier: 1.14, actionSpawnMultiplier: { mine: 1.22, gather: 1.06 } },
        night: { spawnMultiplier: 0.84, yieldMultiplier: 1.22, energyCostMultiplier: 1.2, actionYieldMultiplier: { mine: 1.26, gather: 1.12 } },
    },
    desert: {
        dawn: { spawnMultiplier: 1.08, yieldMultiplier: 1.06, actionSpawnMultiplier: { gather: 1.12 } },
        day: { spawnMultiplier: 0.92, yieldMultiplier: 0.92, energyCostMultiplier: 1.12, actionSpawnMultiplier: { gather: 0.96 } },
        dusk: { spawnMultiplier: 1.12, yieldMultiplier: 1.08, actionSpawnMultiplier: { gather: 1.14 } },
        night: { spawnMultiplier: 0.86, yieldMultiplier: 1.14, energyCostMultiplier: 1.16, actionYieldMultiplier: { gather: 1.18 } },
    },
    tundra: {
        dawn: { spawnMultiplier: 1.1, yieldMultiplier: 1.08, actionSpawnMultiplier: { gather: 1.08, chop: 1.06 } },
        day: { spawnMultiplier: 1.0, yieldMultiplier: 1.0, actionSpawnMultiplier: { gather: 1.02, chop: 1.02 } },
        dusk: { spawnMultiplier: 1.12, yieldMultiplier: 1.1, actionSpawnMultiplier: { gather: 1.1, mine: 1.08 } },
        night: { spawnMultiplier: 0.9, yieldMultiplier: 1.16, energyCostMultiplier: 1.15, actionYieldMultiplier: { gather: 1.18, mine: 1.12 } },
    },
};
const RESOURCE_WINDOWS_GLOBAL = {
    wood: 'all',
    'pine cone': 'daylight',
    apple: 'daylight',
    orange: 'daylight',
    mango: 'daylight',
    coconut: 'daylight',
    water: 'all',
    bamboo: 'daylight',
    'ancient wood': 'night',
    champinon: 'dusk',
    'champinon magico': 'night',
    'baba verde': 'night',
    hierbas: 'daylight',
    insectos: 'night',
    barro: 'all',
    trigo: 'daylight',
    'flor dragon': 'crepuscular',
    'flores amarillas': 'daylight',
    girasoles: 'daylight',
    'hierbas secas': 'daylight',
    'hojas de viento': 'night',
    'roca volcanica': 'all',
    cenizas: 'night',
    carbon: 'night',
    'pez amarillo': 'daylight',
    'pez azul': 'night',
};
const RESOURCE_WINDOWS_BY_BIOME = {
    river: { water: 'all', 'pez amarillo': 'daylight', 'pez azul': 'night' },
    lake: { water: 'all', insectos: 'dusk', hierbas: 'daylight', 'pez amarillo': 'daylight', 'pez azul': 'night' },
    forest: { wood: 'all', 'pine cone': 'daylight', apple: 'daylight', orange: 'daylight', mango: 'daylight', coconut: 'daylight', 'ancient wood': 'night' },
    plains: { trigo: 'daylight', hierbas: 'daylight', 'flor dragon': 'crepuscular', 'flores amarillas': 'daylight', girasoles: 'daylight', 'hierbas secas': 'daylight', 'hojas de viento': 'night' },
    swamp: { champinon: 'dusk', 'champinon magico': 'night', 'baba verde': 'night', insectos: 'night', barro: 'all', hierbas: 'daylight' },
    volcano: { 'roca volcanica': 'all', cenizas: 'night', carbon: 'night' },
    highlands: { wood: 'all', 'pine cone': 'daylight', 'ancient wood': 'night', 'roca volcanica': 'all', carbon: 'night' },
    ashlands: { cenizas: 'all', carbon: 'night', 'roca volcanica': 'all', 'hojas de viento': 'night', 'hierbas secas': 'dusk' },
    desert: { water: 'dawn', 'hierbas secas': 'daylight', 'hojas de viento': 'night', orange: 'daylight' },
    tundra: { wood: 'all', 'pine cone': 'daylight', 'hierbas secas': 'dusk', 'ancient wood': 'night', 'champinon magico': 'night' },
};
const AMBIENT_HINTS = {
    default: {
        dawn: { es: ['🌅 El mundo despierta lentamente.'], en: ['🌅 The world wakes slowly.'], ru: ['🌅 Mir medlenno prosypaetsya.'] },
        day: { es: ['☀️ El reino mantiene un ritmo estable.'], en: ['☀️ The realm settles into a steady rhythm.'], ru: ['☀️ Mir perekhodit v stabilny ritm.'] },
        dusk: { es: ['🌇 Las sombras se estiran sobre el suelo.'], en: ['🌇 Shadows stretch across the land.'], ru: ['🌇 Teni udlinyayutsya nad zemlei.'] },
        night: { es: ['🌙 La noche trae silencio y riesgo.'], en: ['🌙 Night brings silence and risk.'], ru: ['🌙 Noch neset tishinu i risk.'] },
    },
    river: {
        dawn: { es: ['🌅 El rio canta con vida temprana.'], en: ['🌅 The river hums with early life.'], ru: ['🌅 Reka ozhivaet na rassvete.'] },
        day: { es: ['☀️ La corriente fluye clara y constante.'], en: ['☀️ The current runs clear and steady.'], ru: ['☀️ Techenie idet chisto i rovno.'] },
        dusk: { es: ['🌇 El agua refleja un brillo anaranjado.'], en: ['🌇 The water glows with amber reflections.'], ru: ['🌇 Voda otrazhaet yantarnyi svet.'] },
        night: { es: ['🌙 El rio baja la voz y guarda secretos.'], en: ['🌙 The river grows quiet and secretive.'], ru: ['🌙 Reka zatikhaet i khranit tainy.'] },
    },
    lake: {
        dawn: { es: ['🌅 La superficie del lago tiembla con vida temprana.'], en: ['🌅 The lake surface trembles with early life.'], ru: ['🌅 Ozero ozhivaet s pervym svetom.'] },
        day: { es: ['☀️ El lago se abre claro y silencioso.'], en: ['☀️ The lake lies open, clear and quiet.'], ru: ['☀️ Ozero tikhoe i prozrachnoe.'] },
        dusk: { es: ['🌇 Brillos cobrizos recorren el agua quieta.'], en: ['🌇 Copper glints drift across still water.'], ru: ['🌇 Mednye bleski begut po vode.'] },
        night: { es: ['🌙 El lago guarda sombras bajo la neblina.'], en: ['🌙 The lake hides shadows under mist.'], ru: ['🌙 Ozero prjachet teni pod tumanom.'] },
    },
    forest: {
        dawn: { es: ['🌅 El bosque despierta entre aves y rocio.'], en: ['🌅 The forest wakes with birds and dew.'], ru: ['🌅 Les prosypaetsya pod ptits i rosu.'] },
        day: { es: ['☀️ Troncos y hojas crujen bajo la luz.'], en: ['☀️ Wood and leaves crackle under the light.'], ru: ['☀️ Vetvi i listya khrustyat pod svetom.'] },
        dusk: { es: ['🌇 El follaje se vuelve dorado y denso.'], en: ['🌇 The canopy turns golden and dense.'], ru: ['🌇 Krona stanovitsya zolotoi i gustoi.'] },
        night: { es: ['🌙 Ojos brillan entre ramas lejanas.'], en: ['🌙 Eyes glimmer between distant branches.'], ru: ['🌙 Glaza blestyat mezhdu vetvyami.'] },
    },
    plains: {
        dawn: { es: ['🌅 La pradera se llena de brisa fresca.'], en: ['🌅 The plains fill with a cool breeze.'], ru: ['🌅 Step okhlazhdaet svezhii veter.'] },
        day: { es: ['☀️ Campos abiertos, ritmo de farmeo estable.'], en: ['☀️ Open fields, steady farming rhythm.'], ru: ['☀️ Otkrytye polya i stabilnyi temp.'] },
        dusk: { es: ['🌇 Sombras largas cubren la hierba.'], en: ['🌇 Long shadows sweep over the grass.'], ru: ['🌇 Dlinnye teni lozhatsya na travu.'] },
        night: { es: ['🌙 La llanura suena distante y salvaje.'], en: ['🌙 The plain sounds distant and wild.'], ru: ['🌙 Step zvuchit daleko i diko.'] },
    },
    swamp: {
        dawn: { es: ['🌅 Niebla baja y barro despierto.'], en: ['🌅 Low mist and restless mud.'], ru: ['🌅 Nizkii tuman i zhivoi il.'] },
        day: { es: ['☀️ El pantano respira lento y pesado.'], en: ['☀️ The swamp breathes slow and heavy.'], ru: ['☀️ Boloto dyshit medlenno i tyazhelo.'] },
        dusk: { es: ['🌇 El aire se vuelve denso y humedo.'], en: ['🌇 The air turns dense and damp.'], ru: ['🌇 Vozdukh stanovitsya plotnym i syrym.'] },
        night: { es: ['🌙 El pantano cobra vida en la oscuridad.'], en: ['🌙 The swamp comes alive in darkness.'], ru: ['🌙 Boloto ozhivaet vo tme.'] },
    },
    volcano: {
        dawn: { es: ['🌅 El calor cede un poco al amanecer.'], en: ['🌅 The heat eases slightly at dawn.'], ru: ['🌅 Na rassvete zhar nemnogo spadaet.'] },
        day: { es: ['☀️ El suelo arde con fuerza constante.'], en: ['☀️ The ground burns with steady force.'], ru: ['☀️ Zemlya pylayet postoyannym zharom.'] },
        dusk: { es: ['🌇 Brasas y humo pintan el horizonte.'], en: ['🌇 Embers and smoke paint the horizon.'], ru: ['🌇 Ugli i dym okrashivayut gorizont.'] },
        night: { es: ['🌙 Grietas rojas laten entre la ceniza.'], en: ['🌙 Red fissures pulse beneath the ash.'], ru: ['🌙 Krasnye razlomy pulsiruyut v peple.'] },
    },
    highlands: {
        dawn: { es: ['🌅 El viento frio limpia las crestas altas.'], en: ['🌅 Cold wind sweeps the high ridges.'], ru: ['🌅 Kholodnyi veter ochishchaet grebni.'] },
        day: { es: ['☀️ Las laderas crujen bajo roca y grava.'], en: ['☀️ Slopes crack under stone and gravel.'], ru: ['☀️ Sklony khrustyat pod kamnem i shchebnem.'] },
        dusk: { es: ['🌇 Nubes bajas abrazan los riscos.'], en: ['🌇 Low clouds wrap around the cliffs.'], ru: ['🌇 Nizkie oblaka obvivayut skaly.'] },
        night: { es: ['🌙 El eco rebota entre picos oscuros.'], en: ['🌙 Echoes bounce between dark peaks.'], ru: ['🌙 Ekho skachet mezhdu temnymi vershinami.'] },
    },
    ashlands: {
        dawn: { es: ['🌅 Ceniza fina flota con la primera luz.'], en: ['🌅 Fine ash drifts in first light.'], ru: ['🌅 Melkii pepel plyvet v pervom svete.'] },
        day: { es: ['☀️ El suelo humea bajo un cielo opaco.'], en: ['☀️ The ground smokes under a dim sky.'], ru: ['☀️ Zemlya dymit pod tusklym nebom.'] },
        dusk: { es: ['🌇 Brasas tenues respiran en la distancia.'], en: ['🌇 Faint embers breathe in the distance.'], ru: ['🌇 Dalekie ugli tleyut v sumerkakh.'] },
        night: { es: ['🌙 Polvo negro y calor seco dominan la noche.'], en: ['🌙 Black dust and dry heat rule the night.'], ru: ['🌙 Chernaya pyl i sukhoi zhar pravjat nochyu.'] },
    },
    desert: {
        dawn: { es: ['🌅 El desierto ofrece su breve tregua fresca.'], en: ['🌅 The desert offers its brief cool truce.'], ru: ['🌅 Pustynya daet korotkuyu prokhladnuyu peredyshku.'] },
        day: { es: ['☀️ El calor ondula sobre dunas infinitas.'], en: ['☀️ Heat ripples over endless dunes.'], ru: ['☀️ Zhar kolebletsya nad beskonechnymi dunami.'] },
        dusk: { es: ['🌇 El viento borra huellas en minutos.'], en: ['🌇 Wind erases tracks within minutes.'], ru: ['🌇 Veter stirayet sledy za minuty.'] },
        night: { es: ['🌙 El frio corta entre arenas silenciosas.'], en: ['🌙 Cold cuts through silent sands.'], ru: ['🌙 Kholod rezet skvoz bezmolvnye peski.'] },
    },
    tundra: {
        dawn: { es: ['🌅 La escarcha cruje bajo cada paso.'], en: ['🌅 Frost cracks under every step.'], ru: ['🌅 Inyei khrustit pod kazhdym shagom.'] },
        day: { es: ['☀️ La luz fria revela huellas antiguas.'], en: ['☀️ Cold light reveals old tracks.'], ru: ['☀️ Kholodnyi svet otkryvaet starye sledy.'] },
        dusk: { es: ['🌇 El horizonte blanco se vuelve violeta.'], en: ['🌇 The white horizon turns violet.'], ru: ['🌇 Belyi gorizont stanovitsya fioletovym.'] },
        night: { es: ['🌙 El silencio helado pesa sobre la tundra.'], en: ['🌙 Frozen silence weighs over the tundra.'], ru: ['🌙 Ledyanaya tishina davit na tundru.'] },
    },
};
function normalizeActionMap(source) {
    const mapped = { gather: 1, chop: 1, mine: 1, fish: 1 };
    if (!source) {
        return mapped;
    }
    for (const action of ACTIONS) {
        const value = source[action];
        if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
            mapped[action] = value;
        }
    }
    return mapped;
}
function normalizeResourceKey(value) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
}
function isWindowActive(window, period) {
    if (window === 'all')
        return true;
    if (window === 'daylight')
        return period === 'day' || period === 'dawn';
    if (window === 'crepuscular')
        return period === 'dawn' || period === 'dusk';
    if (window === 'night')
        return period === 'night';
    if (window === 'dawn')
        return period === 'dawn';
    return period === 'dusk';
}
function normalizePeriodEffects(base, override) {
    return {
        spawnMultiplier: override?.spawnMultiplier ?? base.spawnMultiplier ?? 1,
        yieldMultiplier: override?.yieldMultiplier ?? base.yieldMultiplier ?? 1,
        energyCostMultiplier: override?.energyCostMultiplier ?? base.energyCostMultiplier ?? 1,
        actionSpawnMultiplier: normalizeActionMap({
            ...(base.actionSpawnMultiplier || {}),
            ...(override?.actionSpawnMultiplier || {}),
        }),
        actionYieldMultiplier: normalizeActionMap({
            ...(base.actionYieldMultiplier || {}),
            ...(override?.actionYieldMultiplier || {}),
        }),
        actionEnergyCostMultiplier: normalizeActionMap({
            ...(base.actionEnergyCostMultiplier || {}),
            ...(override?.actionEnergyCostMultiplier || {}),
        }),
    };
}
export function getDayPeriodEmoji(period) {
    return PERIOD_EMOJI[period];
}
export function getDayPeriodLabel(lang, period) {
    return PERIOD_LABELS[lang][period];
}
export function getDayPeriodEffects(biomeName, period) {
    const normalizedBiome = (biomeName || 'default').toLowerCase();
    const base = DEFAULT_PERIOD_EFFECTS[period];
    const biomeOverrides = BIOME_PERIOD_EFFECTS[normalizedBiome] || {};
    return normalizePeriodEffects(base, biomeOverrides[period]);
}
export function getAmbientHint(lang, biomeName, period, seed = 0) {
    const normalizedBiome = (biomeName || 'default').toLowerCase();
    const set = AMBIENT_HINTS[normalizedBiome] || AMBIENT_HINTS.default;
    const candidates = set?.[period]?.[lang] || [];
    if (!candidates.length) {
        return null;
    }
    const index = Math.abs(seed) % candidates.length;
    return candidates[index] || null;
}
export function isResourceAvailableByPeriod(biomeName, resourceName, period) {
    const biomeKey = normalizeResourceKey(biomeName || '');
    const resourceKey = normalizeResourceKey(resourceName || '');
    if (!resourceKey) {
        return true;
    }
    const biomeRules = RESOURCE_WINDOWS_BY_BIOME[biomeKey] || {};
    const selectedWindow = biomeRules[resourceKey] || RESOURCE_WINDOWS_GLOBAL[resourceKey] || 'all';
    return isWindowActive(selectedWindow, period);
}
