# BAGS.md — Sistema de mochilas e inventario

> Tipos de bolsa, capacidad, peso, transferencias y herramientas. Agnóstico a plataforma.

---

## 1. Definiciones de bolsas

| Slug | Nombre | Emoji | Comando | Slots | Peso máx. (kg) | Peso propio | Stack máx. | Es bolsillo |
|------|--------|-------|---------|-------|----------------|-------------|------------|-------------|
| `pockets` | Bolsillos | 👖 | — | 5 | 5.0 | 0.0 | 20 | Sí |
| `travel-bag` | Bolsa de Viaje | 💼 | `/bag` | 12 | 15.0 | 0.5 | 20 | No |
| `leather-pack` | Mochila de Cuero | 🎒 | `/pack` | 20 | 25.0 | 0.8 | 30 | No |
| `vault_chamber` | Bóveda de la Corona | 🏦 | `/vault` | 20 | 9999 | 0.5 | 999 | No |
| `village_chest` | Baúl del Pueblo | 🧰 | `/chest` | 10 | 9999 | 0.5 | 999 | No |

---

## 2. Estados de una bolsa

| Estado | Significado |
|--------|-------------|
| `ACTIVE` | Bolsa actualmente en uso. |
| `STORED` | Bolsa guardada dentro de otra bolsa. |
| `DORMANT` | Bolsa inactiva (p. ej., bolsillos cuando se usa otra bolsa). |

---

## 3. Cálculo de uso de la bolsa activa

```
usedSlots   = contar slots que no sean herramientas equipadas
totalSlots  = bag.definition.slotCapacity
usedWeight  = suma(peso de cada slot contado)
totalWeight = bag.definition.weightCapacityKg
```

### Peso por tipo de slot

- **Recurso**: `resource.weightKg * quantity`
- **Bolsa almacenada**: `storedBag.definition.itemWeightKg`
- **Equipamiento**: `equipmentInstance.template.weightKg`
- **Herramienta**: `getToolWeight(toolKey)`

### Mensajes de capacidad

```
Si excede peso y slots: "No cabe: superarías el peso (X/Y kg) y los slots (A/B)."
Si solo peso:          "No cabe: superarías el peso (X/Y kg)."
Si solo slots:         "No cabe: superarías los slots (A/B)."
```

---

## 4. Reglas de bolsillos (`pockets`)

- Siempre existen para cada jugador.
- Si no hay otra bolsa activa, los bolsillos pasan a `ACTIVE`.
- Al cambiar a otra bolsa, los bolsillos pasan a `DORMANT`.
- Capacidad: **5 slots, 5.0 kg, stack máximo 20**.
- No se pueden almacenar dentro de otra bolsa.

---

## 5. Cambio de bolsa

1. La bolsa destino debe estar vacía.
2. Se calcula un plan de transferencia con todo el contenido de la bolsa origen.
3. Si la bolsa origen no es `pockets`, se añade ella misma como ítem `storedBag` en el destino.
4. Si cabe en peso y slots:
   - Se eliminan los slots de ambas bolsas.
   - Se cambian los estados.
   - Se recrean los slots en la bolsa destino.

### Plan de transferencia a bolsa vacía

```
1. Agrupar recursos del mismo tipo.
2. Respetar el límite de stack por bolsa.
3. Calcular:
   - slotsNeeded: número total de slots requeridos.
   - totalWeightKg: peso total.
   - blueprint: lista detallada de cada entrada.
```

---

## 6. Acciones con ítems del inventario

| Acción | Descripción |
|--------|-------------|
| `useBagSlot` | Consume un consumible (HP/STA) o usa un ítem usable. |
| `dropBagSlot` | Tira ítems al suelo en el tile actual. |
| `equipToolFromBagItem` | Equipa una herramienta desde la bolsa. |
| `unequipToolByAlias` | Desequipa una herramienta y la devuelve a la bolsa. |
| `pickupDroppedEquipment` | Recoge equipo del suelo. |
| `pickupDroppedTool` | Recoge herramienta del suelo. |
| `pickupDroppedBag` | Recoge una bolsa del suelo. |

---

## 7. Herramientas

### Tipos de herramienta

| Tipo | Acción | Ejemplo |
|------|--------|---------|
| `woodcutting` | Chop | Hacha |
| `mining` | Mine | Pico |
| `gathering` | Gather | Canasta/tijeras |
| `harvesting` | Harvest | Vara |
| `fishing` | Fish | Caña |

### Herramientas iniciales (`/starterkit`)

- `hachaPiedra` — Hacha de Piedra (woodcutting)
- `picoPiedra` — Pico de Piedra (mining)
- `basket` — Tijera de Piedra (gathering)

### Durabilidad

- Cada uso de recolección reduce durabilidad.
- Cuando llega a 0, la herramienta se rompe.
- Equipar/Desequipar se hace por alias (ej. `/eq_<playerToolId>`).

---

## 8. Slots del inventario

Cada slot puede contener:

1. **Recurso apilado**: cantidad, nombre, peso total.
2. **Instancia de equipamiento**: referencia a plantilla + stats explícitos.
3. **Herramienta**: referencia a definición de herramienta + durabilidad actual.
4. **Bolsa almacenada**: otra bolsa con su propio contenido.

---

## 9. Referencia de implementación

| Archivo | Función/constante clave |
|---------|-------------------------|
| `prisma/seed-bags.ts` | `BAG_DEFINITIONS` |
| `src/services/bags-types.ts` | `ACTIVE_STATUS`, `STORED_STATUS`, `DORMANT_STATUS`, `POCKETS_SLUG` |
| `src/services/bags-core.ts` | `buildBagUsage()`, `getSlotWeightKg()`, `buildEmptyBagTransferPlan()`, `buildCapacityReason()` |
| `src/services/bags.ts` | `ensurePlayerBagSetup()`, `getActiveBagView()`, `executeBagSwitch()`, `useBagSlot()`, `dropBagSlot()` |
| `src/services/bags-tools.ts` | `equipToolFromBagItem()`, `unequipToolByAlias()`, `getEquippedToolForAction()`, `applyDurabilityDamageOnEquippedTool()` |
| `src/services/tools.ts` | Definiciones de herramientas |
| `src/types/tools.ts` | Tipos de herramientas |

---

## Notas para reimplementación

1. **Bolsa activa única**: solo una bolsa puede estar `ACTIVE` por jugador; el resto se almacena o queda dormant.
2. **Peso acumulado**: el peso total del inventario afecta la capacidad; las herramientas equipadas no cuentan.
3. **Stacks**: respetar `maxStack` por tipo de bolsa (no es global 99 para todas).
4. **Transferencias**: siempre validar peso y slots antes de mover ítems entre bolsas o del suelo.
5. **Bolsillos como fallback**: garantizar que el jugador siempre tenga al menos los bolsillos disponibles.
6. **Herramientas**: separar del equipo de combate; tienen durabilidad y slots de acción propios.
