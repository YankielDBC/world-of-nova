# ACTIONS.md — Acciones del juego

> Catálogo de todas las acciones/comandos disponibles para el jugador. Cada acción incluye: qué hace, costos, validaciones y flujo paso a paso. Agnóstico a plataforma.

---

## Convenciones

- **STA**: energía/stamina.
- **HP**: puntos de vida.
- **XP**: experiencia.
- **Límites diarios/mensuales**: se reinician en base a UTC por defecto.
- Los costos pueden verse afectados por talentos, habilidades, clima y ciclo día/noche.

---

## 1. Registro y cuenta

### `/start` — Iniciar registro

- Si el jugador no existe, comienza flujo de registro.
- Pide nickname (3–16 caracteres, único).
- Muestra selector de raza (Uren/Zolk).
- Muestra selector de clase según raza.
- Crea jugador con atributos base de clase y stats de combate calculados.
- Genera bolsillos (`pockets`) y equipo inicial.

### `/profile` — Ver perfil

- Muestra: nickname, título, coordenadas, raza, clase, nivel, XP, atributos, stats de combate, resistencias, uso de bolsa.
- No tiene costo.

### `/title` — Cambiar título

- Permite seleccionar entre títulos desbloqueados por nivel.
- No tiene costo.

### `/devmode` — Modo desarrollador

- Activa/desactiva funciones de debug.
- Solo para administradores.

---

## 2. Movimiento y mapa

### `/map` — Ver mapa

- Renderiza una cuadrícula (por defecto 10×10 en Telegram) centrada en el jugador.
- Muestra biomas, lugares descubiertos, jugadores cercanos, criaturas, mercader.
- No tiene costo.

### Movimiento 1 tile (botones de dirección)

- Direcciones: arriba, abajo, izquierda, derecha.
- Coste STA:
  ```
  base = 3 si elevación > 0
       = 2 si agua
       = 1 normal
  coste = max(1, ceil(base * travelStaminaCostMultiplier))
  ```
- Tiempo de viaje:
  ```
  baseTime = 3
  terrainMult = 1.5 agua / 2 elevación / 1 normal
  travelTime = round((baseTime * terrainMult * movementFactor / speed) * travelTimeMultiplier)
  ```
- Valida que haya suficiente STA y que el destino exista.
- Actualiza coordenadas, descubre tile si es nuevo.

### `/venture` — Viaje largo

- El jugador introduce coordenadas destino ya exploradas.
- Calcula ruta Manhattan (primero X, luego Y).
- Suma coste STA y tiempo de todos los tiles.
- Acota multiplicadores: STA [0.7, 1.35], tiempo [0.75, 1.35].
- Requiere `player.energy >= totalEnergy` y no tener otro trabajo de viaje pendiente.
- Al confirmar encola trabajo `venture_arrival` con retardo `totalSeconds + 1`.
- Se puede cancelar antes de encolar; después no hay cancelación explícita.

---

## 3. Inspección y recolección

### `/inspect` o `/interact` — Inspeccionar tile

- Muestra información del tile actual:
  - Lugar (si aplica): edificios y servicios.
  - Nodos de recursos disponibles.
  - Loot en el suelo.
  - Jugadores presentes.
  - Comerciante misterioso.
  - Clima y ciclo día/noche.
  - STA y uso de bolsa.
- No tiene costo.

### Recolectar nodo (`chop`, `mine`, `gather`, `fish`)

- El jugador selecciona un nodo de la lista de inspect.
- Validaciones:
  - Nodo existe y la acción coincide.
  - Cantidad entre 1 y disponible.
  - Skill aprendida y nivel suficiente.
  - Herramienta equipada y no rota.
  - Recurso activo en el período actual.
- Cálculo de coste STA:
  ```
  base por acción: gather=1, chop=2, mine=2
  rarityMult: common=1.0, uncommon=1.2, rare=1.6, epic=2.1, legendary=2.8
  levelFactor = 1 + max(0, requiredLevel-1) * 0.03
  baseEnergy = max(1, ceil(base * rarityMult * levelFactor))
  totalEnergy = ceil(baseEnergy * climateEnergy * dayEnergy * actionEnergy * racialEnergy) * quantity
  ```
- Reduce durabilidad de herramienta:
  ```
  levelPenalty = floor(max(0, requiredLevel-1) / 20)
  durabilityDamage = max(1, 1 + levelPenalty + rarityBonus)
  ```
- Otorga recursos y XP de skill.
- Actualiza nodo (cantidad restante, cooldown de regeneración).

### Recoger loot del suelo

