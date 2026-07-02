import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BAG_DEFINITIONS = [
  {
    slug: 'pockets',
    name: 'Pockets',
    displayName: 'Bolsillos',
    emoji: '👖',
    quickCommand: null,
    description: 'Tus bolsillos de siempre. Capacidad limitada pero siempre contigo.',
    slotCapacity: 5,
    weightCapacityKg: 5.0,
    itemWeightKg: 0.0,
    allowResourceStack: true,
    maxResourceStack: 20,
    isPocket: true,
  },
  {
    slug: 'travel-bag',
    name: 'Travel Bag',
    displayName: 'Bolsa de Viaje',
    emoji: '💼',
    quickCommand: '/bag',
    description: 'Bolsa estándar para almacenar objetos del día a día.',
    slotCapacity: 12,
    weightCapacityKg: 15.0,
    itemWeightKg: 0.5,
    allowResourceStack: true,
    maxResourceStack: 20,
    isPocket: false,
  },
  {
    slug: 'leather-pack',
    name: 'Leather Pack',
    displayName: 'Mochila de Cuero',
    emoji: '🎒',
    quickCommand: '/pack',
    description: 'Mochila robusta con más espacio para expediciones largas.',
    slotCapacity: 20,
    weightCapacityKg: 25.0,
    itemWeightKg: 0.8,
    allowResourceStack: true,
    maxResourceStack: 30,
    isPocket: false,
  },
  {
    slug: 'vault_chamber',
    name: 'Crown Vault',
    displayName: 'Bóveda de la Corona',
    emoji: '🏦',
    quickCommand: '/vault',
    description: 'Contenedor seguro para objetos del banco real.',
    slotCapacity: 20,
    weightCapacityKg: 9999,
    itemWeightKg: 0.5,
    allowResourceStack: true,
    maxResourceStack: 999,
    isPocket: false,
  },
  {
    slug: 'village_chest',
    name: 'Village Chest',
    displayName: 'Baúl del Pueblo',
    emoji: '🧰',
    quickCommand: '/chest',
    description: 'Baúl compacto para guardar objetos durante la ruta.',
    slotCapacity: 10,
    weightCapacityKg: 9999,
    itemWeightKg: 0.5,
    allowResourceStack: true,
    maxResourceStack: 999,
    isPocket: false,
  },
];

async function main() {
  console.log('Seeding bag definitions...');
  for (const bag of BAG_DEFINITIONS) {
    await prisma.bagDefinition.upsert({
      where: { slug: bag.slug },
      update: bag,
      create: bag,
    });
  }
  console.log(`Seeded ${BAG_DEFINITIONS.length} bag definitions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
