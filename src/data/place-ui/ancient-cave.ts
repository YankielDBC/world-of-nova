// @ts-nocheck
export const ancientCavePlace = {
    hint: {
        es: 'Entrada de cueva antigua. Puedes descender y explorar su interior.',
        en: 'Ancient cave entrance. You can descend and explore its depths.',
        ru: 'Vkhod v drevnyuyu peshcheru. Ty mozhesh spustitsya i issledovat glubinu.',
    },
    rulesLabel: {
        es: 'Estado de la zona',
        en: 'Zone status',
        ru: 'Status zony',
    },
    buildingsLabel: {
        es: 'Interacciones',
        en: 'Interactions',
        ru: 'Vzaimodeystviya',
    },
    rules: {
        pvpOff: {
            es: 'PvP',
            en: 'PvP',
            ru: 'PvP',
        },
        creaturesOff: {
            es: 'Criaturas',
            en: 'Creatures',
            ru: 'Suschestva',
        },
    },
    buildings: [
        {
            key: 'cave-mouth',
            emoji: '🕳️',
            name: {
                es: 'Boca de Cueva',
                en: 'Cave Mouth',
                ru: 'Ustye Peschery',
            },
            typeLabel: {
                es: 'Cueva',
                en: 'Cave',
                ru: 'Peschera',
            },
            description: {
                es: 'El interior se extiende bajo tierra con rutas propias, paredes cerradas y progreso persistente.',
                en: 'The interior stretches underground with its own routes, sealed walls, and persistent progress.',
                ru: 'Vnutri prostirayutsya podzemnye marshruty, zakrytye steny i sokhranyaemy progress.',
            },
            hint: {
                es: 'Desciende y explora la cueva',
                en: 'Descend and explore the cave',
                ru: 'Spuskaysya i issleduy peshcheru',
            },
            services: [
                {
                    slug: 'cave-expedition',
                    emoji: '🕳️',
                    name: {
                        es: 'Expedición',
                        en: 'Expedition',
                        ru: 'Ekspeditsiya',
                    },
                    duration: {
                        es: 'Inmediato',
                        en: 'Instant',
                        ru: 'Momentalno',
                    },
                },
            ],
        },
    ],
};
