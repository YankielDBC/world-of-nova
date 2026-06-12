# Checkpoint Refactor (2026-04-07)

## Estado actual
- Refactor en progreso, estable y compilando.
- `src/app-main.ts` reducido de ~2600 lineas a **492 lineas**.
- La capa runtime del bot ya no concentra routing de callbacks, mensajes y comandos en archivos grandes.
- Validacion actual:
  - `cmd /c npm run lint` OK
  - `cmd /c npm run build` OK

## Que ya se extrajo de `app-main.ts`

### Infra y arranque
- `src/bootstrap/startup-sequence.ts`
- `src/bootstrap/install-bot-error-handler.ts`
- `src/bootstrap/run-bot-transport.ts`
- `src/bootstrap/runtime-adapters.ts`
  - adapters de `PlayerTgId` y `LanguageLike` para wiring limpio
- `src/bot/middleware/install-core-middleware.ts`
- `src/bot/handlers/map-utility-handlers.ts`

### Handlers funcionales
- `src/bot/handlers/player-misc-handlers.ts`
  - `/title`, `/devmode`, `/ub`
- `src/bot/handlers/player-profile-handlers.ts`
  - `/profile` + selector de idioma
- `src/bot/handlers/runtime-utility-handlers.ts`
  - `sleep`, `getPlayerLanguage`, `clearCallbackKeyboard`, `t3`, notificador de low vitals
- `src/bot/handlers/venture-flow-handlers.ts`
  - flujo completo de viaje por coordenadas
- `src/bot/handlers/bag-flow-handlers.ts`
  - mochila, item info, flows grab/drop/switch
- `src/bot/handlers/inspect-and-interactions-handlers.ts`
  - inspect, selector de recursos/cantidades, interacciones de coordenada
- `src/bot/handlers/place-interaction-handlers.ts`
  - servicios/place interactions + recuperacion
- `src/bot/state/conversation-scopes.ts`
  - scopes `venture`, `bag`, `inspect`

### Runtime routers ya divididos
- `src/bot/runtime/callback-router-types.ts`
- `src/bot/runtime/callback-handlers/core-callback-handlers.ts`
- `src/bot/runtime/callback-handlers/place-callback-handlers.ts`
- `src/bot/runtime/callback-handlers/bag-callback-handlers.ts`
- `src/bot/runtime/callback-handlers/map-and-inspect-callback-handlers.ts`
- `src/bot/runtime/message-router-types.ts`
- `src/bot/runtime/message-handlers/conversation-message-handlers.ts`
- `src/bot/runtime/message-handlers/alias-message-handlers.ts`
- `src/bot/runtime/message-handlers/module-message-handlers.ts`
- `src/bot/runtime/core-command-types.ts`
- `src/bot/runtime/core-command-registrars/basic-command-registrar.ts`
- `src/bot/runtime/core-command-registrars/inventory-command-registrar.ts`
- `src/bot/runtime/core-command-registrars/world-command-registrar.ts`

### Servicios extraidos
- `src/services/recovery-sweeper.ts`
  - passive STA regen + sweep de recoveries
- `src/services/bags-types.ts`
  - tipos publicos y contratos del dominio mochila
- `src/services/bags-core.ts`
  - helpers base de mochila, peso, slots, transfer plan y persistencia de drops
- `src/services/inspect-types.ts`
  - tipos publicos del dominio inspect
- `src/services/market-exchange-types.ts`
  - tipos publicos del mercado y exchange
- `src/services/mystery-merchant-types.ts`
  - contrato publico del mercader misterioso
- `src/services/mystery-merchant-serialization.ts`
  - parse/serialize/snapshot del mercader
- `src/services/mystery-merchant-state.ts`
  - cache, ensure state, generacion de ofertas y persistencia base
- `src/services/mystery-merchant-alerts.ts`
  - textos, rumor hints y alertas al canal
- `src/services/build-skills-types.ts`
  - contrato publico del sistema de build skills
- `src/services/build-skills-utils.ts`
  - helpers puros de normalizacion, cache math y ranks
- `src/services/death-system-types.ts`
  - contrato publico del sistema de muerte/cadaver/ghost
- `src/services/death-system-utils.ts`
  - helpers puros de idioma, fechas, hashes y celdas de cementerio
- `src/services/inspect-state.ts`
  - generacion, cache y estado persistido de nodos inspeccionables
- `src/services/pve-combat-types.ts`
  - contrato publico del PvE
- `src/services/pve-combat-utils.ts`
  - helpers puros de combate, efectos y redondeos
- `src/services/pve-combat-content.ts`
  - narrativa, intents, scout card y specs de skills PvE
