// @ts-nocheck
import { EMOJIS } from '../../emojis.js';
export const grandExchange = {
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
                ru: 'Pistyy obyyavlyayut tseny, a broker yzakryvayut sdelki za sekundy.',
            },
        },
    ],
};
