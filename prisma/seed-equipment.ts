import { PrismaClient } from '@prisma/client';
import { EQUIPMENT_TEMPLATE_CATALOG } from '../src/data/equipment-catalog.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding equipment templates...');
  for (const template of EQUIPMENT_TEMPLATE_CATALOG) {
    await prisma.equipmentTemplate.upsert({
      where: { key: template.key },
      update: {
        name: template.name,
        shortName: template.shortName,
        emoji: template.emoji,
        slot: template.slot,
        archetype: template.archetype,
        weaponClass: template.weaponClass || null,
        armorClass: template.armorClass || null,
        description: template.description,
        requiredLevel: template.requiredLevel,
        allowedClassesJson: JSON.stringify(template.allowedClasses || []),
        allowedRacesJson: JSON.stringify(template.allowedRaces || []),
        bindTypeDefault: template.bindTypeDefault,
        baseValue: template.baseValue,
        weightKg: template.weightKg,
        salvageTableKey: template.salvageTableKey || null,
        implicitStatProfileJson: JSON.stringify(template.implicitStatProfile),
        dropFamily: template.dropFamily,
        isEnabled: true,
      },
      create: {
        key: template.key,
        name: template.name,
        shortName: template.shortName,
        emoji: template.emoji,
        slot: template.slot,
        archetype: template.archetype,
        weaponClass: template.weaponClass || null,
        armorClass: template.armorClass || null,
        description: template.description,
        requiredLevel: template.requiredLevel,
        allowedClassesJson: JSON.stringify(template.allowedClasses || []),
        allowedRacesJson: JSON.stringify(template.allowedRaces || []),
        bindTypeDefault: template.bindTypeDefault,
        baseValue: template.baseValue,
        weightKg: template.weightKg,
        salvageTableKey: template.salvageTableKey || null,
        implicitStatProfileJson: JSON.stringify(template.implicitStatProfile),
        dropFamily: template.dropFamily,
        isEnabled: true,
      },
    });
  }
  console.log(`Seeded ${EQUIPMENT_TEMPLATE_CATALOG.length} equipment templates.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
