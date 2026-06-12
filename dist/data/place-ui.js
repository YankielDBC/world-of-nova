import { EMOJIS } from './emojis.js';
export const PLACE_UI_CONFIG = {
    'nova-castle': {
        name: {
            es: 'Castillo Nova',
            en: 'Nova Castle',
            ru: 'Nova Castle',
        },
        hint: {
            es: 'Reglas y Edificios dentro del castillo',
            en: 'Rules and buildings inside the castle',
            ru: 'Pravila i zdanija vnutri zamka',
        },
        rulesLabel: {
            es: 'Reglas de Nova',
            en: 'Nova Rules',
            ru: 'Pravila Novy',
        },
        buildingsLabel: {
            es: 'Edificios disponibles',
            en: 'Available buildings',
            ru: 'Dostupnye zdanija',
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
                ru: 'Sushchestva',
            },
        },
        buildings: [
            {
                key: 'gilded-rest',
                emoji: '🛏️',
                name: {
                    es: 'Descanso Dorado',
                    en: 'The Gilded Rest',
                    ru: 'Gilded Rest',
                },
                typeLabel: {
                    es: 'Motel',
                    en: 'Motel',
                    ru: 'Motel',
                },
                description: {
                    es: 'Calido motel donde los aventureros toman un descanso.',
                    en: 'Warm motel where adventurers take a rest.',
                    ru: 'Teplyj motel dlya otdyha puteshestvennikov.',
                },
                hint: {
                    es: 'Descansa y recupera STA',
                    en: 'Rest and recover STA',
                    ru: 'Otdyh i vosstanovlenie STA',
                },
                services: [
                    {
                        slug: 'gilded-rest-free',
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
                        resultLore: {
                            es: 'Descanso lento pero constante. El cuerpo se recompone sin gastar monedas.',
                            en: 'Slow but steady rest. Your body recovers without spending coins.',
                            ru: 'Medlennyj no stabilnyj otdyh bez zatrat monet.',
                        },
                    },
                    {
                        slug: 'gilded-rest',
                        emoji: '💤',
                        name: {
                            es: 'Basico',
                            en: 'Basic',
                            ru: 'Basic',
                        },
                        duration: {
                            es: '≈ 1m',
                            en: '~ 1m',
                            ru: '~ 1m',
                        },
                        resultLore: {
                            es: 'El calor del descanso te devuelve el aliento.',
                            en: 'Warm blankets bring your breath back.',
                            ru: 'Teplo odeyal vozvrashchaet tebe sily.',
                        },
                    },
                    {
                        slug: 'gilded-rest-quick',
                        emoji: '⚡',
                        name: {
                            es: 'S. Veloz',
                            en: 'Swift Slumber',
                            ru: 'Swift Slumber',
                        },
                        duration: {
                            es: '≈ 20s',
                            en: '~ 20s',
                            ru: '~ 20s',
                        },
                        resultLore: {
                            es: 'Un sueno profundo limpia el cansancio.',
                            en: 'A deep slumber clears the fatigue.',
                            ru: 'Glubokij son snymaet ustalost.',
                        },
                    },
                ],
            },
            {
                key: 'mercy-edge',
                emoji: '⛪',
                name: {
                    es: 'Borde de la Misericordia',
                    en: "Mercy's Edge",
                    ru: "Mercy's Edge",
                },
                typeLabel: {
                    es: 'Templo',
                    en: 'Temple',
                    ru: 'Hram',
                },
                description: {
                    es: 'Pequeno templo donde los heridos recobran fuerzas.',
                    en: 'Small temple where the wounded regain strength.',
                    ru: 'Nebolshoj hram, gde rany zatjagivayutsya.',
                },
                hint: {
                    es: 'Recupera HP',
                    en: 'Restore HP',
                    ru: 'Vosstanovi HP',
                },
                services: [
                    {
                        slug: 'mercy-edge-free',
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
                        resultLore: {
                            es: 'La curación avanza lenta, pero no se detiene.',
                            en: 'Healing moves slowly, but never stops.',
                            ru: 'Lechenie idet medlenno, no ne ostanavlivaetsya.',
                        },
                    },
                    {
                        slug: 'mercy-edge',
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
                        resultLore: {
                            es: 'La luz del templo calma tus heridas.',
                            en: 'Temple light soothes your wounds.',
                            ru: 'Svet hrama uspokaivaet rany.',
                        },
                    },
                    {
                        slug: 'mercy-edge-divine',
                        emoji: '✨',
                        name: {
                            es: 'I. Divina',
                            en: 'Divine Intervention',
                            ru: 'Bozhestvennoe vmeshatelstvo',
                        },
                        duration: {
                            es: '≈ 15s',
                            en: '~ 15s',
                            ru: '~ 15s',
                        },
                        resultLore: {
                            es: 'Una bendicion te deja como nuevo.',
                            en: 'A blessing leaves you renewed.',
                            ru: 'Blagoslovenie obnovlyaet tebya.',
                        },
                    },
                ],
            },
            {
                key: 'crow-forge',
                emoji: '⚒️',
                name: {
                    es: 'Forja del Cuervo',
                    en: 'Crow Forge',
                    ru: 'Kuznica Vorona',
                },
                typeLabel: {
                    es: 'Herreria',
                    en: 'Smithy',
                    ru: 'Kuznica',
                },
                description: {
                    es: 'Hierro, carbon y golpes marcan el ritmo de esta forja. Repara tu equipo y/o compra herramientas basicas para el uso diario.',
                    en: 'Iron, coal and hammer blows set the rhythm here.',
                    ru: 'Zhelezo, ugol i udary molota zadayut ritm etoj kuzni.',
                },
                hint: {
                    es: 'Forja y tienda del cuervo',
                    en: 'Repair gear and buy basic tools',
                    ru: 'Chini snaryazhenie i pokupaj instrumenty',
                },
                services: [
                    {
                        slug: 'crow-forge-repair-quick',
                        emoji: '🔧',
                        name: {
                            es: 'A. Rapido',
                            en: 'Quick Tune-Up',
                            ru: 'Bystryj remont',
                        },
                        duration: {
                            es: '≈ 1 min',
                            en: 'Instant',
                            ru: 'Momentalno',
                        },
                        resultLore: {
                            es: 'El herrero ajusta remaches y endereza metal.',
                            en: 'The smith tightens rivets and straightens steel.',
                            ru: 'Kuznec podtyagivaet zaklepki i vypravlyaet stal.',
                        },
                    },
                    {
                        slug: 'crow-forge-repair-full',
                        emoji: '🔥',
                        name: {
                            es: 'R. Completa',
                            en: 'Full Restoration',
                            ru: 'Polnaya restavraciya',
                        },
                        duration: {
                            es: '≈ 3s',
                            en: 'Instant',
                            ru: 'Momentalno',
                        },
                        resultLore: {
                            es: 'El acero bebe fuego y vuelve listo para guerra.',
                            en: 'Steel drinks fire and returns battle-ready.',
                            ru: 'Stal pyot ogon i vozvrashchaetsya gotovoj k boyu.',
                        },
                    },
                    {
                        slug: 'crow-forge-buy-pick',
                        emoji: EMOJIS.tools.picoPiedra,
                        name: {
                            es: 'Pico de Piedra',
                            en: 'Stone Pickaxe',
                            ru: 'Kamennaya kirka',
                        },
                        duration: {
                            es: 'Entrega inmediata',
                            en: 'Instant delivery',
                            ru: 'Momentalnaya vydacha',
                        },
                        resultLore: {
                            es: 'Tosco, pesado y suficiente para partir roca comun.',
                            en: 'Rough, heavy, and enough to crack common rock.',
                            ru: 'Grubaya, tyazhelaya i dostatochnaya dlya obychnogo kamnya.',
                        },
                    },
                    {
                        slug: 'crow-forge-buy-axe',
                        emoji: EMOJIS.tools.hachaPiedra,
                        name: {
                            es: 'Hacha de Piedra',
                            en: 'Stone Axe',
                            ru: 'Kamennyj topor',
                        },
                        duration: {
                            es: 'Entrega inmediata',
                            en: 'Instant delivery',
                            ru: 'Momentalnaya vydacha',
                        },
                        resultLore: {
                            es: 'No es elegante, pero abre camino entre troncos.',
                            en: 'Not elegant, but it cuts a path through trunks.',
                            ru: 'Ne izyaschen, no otkryvaet put skvoz brevna.',
                        },
                    },
                    {
                        slug: 'crow-forge-buy-fishing-rod',
                        emoji: EMOJIS.tools.canapez,
                        name: {
                            es: 'Cana de Bambu',
                            en: 'Bamboo Rod',
                            ru: 'Bambukovaya udochka',
                        },
                        duration: {
                            es: 'Entrega inmediata',
                            en: 'Instant delivery',
                            ru: 'Momentalnaya vydacha',
                        },
                        resultLore: {
                            es: 'Ligera y util para rios y aguas bajas.',
                            en: 'Light and useful for rivers and shallow waters.',
                            ru: 'Legkaya i udobnaya dlya rek i melkovodya.',
                        },
                    },
                ],
            },
            {
                key: 'crown-chamber',
                emoji: '🏦',
                name: {
                    es: 'Camara de la Corona',
                    en: 'Crown Chamber',
                    ru: 'Koronnaya Kamora',
                },
                typeLabel: {
                    es: 'Banco Real',
                    en: 'Royal Bank',
                    ru: 'Korolevskij Bank',
                },
                description: {
                    es: 'Sellos, cofres y guardias custodian cada moneda.',
                    en: 'Seals, vaults and guards watch every coin.',
                    ru: 'Pechati, khranilishcha i strazha sledyat za kazhdoj monetoj.',
                },
                hint: {
                    es: 'Guarda y retira tu fortuna',
                    en: 'Store and withdraw your fortune',
                    ru: 'Khrani i snimaj svoe sostoyanie',
                },
                services: [
                    {
                        slug: 'crown-chamber-open',
                        emoji: '📦',
                        name: {
                            es: 'Abrir Boveda',
                            en: 'Open Vault',
                            ru: 'Otkryt khranilishche',
                        },
                        duration: {
                            es: 'Inmediato',
                            en: 'Instant',
                            ru: 'Momentalno',
                        },
                        resultLore: {
                            es: 'El cofre se abre con un chasquido metalico.',
                            en: 'The chest opens with a metallic click.',
                            ru: 'Sunduk otkryvaetsya s metallicheskim shchelchkom.',
                        },
                    },
                    {
                        slug: 'crown-chamber-deposit-silver',
                        emoji: EMOJIS.ui.gold,
                        name: {
                            es: 'Depositar Plata',
                            en: 'Deposit Silver',
                            ru: 'Vlozhit serebro',
                        },
                        duration: {
                            es: 'Inmediato',
                            en: 'Instant',
                            ru: 'Momentalno',
                        },
                        resultLore: {
                            es: 'El escriba sella la entrada bajo el emblema de Nova.',
                            en: 'The clerk seals the entry under Nova sigil.',
                            ru: 'Pisec zapechatyvaet zapis pod pechatyu Novy.',
                        },
                    },
                    {
                        slug: 'crown-chamber-withdraw-silver',
                        emoji: EMOJIS.ui.silver,
                        name: {
                            es: 'Retirar Plata',
                            en: 'Withdraw Silver',
                            ru: 'Snyat serebro',
                        },
                        duration: {
                            es: 'Inmediato',
                            en: 'Instant',
                            ru: 'Momentalno',
                        },
                        resultLore: {
                            es: 'El tesorero desliza una bolsa por el mostrador.',
                            en: 'The treasurer slides a pouch across the counter.',
                            ru: 'Kaznachej peredvigaet meshochek po stoleshnice.',
                        },
                    },
                ],
            },
            {
                key: 'training-yard',
                emoji: '🎯',
                name: {
                    es: 'Patio de Instruccion',
                    en: 'Training Yard',
                    ru: 'Uchebnyj Dvor',
                },
                typeLabel: {
                    es: 'Entrenamiento',
                    en: 'Training',
                    ru: 'Trenirovka',
                },
                description: {
                    es: 'Postes, blancos y roca marcan el inicio de todo oficio.',
                    en: 'Posts, targets and rock marks start every craft.',
                    ru: 'Stojki, misheni i kamen otkryvayut put lyubomu remeslu.',
                },
                hint: {
                    es: 'Aprende oficios y tecnicas basicas',
                    en: 'Learn basic professions and techniques',
                    ru: 'Izuchaj bazovye remesla i tekhniki',
                },
                services: [
                    {
                        slug: 'training-yard-lesson-chop',
                        emoji: EMOJIS.tools.hachaPiedra,
                        name: {
                            es: 'Leccion de Tala',
                            en: 'Chop Lesson',
                            ru: 'Urok rubki',
                        },
                        duration: {
                            es: 'Req: Nivel 1',
                            en: 'Req: Level 1',
                            ru: 'Req: Uroven 1',
                        },
                        resultLore: {
                            es: 'El primer golpe fue torpe; el segundo, util.',
                            en: 'The first hit was clumsy; the second, useful.',
                            ru: 'Pervyj udar byl neuklyuzhim; vtoroj poleznym.',
                        },
                    },
                    {
                        slug: 'training-yard-lesson-gather',
                        emoji: EMOJIS.tools.canastaPaja,
                        name: {
                            es: 'Leccion de Recoleccion',
                            en: 'Gather Lesson',
                            ru: 'Urok sbora',
                        },
                        duration: {
                            es: 'Req: Nivel 3',
                            en: 'Req: Level 3',
                            ru: 'Req: Uroven 3',
                        },
                        resultLore: {
                            es: 'Tus manos distinguen lo util entre hojas y lodo.',
                            en: 'Your hands now spot value among leaves and mud.',
                            ru: 'Tvoi ruki uzhe vidyat cennost sredi listyev i gryazi.',
                        },
                    },
                    {
                        slug: 'training-yard-lesson-mine',
                        emoji: EMOJIS.tools.picoPiedra,
                        name: {
                            es: 'Leccion de Mineria',
                            en: 'Mining Lesson',
                            ru: 'Urok dobychi',
                        },
                        duration: {
                            es: 'Req: Nivel 5',
                            en: 'Req: Level 5',
                            ru: 'Req: Uroven 5',
                        },
                        resultLore: {
                            es: 'La roca deja de ser muro y se vuelve promesa.',
                            en: 'Rock stops being a wall and becomes a promise.',
                            ru: 'Skala perestaet byt stenoj i stanovitsya obeshchaniem.',
                        },
                    },
                    {
                        slug: 'training-yard-lesson-fishing',
                        emoji: EMOJIS.tools.canapez,
                        name: {
                            es: 'Leccion de Pesca',
                            en: 'Fishing Lesson',
                            ru: 'Urok rybalki',
                        },
                        duration: {
                            es: 'Req: Nivel 8',
                            en: 'Req: Level 8',
                            ru: 'Req: Uroven 8',
                        },
                        resultLore: {
                            es: 'Paciencia y pulso: el agua tambien alimenta.',
                            en: 'Patience and poise: water can feed you too.',
                            ru: 'Terpenie i tvyordaya ruka: voda tozhe kormit.',
                        },
                    },
                ],
            },
            {
                key: 'grand-exchange',
                emoji: '🏛️',
                name: {
                    es: 'Gran Mercado Nova',
                    en: 'Nova Grand Exchange',
                    ru: 'Grand Exchange Nova',
                },
                typeLabel: {
                    es: 'Mercado',
                    en: 'Market',
                    ru: 'Rynok',
                },
                description: {
                    es: 'Centro de comercio impulsado por jugadores. Ordenes, book y cambio de divisas.',
                    en: 'Player-driven market hub with order books and currency exchange.',
                    ru: 'Torgovyy centr igrokov s knigoy orderov i obmenom valyut.',
                },
                hint: {
                    es: 'Compra y vende con oferta y demanda real',
                    en: 'Trade with real supply and demand',
                    ru: 'Torguy po realnomu sprosu i predlozheniyu',
                },
                services: [
                    {
                        slug: 'grand-exchange-open',
                        emoji: EMOJIS.ui.level,
                        name: {
                            es: 'Abrir Mercado',
                            en: 'Open Market',
                            ru: 'Otkryt rynok',
                        },
                        duration: {
                            es: 'Tiempo real',
                            en: 'Real-time',
                            ru: 'V realnom vremeni',
                        },
                        resultLore: {
                            es: 'Los escribas cantan precios y los corredores cierran tratos al instante.',
                            en: 'Clerks call prices while brokers close deals in seconds.',
                            ru: 'Pistsy obyyavlyayut tseny, a broker yzakryvayut sdelki za sekundy.',
                        },
                    },
                ],
            },
        ],
    },
    'frontier-village': {
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
    },
    'ancient-cave': {
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
    },
    'ancient-ruins': {
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
    },
};
export function getLocalizedText(value, lang, fallback = '') {
    if (!value) {
        return fallback;
    }
    return value[lang] || value.es || value.en || fallback;
}
export function getPlaceUiConfig(placeSlug) {
    if (!placeSlug) {
        return null;
    }
    if (PLACE_UI_CONFIG[placeSlug]) {
        return PLACE_UI_CONFIG[placeSlug];
    }
    if (placeSlug.startsWith('frontier-village-')) {
        return PLACE_UI_CONFIG['frontier-village'];
    }
    if (placeSlug.startsWith('ancient-cave-')) {
        return PLACE_UI_CONFIG['ancient-cave'];
    }
    if (placeSlug.startsWith('ancient-ruins-')) {
        return PLACE_UI_CONFIG['ancient-ruins'];
    }
    return null;
}