- El jugador selecciona un ítem del suelo.
- Se añade a la bolsa activa si cabe.
- Si no cabe, queda en el suelo.

---

## 4. Inventario y equipo

### `/bag` — Ver mochila

- Muestra bolsa activa, slots usados, peso y lista de ítems.
- Botones para cambiar de bolsa, usar ítem, tirar ítem.
- No tiene costo.

### Usar ítem (`useBagSlot`)

- Solo consumibles (`usable=true`).
- Aplica efecto según `effectType` y `effectValue`.
- Ejemplos: `hp` cura HP, `sta` recupera STA.
- Reduce cantidad del stack.

### Tirar ítem (`dropBagSlot`)

- El jugador selecciona cantidad.
- El ítem aparece en el suelo del tile actual.
- Si es equipo/herramienta/bolsa, se crea entrada de ground loot correspondiente.

### Cambiar de bolsa (`executeBagSwitch`)

- La bolsa destino debe estar vacía.
- Se transfiere todo el contenido de la origen a la destino.
- Si cabe, se intercambian estados.

### `/equip` — Ver equipo equipado

- Muestra slots de equipo y herramientas.
- Botones para equipar/desequipar.
- No tiene costo.

### Equipar objeto

- Equipamiento: va al slot correspondiente.
- Herramienta: va al slot de acción (chop/mine/gather/fish).
- Si el objeto es `bind_on_equip`, se liga al jugador.

### Desequipar objeto

- Devuelve el objeto a la bolsa activa si cabe.
- Si no cabe, puede quedar en suelo o bloquearse según implementación.

### `/tools` — Ver herramientas

- Lista herramientas en bolsa y equipadas.
- No tiene costo.

### `/starterkit` — Kit inicial

- Otorga: `hachaPiedra`, `picoPiedra`, `basket`.
- Requiere espacio en bolsa.

---

## 5. Combate PvE

### `/combat` — Iniciar combate

- Muestra criaturas vivas en el tile actual.
- El jugador selecciona objetivo.
- Crea encuentro con `turnNumber=1`.
- No tiene costo de inicio.

### Acciones en combate

| Acción | Coste STA | Efecto |
|--------|-----------|--------|
| `attack` | 5 | Daño físico 0.92 + arcano 0.18. |
| `guard` | 3 | +16% defensa, +1 evasión, -34% daño recibido (1 turno). |
| `flee` | 4 | Intento de huida basado en velocidad/evasión/categoría. |
| `build_skill` | variable | Activa habilidad de build equipada. |
| `racial_skill` | variable | Activa habilidad racial equipada. |

### Fin de combate

- **Victoria**: criatura muere → XP, plata, loot.
- **Derrota**: jugador muere → modo fantasma.
- **Huida**: encuentro termina si el roll tiene éxito.

---

## 6. Lugares y servicios

### `/castle` o `/place` — Entrar a lugar

- Si el jugador está en un tile con lugar, muestra edificios y servicios.
- No tiene costo de entrada.

### Servicios de recuperación

| Servicio | Costo | Duración | Efecto |
|----------|-------|----------|--------|
| `gilded-rest-free` | gratis | continuo | Recupera STA muy lentamente (~24h para 100%). |
| `gilded-rest` | 10 plata | 60s | Recupera STA. |
| `gilded-rest-quick` | 25 plata | 20s | Recupera STA rápido. |
| `mercy-edge-free` | gratis | continuo | Recupera HP muy lentamente. |
| `mercy-edge` | 15 plata | 45s | Recupera HP. |
| `mercy-edge-divine` | 40 plata | instantáneo | Recupera HP al instante. |

### Servicios de forja

| Servicio | Costo | Efecto |
|----------|-------|--------|
| `crow-forge-repair-quick` | 4 plata | Repara ~40% durabilidad de cada herramienta. |
| `crow-forge-repair-full` | 10 plata | Repara 100% durabilidad de cada herramienta. |
| `crow-forge-buy-pick` | 8 plata | Compra Pico de Piedra. |
| `crow-forge-buy-axe` | 8 plata | Compra Hacha de Piedra. |
| `crow-forge-buy-fishing-rod` | 9 plata | Compra Caña de Bambú. |

### Servicios de banco

| Servicio | Costo | Efecto |
|----------|-------|--------|
| `crown-chamber-open` | gratis | Abre interfaz de bóveda. |
| `crown-chamber-deposit-silver` | tarifa | Deposita 25 plata. |
| `crown-chamber-withdraw-silver` | gratis | Retira 25 plata. |

### Servicios de entrenamiento

