# BIOMES_ZONES.md — Biomas, clima y zonas de dificultad

> Documento agnóstico a plataforma. Describe el mundo, sus biomas, el ciclo día/noche, el clima y las bandas de dificultad.

---

## 1. Biomas

| Clave | Emoji | Nombre ES | Descripción | Factor movimiento | Color UI |
|-------|-------|-----------|-------------|-------------------|----------|
| `plains` | 🌾 | Llanuras | Extensas llanuras verdes con rica vegetación. | 1.0 | #90EE90 |
| `forest` | 🌲 | Bosque | Bosque denso con árboles altos y sotobosque. | 1.2 | #228B22 |
| `swamp` | 🪷 | Pantano | Terreno fangoso con aguas estancadas. | 1.5 | #556B2F |
| `volcano` | 🌋 | Volcán | Tierras volcánicas con lava y ceniza. | 1.3 | #8B0000 |
| `ashlands` | 🌫️ | Cenizales | Llanuras cubiertas de ceniza volcánica. | 1.1 | #696969 |
| `highlands` | 🏔️ | Tierras Altas | Montañas escarpadas con aire fino. | 1.4 | #A0522D |
| `desert` | 🏜️ | Desierto | Arenales infinitos bajo el sol abrasador. | 1.3 | #F4A460 |
| `tundra` | ❄️ | Tundra | Heladas llanuras cubiertas de nieve. | 1.2 | #E0FFFF |
| `river` | 🌊 | Río | Corrientes de agua que cruzan el territorio. | 0.5 | #4169E1 |
| `lake` | 🏞️ | Lago | Tranquilas aguas lacustres. | 0.3 | #1E90FF |

**Factor de movimiento**: multiplicador del coste/tiempo de viaje. Valores menores = más rápido (agua facilita el viaje).

---

## 2. Ciclo día/noche

### Períodos y duración por defecto

| Período | Emoji | Índice | Duración (min) |
|---------|-------|--------|----------------|
| `dawn` (Amanecer) | 🌅 | 0 | 20 |
| `day` (Día) | ☀️ | 1 | 280 |
| `dusk` (Atardecer) | 🌇 | 2 | 20 |
| `night` (Noche) | 🌙 | 3 | 160 |
| **Total** | | | **480 min (8 h)** |

### Variables de entorno

| Variable | Default |
|----------|---------|
| `DAY_CYCLE_ENABLED` | `true` |
| `DAY_CYCLE_ANCHOR_ISO` | `2026-01-01T00:00:00Z` |
| `DAY_CYCLE_DAWN_MINUTES` | 20 |
| `DAY_CYCLE_DAY_MINUTES` | 280 |
| `DAY_CYCLE_DUSK_MINUTES` | 20 |
| `DAY_CYCLE_NIGHT_MINUTES` | 160 |

Cálculo del período actual:
1. Obtener minutos transcurridos desde el ancla.
2. Calcular `cycleMinute = totalMinutes % 480`.
3. Asignar período según los rangos de duración.

### Efectos globales por período

| Período | Spawn mult. | Yield mult. | Energy cost mult. | Acciones especiales |
|---------|-------------|-------------|-------------------|---------------------|
| dawn | 1.06 | 1.05 | 1.0 | gather +8% spawn, fish +8% spawn |
| day | 1.0 | 1.0 | 1.0 | — |
| dusk | 1.07 | 1.05 | 1.0 | gather +10% spawn, fish +10% spawn |
| night | 0.9 | 1.1 | 1.12 | gather +12% yield, fish +12% yield |

Acciones reconocidas: `gather`, `chop`, `mine`, `fish`.

---

## 3. Efectos biome-específicos por período

Se aplican como override sobre los efectos globales.

### Bosque

| Período | Spawn | Yield | Energy | Notas |
|---------|-------|-------|--------|-------|
| dawn | 1.10 | 1.08 | 1.0 | gather +16% spawn, chop +4% spawn |
| day | 1.04 | 1.02 | 1.0 | chop +12% spawn, gather +2% spawn |
| dusk | 1.10 | 1.08 | 1.0 | gather +12% spawn, chop +4% spawn |
| night | 0.86 | 1.15 | 1.14 | gather +20% yield, chop +8% yield |

