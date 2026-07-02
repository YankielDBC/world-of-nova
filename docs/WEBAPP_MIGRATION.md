# WEBAPP_MIGRATION.md — Guía de migración a webapp

> Cómo convertir World of Nova de bot de Telegram a juego web con botones. Qué reutilizar, qué cambiar, qué hacer nuevo y arquitectura propuesta.

---

## 1. Visión general

**Objetivo**: mantener el backend de lógica de juego y crear una interfaz web con botones que reemplace los comandos de Telegram.

**Stack propuesto**:
```
Frontend: React + Vite + TypeScript + Zustand/Redux + Socket.io-client
Backend:  Express + Socket.io + Prisma + SQLite/Postgres
         (reutilizar src/server/ y src/services/)
```

---

## 2. Qué se puede reutilizar tal cual

### Lógica de dominio

Casi todo en `src/services/` es puro y no depende de Telegram:

| Módulo | Reutilizable |
|--------|--------------|
| `src/services/bags*.ts` | Sí |
| `src/services/equipment*.ts` | Sí |
| `src/services/tools.ts` | Sí |
| `src/services/pve-combat*.ts` | Sí |
| `src/services/creatures*.ts` | Sí |
| `src/services/gathering.ts` | Sí |
| `src/services/inspect*.ts` | Sí |
| `src/services/map*.ts` | Sí |
| `src/services/place-*.ts` | Sí |
| `src/services/crown-bank*.ts` | Sí |
| `src/services/market-exchange*.ts` | Sí |
| `src/services/mystery-merchant*.ts` | Sí |
| `src/services/death-system*.ts` | Sí |
| `src/services/cave-system*.ts` | Sí |
| `src/services/day-cycle.ts`, `climate*.ts` | Sí |
| `src/services/game-jobs.ts` | Sí |
| `src/services/racial-talents.ts`, `racial-effects.ts` | Sí |
| `src/services/build-skills*.ts` | Sí |
| `src/lib/db.ts`, `rpg-attributes.ts`, `player-ui.ts` | Sí |
| `src/data/*.ts` | Sí |

### Base de datos

- Esquema Prisma (`prisma/schema.prisma`).
- Seeds (`prisma/seed-*.ts`).
- Funciones de acceso a DB en `src/lib/db.ts`.

### Servidor web base

- `src/server/index.ts` ya tiene Express + Socket.io.
- `src/server/start.ts` como entry point.

---

## 3. Qué hay que cambiar

### Autenticación

**Actual**: los jugadores se identifican por `tgId` (Telegram ID).

**Webapp**: requiere autenticación real:
- Email + contraseña.
- OAuth (Google, Discord, etc.).
- JWT o sesiones.

**Cambios necesarios**:
1. Añadir modelo `User` con email, passwordHash, etc.
2. Relacionar `Player` con `User` (1 usuario puede tener varios personajes).
3. Crear endpoints `/api/auth/register`, `/api/auth/login`, `/api/auth/me`.
4. Proteger endpoints con middleware de auth.

### Contexto de Telegram

**Actual**: cada comando recibe `ctx` con `tgId`, mensaje, callback, etc.

**Webapp**: el frontend envía peticiones HTTP/WebSocket con token JWT.

**Cambios necesarios**:
1. Reemplazar `ctx` por `req.user` / socket `user`.
2. Extraer `playerId` del token/sesión en lugar de `tgId`.
3. Eliminación progresiva de `src/bot/` (o mantenerlo como legacy opcional).

### Router de comandos

**Actual**: `src/bot/runtime/register-core-commands.ts` y `register-message-router.ts`.

**Webapp**: mapear comandos a endpoints REST y eventos Socket.io.

Ejemplo:
| Comando Telegram | Endpoint / Evento Web |
|------------------|----------------------|
| `/profile` | `GET /api/player/me` |
| `/map` | `GET /api/map/tiles` |
| Movimiento | `POST /api/map/move` |
| `/inspect` | `GET /api/map/inspect` |
| Recolectar | `POST /api/map/gather` |
| `/bag` | `GET /api/inventory` |
| Usar ítem | `POST /api/inventory/use` |
| Equipar | `POST /api/equipment/equip` |
| `/combat` | `POST /api/combat/start` |
| Acción combate | `POST /api/combat/action` |
| `/place` | `GET /api/place` |
| Interacción lugar | `POST /api/place/interact` |
| `/bank` | `GET /api/bank`, `POST /api/bank/deposit` |
| `/market` | `GET /api/market`, `POST /api/market/order` |
| `/merchant` | `GET /api/merchant` |
| `/racial` | `GET /api/build/racial`, `POST /api/build/racial/learn` |
| `/bs` | `GET /api/build/skills`, `POST /api/build/skills/learn` |

### Envío de mensajes

**Actual**: bot envía mensajes de Telegram con texto, botones, mapas.

**Webapp**: el backend responde JSON; el frontend renderiza UI.

