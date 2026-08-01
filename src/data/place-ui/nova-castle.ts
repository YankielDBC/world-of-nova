// @ts-nocheck
import { gildedRest } from './buildings/gilded-rest.js';
import { mercyEdge } from './buildings/mercy-edge.js';
import { crowForge } from './buildings/crow-forge.js';
import { crownChamber } from './buildings/crown-chamber.js';
import { trainingYard } from './buildings/training-yard.js';
import { grandExchange } from './buildings/grand-exchange.js';

export const novaCastlePlace = {
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
        gildedRest,
        mercyEdge,
        crowForge,
        crownChamber,
        trainingYard,
        grandExchange,
    ],
};
