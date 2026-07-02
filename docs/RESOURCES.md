# RESOURCES.md — Catálogo de recursos

> Lista completa de recursos del juego, con sus propiedades, obtención y uso. Agnóstico a plataforma.

---

## 1. Propiedades de un recurso

| Campo | Descripción |
|-------|-------------|
| `name` | Nombre del recurso. |
| `emoji` | Emoji representativo. |
| `type` | `material` o `consumable`. |
| `rarity` | `common`, `uncommon`, `rare`, `epic`, `legendary`. |
| `weightKg` | Peso por unidad en kilogramos. |
| `baseValue` | Precio de referencia base en plata/cobre. |
| `stackable` | Si se puede apilar (todos los recursos actuales son `true`). |
| `maxStack` | Tamaño máximo de pila (por defecto 99). |
| `usable` | Solo consumibles (`true`). |
| `effectType` | Para consumibles: `hp`, `sta`, etc. |
| `effectValue` | Cantidad de efecto. |

---

## 2. Catálogo de recursos

| Nombre | Emoji | Tipo | Rareza | Peso (kg) | Valor | Efecto | Obtención |
|--------|-------|------|--------|-----------|-------|--------|-----------|
| Wood | 🪵 | material | common | 0.5 | 1 | — | Chop en bosque, tierras altas |
| Pine Cone | 🌰 | material | rare | 0.1 | 3 | — | Gather bajo pinos |
| Apple | 🍎 | consumable | common | 0.2 | 2 | STA +5 | Gather en bosque |
| Orange | 🍊 | consumable | uncommon | 0.2 | 4 | STA +8 | Gather en bosque/deserto |
| Mango | 🥭 | consumable | rare | 0.3 | 8 | STA +15 | Gather en bosque |
| Coconut | 🥥 | consumable | common | 0.6 | 5 | STA +12 | Gather en bosque |
| Water | 💧 | consumable | common | 0.3 | 2 | STA +6 | Fish/gather agua |
| Bamboo | 🎋 | material | uncommon | 0.4 | 3 | — | Chop en bosque |
| Ancient Wood | 🪵 | material | rare | 0.8 | 10 | — | Chop nocturno en bosque antiguo |
| Champiñón | 🍄 | consumable | common | 0.1 | 1 | HP +3 | Gather en pantano al atardecer |
| Baba Verde | 🟢 | material | common | 0.3 | 2 | — | Drop de criaturas pantanosas |
| Hierbas | 🌿 | material | common | 0.1 | 1 | — | Gather en llanuras/pantano |
| Insectos | 🐛 | material | uncommon | 0.05 | 2 | — | Gather nocturno en pantano |
| Barro | 🟤 | material | common | 0.5 | 1 | — | Gather en pantano |
| Champiñón Mágico | 🪻 | consumable | rare | 0.1 | 12 | HP +25 | Gather nocturno en bosque profundo/pantano |
| Hueso | 🦴 | material | rare | 0.4 | 6 | — | Drop de bestias mayores |
| Ámbar | 🟡 | material | epic | 0.2 | 25 | — | Yacimientos fósiles |
| Ojo Ancestral | 👁️ | material | legendary | 0.1 | 50 | — | Jefes antiguos, ruinas selladas |
| Seda | 🧵 | material | uncommon | 0.1 | 4 | — | Drop de arañas |
| Trigo | 🌽 | material | common | 0.2 | 1 | — | Gather en llanuras |
| Semillas | 🌱 | material | common | 0.05 | 1 | — | Gather en llanuras |
| Hierba | 🌿 | material | common | 0.1 | 1 | — | Gather general |
| FlorDragón | 🌺 | consumable | rare | 0.1 | 8 | HP +15 | Gather al amanecer/atardecer en llanuras |
| Flores | 🌼 | material | common | 0.05 | 1 | — | Gather en llanuras |
| Girasol | 🌻 | material | uncommon | 0.15 | 3 | — | Gather en llanuras |
| Hierbas Secas | 🥀 | material | common | 0.05 | 1 | — | Gather en desiertos/tundra/cenizales |
| Hojas de Viento | 🍁 | material | epic | 0.05 | 20 | — | Gather nocturno en bosques antiguos/cenizales |
| Roca Volcánica | 🪨 | material | common | 1.0 | 2 | — | Mine en volcán/cenizales/tierras altas |
| Cenizas | 🌫️ | material | common | 0.05 | 1 | — | Gather en volcán/cenizales |
| Carbón | ⚫ | material | uncommon | 0.3 | 3 | — | Mine en volcán/cenizales/tierras altas |
| Agua | 💧 | consumable | common | 0.3 | 1 | STA +4 | Fish en ríos/lagos |
| Pez Amarillo | 🐠 | consumable | common | 0.3 | 3 | STA +10 | Fish diurno en ríos/lagos |
| Pez Azul | 🐟 | consumable | uncommon | 0.4 | 6 | STA +18 | Fish nocturno en ríos/lagos |

---

