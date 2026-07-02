import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BIOMES = [
  { name: 'plains', emoji: '🌾', displayName: 'Llanuras', description: 'Extensas llanuras verdes con rica vegetación.', movementFactor: 1.0, color: '#90EE90' },
  { name: 'forest', emoji: '🌲', displayName: 'Bosque', description: 'Bosque denso con árboles altos y sotobosque.', movementFactor: 1.2, color: '#228B22' },
  { name: 'swamp', emoji: '🪷', displayName: 'Pantano', description: 'Terreno fangoso con aguas estancadas.', movementFactor: 1.5, color: '#556B2F' },
  { name: 'volcano', emoji: '🌋', displayName: 'Volcán', description: 'Tierras volcánicas con lava y ceniza.', movementFactor: 1.3, color: '#8B0000' },
  { name: 'ashlands', emoji: '🌫️', displayName: 'Cenizales', description: 'Llanuras cubiertas de ceniza volcánica.', movementFactor: 1.1, color: '#696969' },
  { name: 'highlands', emoji: '🏔️', displayName: 'Tierras Altas', description: 'Montañas escarpadas con aire fino.', movementFactor: 1.4, color: '#A0522D' },
  { name: 'desert', emoji: '🏜️', displayName: 'Desierto', description: 'Arenales infinitos bajo el sol abrasador.', movementFactor: 1.3, color: '#F4A460' },
  { name: 'tundra', emoji: '❄️', displayName: 'Tundra', description: 'Heladas llanuras cubiertas de nieve.', movementFactor: 1.2, color: '#E0FFFF' },
  { name: 'river', emoji: '🌊', displayName: 'Río', description: 'Corrientes de agua que cruzan el territorio.', movementFactor: 0.5, color: '#4169E1' },
  { name: 'lake', emoji: '🏞️', displayName: 'Lago', description: 'Tranquilas aguas lacustres.', movementFactor: 0.3, color: '#1E90FF' },
];

const BIOME_RESOURCE_LINKS = {
  forest: [
    { resourceName: 'Wood', spawnChance: 90, minQuantity: 1, maxQuantity: 3 },
    { resourceName: 'Pine Cone', spawnChance: 10, minQuantity: 1, maxQuantity: 1 },
    { resourceName: 'Apple', spawnChance: 12, minQuantity: 1, maxQuantity: 2 },
    { resourceName: 'Orange', spawnChance: 9, minQuantity: 1, maxQuantity: 2 },
    { resourceName: 'Mango', spawnChance: 4, minQuantity: 1, maxQuantity: 1 },
    { resourceName: 'Coconut', spawnChance: 16, minQuantity: 1, maxQuantity: 1 },
    { resourceName: 'Water', spawnChance: 5, minQuantity: 1, maxQuantity: 2 },
    { resourceName: 'Bamboo', spawnChance: 2, minQuantity: 2, maxQuantity: 4 },
    { resourceName: 'Ancient Wood', spawnChance: 1, minQuantity: 1, maxQuantity: 2 },
  ],
  swamp: [
    { resourceName: 'Champiñón', spawnChance: 30, minQuantity: 2, maxQuantity: 4 },
    { resourceName: 'Baba Verde', spawnChance: 25, minQuantity: 1, maxQuantity: 3 },
    { resourceName: 'Hierbas', spawnChance: 20, minQuantity: 2, maxQuantity: 4 },
    { resourceName: 'Insectos', spawnChance: 15, minQuantity: 2, maxQuantity: 4 },
    { resourceName: 'Barro', spawnChance: 5, minQuantity: 1, maxQuantity: 2 },
    { resourceName: 'Champiñón Mágico', spawnChance: 3, minQuantity: 1, maxQuantity: 1 },
    { resourceName: 'Seda', spawnChance: 1, minQuantity: 1, maxQuantity: 3 },
  ],
  plains: [
    { resourceName: 'Trigo', spawnChance: 30, minQuantity: 2, maxQuantity: 5 },
    { resourceName: 'Semillas', spawnChance: 18, minQuantity: 1, maxQuantity: 3 },
    { resourceName: 'Hierbas', spawnChance: 22, minQuantity: 1, maxQuantity: 4 },
    { resourceName: 'FlorDragón', spawnChance: 5, minQuantity: 1, maxQuantity: 2 },
    { resourceName: 'Flores', spawnChance: 15, minQuantity: 3, maxQuantity: 6 },
    { resourceName: 'Girasol', spawnChance: 10, minQuantity: 1, maxQuantity: 3 },
    { resourceName: 'Hierbas Secas', spawnChance: 3, minQuantity: 2, maxQuantity: 4 },
    { resourceName: 'Hojas de Viento', spawnChance: 2, minQuantity: 1, maxQuantity: 2 },
  ],
  volcano: [
    { resourceName: 'Roca Volcánica', spawnChance: 75, minQuantity: 1, maxQuantity: 4 },
    { resourceName: 'Cenizas', spawnChance: 45, minQuantity: 2, maxQuantity: 5 },
    { resourceName: 'Carbón', spawnChance: 8, minQuantity: 1, maxQuantity: 2 },
  ],
  river: [
    { resourceName: 'Agua', spawnChance: 40, minQuantity: 2, maxQuantity: 4 },
    { resourceName: 'Pez Amarillo', spawnChance: 35, minQuantity: 1, maxQuantity: 3 },
    { resourceName: 'Pez Azul', spawnChance: 13, minQuantity: 1, maxQuantity: 2 },
  ],
};

async function main() {
  console.log('Seeding world...');

  const worldMap = await prisma.worldMap.upsert({
    where: { name: 'Novaria' },
    update: { width: 100, height: 100, description: 'El mundo principal de Nova.' },
    create: { name: 'Novaria', width: 100, height: 100, description: 'El mundo principal de Nova.' },
  });
  console.log(`WorldMap: "${worldMap.name}" (id=${worldMap.id})`);

  for (const biome of BIOMES) {
    const created = await prisma.biome.upsert({
      where: { name: biome.name },
      update: biome,
      create: biome,
    });

    const links = BIOME_RESOURCE_LINKS[biome.name];
    if (links) {
      for (const link of links) {
        const resource = await prisma.resource.findUnique({ where: { name: link.resourceName } });
        if (resource) {
          await prisma.biomeResource.upsert({
            where: { biomeId_resourceId: { biomeId: created.id, resourceId: resource.id } },
            update: { spawnChance: link.spawnChance, minQuantity: link.minQuantity, maxQuantity: link.maxQuantity },
            create: { biomeId: created.id, resourceId: resource.id, spawnChance: link.spawnChance, minQuantity: link.minQuantity, maxQuantity: link.maxQuantity },
          });
        }
      }
    }
  }

  console.log(`Seeded ${BIOMES.length} biomes with resource links.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
