# DEATH_AND_CAVES.md — Muerte, fantasmas y cuevas

> Sistema de muerte del jugador, modo fantasma, recuperación de cadáver y cuevas procedurales. Agnóstico a plataforma.

---

## 1. Muerte del jugador

### Condición

El jugador muere cuando su `HP <= 0`, típicamente en combate PvE.

### Qué ocurre (`killPlayerAndCreateCorpse`)

1. Se elimina cualquier estado fantasma previo.
2. Cadáveres activos previos del jugador pasan a estado `ABANDONED`.
3. Se crea un nuevo cadáver en las coordenadas de muerte.
4. El jugador se teletransporta al **cementerio más cercano**.
5. Se guarda su ancla del alma si existe.
6. El jugador queda con:
   - `hp = 0`
   - `energy = 0`
   - Plata reducida en un 10% (`CORPSE_SILVER_DROP_RATIO = 0.1`)
   - Estado fantasma (`status = 'GHOST'`)

---

## 2. Cadáver

### Qué contiene

El cadáver guarda un snapshot con:

1. **Recursos de la bolsa activa**
   - Se descarta cantidad bloqueada por mercader (`merchantLockedQty`).
   - Cae solo la cantidad libre: `max(0, quantity - merchantLockedQty)`.
   - Si quedaba cantidad bloqueada, el slot se reduce a esa cantidad.
   - Si no quedaba nada bloqueado, el slot se elimina.

2. **Herramientas en la bolsa**
   - Caen las que no estén equipadas como herramienta principal.
   - No caen las marcadas como `merchantLocked`.

3. **Mochilas almacenadas**
   - Caen las `storedBag` de la bolsa activa.

4. **Plata**
   - `silverDropped = max(0, floor(player.silver * 0.1))`

5. **Equipo equipado**
   - **NO cae** en PvE base.
   - Herramientas equipadas (`chopToolId`, `mineToolId`, `gatherToolId`) están protegidas.

### Temporizador de gracia

```
CORPSE_OWNER_GRACE_MS = 10 * 60 * 1000  // 10 minutos
```

Durante los 10 minutos iniciales, **solo el propietario** puede recuperar el cadáver.
El UI muestra minutos restantes redondeados hacia arriba.

### Estados del cadáver

- `ACTIVE`: recuperable.
- `RECOVERED`: ya reclamado por el dueño.
- `ABANDONED`: cadáver viejo reemplazado por uno nuevo.

---

## 3. Modo fantasma

### Aparecimiento

- El jugador aparece en el cementerio más cercano.
- Coordenadas: `cemeteryX`, `cemeteryY`.

### Limitaciones

- Solo puede: moverse, ver perfil, recuperar su cuerpo.
- No puede: interactuar con el mapa normal, comerciar, combatir, recolectar.
- Mensaje bloqueado: "Estás muerto. Mientras sigas en el plano astral solo puedes moverte, ver tu perfil y recuperar tu cuerpo."

### Movimiento fantasma

- 4 direcciones cardinales.
- Cada acción mueve 1 tile.
- **No consume STA**.
- No respeta obstáculos, agua, elevación ni límites del mapa.
- Mapa fantasma:
  - `👻` = jugador
  - `☠️` = cadáver
  - `⚰️` = cementerio
  - Radio visual: 5 tiles en cada dirección.

### Cementerios

- Tamaño de celda: 24 tiles.
- Coordenadas deterministas dentro de cada celda usando hash.
- Búsqueda: revisa 9 celdas vecinas (`dx, dy ∈ [-1, 1]`) y elige la de menor distancia euclidiana.
- `isNearCemetery(x, y, radius = 4)`: distancia `<= 4`.

---

## 4. Recuperación del cadáver

### Requisitos

- Jugador en modo fantasma.
- Coordenadas exactas del cadáver:
  ```
  player.mapX === death.deathX
  player.mapY === death.deathY
  ```

### Efecto

