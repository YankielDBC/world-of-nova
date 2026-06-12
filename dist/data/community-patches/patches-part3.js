// @ts-nocheck
export const COMMUNITY_PATCH_PART3 = [
    {
        slug: 'patch-v0-1-16-sos-pigeon',
        version: 'v0.1.16',
        title: '🕊️ Paloma SOS',
        summary: 'Si tu ruta se complica, ahora existe un rescate de emergencia para ganar unos minutos mas de vida.',
        bullets: [
            'La paloma puede traer 1 o 2 frutas al azar por 5 de plata.',
            'Tiene limite real: 2 usos por dia y 10 por mes.',
            'La entrega entra directo a tu inventario y avisa si algo no cabe.',
        ],
        uiPreview: [
            '🕊️ Llamado SOS desde ruta',
            '📦 Apple, Orange, Mango o Coconut',
            '⚠️ Aviso si peso o slots no alcanzan',
        ],
        flowSteps: [
            'Tus vitales bajan y decides no forzar otra accion.',
            'Envias la señal SOS desde el bot.',
            'La paloma regresa con fruta de emergencia.',
            'Recuperas margen para seguir o volver a salvo.',
        ],
        gameplayImpact: [
            'Menos muertes tontas por quedarte seco.',
            'Mas decisiones de economia durante la ruta.',
            'Una ayuda real, pero limitada para no romper el riesgo.',
        ],
        closing: 'La paloma no gana la expedicion por ti, pero si puede comprarte el minuto que faltaba para volver con vida.',
    },
    {
        slug: 'patch-v0-1-17-corpse-system',
        version: 'v0.1.17',
        title: '☠️ Cuerpo persistente',
        summary: 'Morir ya deja una consecuencia visible en el mundo: tu cuerpo permanece en la coordenada donde caiste.',
        bullets: [
            'El punto de muerte deja un cuerpo real para recuperar.',
            'Tu derrota ya no se borra con un simple mensaje.',
            'La base queda lista para futuras tensiones alrededor de los restos.',
        ],
        uiPreview: [
            '☠️ Cuerpo anclado en el mapa',
            '📍 Coordenadas de recuperacion',
            '🎒 Tus cosas esperan tu regreso',
        ],
        flowSteps: [
            'Caes derrotado en combate.',
            'Tu cuerpo queda donde moriste.',
            'El juego te obliga a volver y cerrarlo en persona.',
        ],
        gameplayImpact: [
            'Morir ahora se siente serio.',
            'La exploracion exige mas cabeza y preparacion.',
            'Cada derrota deja memoria fisica dentro del reino.',
        ],
        closing: 'La aventura ya no termina con un "perdiste". Ahora deja una marca que debes ir a reclamar.',
    },
    {
        slug: 'patch-v0-1-18-astral-experience',
        version: 'v0.1.18',
        title: '👻 Experiencia astral',
        summary: 'Tras morir no reapareces como si nada: despiertas como espiritu y corres de vuelta hacia tu propio cuerpo.',
        bullets: [
            'Respawn espiritual en un cementerio cercano y oculto.',
            'Mapa astral con tu cuerpo marcado y el resto del plano cubierto en negro.',
            'Movimiento mas rapido para volver a la zona de muerte.',
        ],
        uiPreview: [
            '👻 Tu alma en el mapa',
            '⚰️ Cementerio como punto de retorno',
            '⬛ Mundo astral separado del plano normal',
        ],
        flowSteps: [
            'Muere tu personaje y despierta su espiritu.',
            'Ves el cuerpo como objetivo dentro del plano astral.',
            'Cruzas la oscuridad y regresas al punto exacto donde caiste.',
            'Recuperas el cuerpo para volver al reino vivo.',
        ],
        gameplayImpact: [
            'La muerte gana dramatismo sin volverse puro castigo.',
            'Volver al cuerpo crea tension y narrativa.',
            'El mapa cambia por completo cuando estas muerto.',
        ],
        closing: 'Morir ya no es una pantalla. Es una experiencia completa de regreso, tension y redencion.',
    },
    {
        slug: 'patch-v0-1-19-pockets-system',
        version: 'v0.1.19',
        title: '👖 Pantalones y bolsillos',
        summary: 'Aunque te quites la mochila, el aventurero nunca queda completamente inutil: siempre conserva sus bolsillos base.',
        bullets: [
            'El modo sin mochila sigue teniendo inventario minimo.',
            'Los bolsillos base funcionan como tu ultimo soporte logico de supervivencia.',
            'Cambiar o quitar bag respeta peso y slots para no romper la simulacion.',
        ],
        uiPreview: [
            '👖 Pockets como bag por defecto',
            '🎒 Cambio seguro entre bolsas',
            '⚖️ Control real de peso y espacio',
        ],
        flowSteps: [
            'Decides quitarte la mochila o cambiar a otra.',
            'El sistema valida si el contenido cabe.',
            'Si no llevas bag, sobrevives con tus bolsillos base.',
        ],
        gameplayImpact: [
            'Nunca quedas bloqueado por perder o quitar una mochila.',
            'Mas logica en el manejo de inventario.',
            'Tus decisiones de carga se sienten mas reales.',
        ],
        closing: 'Incluso sin mochila, sigues siendo un aventurero. Solo que uno mucho mas limitado y mucho mas tenso.',
    },
    {
        slug: 'patch-v0-1-20-player-stats-profile',
        version: 'v0.1.20',
        title: '📊 Stats y atributos reales',
        summary: 'La hoja del personaje ya enseña el cuerpo completo del aventurero: atributos primarios, stats derivados y resistencias vivas.',
        bullets: [
            'STR, DEX, INT, VIT, AGI y ENG ya forman la base del personaje.',
            'HP, STA, Attack, Crit, Evasion, Defense y resistencias se calculan en vivo.',
            'Raza, clase y nivel cambian de verdad como se siente cada build.',
        ],
        uiPreview: [
            '📊 Attributes visibles en profile',
            '❤️ HP y 🔋 STA calculados al momento',
            '🛡️ Resistencias listas para PvE y PvP',
        ],
        flowSteps: [
            'Abres /profile y ves tu estado real.',
            'El juego toma raza, clase, nivel y build.',
            'La card calcula tu rendimiento actual en tiempo real.',
        ],
        gameplayImpact: [
            'Comparar builds ya tiene sentido real.',
            'Prepararte para combate se vuelve mas tactico.',
            'Cada punto del personaje ahora pesa en el gameplay.',
        ],
        closing: 'Tu perfil ya no es decoracion. Es una lectura viva de lo que tu personaje realmente puede hacer.',
    },
    {
        slug: 'patch-v0-1-21-basic-skills-gather-loop',
        version: 'v0.1.21',
        title: '🪓 Skills basicos y recoleccion',
        summary: 'Los oficios base ya forman un loop claro: leer el terreno, elegir objetivo, gastar recursos y cobrar progreso.',
        bullets: [
            'Inspect muestra nodos, rareza y requisito de skill en una sola card.',
            'Talar, minar, recolectar y pescar ya consumen STA y durabilidad real.',
            'El resultado avisa loot, XP, progreso y problemas de peso o slots.',
        ],
        uiPreview: [
            '👀 Inspect con nodos y requisitos',
            '⚒️ Card de trabajo con costo real',
            '🏆 Resultado con XP, loot y bolsa',
        ],
        flowSteps: [
            'Inspeccionas el tile y lees lo disponible.',
            'Eliges nodo, cantidad y herramienta correcta.',
            'Trabajas el recurso y ves una card limpia de resultado.',
            'Decides seguir, revisar mas recursos o volver al mapa.',
        ],
        gameplayImpact: [
            'El farmeo se entiende mejor y cansa menos.',
            'Cada accion enseña si fue rentable o no.',
            'Subir oficios ya se siente como progresion real.',
        ],
        closing: 'Recolectar ya no es solo apretar un comando. Ahora es leer, decidir, ejecutar y administrar el resultado.',
    },
    {
        slug: 'patch-v0-1-22-level-titles',
        version: 'v0.1.22',
        title: '📜 Titulos del reino',
        summary: 'El nombre del aventurero ya puede cargar prestigio visible, y el sistema queda listo para titulos ganados jugando.',
        bullets: [
            'Cada rango de nivel ya puede mostrar un titulo propio en profile.',
            'El titulo visible ya no depende de la clase racial.',
            'La base queda abierta para futuros titulos por logros, eventos y misiones.',
        ],
        uiPreview: [
            '📜 Novato, Aprendiz y mas',
            '👤 Nick + titulo en profile',
            '🏅 Espacio listo para rarezas futuras',
        ],
        flowSteps: [
            'Subes de nivel y cambia tu rango visible.',
            'El perfil enseña ese titulo junto a tu identidad.',
            'Mas adelante podras sobrescribirlo con titulos ganados jugando.',
        ],
        gameplayImpact: [
            'Tu progreso se ve a simple vista.',
            'La identidad social del personaje gana peso.',
            'Se abre un camino fuerte para logros y prestigio.',
        ],
        closing: 'Tu nombre ya no aparece solo. Lo acompana una reputacion que ira creciendo con cada historia del reino.',
    },
];
//# sourceMappingURL=patches-part3.js.map