- `src/services/pve-combat-state.ts`
  - schema, lecturas/escrituras y estado persistido del encounter
- `src/services/creatures-types.ts`
  - contrato publico del sistema de criaturas
- `src/services/creatures-config.ts`
  - catalogos/config de categorias, biomas y pesos
- `src/services/creatures-utils.ts`
  - helpers puros de parseo, redondeo, drops y picks seedados
- `src/services/market-exchange-constants.ts`
  - constantes y contrato base del dominio mercado
- `src/services/market-exchange-item.ts`
  - ordenes y trades de items
- `src/services/market-exchange-fx.ts`
  - exchange oro/plata y matching FX
- `src/services/build-skills-state.ts`
  - schema, cache, cooldowns, efectos y telemetria de build skills
- `src/services/death-system-state.ts`
  - schema, anchors, estados fantasma y lectura de cadaveres
- `src/services/bags-tools.ts`
  - equip/unequip, grant/pickup de tools, durabilidad y card de equipment
- `src/services/crown-bank-core.ts`
  - contratos, includes Prisma, helpers de slots, overview base y vault container
- `src/services/pve-combat-engine.ts`
  - pressure, ticks, damage, reactions y stat builders del motor PvE
- `src/bot/modules/bank-module-helpers.ts`
  - teclado/UI helper + parseos y estado conversacional del banco
- `src/bot/modules/market-module-helpers.ts`
  - teclado/UI helper + formatters y estado conversacional del mercado
- `src/services/climate-core.ts`
  - tipos, labels, reglas de clima, formatters y multiplicadores por bioma
- `src/services/inspect-loot.ts`
  - rollout de loot, escalado, harvest cooldown y pickup de loot del suelo
- `src/services/dev-explorer-utils.ts`
  - utilidades puras de simulacion, clima, day cycle, energia y formato de reportes

### Tipos compartidos
- `src/types/runtime-contracts.ts`
  - `AnyCtx`
  - `LanguageLike`
  - `PlayerTgId`
  - `BagSlotUid`
  - `CreatureId`

## Estado de `app-main.ts`

### Runtime real restante
- wiring de modulos
- registro de routers
- `start()`

### Estado actual del archivo
- Ya no quedan helpers `legacy*`.
- La unica funcion local real restante en `src/app-main.ts` es `start()`.
- `src/app-main.ts` ya no usa `// @ts-nocheck`.
- El archivo ya funciona como composicion principal del bot.

## Tamano actual de la capa runtime
- `src/bot/runtime/register-core-commands.ts` -> **17 lineas**
- `src/bot/runtime/register-callback-router.ts` -> **53 lineas**
- `src/bot/runtime/register-message-router.ts` -> **38 lineas**

Los tres quedaron como entrypoints delgados que delegan a handlers por dominio.

## Hitos cerrados en esta fase
- Se retiro `@ts-nocheck` de `src/app-main.ts`.
- Se agrego guard para `TELEGRAM_BOT_TOKEN`.
- Se normalizaron contratos suficientes para compilar tipado:
  - `Language` vs `string`
  - ids `playerTgId`, `slotUid`, `creatureId`
  - wrappers explicitos en wiring para firmas mas estrictas
  - forward refs de recovery/place resueltas sin romper runtime
- Se inicio la centralizacion de contratos runtime en `src/types/runtime-contracts.ts`.
- Se movieron adapters repetidos de `src/app-main.ts` a `src/bootstrap/runtime-adapters.ts`.
- Se eliminaron todos los bloques `legacy*` sobrantes del archivo principal.
- Se dividio `register-callback-router.ts` por dominios.
- Se dividio `register-message-router.ts` por dominios.
- Se dividio `register-core-commands.ts` por grupos funcionales.
- Se iniciaron modulos propios para `bags` sin romper el servicio principal:
  - `bags-types.ts`
  - `bags-core.ts`
- `bag-flow-handlers.ts` y `player-profile-handlers.ts` ya usan tipos del dominio mochila en vez de `any` en puntos clave.
- `inspect.ts` ya consume tipos desde `inspect-types.ts`.
- `market-exchange.ts` ya consume tipos desde `market-exchange-types.ts`.
- `mystery-merchant.ts` ya no mezcla:
  - tipos
  - serializacion
  - cache/ensure state
  - textos/alertas
  todo eso ya vive en modulos dedicados.
