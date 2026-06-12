# World of Nova - Scaling and Performance Notes

## Objetivo
Mantener la experiencia del jugador intacta y mejorar la capacidad del backend para soportar:
- mas jugadores concurrentes
- mas acciones por minuto
- mas carga de inventario/tiles sin degradar UX

## Mejoras aplicadas

### 0) Base de produccion orientada a PostgreSQL
- El schema Prisma ahora apunta a `postgresql` y se agregaron indices de alto trafico:
  - `Player(mapX,mapY)`
  - `Player(isActive,lastActiveAt)`
  - `Player(mapX,mapY,isActive,lastActiveAt)`
  - `Place(type,isActive,coordX,coordY)`
- Beneficio: prepara throughput y lookup por coordenadas para concurrencia alta.

### 0.1) Estado conversacional distribuible (Redis + fallback)
- Nuevo store `distributed-kv` + `conversation-state`.
- Flujos de conversacion ahora desacoplados de `Map` en memoria:
  - registro
  - banco
  - forja
  - venture / inspect / bag en index
- Beneficio: base para multi-instancia sin perder estado al reiniciar.

### 0.2) Jobs durables para acciones largas
- Nuevo modelo `GameJob`.
- Nuevo worker `game-jobs` para:
  - llegada de movimiento (`move_arrival`)
  - llegada de venture (`venture_arrival`)
- Se elimina dependencia de `sleep` como fuente de verdad para finalizacion.
- Beneficio: resiliencia a restart y mejor control de carga.

### 0.3) Modo webhook + separacion bot/worker
- Runtime soporta `BOT_TRANSPORT_MODE=polling|webhook`.
- Nuevo `src/worker.ts` para correr workers de fondo separados del bot API process.
- Beneficio: escalado horizontal mas limpio y desacople de responsabilidades.

### 1) Concurrencia segura en estado de tiles
- Se introdujo `mutateTileResourceState(...)` (CAS optimista por `updatedAt`) para escritura segura de `resourcesJson`.
- Ya esta aplicado en:
  - `inspect` (harvest, pickup de loot en suelo, restauracion de loot)
  - `bags` (drop de loot al suelo)
- Beneficio: reduce perdida de actualizaciones cuando dos jugadores interactuan con el mismo tile.

### 2) Batch de exploracion y descubrimiento
- `markTilesExploredBatch(...)` ahora:
  - deduplica coordenadas
  - escribe exploracion por lotes
  - actualiza `firstDiscoveredBy` por chunks
- `markTileExplored(...)` reutiliza el batch path.
- En `renderMap(...)` se evita reescritura redundante de exploracion.
- Beneficio: menos queries repetitivas y menor presion de DB bajo movimiento frecuente.

### 3) Generacion masiva de tiles para viajes
- Se anadio `ensureTilesGeneratedForCoords(...)` en `map`.
- Flujo de `venture` usa generacion batch de tiles en la ruta.
- Calculo de coste/tiempo de venture usa carga de tiles en lotes (`loadVentureTiles(...)`) en vez de N lecturas individuales.
- Beneficio: mejora fuerte para viajes largos (menos round-trips a DB).

### 4) Cache de nodos de recursos en inspect
- Cache TTL para `resourceNode` por bioma en `inspect`.
- TTL ahora configurable por env: `INSPECT_NODE_CACHE_TTL_MS`.
- Beneficio: menos lecturas repetitivas al abrir inspect en la misma zona y ajuste fino por entorno.

### 5) Reduccion de ruido de logs
- Logs de trafico (mensajes/callbacks) ahora dependen de `DEBUG_LOGS`.
- Por defecto: menos I/O y menor costo de CPU/logging en produccion.
- Para activar debug: `DEBUG_LOGS=true` en `.env`.

### 6) Mejoras de inventario
- `storeGatheredItems(...)` agrupa items por nombre antes de persistir.
- `executeBagSwitch(...)` usa `createMany` para rehidratar slots.
- Beneficio: menos transacciones y menor latencia en bolsa.

### 7) Recuperacion de lugares persistente (STA/HP)
- El estado de recuperacion ya no vive en `Map` en memoria.
- Nuevo modelo persistente: `PlayerRecovery` (Prisma).
- `start/finalize/check` de recuperacion ahora usa DB como fuente de verdad.
- Finalizacion segura por transaccion con claim (`ACTIVE` -> `FINALIZING`) para evitar dobles cierres en multiples instancias.
- Se agrego sweeper periodico (10s) para cerrar recuperaciones vencidas tras reinicios o timers perdidos.
- Beneficio: comportamiento consistente en despliegues multi-instancia y sin perdida de progreso por restart.

### 8) Banco de la Corona alineado con Prisma
- Se agrego `PlayerBankAccount` al schema de Prisma.
- `crown-bank.ts` ahora usa `upsert/update` tipado (sin SQL crudo para writes/reads del banco).
- Beneficio: menor deuda tecnica, mejor mantenibilidad y validacion de tipos.

### 9) Observabilidad de rendimiento (p50/p95/p99)
- Se agrego agregador de metricas de runtime en `src/lib/perf-metrics.ts`.
- Se instrumentaron:
  - updates por comando/callback (`update.command.*`, `update.callback.*`)
  - mapa (`map.render`, `map.move`, `map.gatherable`)
  - inspect (`inspect.render`, `inspect.action`)
  - recuperacion (`recovery.start`, `recovery.finalize`, `recovery.sweep`)
- Reporter periodico por consola con promedio, p50, p95, p99 y max.
- Config por env:
  - `PERF_METRICS_ENABLED`
  - `PERF_REPORT_INTERVAL_MS`
  - `PERF_SAMPLE_LIMIT`
- Beneficio: visibilidad real de latencia y cuellos sin cambiar UX.

### 10) Configuracion runtime centralizada
- Nuevo modulo `src/lib/runtime-config.ts`.
- Variables centralizadas para caches, sweeper de recovery y metricas.
- Beneficio: ajustes operativos rapidos sin tocar codigo.

### 11) Cola/worker por jugador para acciones pesadas
- Nuevo modulo `src/lib/player-action-queue.ts`.
- Cola en memoria con:
  - serializacion por jugador (evita que 2 acciones del mismo jugador corran a la vez)
  - limite global de concurrencia
  - limites de pendientes globales y por jugador (backpressure)
- Aplicado en `inspect` (acciones de recoleccion/mineria/tala) para reducir carreras y spam concurrente.
- Config por env:
  - `PLAYER_QUEUE_MAX_CONCURRENCY`
  - `PLAYER_QUEUE_MAX_PENDING`
  - `PLAYER_QUEUE_MAX_PENDING_PER_PLAYER`
- Beneficio: estabilidad bajo spam sin afectar UX.

## Riesgos mitigados
- Race conditions en tile state
- Escrituras redundantes en exploracion
- Escalamiento pobre en viajes largos por acceso per-step
- Saturacion de logs en runtime normal
- Perdida de estado de recuperacion tras restart de proceso
- Doble finalizacion de recuperaciones en escenarios multi-instancia

## Siguientes pasos recomendados (fase 5)
- Extender la cola/worker a mas flujos (movimiento, venture y place interactions) segun telemetria.
- Migrar de SQLite a PostgreSQL antes de alta concurrencia real.
- Expandir metricas a DB (queries lentas, lock contention, errores por transaccion).
- Exponer dashboard/endpoint interno de metricas para monitoreo continuo.

## Criterio de exito
- UX intacta para jugador.
- Menor latencia en mapa/inspeccion/inventario.
- Menos conflictos de estado en tiles compartidos.
- Recuperaciones robustas ante reinicio y despliegue horizontal.
