# World of Nova – Web API & Frontend

Documentación de la capa web (Express + React + Vite + Socket.io).

---

## Stack

| Capa | Tecnología |
|------|------------|
| Servidor HTTP | Express 5 + Socket.io 4 |
| Base de datos | Prisma + SQLite (actual) |
| Frontend | React 19 + Vite 8 |
| Estilos | CSS puro con variables |
| Tiempo real | Socket.io (websockets) |

---

## Scripts de arranque

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor Express :3000 + Vite :5173 en paralelo |
| `npm run server:dev` | Solo servidor Express con watch |
| `npm run server:start` | Solo servidor Express |
| `npm run web:dev` | Solo frontend Vite |
| `npm run web:build` | Build de producción en `web/dist` |

---

## Estructura de carpetas web

```
web/
  index.html              # punto de entrada Vite
  src/
    main.tsx              # React entry point
    App.tsx               # Router: login vs juego
    index.css             # variables CSS globales
    store/
      gameStore.tsx       # React Context con estado global
    components/
      MainMenu.tsx/.css   # Login/registro
      GameLayout.tsx/.css # Layout 3 columnas
      MapView.tsx/.css    # Mini-mapa 7×7
      CharacterPanel.tsx/.css # Stats del personaje
      ActionPanel.tsx/.css    # D-pad + recolectar

src/server/
  index.ts                # Express + Socket.io + rutas
  start.ts                # Entry point del servidor
```

---

## Endpoints REST

### Auth

#### `GET /api/auth/races`

Devuelve razas y clases disponibles para el registro.

**Respuesta:**
```json
{
  "races": { "uren": { ... }, "zolk": { ... } },
  "classes": { "uren": { ... }, "zolk": { ... } }
}
```

#### `POST /api/auth/register`

Crea un nuevo personaje.

**Body:**
```json
{
  "nickname": "string (3-16 chars)",
  "race": "uren | zolk",
  "class": "dark_druid | arcane | alchemist_rogue | curse_hunter"
}
```

**Respuesta:**
```json
{
  "player": {
    "id": 1,
    "nickname": "...",
    "race": "...",
    "class": "...",
    "level": 1,
    "mapX": 0,
    "mapY": 0,
    "hp": 138,
    "maxHp": 138,
    "energy": 117,
    "maxEnergy": 117,
    "attrs": { "str": 13, "dex": 11, ... },
    "combatStats": { "maxHp": 138, "maxEnergy": 117, ... }
  }
}
```

#### `POST /api/auth/login`

Busca un jugador por nickname.

**Body:** `{ "nickname": "..." }`

**Respuesta:** mismo formato que register.

---

### Player

#### `GET /api/player/:id`

Devuelve datos enriquecidos del jugador.

**Respuesta:**
```json
{
  "id": 1,
  "nickname": "...",
  "race": "zolk",
  "raceName": "Zolk",
  "raceEmoji": "🧪",
  "class": "curse_hunter",
  "className": "Curse Hunter",
  "classEmoji": "🏹",
  "level": 1,
  "title": "...",
  "mapX": 0,
  "mapY": 0,
  "hp": 138,
  "maxHp": 138,
  "energy": 117,
  "maxEnergy": 117,
  "gold": 0,
  "silver": 0,
  "attrs": { "str": 13, ... },
  "combatStats": { ... }
}
```

---

### Map

#### `GET /api/map/world`

Devuelve el mapa canónico.

#### `GET /api/map/tile/:x/:y`

Devuelve información del tile.

**Respuesta:**
```json
{
  "tile": { "x": 0, "y": 0, "biome": "plains", "baseTile": "...", "name": "...", "emoji": "🌾" },
  "place": null,
  "gatherable": [ ... ]
}
```

#### `POST /api/map/move`

Mueve al jugador en una dirección.

**Body:** `{ "playerId": 1, "direction": "up" | "down" | "left" | "right" }`

**Respuesta:**
```json
{
  "success": true,
  "player": { "mapX": 1, "mapY": 0, "energy": 110, "maxEnergy": 117 },
  "from": { "x": 0, "y": 0 },
  "to": { "x": 1, "y": 0 },
  "energyCost": 7,
  "tile": { ... },
  "gatherable": [ ... ]
}
```

#### `POST /api/map/gather`

Recolecta un recurso en la posición actual del jugador.

**Body:** `{ "playerId": 1 }`

**Respuesta:**
```json
{
  "success": true,
  "gathered": {
    "resourceKey": "...",
    "resourceName": "Wood",
    "quantity": 2,
    "emoji": "🪵"
  }
}
```

---

## Eventos Socket.io

### Cliente → Servidor

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `player:join` | `{ playerId, nickname, race, mapX, mapY }` | El jugador entra al mundo y se une a la sala del tile. |

### Servidor → Cliente

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `player:entered` | `{ playerId, nickname, x, y, race }` | Otro jugador entró al tile. |
| `player:left` | `{ playerId, x, y }` | Un jugador salió del tile. |

---

## Layout de la UI

```
+---------------------------------------------------------+
|  HEADER: World of Nova | nickname | coords (x,y) | Salir |
+-----------+---------------------------+-----------------+
|  MAPA     |      PANEL CENTRAL        |   PERSONAJE     |
|  7×7      |      - Ubicación actual   |   - HP/STA bars |
|  tiles    |      - D-pad              |   - Atributos   |
|           |      - Recolectar         |   - Stats       |
|           |      - Recursos visibles  |   - Economía    |
|           |      - Resultado/Log      |                 |
+-----------+---------------------------+-----------------+
```

---

## Flujo de usuario

1. Usuario abre `http://localhost:5173`.
2. Pantalla de login/registro.
3. Si es nuevo: ingresa nickname → elige raza → elige clase.
4. Entra al juego con el layout 3-columnas.
5. Usa el D-pad para moverse, el botón "Recolectar" para farmear.
6. Recibe notificaciones de tiempo real de otros jugadores en el mismo tile.

---

## Próximos endpoints planeados

- `GET /api/inventory/:playerId`
- `POST /api/inventory/equip`
- `POST /api/combat/attack`
- `POST /api/combat/flee`
- `POST /api/craft`
- `GET /api/market/listings`
- `POST /api/market/order`
- `GET /api/place/:placeId`
- `POST /api/place/interact`

---

*Actualizado: 2026-06-17*
