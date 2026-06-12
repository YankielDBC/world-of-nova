// @ts-nocheck
import { EMOJIS } from '../../emojis.js';
export const crowForge = {
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
                ru: 'Kuznec podtyagivaet zaklepki i vypryamlyaet stal.',
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
};
//# sourceMappingURL=crow-forge.js.map