**Para eventos en tiempo real**:
- Socket.io `player:update` para cambios de HP/STA/coordenadas.
- Socket.io `combat:turn` para turnos de combate.
- Socket.io `recovery:tick` para progreso de recovery.
- Socket.io `merchant:rumor` para pistas de comerciante.
- Socket.io `notification` para mensajes generales.

---

## 4. Qué hay que hacer nuevo

### Frontend

Pantallas/componentes necesarios:

| Pantalla | Función |
|----------|---------|
| Login/Register | Autenticación de usuario. |
| Character Select | Elegir/crear personaje. |
| Game Layout | Layout principal con paneles. |
| Map View | Mapa centrado en jugador con botones de movimiento. |
| Character Panel | Perfil, stats, equipo, talentos, skills. |
| Inventory Panel | Mochila, herramientas, equipamiento, acciones. |
| Inspect Panel | Info del tile, nodos, loot, acciones de recolección. |
| Combat Panel | Encuentro PvE, acciones, log, huida. |
| Place Panel | Edificios y servicios del lugar actual. |
| Bank Panel | Depósitos, retiros, movimiento de objetos. |
| Market Panel | Órdenes de compra/venta. |
| Merchant Panel | Ofertas del comerciante misterioso. |
| Build Panel | Asignación de puntos y loadout. |
| Settings | Idioma, logout, preferencias. |

### Estado global

Usar Zustand/Redux para:
- Jugador autenticado.
- Personaje actual (HP, STA, coordenadas, nivel, XP).
- Inventario y equipo.
- Encuentro de combate activo.
- Mapa y tiles explorados.
- Notificaciones.

### Comunicación en tiempo real

Socket.io rooms por `playerId` para enviar actualizaciones privadas.

Eventos recomendados:
```
client → server:
  auth:authenticate { token }
  player:move { direction }
  player:gather { nodeId, quantity }
  combat:action { action, target? }
  place:interact { interactionId }
  inventory:use { slotUid }
  inventory:equip { slotUid }

server → client:
  player:state { hp, sta, x, y, ... }
  map:update { tiles }
  combat:start { encounter }
  combat:turn { state }
  combat:end { result }
  notification { message, type }
  recovery:tick { current, max }
```

### Scheduler/Workers

Reutilizar `src/services/game-jobs.ts` pero adaptar triggers:
- En lugar de "bot envía mensaje", emitir evento Socket.io.
- Jobs: `move_arrival`, `venture_arrival`, `recovery_tick`, `merchant_move`, `creature_respawn`.

---

## 5. Arquitectura propuesta

```
┌─────────────────────────────────────┐
│         React + Vite Frontend       │
│  (botones, paneles, mapa, combate)  │
└─────────────┬───────────────────────┘
              │ HTTP / WebSocket
┌─────────────▼───────────────────────┐
│      Express + Socket.io API        │
│  - Auth middleware (JWT)            │
│  - REST endpoints                   │
│  - Socket events                    │
└─────────────┬───────────────────────┘
              │ llama a
┌─────────────▼───────────────────────┐
│      Lógica de dominio puro         │
│  (src/services/* reutilizados)      │
└─────────────┬───────────────────────┘
              │ Prisma Client
┌─────────────▼───────────────────────┐
│      SQLite / PostgreSQL            │
└─────────────────────────────────────┘
```

---

## 6. Mapeo de comandos a endpoints

| Comando | Método | Endpoint | Body / Query |
|---------|--------|----------|--------------|
| `/start` (registro) | POST | `/api/auth/register` | `{ email, password, nickname, race, class }` |
| `/profile` | GET | `/api/player/me` | — |
| `/map` | GET | `/api/map/tiles` | `?radius=7` |
| Movimiento | POST | `/api/map/move` | `{ direction }` |
| `/venture` | POST | `/api/map/venture` | `{ targetX, targetY }` |
| `/inspect` | GET | `/api/map/inspect` | — |
| Recolectar | POST | `/api/map/gather` | `{ nodeId, quantity }` |
| `/bag` | GET | `/api/inventory` | — |
| Usar ítem | POST | `/api/inventory/use` | `{ slotUid, quantity? }` |
| Tirar ítem | POST | `/api/inventory/drop` | `{ slotUid, quantity? }` |
| Cambiar bolsa | POST | `/api/inventory/switch-bag` | `{ bagId }` |
| `/equip` | GET | `/api/equipment` | — |
| Equipar | POST | `/api/equipment/equip` | `{ slotUid }` |
| Desequipar | POST | `/api/equipment/unequip` | `{ slot }` |
| `/combat` | POST | `/api/combat/start` | `{ creatureId }` |
| Acción combate | POST | `/api/combat/action` | `{ action, skillKey? }` |
| `/place` | GET | `/api/place` | — |
| Interacción lugar | POST | `/api/place/interact` | `{ interactionId }` |
| Interrumpir recovery | POST | `/api/place/interrupt-recovery` | — |
| `/bank` | GET | `/api/bank` | — |
| Depósito | POST | `/api/bank/deposit` | `{ currency, amount }` |
| Retiro | POST | `/api/bank/withdraw` | `{ currency, amount }` |
| Mover objeto bóveda | POST | `/api/bank/move` | `{ direction, slotUid, quantity }` |
| `/market` | GET | `/api/market` | — |
| Orden ítem | POST | `/api/market/item-order` | `{ resourceId, quantity, priceSilver }` |
| Comprar ítem | POST | `/api/market/item-buy` | `{ resourceId, quantity }` |
| Orden divisa | POST | `/api/market/fx-order` | `{ side, amount, price }` |
| Cancelar orden | POST | `/api/market/cancel` | `{ orderId }` |
| `/merchant` | GET | `/api/merchant` | — |
| Comprar al mercader | POST | `/api/merchant/buy` | `{ offerId, quantity? }` |
| Vender al mercader | POST | `/api/merchant/sell` | `{ slotUid, quantity? }` |
| `/sos` | POST | `/api/sos` | — |
| `/racial` | GET | `/api/build/racial` | — |
| Aprender talento | POST | `/api/build/racial/learn` | `{ talentKey }` |
| Equipar talento | POST | `/api/build/racial/equip` | `{ talentKey, slot }` |
| Reset racial | POST | `/api/build/racial/reset` | — |
| `/bs` | GET | `/api/build/skills` | — |
| Aprender skill | POST | `/api/build/skills/learn` | `{ skillKey }` |
| Equipar skill | POST | `/api/build/skills/equip` | `{ skillKey, slot }` |
| Reset build | POST | `/api/build/skills/reset` | — |

