// @ts-nocheck
import { prisma } from '../lib/db.js';
import { EMOJIS } from '../data/emojis.js';
export async function ensureBagEmojisEnabled() {
    await prisma.bagDefinition.updateMany({
        where: {
            slug: {
                in: ['travel-bag', 'leather-pack'],
            },
        },
        data: {
            emoji: EMOJIS.ui.bag,
        },
    });
}
//# sourceMappingURL=bag-bootstrap.js.map