- `build-skills.ts` ya no concentra su contrato ni helpers numericos puros.
- `death-system.ts` ya no concentra su contrato ni helpers base de conversion/hash.
- `inspect.ts` ya delega generacion de nodos, contexto y estado persistente a `inspect-state.ts`.
- `bags.ts` ya delega mas helpers base de suelo/switch/unequip en `bags-core.ts`.
- `pve-combat.ts` ya no concentra:
  - tipos
  - helpers puros
  - narrativa/scout/intents
  - schema y persistencia de encounters
- `creatures.ts` ya no concentra:
  - tipos
  - config base
  - helpers puros de parseo y drops
- `market-exchange.ts` ya no mezcla:
  - hub/read models
  - matching de items
  - exchange oro/plata
  ahora `items` y `fx` viven en modulos separados.
- `build-skills.ts` ya no concentra:
  - schema
  - cache local
  - persistencia de loadout/ranks
  - cooldowns/efectos runtime
  - lectura de telemetria
- `death-system.ts` ya no concentra:
  - schema
  - state mapping
  - lookup de ghost/corpse
  - soul anchor persistente
- `bags.ts` ya no concentra:
  - equip/unequip
  - grant/pickup de herramientas
  - durabilidad aplicada
  - equipment card
  eso ya vive en `bags-tools.ts`.
- `crown-bank.ts` ya no concentra:
  - contratos
  - config del vault
  - includes Prisma
  - helpers de slots/peso/valor
  eso ya vive en `crown-bank-core.ts`.
- `bank-module.ts` y `market-module.ts` ya no cargan:
  - parseos base
  - teclados inline
  - formatters cortos
  - estado conversacional tipado
  ese ruido ya esta en helpers dedicados.
- `pve-combat.ts` ya no concentra:
  - ticks y cooldowns
  - damage formula
  - reaction engine
  - stat builders runtime
  eso ya vive en `pve-combat-engine.ts`.
- `climate.ts` ya no concentra:
  - tipos publicos
  - tablas de labels/emojis
  - formatters
  - multiplicadores climaticos
  eso ya vive en `climate-core.ts`.
- `inspect.ts` ya no concentra:
  - pickup de ground loot
  - escalado de loot
  - aplicacion de harvest cooldown
  eso ya vive en `inspect-loot.ts`.
- `dev-explorer.ts` ya no concentra:
  - parseo de yields
  - energia por accion/rareza
  - multiplicadores de clima
  - formateo de reporte
  eso ya vive en `dev-explorer-utils.ts`.

## Tamano actual de servicios pesados
- `src/services/pve-combat.ts` -> **979 lineas**
- `src/services/pve-combat-content.ts` -> **411 lineas**
- `src/services/pve-combat-engine.ts` -> **302 lineas**
- `src/services/pve-combat-state.ts` -> **174 lineas**
- `src/services/bags.ts` -> **694 lineas**
- `src/services/bags-tools.ts` -> **475 lineas**
- `src/services/build-skills.ts` -> **735 lineas**
- `src/services/build-skills-state.ts` -> **283 lineas**
- `src/services/death-system.ts` -> **743 lineas**
- `src/services/death-system-state.ts` -> **216 lineas**
- `src/services/inspect.ts` -> **503 lineas**
- `src/services/inspect-loot.ts` -> **173 lineas**
- `src/services/creatures.ts` -> **616 lineas**
- `src/services/crown-bank.ts` -> **438 lineas**
- `src/services/crown-bank-core.ts` -> **322 lineas**
- `src/services/market-exchange.ts` -> **112 lineas**
- `src/services/market-exchange-item.ts` -> **249 lineas**
- `src/services/market-exchange-fx.ts` -> **352 lineas**
- `src/services/climate.ts` -> **276 lineas**
- `src/services/climate-core.ts` -> **464 lineas**
- `src/services/dev-explorer.ts` -> **518 lineas**
- `src/services/dev-explorer-utils.ts` -> **206 lineas**
- `src/bot/modules/market-module.ts` -> **769 lineas**
- `src/bot/modules/bank-module.ts` -> **639 lineas**

## Proximo paso recomendado
1. Seguir partiendo servicios grandes:
   - `src/bot/modules/market-module.ts`
   - `src/bot/modules/bank-module.ts`
   - `src/services/pve-combat.ts`
   - `src/services/build-skills.ts`
   - `src/services/death-system.ts`
2. Correr smoke de runtime:
   - `/map`
   - `/bag`
   - `/inspect`
   - `/place`
   - `/venture`
   - callbacks criticos (`map`, `interact`, `place`, `merchant`, `market`, `bank`, `pve`)

## Comandos de verificacion rapida
```powershell
cmd /c npm run lint
cmd /c npm run build
cmd /c npm run dev
```