---

## 7. Plan de migración paso a paso

### Fase A — Infraestructura web

1. Configurar `src/server/index.ts` como entry point principal.
2. Añadir modelo `User` y relación con `Player` en Prisma.
3. Implementar registro/login con JWT.
4. Crear middleware de autenticación.
5. Actualizar seeds si es necesario.

### Fase B — API REST base

1. Endpoints de autenticación.
2. Endpoints de jugador (`/api/player/*`).
3. Endpoints de mapa (`/api/map/*`).
4. Endpoints de inventario (`/api/inventory/*`).
5. Endpoints de equipo (`/api/equipment/*`).

### Fase C — Acciones del juego

1. Recolección e inspect.
2. Movimiento y venture.
3. Combate PvE.
4. Lugares y servicios.

### Fase D — Economía y progresión

1. Banco.
2. Grand Exchange.
3. Comerciante misterioso.
4. Build/racial skills.

### Fase E — Frontend jugable

1. Login/character select.
2. Game layout con mapa, character panel, action panel.
3. Inventario y equipo.
4. Combate.
5. Lugares y economía.
6. Configuración y notificaciones.

### Fase F — Tiempo real

1. Integrar Socket.io.
2. Emitir actualizaciones de estado.
3. Migrar jobs para usar Socket.io en lugar de mensajes Telegram.

### Fase G — Limpieza

1. Marcar `src/bot/` como legacy o eliminar.
2. Actualizar documentación.
3. Tests de integración.
4. Deploy de backend (Railway/Render/Heroku) y frontend (Vercel/Netlify).

---

## 8. Consideraciones de seguridad

1. **Validar todo en servidor**: nunca confiar en el frontend para costos, cooldowns o límites.
2. **Proteger JWT**: usar httpOnly cookies o almacenamiento seguro; rotar secrets.
3. **Rate limiting**: en endpoints críticos (comercio, combate, movimiento).
4. **Transacciones atómicas**: especialmente en economía e inventario.
5. **Autorización**: verificar que el jugador pueda actuar en su tile actual.

---

## 9. Consideraciones de UX

1. **Botones contextuales**: solo mostrar acciones válidas para el estado actual.
2. **Feedback inmediato**: animaciones y mensajes tras cada acción.
3. **Mapa interactivo**: clic para moverse, hover para info de tile.
4. **Atajos de teclado**: opcional, para jugadores avanzados.
5. **Responsive**: adaptable a móvil.
6. **Idiomas**: mantener ES/EN/RU.

---

## 10. Referencia de implementación

| Archivo | Estado |
|---------|--------|
| `src/server/index.ts` | Base existente; expandir endpoints. |
| `src/server/start.ts` | Entry point existente. |
| `src/bot/` | Legacy; reemplazar progresivamente. |
| `web/src/App.tsx` | Punto de entrada frontend existente. |
| `web/src/components/GameLayout.tsx` | Layout base existente. |
| `web/src/store/gameStore.tsx` | Store base existente; expandir. |

---

## Notas para reimplementación

1. **No reescribir la lógica de dominio**: usar los servicios existentes como bibliotecas.
2. **Adaptadores**: crear capa fina entre HTTP/Socket y servicios (inyectar `playerId`, parsear respuestas).
3. **Eventos vs REST**: REST para acciones puntuales; Socket.io para estado en tiempo real.
4. **Fallback offline**: si el jugador se desconecta, el estado se recarga al reconectar.
5. **Deploy separado**: backend con DB persistente; frontend estático o SSR según necesidad.
