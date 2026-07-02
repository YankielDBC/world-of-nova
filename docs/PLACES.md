# PLACES.md — Lugares y servicios

> Documentación de lugares, edificios y servicios disponibles para el jugador. Agnóstico a plataforma.

---

## 1. Concepto de lugar

Un **lugar** (`Place`) es una estructura estática o dinámica ubicada en un tile del mapa. Ofrece uno o más **edificios** con servicios.

### Tipos de lugar

| Tipo | Descripción |
|------|-------------|
| `castle` | Lugar seguro central (Nova Castle). |
| `village` | Pueblo fronterizo dinámico. |
| `cave` | Entrada a cueva procedural. |
| `ruin` | Ruinas con posibles eventos. |

### Lugares dinámicos

Se generan proceduralmente según banda de zona:

| Zona | Prob. aldea | Prob. cueva | Prob. ruina |
|------|-------------|-------------|-------------|
| core | 0 | 0 | 0 |
| inner | 0.03 | 0.016 | 0.008 |
| middle | 0.024 | 0.02 | 0.012 |
| outer | 0.02 | 0.024 | 0.016 |
| frontier | 0.018 | 0.03 | 0.02 |

---

## 2. Nova Castle

Lugar inicial seguro con 6 edificios.

### Gilded Rest (Descanso Dorado)

Recuperación de STA.

| Servicio | Costo | Duración | Efecto |
|----------|-------|----------|--------|
| `gilded-rest-free` | gratis | continuo | Recupera STA muy lentamente (~24h para llenar). |
| `gilded-rest` | 10 plata | 60s | Recupera STA. |
| `gilded-rest-quick` | 25 plata | 20s | Recupera STA rápido. |

### Mercy Edge (Borde de la Misericordia)

Recuperación de HP.

| Servicio | Costo | Duración | Efecto |
|----------|-------|----------|--------|
| `mercy-edge-free` | gratis | continuo | Recupera HP muy lentamente. |
| `mercy-edge` | 15 plata | 45s | Recupera HP. |
| `mercy-edge-divine` | 40 plata | instantáneo | Recupera HP al instante. |

### Crow Forge (Forja del Cuervo)

Reparación y compra de herramientas.

| Servicio | Costo | Efecto |
|----------|-------|--------|
| `crow-forge-repair-quick` | 4 plata | Repara ~40% de durabilidad de cada herramienta. |
| `crow-forge-repair-full` | 10 plata | Repara 100% de durabilidad de cada herramienta. |
| `crow-forge-buy-pick` | 8 plata | Compra Pico de Piedra (`picoPiedra`). |
| `crow-forge-buy-axe` | 8 plata | Compra Hacha de Piedra (`hachaPiedra`). |
| `crow-forge-buy-fishing-rod` | 9 plata | Compra Caña de Bambú (`canapez`). |

Fórmula reparación rápida:
```
targetDurability = min(maxDurability, durability + max(1, ceil(maxDurability * 0.4)))
```

### Crown Chamber (Cámara de la Corona)

Banco y bóveda.

| Servicio | Costo | Efecto |
|----------|-------|--------|
| `crown-chamber-open` | gratis | Abre interfaz de bóveda. |
| `crown-chamber-deposit-silver` | tarifa | Deposita 25 plata. |
| `crown-chamber-withdraw-silver` | gratis | Retira 25 plata. |

Ver `ECONOMY.md` para detalles de tarifas y bóveda.

### Training Yard (Patio de Instrucción)

Aprender y practicar skills.

| Lección | Skill | Nivel req. | Costo | XP aprender | XP practicar |
|---------|-------|------------|-------|-------------|--------------|
| `training-yard-lesson-chop` | Tala (`chop`) | 1 | 5 | 10 | 5 |
| `training-yard-lesson-gather` | Recolección (`gather`) | 3 | 8 | 12 | 6 |
| `training-yard-lesson-mine` | Minería (`mine`) | 5 | 12 | 14 | 7 |
| `training-yard-lesson-fishing` | Pesca (`fish`) | 8 | 15 | 16 | 8 |

Reglas:
- Si la skill no está aprendida, se aprende y se otorga XP completo.
- Si ya está aprendida, se otorga la mitad (mínimo 4 XP).

### Grand Exchange (Gran Mercado Nova)

| Servicio | Costo | Efecto |
|----------|-------|--------|
| `grand-exchange-open` | gratis | Abre interfaz de mercado. |

Ver `ECONOMY.md` para detalles de mercado.

---

## 3. Pueblo fronterizo

Replica servicios reducidos:

| Edificio | Servicios |
|----------|-----------|
| Descanso | `village-rest`, `village-rest-quick` |
| Santuario | `village-shrine`, `village-shrine-divine` |
| Baúl comunitario | `village-chest` (10 slots) |

