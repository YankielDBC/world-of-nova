# World of Nova - Refactor Execution Plan

## Objetivo

Reducir deuda técnica sin romper la experiencia del jugador, preparando el backend para:

- más concurrencia real
- más sistemas de gameplay
- migración posterior a PostgreSQL
- mantenimiento más predecible

Este plan parte del estado actual descrito en:

- `docs/ARCHITECTURE_MASTER_MAP.md`
- `docs/SCALING_AND_PERF.md`
- `docs/POSTGRES_MIGRATION_PLAN.md`

## Principios de ejecución

1. No mezclar refactor estructural grande con cambios de gameplay en la misma fase.
2. Mantener siempre una ruta de rollback simple.
3. Partir por dominios, no por “trozos arbitrarios de líneas”.
4. Separar cada módulo en cuatro capas cuando sea posible:
   - reglas puras
   - persistencia
   - render/UI
   - orquestación
5. No introducir nuevos features en un dominio hasta cerrar su partición principal.

## Prioridad real de refactor

Orden recomendado:

1. `app-main.ts`
2. `pve-combat.ts`
3. `bags.ts`
4. `build-skills.ts`
5. `mystery-merchant.ts`
6. `inspect.ts`
7. convergencia de persistencia híbrida

## Fase 0 - Guardrails antes de tocar el núcleo

### Objetivo

Crear seguridad operativa para refactorizar sin volar flujos existentes.

### Trabajo

- crear smoke checklist manual por feature crítica
- centralizar helpers de testing de flujos del bot
- documentar comandos/callbacks críticos por dominio
- congelar cambios de gameplay grandes durante esta fase

### Archivos a crear

- `docs/SMOKE_CHECKLIST.md`
- `docs/RUNTIME_FLOWS.md`

### Criterio de done

- existe una lista corta de pruebas manuales por dominio
- cada refactor puede validarse contra la misma checklist

---

## Fase 1 - Descomponer `app-main.ts`

### Problema actual

`src/app-main.ts` sigue actuando como:

- bootstrap
- registry de dependencias
- instalación de middleware
- handlers inline
- coordinación de recovery
- bloqueos de ghost/combat
- startup de workers

Eso lo convierte en cuello de mantenimiento.

### Objetivo

Dejar `app-main.ts` como raíz de composición, no como archivo de lógica viva.

### Resultado buscado

`app-main.ts` debe quedarse en:

- creación de bot
- carga de config/env
- composición de módulos
- `register*`
- `start()`

### Partición recomendada

#### 1. Bootstrap

Extraer:

- inicialización DB
- ensure schemas
- startup de workers
- publicación de patch notes
- `setMyCommands`

Nuevo archivo sugerido:

- `src/bootstrap/app-bootstrap.ts`

#### 2. Middleware global

Extraer:

- logging middleware
- métricas middleware
- touch de actividad
- bloqueos de ghost
- bloqueos por combate activo

Nuevos archivos sugeridos:

- `src/bot/middleware/logging-middleware.ts`
- `src/bot/middleware/activity-middleware.ts`
- `src/bot/middleware/ghost-guard-middleware.ts`
- `src/bot/middleware/combat-guard-middleware.ts`
- `src/bot/middleware/perf-middleware.ts`

#### 3. Handlers locales que aún viven en `app-main.ts`

Mover a módulos dedicados:

- profile
- title
- map movement orchestration
- inspect flow orchestration
- bag flow orchestration
- recovery command helpers
- ghost hint / recover helpers

Nuevos archivos sugeridos:

- `src/bot/handlers/profile-handler.ts`
- `src/bot/handlers/title-handler.ts`
- `src/bot/handlers/map-handler.ts`
- `src/bot/handlers/inspect-handler.ts`
- `src/bot/handlers/bag-handler.ts`
- `src/bot/handlers/recovery-handler.ts`
- `src/bot/handlers/ghost-handler.ts`

### Criterio de done

- `app-main.ts` baja idealmente de 2600 a menos de 1200 líneas
- ningún handler de gameplay largo queda inline
- el orden de middleware queda explícito y documentado

### Riesgo

Alto, porque toca el corazón del bot.

### Mitigación

- no cambiar textos/UI en esta fase
- no cambiar contratos de servicios
- mover primero, mejorar después

---

## Fase 2 - Partir `pve-combat.ts`

### Problema actual

