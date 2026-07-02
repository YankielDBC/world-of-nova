import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NOVA_CASTLE = {
  slug: 'nova-castle',
  name: 'Nova Castle',
  displayName: 'Castillo Nova',
  description: 'El corazón del reino. Castillo principal donde los aventureros descansan, comercian y se preparan.',
  type: 'town',
  coordX: 0,
  coordY: 0,
  emoji: '🏰',
  pvpAllowed: false,
  combatAllowed: false,
  triggerType: null,
  expiresAt: null,
  isActive: true,
};

const CASTLE_INTERACTIONS = [
  // Gilded Rest - Motel
  { slug: 'gilded-rest-free', name: 'Plan Free', displayName: 'Plan Free', type: 'service', emoji: '🛌', costType: null, costAmount: null, effectType: 'rest', effectValue: null, instantFull: false, sortOrder: 1 },
  { slug: 'gilded-rest', name: 'Básico', displayName: 'Básico', type: 'service', emoji: '💤', costType: 'silver', costAmount: 10, effectType: 'rest', effectValue: null, instantFull: false, sortOrder: 2 },
  { slug: 'gilded-rest-quick', name: 'S. Veloz', displayName: 'S. Veloz', type: 'service', emoji: '⚡', costType: 'silver', costAmount: 25, effectType: 'rest', effectValue: null, instantFull: false, sortOrder: 3 },
  // Mercy Edge - Temple
  { slug: 'mercy-edge-free', name: 'Plan Free', displayName: 'Plan Free', type: 'service', emoji: '🩹', costType: null, costAmount: null, effectType: 'heal', effectValue: null, instantFull: false, sortOrder: 4 },
  { slug: 'mercy-edge', name: 'Misericordia', displayName: 'Misericordia', type: 'service', emoji: '✨', costType: 'silver', costAmount: 15, effectType: 'heal', effectValue: null, instantFull: false, sortOrder: 5 },
  { slug: 'mercy-edge-divine', name: 'I. Divina', displayName: 'I. Divina', type: 'service', emoji: '✨', costType: 'silver', costAmount: 40, effectType: 'heal', effectValue: null, instantFull: true, sortOrder: 6 },
  // Crow Forge - Smithy
  { slug: 'crow-forge-repair-quick', name: 'A. Rápido', displayName: 'A. Rápido', type: 'service', emoji: '🔧', costType: 'silver', costAmount: 4, effectType: 'repair_quick', effectValue: null, instantFull: false, sortOrder: 7 },
  { slug: 'crow-forge-repair-full', name: 'R. Completa', displayName: 'R. Completa', type: 'service', emoji: '🔥', costType: 'silver', costAmount: 10, effectType: 'repair_full', effectValue: null, instantFull: true, sortOrder: 8 },
  { slug: 'crow-forge-buy-pick', name: 'Pico de Piedra', displayName: 'Pico de Piedra', type: 'shop', emoji: '⛏️', costType: 'silver', costAmount: 32, effectType: 'buy_tool', effectValue: null, instantFull: true, sortOrder: 9 },
  { slug: 'crow-forge-buy-axe', name: 'Hacha de Piedra', displayName: 'Hacha de Piedra', type: 'shop', emoji: '🪓', costType: 'silver', costAmount: 28, effectType: 'buy_tool', effectValue: null, instantFull: true, sortOrder: 10 },
  { slug: 'crow-forge-buy-fishing-rod', name: 'Caña de Bambú', displayName: 'Caña de Bambú', type: 'shop', emoji: '🎣', costType: 'silver', costAmount: 22, effectType: 'buy_tool', effectValue: null, instantFull: true, sortOrder: 11 },
  // Crown Chamber - Bank
  { slug: 'crown-chamber-open', name: 'Abrir Bóveda', displayName: 'Abrir Bóveda', type: 'service', emoji: '📦', costType: null, costAmount: null, effectType: 'open_vault', effectValue: null, instantFull: true, sortOrder: 12 },
  { slug: 'crown-chamber-deposit-silver', name: 'Depositar Plata', displayName: 'Depositar Plata', type: 'service', emoji: '💰', costType: null, costAmount: null, effectType: 'deposit', effectValue: null, instantFull: true, sortOrder: 13 },
  { slug: 'crown-chamber-withdraw-silver', name: 'Retirar Plata', displayName: 'Retirar Plata', type: 'service', emoji: '🪙', costType: null, costAmount: null, effectType: 'withdraw', effectValue: null, instantFull: true, sortOrder: 14 },
  // Training Yard
  { slug: 'training-yard-lesson-chop', name: 'Lección de Tala', displayName: 'Lección de Tala', type: 'service', emoji: '🪓', costType: 'silver', costAmount: 5, effectType: 'learn_skill', effectValue: null, instantFull: true, sortOrder: 15 },
  { slug: 'training-yard-lesson-gather', name: 'Lección de Recolección', displayName: 'Lección de Recolección', type: 'service', emoji: '✂️', costType: 'silver', costAmount: 8, effectType: 'learn_skill', effectValue: null, instantFull: true, sortOrder: 16 },
  { slug: 'training-yard-lesson-mine', name: 'Lección de Minería', displayName: 'Lección de Minería', type: 'service', emoji: '⛏️', costType: 'silver', costAmount: 12, effectType: 'learn_skill', effectValue: null, instantFull: true, sortOrder: 17 },
  { slug: 'training-yard-lesson-fishing', name: 'Lección de Pesca', displayName: 'Lección de Pesca', type: 'service', emoji: '🎣', costType: 'silver', costAmount: 15, effectType: 'learn_skill', effectValue: null, instantFull: true, sortOrder: 18 },
  // Grand Exchange
  { slug: 'grand-exchange-open', name: 'Abrir Mercado', displayName: 'Abrir Mercado', type: 'service', emoji: '📈', costType: null, costAmount: null, effectType: 'open_market', effectValue: null, instantFull: true, sortOrder: 19 },
];

async function main() {
  console.log('Seeding places...');

  const place = await prisma.place.upsert({
    where: { slug: NOVA_CASTLE.slug },
    update: NOVA_CASTLE,
    create: NOVA_CASTLE,
  });

  for (const interaction of CASTLE_INTERACTIONS) {
    await prisma.placeInteraction.upsert({
      where: { placeId_slug: { placeId: place.id, slug: interaction.slug } },
      update: { ...interaction, placeId: place.id },
      create: { ...interaction, placeId: place.id },
    });
  }

  console.log(`Seeded place "${NOVA_CASTLE.slug}" with ${CASTLE_INTERACTIONS.length} interactions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