---

## 4. Sistema de recuperación

### Tasa gratuita

```
FREE_RECOVERY_PER_15_MIN = 1.0416
FREE_RECOVERY_RATE_PER_SECOND ≈ 0.001157
```

Tarda aproximadamente 24 horas en recuperar de 0% a 100%.

### Servicios de pago

```
baseRate = targetGain / totalSeconds
```

Donde `targetGain` son los puntos faltantes (o `effectValue` si está definido) y `totalSeconds` viene de `TIMED_PLACE_RECOVERY_SECONDS`.

### Tiempos

| Servicio | Segundos |
|----------|----------|
| `gilded-rest` | 60 |
| `gilded-rest-quick` | 20 |
| `mercy-edge` | 45 |
| `mercy-edge-divine` | 15 |
| `village-rest` | 60 |
| `village-rest-quick` | 20 |
| `village-shrine` | 45 |
| `village-shrine-divine` | 15 |

### Cálculo del valor proyectado

```
elapsedSeconds = min(now, endsAt) - startedAt
projected = startValue + elapsedSeconds * ratePerSecond
nextValue = max(previousValue, min(maxValue, floor(projected)))
```

### Interrupción

- Comandos: `/despertar`, `/interrumpir`, `/wake`, `/interrupt`.
- Botón: `recovery_interrupt`.
- Se conserva el progreso recuperado hasta el momento.
- Durante recuperación no se pueden realizar otras acciones.

---

## 5. Cuevas

### Entrada

- Desde un lugar con `placeType` cave, el jugador puede entrar.
- Cada lugar tiene una única instancia de cueva.
- Si no existe, se genera determinísticamente.
- Jugador aparece en posición inicial `(startX, startY)`.

### Movimiento

- 4 direcciones cardinales.
- Coste: 1 STA por paso.
- Solo celdas de tipo camino (`PATH_CELL`).
- Revelado de mapa: radio 3 (distancia Chebyshev).

### Generación procedural

- Semilla: `"cave-layout:{place.id}:{place.slug}:{baseX}:{baseY}"`.
- Tamaño según zona:

| Zona | Celdas ancho | Celdas alto |
|------|--------------|-------------|
| inner | 18–22 | 16–19 |
| middle | 22–27 | 18–22 |
| outer | 28–34 | 22–27 |
| frontier | 34–43 | 26–33 |
| default | 16–19 | 14–16 |

- Dimensiones reales: `width = cellsWide*2+1`, `height = cellsHigh*2+1`.
- Algoritmo: recursive backtracker con direcciones aleatorizadas.
- Pasadizos extra: `max(8, floor(cellsWide * cellsHigh * 0.035))`.

### Salida

- Pone `isInside = false` en todas las cuevas del jugador.
- Regresa al lugar exterior.

---

## 6. Referencia de implementación

| Archivo | Función/constante clave |
|---------|-------------------------|
| `src/bot/modules/place-module.ts` | `handlePlaceEntry`, `handlePlaceBuilding`, `handlePlaceExit` |
| `src/services/place-custom.ts` | `executeCustomPlaceInteraction` |
| `src/services/place-recovery.ts` | `TIMED_PLACE_RECOVERY_SECONDS`, `upsertActivePlaceRecovery`, `finalizeRecoveryState` |
| `src/services/place-ui-render.ts` | `formatPlaceOverview`, `formatPlaceBuilding` |
| `src/data/place-ui/nova-castle.ts` | Configuración de Nova Castle |
| `src/data/place-ui/frontier-village.ts` | Configuración de pueblos fronterizos |
| `src/data/place-ui.ts` | `PLACE_UI_CONFIG` |
| `prisma/seed-places.ts` | Seed de lugares e interacciones |
| `src/services/dynamic-places.ts` | Generación de lugares dinámicos |
| `src/services/cave-system.ts` | `enterCaveForPlayer`, `movePlayerInCave`, `exitActiveCaveForTgId` |
| `src/services/cave-system-actions.ts` | `buildDeterministicCaveLayout`, `revealAround` |

---

## Notas para reimplementación

1. **Lugares como tiles especiales**: un tile puede tener un lugar asociado; al inspeccionar se muestran sus edificios.
2. **Recuperación diferida**: usar scheduler/timers para aplicar la regeneración a lo largo del tiempo.
3. **Interrupción conserva progreso**: no penalizar al jugador por interrumpir.
4. **Cuevas deterministas**: la misma cueva debe generarse igual para todos los jugadores de un mismo lugar.
5. **Servicios con costo**: validar siempre que el jugador tenga suficiente plata antes de aplicar el efecto.