### Llanuras

| Período | Spawn | Yield | Energy | Notas |
|---------|-------|-------|--------|-------|
| dawn | 1.12 | 1.08 | 1.0 | gather +20% spawn, gather +12% yield |
| day | 1.03 | 1.01 | 1.0 | gather +6% spawn |
| dusk | 1.14 | 1.08 | 1.0 | gather +20% spawn, gather +10% yield |
| night | 0.80 | 1.16 | 1.16 | gather +20% yield |

### Pantano

| Período | Spawn | Yield | Energy | Notas |
|---------|-------|-------|--------|-------|
| dawn | 1.08 | 1.08 | 1.0 | gather +12% spawn, fish +10% spawn |
| day | 1.02 | 1.02 | 1.0 | gather +4% spawn |
| dusk | 1.14 | 1.14 | 1.0 | gather +18% spawn, fish +14% spawn, gather +12% yield |
| night | 1.16 | 1.22 | 1.14 | gather +24% spawn, fish +20% spawn, gather +20% yield, fish +16% yield |

### Río

| Período | Spawn | Yield | Energy | Notas |
|---------|-------|-------|--------|-------|
| dawn | 1.15 | 1.10 | 1.0 | fish +20% spawn, gather +10% spawn |
| day | 1.05 | 1.02 | 1.0 | fish +12% spawn, gather +8% spawn |
| dusk | 1.18 | 1.12 | 1.0 | fish +24% spawn, gather +10% spawn |
| night | 0.82 | 1.20 | 1.15 | fish +25% yield, gather +14% yield |

### Lago

| Período | Spawn | Yield | Energy | Notas |
|---------|-------|-------|--------|-------|
| dawn | 1.12 | 1.10 | 1.0 | fish +20% spawn, gather +10% spawn |
| day | 1.04 | 1.02 | 1.0 | fish +8% spawn, gather +4% spawn |
| dusk | 1.14 | 1.12 | 1.0 | fish +24% spawn, gather +8% spawn |
| night | 0.86 | 1.20 | 1.14 | fish +24% yield, gather +10% yield |

### Volcán

| Período | Spawn | Yield | Energy | Notas |
|---------|-------|-------|--------|-------|
| dawn | 1.04 | 1.08 | 1.0 | mine +10% spawn, mine +12% yield |
| day | 1.08 | 1.14 | 1.08 | mine +20% spawn, mine +16% yield, mine energy +10% |
| dusk | 1.06 | 1.10 | 1.0 | mine +12% spawn, mine +10% yield |
| night | 0.84 | 1.24 | 1.20 | mine +28% yield, mine energy +15% |

### Tierras Altas

| Período | Spawn | Yield | Energy | Notas |
|---------|-------|-------|--------|-------|
| dawn | 1.08 | 1.08 | 1.0 | mine +14% spawn, chop +6% spawn |
| day | 1.05 | 1.04 | 1.0 | mine +12% spawn, chop +6% spawn |
| dusk | 1.10 | 1.10 | 1.0 | mine +16% spawn, gather +6% spawn |
| night | 0.88 | 1.16 | 1.14 | mine +20% yield, gather +10% yield |

### Cenizales

| Período | Spawn | Yield | Energy | Notas |
|---------|-------|-------|--------|-------|
| dawn | 1.02 | 1.06 | 1.0 | mine +12% spawn |
| day | 1.08 | 1.12 | 1.08 | mine +20% spawn |
| dusk | 1.10 | 1.14 | 1.0 | mine +22% spawn, gather +6% spawn |
| night | 0.84 | 1.22 | 1.20 | mine +26% yield, gather +12% yield |

### Desierto

