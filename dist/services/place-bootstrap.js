import { prisma } from '../lib/db.js';
import { EMOJIS } from '../data/emojis.js';
const NOVA_FISHING_INTERACTIONS = [
    {
        slug: 'crow-forge-buy-fishing-rod',
        name: 'Crow Forge - Bamboo Rod',
        displayName: 'Bamboo Rod',
        description: 'Buy a basic fishing tool.',
        type: 'SERVICE',
        emoji: EMOJIS.tools.canapez,
        costType: 'SILVER',
        costAmount: 9,
        effectType: null,
        effectValue: null,
        instantFull: false,
        sortOrder: 9,
    },
    {
        slug: 'training-yard-lesson-fishing',
        name: 'Training Yard - Fishing Lesson',
        displayName: 'Fishing Lesson',
        description: 'Basic fishing discipline.',
        type: 'SERVICE',
        emoji: EMOJIS.tools.canapez,
        costType: 'SILVER',
        costAmount: 9,
        effectType: null,
        effectValue: null,
        instantFull: false,
        sortOrder: 15,
    },
];
export async function ensureNovaFishingEnabled() {
    const place = await prisma.place.findFirst({
        where: { slug: 'nova-castle' },
        select: { id: true },
    });
    if (!place) {
        return;
    }
    for (const interaction of NOVA_FISHING_INTERACTIONS) {
        await prisma.placeInteraction.upsert({
            where: { placeId_slug: { placeId: place.id, slug: interaction.slug } },
            create: {
                ...interaction,
                placeId: place.id,
            },
            update: {
                name: interaction.name,
                displayName: interaction.displayName,
                description: interaction.description,
                type: interaction.type,
                emoji: interaction.emoji,
                costType: interaction.costType,
                costAmount: interaction.costAmount,
                effectType: interaction.effectType,
                effectValue: interaction.effectValue,
                instantFull: interaction.instantFull,
                sortOrder: interaction.sortOrder,
            },
        });
    }
}
