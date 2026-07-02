# EQUIPMENT.md — Sistema de equipamiento

> Slots, plantillas base, rareza, ligadura y generación de equipo. Agnóstico a plataforma.

---

## 1. Slots de equipamiento

| Slot | Etiqueta | Uso típico |
|------|----------|------------|
| `head` | Head | Cascos, capuchas |
| `chest` | Chest | Armaduras de torso |
| `legs` | Legs | Grebas, pantalones |
| `boots` | Boots | Botas |
| `gloves` | Gloves | Guantes |
| `belt` | Belt | Cinturones |
| `cloak` | Cloak | Capas |
| `ring_1` | Ring I | Anillo izquierdo |
| `ring_2` | Ring II | Anillo derecho |
| `amulet` | Amulet | Amuletos |
| `main_hand` | Main Hand | Armas mano principal |
| `off_hand` | Off Hand | Escudos, armas secundarias |
| `two_hand` | Two Hand | Armas a dos manos |
| `fishing_tool` | Fishing Tool | Cañas y herramientas de pesca |

---

## 2. Rareza

De menor a mayor:

`common` → `uncommon` → `rare` → `epic` → `legendary` → `mythic`

### Peso de rareza para Gear Score

| Rareza | Multiplicador |
|--------|---------------|
| common | 1.0 |
| uncommon | 1.15 |
| rare | 1.35 |
| epic | 1.65 |
| legendary | 2.1 |
| mythic | 2.75 |

---

## 3. Tipos de ligadura

| Tipo | Comportamiento |
|------|----------------|
| `none` | Se puede intercambiar libremente. |
| `bind_on_equip` | Se liga al equipar. |
| `bind_on_pickup` | Se liga al recogerlo. |
| `soulbound` | Ligado permanentemente al personaje. |
| `quest_bound` | Ligado a una misión. |

---

## 4. Stats que puede otorgar un objeto

### Stats de combate

- `maxHpFlat`, `maxHpPct`
- `maxEnergyFlat`, `maxEnergyPct`
- `maxSoulFlat`
- `attackFlat`, `attackPct`
- `arcaneFlat`, `arcanePct`
- `baseDamageFlat`
- `defenseFlat`, `defensePct`
- `critChanceFlat`
- `evasionFlat`
- `atkSpeedFlat`, `atkSpeedPct`
- `moveSpeedFlat`, `moveSpeedPct`
- `resistPhysicalFlat`, `resistElementalFlat`, `resistArcaneFlat`, `resistHolyFlat`, `resistChemicalFlat`

### Stats de utilidad

- `chopYieldPct`, `mineYieldPct`, `gatherYieldPct`, `fishYieldPct`
- `travelStaCostPct`
- `passiveStaRegenFlat`
- `merchantPriceFavorPct`
- `bankFeeReductionPct`
- `dropRateMinorPct`

### Límite de modificadores porcentuales

Todos los modificadores `Pct` se clampan a **[-0.2, 0.2]** (±20%).

---

## 5. Plantillas base de equipamiento

