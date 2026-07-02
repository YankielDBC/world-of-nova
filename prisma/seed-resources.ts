import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const RESOURCES = [
  { name: 'Wood', emoji: '🪵', description: 'Madera básica para crafteo inicial.', type: 'material', rarity: 'common', weightKg: 0.5, baseValue: 1, stackable: true, maxStack: 99 },
  { name: 'Pine Cone', emoji: '🌰', description: 'Semilla de pino usada en recetas simples.', type: 'material', rarity: 'rare', weightKg: 0.1, baseValue: 3, stackable: true, maxStack: 99 },
  { name: 'Apple', emoji: '🍎', description: 'Fruta que recupera un poco de STA.', type: 'consumable', rarity: 'common', weightKg: 0.2, usable: true, effectType: 'sta', effectValue: 5, baseValue: 2, stackable: true, maxStack: 99 },
  { name: 'Orange', emoji: '🍊', description: 'Fruta cítrica que recupera STA.', type: 'consumable', rarity: 'uncommon', weightKg: 0.2, usable: true, effectType: 'sta', effectValue: 8, baseValue: 4, stackable: true, maxStack: 99 },
  { name: 'Mango', emoji: '🥭', description: 'Fruta rara que recupera más STA.', type: 'consumable', rarity: 'rare', weightKg: 0.3, usable: true, effectType: 'sta', effectValue: 15, baseValue: 8, stackable: true, maxStack: 99 },
  { name: 'Coconut', emoji: '🥥', description: 'Fruta pesada que recupera buena STA.', type: 'consumable', rarity: 'common', weightKg: 0.6, usable: true, effectType: 'sta', effectValue: 12, baseValue: 5, stackable: true, maxStack: 99 },
  { name: 'Water', emoji: '💧', description: 'Agua potable para recuperar STA.', type: 'consumable', rarity: 'common', weightKg: 0.3, usable: true, effectType: 'sta', effectValue: 6, baseValue: 2, stackable: true, maxStack: 99 },
  { name: 'Bamboo', emoji: '🎋', description: 'Material flexible para estructuras ligeras.', type: 'material', rarity: 'uncommon', weightKg: 0.4, baseValue: 3, stackable: true, maxStack: 99 },
  { name: 'Ancient Wood', emoji: '🪵', description: 'Madera rara de alto valor.', type: 'material', rarity: 'rare', weightKg: 0.8, baseValue: 10, stackable: true, maxStack: 99 },
  { name: 'Champiñón', emoji: '🍄', description: 'Hongo común con leve recuperación de HP.', type: 'consumable', rarity: 'common', weightKg: 0.1, usable: true, effectType: 'hp', effectValue: 3, baseValue: 1, stackable: true, maxStack: 99 },
  { name: 'Baba Verde', emoji: '🟢', description: 'Material viscoso para alquimia.', type: 'material', rarity: 'common', weightKg: 0.3, baseValue: 2, stackable: true, maxStack: 99 },
  { name: 'Hierbas', emoji: '🌿', description: 'Planta común de recolección.', type: 'material', rarity: 'common', weightKg: 0.1, baseValue: 1, stackable: true, maxStack: 99 },
  { name: 'Insectos', emoji: '🐛', description: 'Ingrediente común de cebo y recetas.', type: 'material', rarity: 'uncommon', weightKg: 0.05, baseValue: 2, stackable: true, maxStack: 99 },
  { name: 'Barro', emoji: '🟤', description: 'Base para mezclas y crafteo.', type: 'material', rarity: 'common', weightKg: 0.5, baseValue: 1, stackable: true, maxStack: 99 },
  { name: 'Champiñón Mágico', emoji: '🪻', description: 'Hongo raro con recuperación alta de HP.', type: 'consumable', rarity: 'rare', weightKg: 0.1, usable: true, effectType: 'hp', effectValue: 25, baseValue: 12, stackable: true, maxStack: 99 },
  { name: 'Hueso', emoji: '🦴', description: 'Resto ancestral de criaturas antiguas.', type: 'material', rarity: 'rare', weightKg: 0.4, baseValue: 6, stackable: true, maxStack: 99 },
  { name: 'Ámbar', emoji: '🟡', description: 'Gema fosilizada de gran valor.', type: 'material', rarity: 'epic', weightKg: 0.2, baseValue: 25, stackable: true, maxStack: 99 },
  { name: 'Ojo Ancestral', emoji: '👁️', description: 'Reliquia legendaria de poder antiguo.', type: 'material', rarity: 'legendary', weightKg: 0.1, baseValue: 50, stackable: true, maxStack: 99 },
  { name: 'Seda', emoji: '🧵', description: 'Fibra fina para confección.', type: 'material', rarity: 'uncommon', weightKg: 0.1, baseValue: 4, stackable: true, maxStack: 99 },
  { name: 'Trigo', emoji: '🌽', description: 'Grano básico de alimento.', type: 'material', rarity: 'common', weightKg: 0.2, baseValue: 1, stackable: true, maxStack: 99 },
  { name: 'Semillas', emoji: '🌱', description: 'Semillas para plantar o procesar.', type: 'material', rarity: 'common', weightKg: 0.05, baseValue: 1, stackable: true, maxStack: 99 },
  { name: 'Hierba', emoji: '🌿', description: 'Hierba común de recolección.', type: 'material', rarity: 'common', weightKg: 0.1, baseValue: 1, stackable: true, maxStack: 99 },
  { name: 'FlorDragón', emoji: '🌺', description: 'Flor rara con propiedades curativas.', type: 'consumable', rarity: 'rare', weightKg: 0.1, usable: true, effectType: 'hp', effectValue: 15, baseValue: 8, stackable: true, maxStack: 99 },
  { name: 'Flores', emoji: '🌼', description: 'Flores comunes usadas en preparados.', type: 'material', rarity: 'common', weightKg: 0.05, baseValue: 1, stackable: true, maxStack: 99 },
  { name: 'Girasol', emoji: '🌻', description: 'Flor resistente con usos varios.', type: 'material', rarity: 'uncommon', weightKg: 0.15, baseValue: 3, stackable: true, maxStack: 99 },
  { name: 'Hierbas Secas', emoji: '🥀', description: 'Fibra vegetal para mezclas y fuego.', type: 'material', rarity: 'common', weightKg: 0.05, baseValue: 1, stackable: true, maxStack: 99 },
  { name: 'Hojas de Viento', emoji: '🍁', description: 'Hoja épica usada en recetas avanzadas.', type: 'material', rarity: 'epic', weightKg: 0.05, baseValue: 20, stackable: true, maxStack: 99 },
  { name: 'Roca Volcánica', emoji: '🪨', description: 'Mineral pesado de zonas volcánicas.', type: 'material', rarity: 'common', weightKg: 1.0, baseValue: 2, stackable: true, maxStack: 99 },
  { name: 'Cenizas', emoji: '🌫️', description: 'Residuo ligero de origen volcánico.', type: 'material', rarity: 'common', weightKg: 0.05, baseValue: 1, stackable: true, maxStack: 99 },
  { name: 'Carbón', emoji: '⚫', description: 'Combustible mineral útil en hornos.', type: 'material', rarity: 'uncommon', weightKg: 0.3, baseValue: 3, stackable: true, maxStack: 99 },
  { name: 'Agua', emoji: '💧', description: 'Agua potable para recuperar STA.', type: 'consumable', rarity: 'common', weightKg: 0.3, usable: true, effectType: 'sta', effectValue: 4, baseValue: 1, stackable: true, maxStack: 99 },
  { name: 'Pez Amarillo', emoji: '🐠', description: 'Pescado común que recupera STA.', type: 'consumable', rarity: 'common', weightKg: 0.3, usable: true, effectType: 'sta', effectValue: 10, baseValue: 3, stackable: true, maxStack: 99 },
  { name: 'Pez Azul', emoji: '🐟', description: 'Pescado poco común con mejor recuperación de STA.', type: 'consumable', rarity: 'uncommon', weightKg: 0.4, usable: true, effectType: 'sta', effectValue: 18, baseValue: 6, stackable: true, maxStack: 99 },
];

async function main() {
  console.log('Seeding resources...');
  for (const res of RESOURCES) {
    await prisma.resource.upsert({
      where: { name: res.name },
      update: res,
      create: res,
    });
  }
  console.log(`Seeded ${RESOURCES.length} resources.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
