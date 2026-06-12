# Equipment Phase 1 Checkpoint

## Fecha

2026-04-09

## Objetivo de esta fase

Abrir el dominio de equipamiento correctamente dentro del proyecto sin forzar aun la UI, los drops ni el mercado.

Esta fase busca dejar lista la base tecnica para:

- templates de gear
- instancias unicas de gear
- slots reales de equipamiento
- lectura de stats rolados
- agregacion de bonuses sobre el runtime de combate

---

## Lo que se implemento

### 1. Schema Prisma ampliado

Archivo:

- `prisma/schema.prisma`

Se agrego:

- `EquipmentTemplate`
- `EquipmentInstance`

Y se amplio:

- `Player`
- `PlayerBagSlot`
- `PlayerEquipment`

### Nuevos conceptos ya modelados

- template base de item
- item unico instanciado
- container type
- bind type
- item level
- rarity
- quality score
- durability
- implicit stats
- explicit stats
- special effect key
- slots reales de equipo

### Slots abiertos en `PlayerEquipment`

- `head`
- `chest`
- `legs`
- `boots`
- `gloves`
- `belt`
- `cloak`
- `ring1`
- `ring2`
- `amulet`
- `mainHand`
- `offHand`
- `twoHand`
- `fishingTool`

Las herramientas actuales siguen coexistiendo:

- `chopTool`
- `mineTool`
- `gatherTool`

---

## 2. Vocabulario compartido de equipment

Archivo:

- `src/data/equipment.ts`

Se centralizo:

- orden de slots
- labels de slots
- rarezas
- bind types
- container types
- stat keys de combate
- stat keys utilitarios

Esto evita que mochila, market, drops y UI nazcan hablando idiomas distintos.

---

## 3. Tipos del dominio equipment

Archivo:

- `src/services/equipment-types.ts`

Incluye:

- forma runtime de template
- forma runtime de instance
- mapas de stats
- modifiers de combate
- modifiers utilitarios
- breakdown por item
- aggregate total del set equipado

---

## 4. Runtime de agregacion de gear

Archivo:

- `src/services/equipment-runtime.ts`

Ya resuelve:

- parseo seguro de `implicitStatsJson`
- parseo seguro de `explicitStatsJson`
- merge de stats
- separacion entre combat modifiers y utility modifiers
- breakdown por item
- estimacion de `gearScore`

---

## 5. Fachada de servicio

Archivo:

- `src/services/equipment.ts`

Expone helpers limpios para:

- aggregate completo
- combat modifiers
- utility modifiers
- gear score

---

## 6. Nucleo de stats ampliado

Archivo:

- `src/lib/db.ts`

El calculador `calculateCombatStats(...)` ya acepta mas modifiers compatibles con gear:

- `maxHpPct`
- `maxEnergyPct`
- `maxSoulFlat`
- `baseDamageFlat`
- `atkSpeedFlat`
- `moveSpeedFlat`

Y esos modifiers ya alteran el resultado final del runtime de combate.

---

## Estado real tras esta fase

### Ya esta listo

- modelado base de equipment
- slots reales
- lectura de affixes/bonuses desde JSON
- agregacion de modifiers
- compatibilidad del motor de stats con gear

### Aun no esta cableado al gameplay

- no hay generador procedural todavia
- no hay seeds de templates
- no hay UI de mochila para `equipment`
- no hay equip/unequip de gear
- no hay drops de gear
- no hay market de gear
- no hay repair flow de gear

---

## Limitacion encontrada

`npx prisma validate` paso correctamente.

`npx prisma generate` no pudo terminar por bloqueo del engine en Windows:

- `EPERM ... query_engine-windows.dll.node`

Eso apunta a archivo bloqueado por proceso vivo, no a fallo del schema.

---

## Siguiente fase correcta

### Fase 2

1. crear catalogo inicial de `EquipmentTemplate`
2. crear generador procedural de `EquipmentInstance`
3. extender mochila para soportar `equipment`
4. extender `PlayerEquipment` runtime para equipar slots nuevos
5. mostrar comparativa de stats al inspeccionar gear

### Fase 3

1. drops por criaturas, ruinas, cuevas y mercader
2. repair/salvage
3. mercado de gear
4. gear score en profile e inspect

---

## Veredicto

El proyecto ya tiene la base correcta para que el sistema de equipamiento nazca bien.

Desde aqui ya no hace falta improvisar.
Lo siguiente ya puede ser implementacion de gameplay puro sobre una estructura sana.