| Período | Spawn | Yield | Energy | Notas |
|---------|-------|-------|--------|-------|
| dawn | 1.08 | 1.06 | 1.0 | gather +12% spawn |
| day | 0.92 | 0.92 | 1.12 | gather -4% spawn |
| dusk | 1.12 | 1.08 | 1.0 | gather +14% spawn |
| night | 0.86 | 1.14 | 1.16 | gather +18% yield |

### Tundra

| Período | Spawn | Yield | Energy | Notas |
|---------|-------|-------|--------|-------|
| dawn | 1.10 | 1.08 | 1.0 | gather +8% spawn, chop +6% spawn |
| day | 1.00 | 1.00 | 1.0 | gather +2% spawn, chop +2% spawn |
| dusk | 1.12 | 1.10 | 1.0 | gather +10% spawn, mine +8% spawn |
| night | 0.90 | 1.16 | 1.15 | gather +18% yield, mine +12% yield |

---

## 4. Clima

### Tipos de clima

| Tipo | Emoji | Etiqueta ES |
|------|-------|-------------|
| `calm` | 🌤️ | Calma |
| `humid` | 🌧️ | Húmedo |
| `dry` | 🏜️ | Seco |
| `mist` | 🌫️ | Neblina |
| `heat` | 🔥 | Calor |
| `storm` | ⛈️ | Tormenta |
| `ash` | 🌋 | Ceniza |

### Pesos base de selección

| Tipo | Peso |
|------|------|
| calm | 20 |
| humid | 18 |
| dry | 16 |
| mist | 14 |
| heat | 12 |
| storm | 12 |
| ash | 8 |

Cada bioma modifica estos pesos según su clima preferido.

### Intensidad

- `calm`: I 60%, II 30%, III 10%
- `storm` / `ash`: I 20%, II 45%, III 35%
- resto: I 40%, II 40%, III 20%

### Eventos especiales

| Evento | Emoji | Condiciones típicas |
|--------|-------|---------------------|
| `flood` (Crecida) | 🌊 | river/lake + humid/storm |
| `wildfire` (Incendio) | 🔥 | forest + dry/heat |
| `quakes` (Sismos) | 💥 | highlands/volcano/ashlands + storm/ash/heat |
| `duststorm` (Polvareda) | 🌪️ | plains/desert + dry/storm |
| `toxic_fog` (Niebla tóxica) | ☣️ | swamp + humid/mist |

Probabilidad de evento: 18% si intensidad >= 3, 8% si no.

### Modificadores de evento

| Evento | Spawn | Yield | Energy |
|--------|-------|-------|--------|
| flood | +0.18 | +0.12 | +0.08 |
| wildfire | -0.28 | -0.22 | +0.18 |
| quakes | -0.05 | +0.08 | +0.20 |
| duststorm | -0.20 | -0.15 | +0.20 |
| toxic_fog | +0.06 | +0.06 | +0.22 |

### Efectos de clima por bioma (tabla resumida)

Ver sección completa en código fuente. Los valores finales se clampan:
- `spawnMultiplier`: [0.35, 1.85]
- `yieldMultiplier`: [0.5, 2.0]
- `energyCostMultiplier`: [0.9, 1.8]

---

## 5. Bandas de zona

Las coordenadas del mundo se dividen en bandas concéntricas desde el centro (0,0).

| Banda | Distancia radial | Nivel recomendado | Prob. aldea | Prob. cueva | Prob. ruina |
|-------|------------------|-------------------|-------------|-------------|-------------|
| `core` | 0 – <10 | 1–3 | 0 | 0 | 0 |
| `inner` | 10 – <35 | 4–8 | 0.03 | 0.016 | 0.008 |
| `middle` | 35 – <60 | 9–14 | 0.024 | 0.02 | 0.012 |
| `outer` | 60 – <90 | 15–22 | 0.02 | 0.024 | 0.016 |
| `frontier` | >=90 | 23+ | 0.018 | 0.03 | 0.02 |

### Probabilidad de categoría de criatura por zona

