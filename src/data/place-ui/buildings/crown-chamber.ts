// @ts-nocheck
import { EMOJIS } from '../../emojis.js';
export const crownChamber = {
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
};
