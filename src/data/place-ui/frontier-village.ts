// @ts-nocheck
export const frontierVillagePlace = {
    hint: {
        es: 'Refugio de frontera con servicios básicos.',
        en: 'Frontier refuge with basic services.',
        ru: 'Pograničnoe ubezhische s bazovymi uslugami.',
    },
    rulesLabel: {
        es: 'Reglas del pueblo',
        en: 'Village rules',
        ru: 'Pravila derevni',
    },
    buildingsLabel: {
        es: 'Edificios disponibles',
        en: 'Available buildings',
        ru: 'Dostupnye zdaniya',
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
            key: 'village-rest',
            emoji: '🛏️',
            name: {
                es: 'Posada del Pueblo',
                en: 'Village Inn',
                ru: 'Derevenskaya Gostinica',
            },
            typeLabel: {
                es: 'Motel',
                en: 'Motel',
                ru: 'Motel',
            },
            description: {
                es: 'Posada cálida para recuperar STA antes de seguir la ruta.',
                en: 'A warm inn to recover STA before getting back on the road.',
                ru: 'Teplaya gostinica dlya vosstanovleniya STA pered putyom.',
            },
            hint: {
                es: 'Descansa y recupera STA',
                en: 'Rest and recover STA',
                ru: 'Otdohnite i vosstanovite STA',
            },
            services: [
                {
                    slug: 'village-rest-free',
                    emoji: '🛌',
                    name: {
                        es: 'Plan Free',
                        en: 'Free Plan',
                        ru: 'Free Plan',
                    },
                    duration: {
                        es: '≈ 24h',
                        en: '~ 24h (full)',
                        ru: '~ 24h (full)',
                    },
                },
                {
                    slug: 'village-rest',
                    emoji: '💤',
                    name: {
                        es: 'Básico',
                        en: 'Basic',
                        ru: 'Basic',
                    },
                    duration: {
                        es: '≈ 1m',
                        en: '~ 1m',
                        ru: '~ 1m',
                    },
                },
                {
                    slug: 'village-rest-quick',
                    emoji: '⚡',
                    name: {
                        es: 'S. Veloz',
                        en: 'Swift Rest',
                        ru: 'Swift Rest',
                    },
                    duration: {
                        es: '≈ 20s',
                        en: '~ 20s',
                        ru: '~ 20s',
                    },
                },
            ],
        },
        {
            key: 'village-shrine',
            emoji: '⛪',
            name: {
                es: 'Santuario del Pueblo',
                en: 'Village Shrine',
                ru: 'Derevenskoe Svyatilische',
            },
            typeLabel: {
                es: 'Templo',
                en: 'Temple',
                ru: 'Hram',
            },
            description: {
                es: 'Santuario pequeño donde los viajeros curan heridas.',
                en: 'A small shrine where travelers heal their wounds.',
                ru: 'Nebolshoe svyatilische, gde putniki lechat rany.',
            },
            hint: {
                es: 'Recupera HP',
                en: 'Restore HP',
                ru: 'Vosstanovit HP',
            },
            services: [
                {
                    slug: 'village-shrine-free',
                    emoji: '🩹',
                    name: {
                        es: 'Plan Free',
                        en: 'Free Plan',
                        ru: 'Free Plan',
                    },
                    duration: {
                        es: '≈ 24h',
                        en: '~ 24h (full)',
                        ru: '~ 24h (full)',
                    },
                },
                {
                    slug: 'village-shrine',
                    emoji: '✨',
                    name: {
                        es: 'Misericordia',
                        en: 'Mercy',
                        ru: 'Mercy',
                    },
                    duration: {
                        es: '≈ 45s',
                        en: '~ 45s',
                        ru: '~ 45s',
                    },
                },
                {
                    slug: 'village-shrine-divine',
                    emoji: '✨',
                    name: {
                        es: 'I. Divina',
                        en: 'Divine',
                        ru: 'Divine',
                    },
                    duration: {
                        es: '≈ 15s',
                        en: '~ 15s',
                        ru: '~ 15s',
                    },
                },
            ],
        },
        {
            key: 'village-chest',
            emoji: '🧰',
            name: {
                es: 'Baúl del Pueblo',
                en: 'Village Chest',
                ru: 'Derevenskiy Sunduk',
            },
            typeLabel: {
                es: 'Baúl',
                en: 'Chest',
                ru: 'Sunduk',
            },
            description: {
                es: 'Baúl comunitario de 10 slots para guardar objetos.',
                en: 'A 10-slot community chest to store items.',
                ru: 'Obschiy sunduk na 10 slotov dlya predmetov.',
            },
            hint: {
                es: 'Guarda y retira objetos',
                en: 'Store and withdraw items',
                ru: 'Khranit i zabirat predmety',
            },
            services: [
                {
                    slug: 'village-chest-open',
                    emoji: '📦',
                    name: {
                        es: 'Administrar Baúl',
                        en: 'Manage Chest',
                        ru: 'Upravlyat Sundukom',
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