| Zona | Básico | Veterano | Élite | Jefe |
|------|--------|----------|-------|------|
| core | 82% | 15% | 3% | 0% |
| inner | 70% | 20% | 9% | 1% |
| middle | 56% | 25% | 15% | 4% |
| outer | 45% | 27% | 20% | 8% |
| frontier | 35% | 30% | 22% | 13% |

### Política de recursos por zona

Para cada zona se calcula:

```
preferredMin = max(1, recommendedLevelMin - 1)
preferredMax = recommendedLevelMax
hardMax = recommendedLevelMax + 4
```

Multiplicador de spawn según nivel requerido del nodo:

```
if requiredLevel > hardMax:
  multiplier = 0
elif requiredLevel > preferredMax:
  excess = requiredLevel - preferredMax
  multiplier = max(0.08, 1 - excess * 0.24)
elif requiredLevel < preferredMin:
  deficit = preferredMin - requiredLevel
  multiplier = max(0.32, 1 - deficit * 0.12)
else:
  multiplier = 1
```

---

## 6. Especies de criaturas por bioma

| Bioma | Especies |
|-------|----------|
| forest | Lobo, Jabalí, Cuervo, Araña Corteza, Ciervo Gris, Bestia Musgo |
| swamp | Sapo Venenoso, Babosa Negra, Serpiente Fango, Acechador Turbio, Mosca Daga |
| plains | Zorro de Prado, Carnero Salvaje, Halcón Bajo, Jabalina, Lince Dorado |
| river | Pez Diente, Anguila de Cauce, Nutria Feroz, Cangrejo Roca, Piraña Rill |
| lake | Raya Lacustre, Carpa Titán, Nimbo Escama, Garra de Agua, Mordedor Azul |
| volcano | Sabueso Ceniza, Escorpión Lava, Draco Brasa, Golem Escoria, Murciélago Fuego |
| ashlands | Hiena Ceniza, Cuervo Carbón, Bestia Escoria, Araña Humo, Chacal Obsidiana |
| highlands | Cabra Acero, Lobo Cumbre, Águila Pedernal, Raptor Colina, Bisonte Roca |
| desert | Escorpión Seco, Coyote Duna, Víbora Arena, Buitre Sol, Reptil Espina |
| tundra | Lobo Nieve, Caribú Sombrío, Oso Escarcha, Raptor Hielo, Zorro Blanco |

---

## 7. Referencia de implementación

| Archivo | Función/constante clave |
|---------|-------------------------|
| `prisma/seed-world.ts` | `BIOMES[]`, `BIOME_RESOURCE_LINKS` |
| `src/services/world-biomes.ts` | `pickBiomeNameForCoords()` |
| `src/services/world-zones.ts` | `getRadialDistance()`, `getZoneBandByDistance()` |
| `src/services/world-resource-rules.ts` | `getZoneResourcePolicyAtCoords()` |
| `src/data/day-cycle.ts` | `DEFAULT_PERIOD_EFFECTS`, `BIOME_PERIOD_EFFECTS`, `getDayPeriodEffects()` |
| `src/services/day-cycle.ts` | `getDayCycleSnapshot()` |
| `src/lib/runtime-config.ts` | Configuración de duración de períodos |
| `src/services/climate-core.ts` | Tipos de clima, eventos, formateo |
| `src/services/climate-core-actions.ts` | `pickClimateKind()`, `pickIntensity()`, `pickSpecialEvent()` |
| `src/services/climate.ts` | `getClimateForTile()`, rotación de clima |

---

## Notas para reimplementación

1. **Mapa procedural**: el bioma de cada tile se deriva de campos de distancia (río, lago, volcán) y ruido determinista.
2. **Ciclo día/noche global**: todos los tiles comparten el mismo período; la duración es configurable por variables de entorno.
3. **Clima por tile/zona**: cada tile (o zona de tiles) tiene su propio clima que rota periódicamente.
4. **Multiplicadores finales**: combinar multiplicadores globales + biome + clima + evento + herramienta + talentos; clampar según reglas.
5. **Zonas**: la dificultad escala con la distancia radial; criaturas y recursos de alto nivel solo aparecen en zonas lejanas.
