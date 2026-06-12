// @ts-nocheck
export const ancientRuinsPlace = {
    hint: {
        es: 'Ruinas antiguas. Su interior aun no esta habilitado.',
        en: 'Ancient ruins. Deep exploration is not enabled yet.',
        ru: 'Drevnie ruiny. Glubokoe issledovanie poka nedostupno.',
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
            key: 'ruins-core',
            emoji: '🏚️',
            name: {
                es: 'Ruinas Selladas',
                en: 'Sealed Ruins',
                ru: 'Zapecatannye Ruiny',
            },
            typeLabel: {
                es: 'Ruinas',
                en: 'Ruins',
                ru: 'Ruiny',
            },
            description: {
                es: 'Restos de una civilizacion olvidada. Las expediciones aun no estan abiertas.',
                en: 'Remains of a forgotten civilization. Expeditions are not open yet.',
                ru: 'Ostatki zabytoj civilizacii. Ekspedicii poka zakryty.',
            },
            hint: {
                es: 'Contenido en desarrollo',
                en: 'Content in development',
                ru: 'Kontent v razrabotke',
            },
            services: [
                {
                    slug: 'ruins-expedition',
                    emoji: '🚧',
                    name: {
                        es: 'Expedicion',
                        en: 'Expedition',
                        ru: 'Ekspediciya',
                    },
                    duration: {
                        es: 'Coming soon',
                        en: 'Coming soon',
                        ru: 'Coming soon',
                    },
                },
            ],
        },
    ],
};