`src/services/pve-combat.ts` ya combina:

- schema runtime
- lectura/escritura de encounters
- resolver de turnos
- runtime de buffs/debuffs
- bindings de build/racial
- render view model
- reglas de daño

### Objetivo

Separar motor de combate de persistencia y de presentación.

### Partición recomendada

#### Persistencia

- `src/services/pve/pve-schema.ts`
- `src/services/pve/pve-repository.ts`

Responsabilidad:

- ensure schema
- CRUD de encounter
- claim / update / clear

#### Reglas puras de combate

- `src/services/pve/pve-damage.ts`
- `src/services/pve/pve-effects.ts`
- `src/services/pve/pve-intents.ts`
- `src/services/pve/pve-turn-resolver.ts`
- `src/services/pve/pve-runtime.ts`

Responsabilidad:

- cálculo de daño
- evasión / crit / defensa
- duración de efectos
- IA de intención
- resolución del turno

#### Adaptadores de personaje

- `src/services/pve/pve-player-adapter.ts`
- `src/services/pve/pve-creature-adapter.ts`

Responsabilidad:

- traducir player build/racial a snapshot de combate
- traducir criatura a snapshot de combate

#### Presentación

- `src/services/pve/pve-view.ts`
- `src/bot/modules/pve-ui.ts` puede quedarse, pero más delgado

### Criterio de done

- `pve-combat.ts` queda solo como facade u orquestador corto
- la resolución de turno es testeable sin bot ni DB
- la vista de combate ya no depende de SQL

### Riesgo

Muy alto, porque PvE ya toca muerte, rewards, build y UI.

### Mitigación

- mantener contrato externo de `resolvePveAction` y `getEncounterView`
- refactor interno sin cambiar callback names al inicio

---

## Fase 3 - Partir `bags.ts`

### Problema actual

`src/services/bags.ts` contiene demasiados conceptos:

- lectura de bag
- render de bag
- mutación de slots
- equip/unequip
- switch de bag
- store de loot
- weight math
- tool handling
- drop al suelo

### Objetivo

Separar inventario en subdominios claros.

### Partición recomendada

- `src/services/bags/bags-repository.ts`
- `src/services/bags/bags-read.ts`
- `src/services/bags/bags-write.ts`
- `src/services/bags/bags-switch.ts`
- `src/services/bags/bags-render.ts`
- `src/services/bags/bags-ground-loot.ts`
- `src/services/bags/bags-items.ts`
- `src/services/bags/bags-tools.ts`
- `src/services/bags/bags-weight.ts`

### Resultado buscado

Poder tocar:

- render de bag
- lógica de switch
- cálculo de peso
- equipación

sin tocar el resto del dominio.

### Criterio de done

- `bags.ts` queda como facade o desaparece en favor del folder
- cálculo de peso y slots vive aislado
- render HTML/textual ya no mezcla mutaciones de DB

---

## Fase 4 - Partir `build-skills.ts` y alinear con `racial-talents.ts`

### Problema actual

`build-skills.ts` hace:

- ensure schema
- cache
- puntos
- ranks
- loadout
- cooldowns
- effects
- telemetry
- gameplay modifiers

Y el sistema racial sigue un patrón parecido, pero separado.

### Objetivo

Unificar la arquitectura de talentos sin mezclar sus catálogos.

### Partición recomendada

#### Base compartida

- `src/services/talents/talent-points.ts`
- `src/services/talents/talent-loadout.ts`
- `src/services/talents/talent-effects.ts`
- `src/services/talents/talent-telemetry.ts`

#### Build

- `src/services/build/build-schema.ts`
- `src/services/build/build-state.ts`
- `src/services/build/build-loadout.ts`
- `src/services/build/build-effects.ts`
- `src/services/build/build-telemetry.ts`

#### Racial

- `src/services/racial/racial-schema.ts`
- `src/services/racial/racial-state.ts`
- `src/services/racial/racial-loadout.ts`
- `src/services/racial/racial-effects.ts`

### Criterio de done

- build y racial comparten patrón de lectura/escritura
- puntos, loadouts y cooldowns ya no están duplicados conceptualmente
- `gameplay-effects.ts` consume interfaces claras, no detalles internos de dos sistemas distintos

---

## Fase 5 - Partir `mystery-merchant.ts`

### Problema actual

`mystery-merchant.ts` mezcla:

