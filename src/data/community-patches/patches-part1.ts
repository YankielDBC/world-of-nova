// @ts-nocheck
export const COMMUNITY_PATCH_PART1 = [
    {
        slug: 'patch-v0-1-0-shared-world',
        version: 'v0.1.0',
        title: '🌍 Reino Compartido',
        summary: 'Todos los aventureros ya pisan el mismo mundo persistente en tiempo real.',
        bullets: [
            'Un solo mapa canonico para toda la comunidad.',
            'Descubrimientos por coordenada que quedan guardados.',
            'Base tecnica lista para escalar como MMORPG.',
        ],
        uiPreview: [
            '🗺 /map ahora es global',
            '📍 Descubres y queda fijo',
            '🤝 Todos pisan el mismo reino',
        ],
        flowSteps: [
            'Exploras una coordenada nueva.',
            'El tile queda registrado en el mundo.',
            'Otro jugador puede llegar y verla.',
        ],
        gameplayImpact: [
            'Mas encuentros reales entre players.',
            'Menos sensacion de mundo vacio.',
            'Base solida para eventos globales.',
        ],
        closing: 'Cada paso de un jugador ya puede cambiar la historia del reino.',
    },
    {
        slug: 'patch-v0-1-1-biomes',
        version: 'v0.1.1',
        title: '🏞️ Biomas Expandidos',
        summary: 'El mundo gano variedad real de terreno y rutas con mas personalidad.',
        bullets: [
            'Nuevos biomas: Highlands, Cenizal, Lago, Desierto y Tundra.',
            'Transiciones entre biomas con logica de vecindad.',
            'Exploracion menos repetitiva y mas inmersiva.',
        ],
        uiPreview: [
            '🏔️ Highlands con rutas altas',
            '🏜️ Desierto y zonas secas',
            '❄️ Tundra para anillos lejanos',
        ],
        flowSteps: [
            'Te mueves desde Nova a frontera.',
            'El terreno cambia con coherencia.',
            'El loot y riesgo se siente distinto.',
        ],
        gameplayImpact: [
            'Mas variedad por sesion de juego.',
            'Rutas con identidad por zona.',
            'Explorar vuelve a sorprender.',
        ],
        closing: 'Cada ruta ahora se siente como una expedicion distinta.',
    },
    {
        slug: 'patch-v0-1-2-climate-cycle',
        version: 'v0.1.2',
        title: '⛅ Clima y Horarios',
        summary: 'El entorno ya no es decorativo: clima y horario cambian el gameplay.',
        bullets: [
            'Clima por zonas con intensidad y eventos especiales.',
            'Ciclo completo de amanecer, dia, atardecer y noche.',
            'Cambios reales en spawn, rendimiento y costo de acciones.',
        ],
        uiPreview: [
            '🌦️ Clima zona: Humedo II',
            '🕰️ Horario: Noche · 1h',
            '🎯 Zona Lv visible en mapa',
        ],
        flowSteps: [
            'Abres /map y lees clima y horario.',
            'Decides ruta segun riesgo y loot.',
            'Ajustas farmeo por momento del dia.',
        ],
        gameplayImpact: [
            'Planear ruta ahora da ventaja.',
            'No todo tile rinde igual siempre.',
            'El mundo se siente vivo y cambiante.',
        ],
        closing: 'El mapa ahora tiene ritmo propio y obliga a planear mejor.',
    },
    {
        slug: 'patch-v0-1-3-mobile-ui',
        version: 'v0.1.3',
        title: '🧭 UI Movil Afinada',
        summary: 'La UI de Telegram movil fue pulida para jugar rapido y sin ruido.',
        bullets: [
            'Cards compactas pensadas para lineas cortas.',
            'Flujo con menos spam y decisiones mas claras.',
            'Mas botones utiles y menos comandos largos.',
        ],
        uiPreview: [
            '📱 Cards legibles en 30 chars',
            '🧭 Menos texto, mas accion',
            '🟢 Botones directos por contexto',
        ],
        flowSteps: [
            'Entras a una UI de accion.',
            'Ves info clave sin ruido.',
            'Resuelves con botones o comando corto.',
        ],
        gameplayImpact: [
            'Menos friccion al jugar en movil.',
            'Mas acciones por minuto real.',
            'Mejor lectura en combate y loot.',
        ],
        closing: 'Menos friccion, mas aventura por minuto.',
    },
    {
        slug: 'patch-v0-1-4-bag-tools',
        version: 'v0.1.4',
        title: '🎒 Mochila y Tools',
        summary: 'Inventario y tools ahora se gestionan con mas control y precision.',
        bullets: [
            'Vista de mochila mas clara con acceso por slot.',
            'Equipamiento de herramientas separado del contenido normal.',
            'Base de items preparada para crecer sin romper la UX.',
        ],
        uiPreview: [
            '👜 /bag con slots ordenados',
            '🔧 /equip separado y limpio',
            '🆔 Item por slot para acciones',
        ],
        flowSteps: [
            'Abres mochila y eliges slot.',
            'Consultas info con comando corto.',
            'Equipas o sueltas con confirmacion.',
        ],
        gameplayImpact: [
            'Inventario mas facil de gestionar.',
            'Menos errores al equipar tools.',
            'Base lista para mercado y banco.',
        ],
        closing: 'Tu equipo ya se siente como build real, no como lista plana.',
    },
    {
        slug: 'patch-v0-1-5-nova-castle',
        version: 'v0.1.5',
        title: '🏰 Castillo Nova',
        summary: 'Castillo Nova ya funciona como hub central de preparacion.',
        bullets: [
            'Edificios activos: motel, templo, forja, banco y entrenamiento.',
            'Servicios con costos, tiempos y estados definidos.',
            'Navegacion por ciudad mas limpia con botones directos.',
        ],
        uiPreview: [
            '🏰 /place muestra edificios',
            '🛏️ Descanso con plan free',
            '⛪ Curacion con interrupcion',
        ],
        flowSteps: [
            'Llegas a Nova y haces /place.',
            'Eliges edificio y servicio.',
            'Recibes estado y control de accion.',
        ],
        gameplayImpact: [
            'Ciudad util, no solo decoracion.',
            'Mas decisiones entre coste y tiempo.',
            'Mejor loop entre farmeo y descanso.',
        ],
        closing: 'Nova ya se siente viva y util para progresar.',
    },
    {
        slug: 'patch-v0-1-6-market',
        version: 'v0.1.6',
        title: '🏛️ Economia Comunitaria',
        summary: 'La economia dio un salto: precios y flujo comercial mas reales.',
        bullets: [
            'Hub de mercado con ordenes y actividad comunitaria.',
            'Exchange interno entre oro y plata.',
            'Resumenes de volumen y tendencia para decidir mejor.',
        ],
        uiPreview: [
            '🏛️ Hub con datos 24H',
            '📦 Compra y venta por orden',
            '💱 Exchange oro/plata activo',
        ],
        flowSteps: [
            'Abres mercado desde Nova.',
            'Seleccionas item o divisa.',
            'Publicas orden o ejecutas compra.',
        ],
        gameplayImpact: [
            'Economia movida por jugadores.',
            'Precios vivos por oferta demanda.',
            'Nuevas rutas de progreso sin grind.',
        ],
        closing: 'Cada trade ya mueve el pulso del reino.',
    },
    {
        slug: 'patch-v0-1-7-merchant',
        version: 'v0.1.7',
        title: '🕵️ Comerciante Misterioso',
        summary: 'El evento del mercader agrega competencia, riesgo y oportunidad real.',
        bullets: [
            'Recorrido dinamico por el mapa con presencia situacional.',
            'Oferta y precios rotativos para crear ventanas de oportunidad.',
            'Interaccion directa al encontrarlo en tu coordenada.',
        ],
        uiPreview: [
            '🔔 Rumor en canal del reino',
            '🧥 Stock rotativo del mercader',
            '💰 Compra y paga con bonus',
        ],
        flowSteps: [
            'Ves rumor y sales a buscarlo.',
            'Lo encuentras en coordenada activa.',
            'Compras o vendes antes de que cambie.',
        ],
        gameplayImpact: [
            'Evento social con FOMO real.',
            'Ventanas de profit por timing.',
            'Mas competencia entre exploradores.',
        ],
        closing: 'Un encuentro a tiempo puede darte ventaja enorme.',
    },
];
