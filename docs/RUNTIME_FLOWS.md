# World of Nova - Runtime Flows

## 1. Update pipeline

1. Telegram envía update.
2. `app-main.ts` recibe update en grammY.
3. middleware global aplica:
   - logs/perf
   - touch de actividad
   - guardias de recovery
   - guardias de ghost
   - guardias de combate activo
4. router decide destino:
   - comandos (`register-core-commands.ts`)
   - callbacks (`register-callback-router.ts`)
   - mensaje conversacional (`register-message-router.ts`)
5. módulo o servicio resuelve lógica.
6. respuesta UI vuelve a Telegram.

## 2. Startup flow

1. conectar DB
2. normalizar mapa canónico
3. bootstraps de mundo/economía/build/creatures
4. iniciar workers si están habilitados
5. prime custom emoji availability
6. sincronizar patch notes de comunidad
7. registrar comandos del bot
8. iniciar transporte (`polling` o `webhook`)

## 3. Worker flow

Workers principales:

- game jobs
- climate sweep
- mystery merchant sweep
- recovery sweep

Cada worker:

1. reclama lote pendiente
2. ejecuta tarea
3. marca done/retry/failed
4. emite métricas

## 4. Conversational state flow

Estados guardados por scope:

- `venture`
- `bag`
- `inspect`
- módulos (market/bank/forge/merchant)

Patrón:

1. UI pide input
2. guarda estado por jugador
3. parser de texto valida entrada
4. ejecuta acción
5. limpia o avanza estado

## 5. Map and travel flow

1. jugador solicita mover (`map_*` o `venture`)
2. se valida bloqueo (recovery/ghost/combat)
3. se calcula costo y tiempo
4. si aplica, se encola `GameJob`
5. al llegar, se finaliza movimiento y render map

## 6. PvE flow

1. `/interact` detecta criatura
2. scout card
3. iniciar encounter persistente
4. loop de turnos con intención enemiga
5. outcome:
   - victoria: XP/loot/coins
   - derrota: death system (corpse + astral)
   - fuga: cierre controlado

## 7. Death flow

1. jugador muere en PvE
2. se crea corpse persistente
3. jugador entra a estado ghost
4. mapa cambia a plano astral
5. recuperar cuerpo revive y limpia estado

## 8. Economy flow

- Market hub -> item/fx subflows
- órdenes abiertas en DB
- matching parcial/completo por operación
- banco y forja con subflujos conversacionales propios

## 9. Observabilidad

- métricas de performance por comando/callback
- debug logs opcionales
- logs de errores Telegram API sanitizados