| Lección | Nivel req. | Costo | XP aprender | XP practicar |
|---------|------------|-------|-------------|--------------|
| `training-yard-lesson-chop` | 1 | 5 | 10 | 5 |
| `training-yard-lesson-gather` | 3 | 8 | 12 | 6 |
| `training-yard-lesson-mine` | 5 | 12 | 14 | 7 |
| `training-yard-lesson-fishing` | 8 | 15 | 16 | 8 |

### Gran Mercado

- `grand-exchange-open`: abre interfaz de mercado.
- Comprar/vender recursos y oro/plata.
- Ver `ECONOMY.md` para detalles.

### Interrupción de recuperación

- `/despertar`, `/interrumpir`, `/wake`, `/interrupt`.
- Finaliza recuperación activa conservando el progreso.

---

## 7. Economía

### `/merchant` — Comerciante misterioso

- Si hay comerciante en el tile, muestra ofertas de compra/venta.
- Compra ítems al jugador con multiplicador aleatorio 2–20×.
- Vende recursos y herramientas.

### `/bank` — Banco

- Depositar/retirar plata u oro.
- Mover objetos entre bolsa y bóveda.

### `/market` — Mercado

- Crear órdenes de venta de recursos.
- Comprar recursos al mejor precio.
- Crear órdenes de compra/venta de oro.

### `/sos` — Entrega de emergencia

- Costo: 5 plata.
- Límite: 2 por día, 10 por mes.
- Entrega 1–2 frutas (Apple, Orange, Mango, Coconut).

---

## 8. Build y talentos

### `/racial` — Talentos raciales

- Ver/ aprender/ equipar talentos raciales.
- Coste de reset: `25 + puntos_gastados * 5` plata.

### `/bs` — Build skills

- Ver/ aprender/ equipar habilidades de clase y generales.
- Coste de reset: `40 + (puntos_clase + puntos_general) * 6` plata.

---

## 9. Muerte y cuevas

### Movimiento fantasma

- Solo disponible cuando el jugador está muerto.
- No consume STA.
- Pasos de 1 tile sin obstáculos.
- Solo permite: moverse, ver perfil, recuperar cuerpo.

### `/recover` — Recuperar cadáver

- Requiere estar en las coordenadas del cadáver.
- Devuelve ítems y plata restante.
- Restaura HP y STA a 50% del máximo.

### Entrada/salida de cueva

- Desde un lugar con cueva, el jugador puede entrar.
- Movimiento dentro: 1 tile, 1 STA, solo celdas camino.
- Salida: regresa al lugar exterior.

---

## 10. Referencia de implementación

| Comando | Archivo principal | Función clave |
|---------|-------------------|---------------|
| `/start` | `src/bot/modules/registration-module.ts` | `handleStartCommand` |
| `/profile` | `src/lib/player-ui.ts` | `buildProfileCard` |
| `/map` | `src/services/map-render.ts` | `renderMap` |
| Movimiento | `src/services/map-move.ts` | `movePlayer` |
| `/venture` | `src/bot/handlers/venture-flow-handlers.ts` | `startVentureFlow` |
| `/inspect` | `src/services/inspect.ts` | `renderInspectForPlayer` |
| Recolección | `src/services/inspect.ts` | `executeInspectAction` |
| `/bag` | `src/services/bags.ts` | `getActiveBagView` |
| `/equip` | `src/services/equipment.ts` | `getEquipmentCard` |
| `/combat` | `src/services/pve-combat.ts` | `startPveEncounter` |
| `/place` | `src/bot/modules/place-module.ts` | `handlePlaceEntry` |
| `/merchant` | `src/services/mystery-merchant-actions.ts` | `getMerchantSnapshotForPlayer` |
| `/bank` | `src/services/crown-bank.ts` | `getBankSummary` |
| `/market` | `src/services/market-exchange.ts` | `getMarketHubSummary` |
| `/sos` | `src/services/sos.ts` | `requestSosDelivery` |
| `/racial` | `src/services/racial-talents.ts` | `getPlayerRacialTalentState` |
| `/bs` | `src/services/build-skills.ts` | `getPlayerBuildSkillState` |

---

## Notas para reimplementación

1. **Validaciones primero**: siempre verificar prerequisitos antes de aplicar costos o efectos.
2. **Efectos acumulativos**: clima, ciclo día/noche, talentos y habilidades se multiplican, no se suman linealmente.
3. **Cooldowns y duraciones**: convertir segundos a turnos en combate (`max(1, ceil(seconds/8))`).
4. **Ground loot**: persistir en el tile para que otros jugadores (o el mismo) puedan recogerlo.
5. **Trabajos diferidos**: usar scheduler para movimiento, venture, respawn, recovery y merchant.