## 3. Vínculos de recursos por bioma

Probabilidad de spawn y cantidad por acción de recolección.

### Bosque (`forest`)

| Recurso | Spawn % | Min | Max |
|---------|---------|-----|-----|
| Wood | 90 | 1 | 3 |
| Pine Cone | 10 | 1 | 1 |
| Apple | 12 | 1 | 2 |
| Orange | 9 | 1 | 2 |
| Mango | 4 | 1 | 1 |
| Coconut | 16 | 1 | 1 |
| Water | 5 | 1 | 2 |
| Bamboo | 2 | 2 | 4 |
| Ancient Wood | 1 | 1 | 2 |

### Pantano (`swamp`)

| Recurso | Spawn % | Min | Max |
|---------|---------|-----|-----|
| Champiñón | 30 | 2 | 4 |
| Baba Verde | 25 | 1 | 3 |
| Hierbas | 20 | 2 | 4 |
| Insectos | 15 | 2 | 4 |
| Barro | 5 | 1 | 2 |
| Champiñón Mágico | 3 | 1 | 1 |
| Seda | 1 | 1 | 3 |

### Llanuras (`plains`)

| Recurso | Spawn % | Min | Max |
|---------|---------|-----|-----|
| Trigo | 30 | 2 | 5 |
| Semillas | 18 | 1 | 3 |
| Hierbas | 22 | 1 | 4 |
| FlorDragón | 5 | 1 | 2 |
| Flores | 15 | 3 | 6 |
| Girasol | 10 | 1 | 3 |
| Hierbas Secas | 3 | 2 | 4 |
| Hojas de Viento | 2 | 1 | 2 |

### Volcán (`volcano`)

| Recurso | Spawn % | Min | Max |
|---------|---------|-----|-----|
| Roca Volcánica | 75 | 1 | 4 |
| Cenizas | 45 | 2 | 5 |
| Carbón | 8 | 1 | 2 |

### Río (`river`)

| Recurso | Spawn % | Min | Max |
|---------|---------|-----|-----|
| Agua | 40 | 2 | 4 |
| Pez Amarillo | 35 | 1 | 3 |
| Pez Azul | 13 | 1 | 2 |

### Lago (`lake`)

| Recurso | Spawn % | Min | Max |
|---------|---------|-----|-----|
| Agua | 40 | 2 | 4 |
| Pez Amarillo | 35 | 1 | 3 |
| Pez Azul | 13 | 1 | 2 |

---

## 4. Ventanas de spawn por ciclo día/noche

| Recurso | Ventana | Períodos activos |
|---------|---------|------------------|
| Wood | all | dawn, day, dusk, night |
| Pine Cone | daylight | dawn, day |
| Apple | daylight | dawn, day |
| Orange | daylight | dawn, day |
| Mango | daylight | dawn, day |
| Coconut | daylight | dawn, day |
| Water | all | dawn, day, dusk, night |
| Bamboo | daylight | dawn, day |
| Ancient Wood | night | night |
| Champiñón | dusk | dusk |
| Champiñón Mágico | night | night |
| Baba Verde | night | night |
| Hierbas | daylight | dawn, day |
| Insectos | night | night |
| Barro | all | dawn, day, dusk, night |
| Trigo | daylight | dawn, day |
| FlorDragón | crepuscular | dawn, dusk |
| Flores | daylight | dawn, day |
| Girasol | daylight | dawn, day |
| Hierbas Secas | daylight | dawn, day |
| Hojas de Viento | night | night |
| Roca Volcánica | all | dawn, day, dusk, night |
| Cenizas | night | night |
| Carbón | night | night |
| Pez Amarillo | daylight | dawn, day |
| Pez Azul | night | night |

**Definición de ventanas:**
- `all`: todos los períodos.
- `daylight`: dawn + day.
- `crepuscular`: dawn + dusk.
- `night`: solo night.
- `dawn` / `dusk`: solo ese período.

---

## 5. Referencia de implementación

| Archivo | Función/constante clave |
|---------|-------------------------|
| `prisma/seed-resources.ts` | `RESOURCES[]` |
| `prisma/seed-world.ts` | `BIOME_RESOURCE_LINKS` |
| `src/data/day-cycle.ts` | `RESOURCE_WINDOWS_GLOBAL`, `RESOURCE_WINDOWS_BY_BIOME` |
| `src/services/gathering.ts` | Lógica de recolección y rolls |
| `src/services/world-resource-rules.ts` | Política de recursos por zona |

---

## Notas para reimplementación

1. Todos los recursos son apilables; `maxStack` por defecto 99.
2. El spawn de un recurso depende del bioma, la ventana de tiempo y la zona de dificultad.
3. La cantidad obtenida se calcula con `minQuantity`..`maxQuantity` y multiplicadores de yield.
4. Algunos recursos requieren herramienta específica (ej. minería para Rocas/Carbón, pesca para Peces).
5. La base de precios (`baseValue`) es la referencia para compra/venta con NPCs; el market jugador puede variar.
