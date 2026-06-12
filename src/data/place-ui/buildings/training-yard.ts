// @ts-nocheck
import { EMOJIS } from '../../emojis.js';
export const trainingYard = {
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
};