- spawn y estado
- pathing
- catálogo de compra/venta
- rumor system
- publicación al canal
- control de cooldown y locks

### Objetivo

Volver el mercader un sistema modular y ajustable.

### Partición recomendada

- `src/services/merchant/merchant-schema.ts`
- `src/services/merchant/merchant-state.ts`
- `src/services/merchant/merchant-pathing.ts`
- `src/services/merchant/merchant-offers.ts`
- `src/services/merchant/merchant-pricing.ts`
- `src/services/merchant/merchant-rumors.ts`
- `src/services/merchant/merchant-trades.ts`

### Criterio de done

- mover pathing y oferta sin tocar UI
- rumor system separado del core de trading
- precios y stock ajustables desde un solo sitio

---

## Fase 6 - Partir `inspect.ts`

### Problema actual

`inspect.ts` sigue haciendo:

- lectura de tile
- armado de nodos
- validación de herramientas
- ejecución de chop/mine/gather/fish
- render de inspect
- keyboards

### Objetivo

Separar:

- lectura del terreno
- resolución de acción
- render UI

### Partición recomendada

- `src/services/inspect/inspect-read.ts`
- `src/services/inspect/inspect-actions.ts`
- `src/services/inspect/inspect-validate.ts`
- `src/services/inspect/inspect-render.ts`
- `src/services/inspect/inspect-keyboards.ts`

### Criterio de done

- una acción de recolección puede resolverse sin depender del renderer
- inspect card y result card quedan aisladas
- fishing entra después más fácil

---

## Fase 7 - Convergencia de persistencia

### Problema actual

El modelo real de datos está dividido entre:

- `prisma/schema.prisma`
- `CREATE TABLE IF NOT EXISTS` dentro de servicios

### Objetivo

Definir una sola estrategia persistente clara.

### Opción recomendada

Mover gradualmente las tablas runtime críticas a Prisma.

Orden sugerido:

1. `CommunityAnnouncement`
2. `PlayerRacialTalent` y `PlayerRacialLoadout`
3. `PlayerBuildSkill`, `PlayerBuildLoadout`, `PlayerBuildEffect`, `PlayerBuildCooldown`
4. `PlayerPveEncounter`
5. `PlayerSoulAnchor`, `PlayerCorpse`, `PlayerDeathState`
6. `WorldCreatureSpawn`

### Resultado buscado

- Prisma vuelve a ser el source of truth del storage
- la migración a PostgreSQL se simplifica mucho

### Criterio de done

- toda tabla persistente crítica existe en Prisma schema o está explícitamente documentada como runtime-only

---

## Fase 8 - Preparación final para PostgreSQL

### Objetivo

Terminar de adaptar el backend a una base transaccional seria.

### Trabajo

- eliminar dependencias SQLite-specific
- revisar locks, retries y timeouts
- migrar queries raw sensibles
- preparar índices de alto tráfico
- validar workers con DB remota real

### Dependencia

Esta fase no debe empezar hasta cerrar al menos Fases 1 a 7.

---

## Plan de ejecución recomendado

### Ola 1 - núcleo del bot

1. Fase 0
2. Fase 1

### Ola 2 - combate e inventario

3. Fase 2
4. Fase 3

### Ola 3 - progresión y merchant

5. Fase 4
6. Fase 5

### Ola 4 - interacción y persistencia

7. Fase 6
8. Fase 7

### Ola 5 - infraestructura seria

9. Fase 8

## Qué no hacer

- No partir todo al mismo tiempo.
- No mezclar migración de DB con refactor de PvE.
- No tocar callback names masivamente sin capa de compatibilidad.
- No cambiar textos/UI mientras se hace cirugía estructural, salvo que sea necesario.

## Señales de éxito

- cada dominio queda con responsabilidades más nítidas
- baja el tamaño de los archivos gigantes
- menos lógica de gameplay dentro de routers
- menos SQL crudo disperso
- migración a Postgres mucho más simple
- entrada de nuevos features sin volver a inflar el núcleo

## Primer sprint recomendado

Si se empezara hoy mismo, el primer sprint debería ser:

1. Fase 0 completa
2. bootstrap fuera de `app-main.ts`
3. middleware fuera de `app-main.ts`
4. handlers de ghost/profile/map fuera de `app-main.ts`

Ese sprint por sí solo ya baja el riesgo general del proyecto y aclara muchísimo la arquitectura.