1. Se restauran los objetos del cadáver a la bolsa activa.
2. Se devuelve la plata restante del cadáver.
3. HP y STA se restauran a:
   ```
   hp = max(1, floor(maxHp * 0.5))
   sta = max(1, floor(maxEnergy * 0.5))
   ```
4. Se borra `PlayerDeathState`.
5. El cadáver pasa a estado `RECOVERED`.

---

## 5. Sistema de cuevas

### Entrada (`enterCaveForPlayer`)

- Requiere un `placeId`.
- Cada lugar tiene una única instancia de cueva (`CaveInstance.placeId` es único).
- Si no existe, se genera de forma determinista.
- Jugador entra en posición inicial `(startX, startY)`.
- Se reinicia `isInside = true` para esa cueva y se desactivan otras.

### Movimiento dentro (`movePlayerInCave`)

- Direcciones: arriba, abajo, izquierda, derecha.
- Coste por paso: **1 STA** (`CAVE_STEP_STA_COST = 1`).
- Solo celdas de tipo camino (`PATH_CELL`).
- Revelado de mapa: radio 3 (distancia Chebyshev).

### Mapa de cueva

- Media ventana horizontal: 5 tiles.
- Media ventana vertical: 8 tiles.
- Símbolos:
  - `⬛` = pared
  - `⬜` = camino explorado
  - `📍` = jugador

### Salida (`exitActiveCaveForTgId`)

- Pone `isInside = false` en todas las cuevas del jugador.
- Regresa al lugar exterior.

---

## 6. Generación procedural de cuevas

### Semilla

```
"cave-layout:{place.id}:{place.slug}:{baseX}:{baseY}"
```

### Tamaño según zona

| Zona | Celdas ancho | Celdas alto |
|------|--------------|-------------|
| inner | 18–22 | 16–19 |
| middle | 22–27 | 18–22 |
| outer | 28–34 | 22–27 |
| frontier | 34–43 | 26–33 |
| default | 16–19 | 14–16 |

Dimensiones reales:
```
width = cellsWide * 2 + 1
height = cellsHigh * 2 + 1
```

### Algoritmo

- **Recursive backtracker** con direcciones aleatorizadas.
- Posición inicial: `startX = 1`, `startY = startCellY * 2 + 1`.
- Pasadizos extra: `max(8, floor(cellsWide * cellsHigh * 0.035))`.
- Se convierte una pared en camino si tiene vecinos de camino horizontal o vertical.

---

## 7. Referencia de implementación

| Archivo | Función clave |
|---------|---------------|
| `src/services/death-system.ts` | `moveGhostPlayer`, `renderGhostMap`, `recoverOwnCorpse`, `buildPveDeathCard` |
| `src/services/death-system-actions.ts` | `killPlayerAndCreateCorpse`, `recoverOwnCorpse`, `getNearestCemeteryCoords` |
| `src/services/death-system-state.ts` | `ensureDeathSystemSchema`, `getActiveDeathStateByTgId`, `getActiveCorpseById` |
| `src/services/death-system-utils.ts` | Utilidades de cementerios y estados |
| `src/services/cave-system.ts` | `enterCaveForPlayer`, `exitActiveCaveForTgId`, `movePlayerInCave`, `renderActiveCaveMap` |
| `src/services/cave-system-actions.ts` | `buildDeterministicCaveLayout`, `revealAround`, `getCaveCell` |

---

## Notas para reimplementación

1. **Cadáver único activo**: al morir, marcar cadáveres previos como `ABANDONED`.
2. **Gracia del propietario**: durante 10 minutos solo el dueño puede recuperar; después podría permitirse saqueo (no implementado actualmente).
3. **Fantasma sin colisiones**: facilita volver al cadáver pero limita interacciones.
4. **Cuevas deterministas**: todos los jugadores ven la misma cueva para un mismo lugar.
5. **Coste de paso**: 1 STA fijo; validar siempre que haya suficiente.
6. **Persistencia**: guardar progreso de exploración de cueva por jugador.