| Key | Nombre | Slot | Nivel | Clase | Ligadura | Peso | Stats implícitos | Familia drop |
|-----|--------|------|-------|-------|----------|------|------------------|--------------|
| `nova_guard_helm` | Casco de Guardia de Nova | head | 1 | — | bind_on_equip | 1.2 | def +2, hp +6 | nova_guard |
| `ashen_hunter_hood` | Capucha del Cazador de Ceniza | head | 4 | curse_hunter | bind_on_equip | 0.6 | crit +1.5%, eva +1 | ashlands |
| `briar_stalker_boots` | Botas del Acecho Briar | boots | 3 | — | bind_on_equip | 0.8 | mov +2%, eva +1 | forest |
| `reedwash_treads` | Botas de Reed Wash | boots | 2 | — | bind_on_equip | 0.7 | mov +1.5%, resist química +1 | river |
| `rootbound_vest` | Chaleco de Raíz Firme | chest | 5 | — | bind_on_equip | 2.1 | hp +12, def +3 | forest |
| `scoria_plate` | Coraza de Escoria | chest | 8 | — | bind_on_pickup | 3.4 | def +5, resist elemental +2 | volcano |
| `watcher_gloves` | Guantes del Vigía | gloves | 4 | — | bind_on_equip | 0.5 | crit +1%, atk speed +1.5% | nova_guard |
| `bogbound_belt` | Cinturón de Fango Quieto | belt | 6 | — | bind_on_equip | 0.9 | resist química +3, sta +4 | swamp |
| `cursebreaker_blade` | Hoja Rompemaldiciones | main_hand | 7 | curse_hunter | bind_on_equip | 1.6 | atk +4, base dmg +1, crit +1.2% | hunter |
| `riverglass_dagger` | Daga de Cristal de Río | main_hand | 5 | alchemist_rogue | bind_on_equip | 1.0 | atk +3, atk speed +2%, eva +1 | river |
| `moon_veil_cloak` | Capa del Velo Lunar | cloak | 6 | — | bind_on_equip | 0.7 | sta +6, resist arcana +2 | nightfall |
| `nova_oath_amulet` | Amuleto del Juramento de Nova | amulet | 3 | — | bind_on_equip | 0.3 | hp +8, resist sagrada +1 | nova_guard |
| `scoria_loop` | Anillo de Escoria | ring_1 | 9 | — | bind_on_pickup | 0.1 | arcano +2, resist elemental +2 | volcano |

---

## 6. Generación procedural

El repositorio actual tiene las constantes y funciones base pero **no un generador procedural completo** de afijos/presupuesto.

### Lo que existe

1. Cada plantilla define `implicitStatProfile` (stats fijos).
2. El objeto puede tener `explicitStatsJson` (stats generados).
3. `buildEquipmentModifierBreakdown(item)` combina implícitos + explícitos.
4. `collectEquipmentModifiers(items)` suma todos los modificadores del equipo equipado.
5. `estimateGearScore(item, combined)` calcula Gear Score:

```
gearScore ≈ round(itemLevel * rarityWeight + magnitud_total_estadísticas)
```

### Stats implícitos vs explícitos

- **Implícitos**: propios de la plantilla; todos los objetos de esa plantilla los tienen.
- **Explícitos**: generados por el sistema de loot/crafting; varían entre instancias.

---

## 7. Equipar y desequipar

- El jugador puede equipar una pieza por slot (con excepción de anillos: 2 slots).
- Al equipar un objeto con `bind_on_equip`, este se liga al jugador.
- Al recoger un objeto con `bind_on_pickup`, se liga inmediatamente.
- Las herramientas de recolección se equipan en slots específicos de herramientas (`chopToolId`, `mineToolId`, `gatherToolId`), no en el equipo de combate.

---

## 8. Referencia de implementación

| Archivo | Función/constante clave |
|---------|-------------------------|
| `src/data/equipment.ts` | `EQUIPMENT_SLOT_ORDER`, `EQUIPMENT_SLOT_LABELS`, `EQUIPMENT_RARITIES`, `EQUIPMENT_BIND_TYPES`, `EQUIPMENT_COMBAT_STAT_KEYS`, `EQUIPMENT_UTILITY_STAT_KEYS` |
| `src/data/equipment-catalog.ts` | `EQUIPMENT_TEMPLATE_CATALOG` |
| `src/services/equipment.ts` | `getEquipmentAggregate()`, `getEquipmentCombatModifiers()`, `getEquipmentUtilityModifiers()`, `getEquipmentGearScore()` |
| `src/services/equipment-runtime.ts` | `buildEquipmentModifierBreakdown()`, `collectEquipmentModifiers()`, `estimateGearScore()` |
| `prisma/seed-equipment.ts` | Seed de plantillas |

---

## Notas para reimplementación

1. **Plantillas como base**: todo equipo deriva de una plantilla que define slot, nivel, peso, ligadura e implícitos.
2. **Stats explícitos**: el sistema de loot genera stats adicionales; el balance depende del nivel y rareza.
3. **Gear Score**: métrica de poder aproximada; útil para comparar objetos.
4. **Ligadura**: decide cuándo un objeto deja de ser comerciable.
5. **Herramientas vs equipo de combate**: separar conceptualmente; las herramientas tienen durabilidad y se equipan en slots propios.
