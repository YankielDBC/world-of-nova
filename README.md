# World of Nova: Nightfall

> RPG web por tiles con servidor Express + Socket.io, frontend React + Vite y lógica de juego en TypeScript.

---

## Qué es

World of Nova: Nightfall es un RPG multijugador por tiles ambientado en el mundo de Nova. Los jugadores eligen una raza y clase, exploran biomas, recolectan recursos, combaten criaturas, comercian y progresan en niveles, habilidades y equipamiento.

El proyecto comenzó como bot de Telegram y actualmente se está migrando a una **webapp con botones** manteniendo el backend de lógica de juego.

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React + Vite + TypeScript |
| Backend | Express + Socket.io + TypeScript |
| Lógica de juego | TypeScript puro (`src/services/`) |
| Base de datos | Prisma + SQLite (desarrollo), PostgreSQL (producción futura) |
| Deploy frontend | Vercel |
| Deploy backend | Node.js (Railway/Render/Heroku/etc.) |

---

## Estructura de carpetas

```
D:\HDD\2026\WorldOfNova-no-deps
├── src/
│   ├── server/          # API REST y WebSocket (nueva capa web)
│   ├── services/        # Lógica pura del juego
│   ├── bot/             # Código legacy del bot de Telegram
│   ├── data/            # Catálogos estáticos: emojis, talentos, skills, equipos
│   ├── lib/             # Infraestructura: DB, i18n, utilidades
│   ├── types/           # Tipos e interfaces
│   └── app-main.ts      # Entry point del bot (legacy)
├── web/                 # Frontend React + Vite
│   ├── index.html
│   └── src/
│       ├── components/
│       └── store/
├── prisma/              # Schema, migraciones y seeds
├── docs/                # Documentación completa del juego
│   ├── INDEX.md
│   ├── GAME_CORE.md
│   ├── RACES_CLASSES.md
│   ├── RESOURCES.md
│   ├── BIOMES_ZONES.md
│   ├── CREATURES.md
│   ├── EQUIPMENT.md
│   ├── BAGS.md
│   ├── ACTIONS.md
│   ├── PLAYER_FLOW.md
│   ├── PVE_COMBAT.md
│   ├── PLACES.md
│   ├── ECONOMY.md
│   ├── DEATH_AND_CAVES.md
│   ├── WEBAPP_MIGRATION.md
│   └── ...
└── vite.config.ts       # Configuración Vite
```

---

## Cómo arrancar

```bash
npm install
npx prisma db push
npm run db:seed:all
npm run dev
```

- Servidor backend: http://localhost:3000
- Frontend Vite: http://localhost:5173

Para solo el servidor: `npm run server:dev`.
Para solo el frontend: `npm run web:dev`.

---

## Verificación obligatoria

Después de cualquier cambio:

```bash
npm run build
npm run web:build
```

---

## Documentación

La documentación completa está en `docs/INDEX.md`.

Para replicar el juego o entender sus sistemas:
1. `docs/GAME_CORE.md` — atributos y fórmulas.
2. `docs/RACES_CLASSES.md` — razas, clases, talentos y skills.
3. `docs/ACTIONS.md` — todas las acciones del juego.
4. `docs/PLAYER_FLOW.md` — flujo completo del jugador.
5. `docs/WEBAPP_MIGRATION.md` — guía para migrar a webapp.

---

## Estado actual

El dashboard web está desplegado en Vercel y sirve como enciclopedia/progreso del proyecto. El juego jugable requiere el backend corriendo localmente.

Dashboard en vivo: https://world-of-nova.vercel.app

Sistemas implementados:
- ✅ Onboarding web
- ✅ Mapa y movimiento básico
- ✅ Recolección básica
- ⚠️ Inventario/equipo (parcial)
- ⚠️ Combate PvE (parcial)
- ⚠️ Economía (parcial)
- ⏳ Crafteo, quests, PvP, autenticación real

---

## Convenciones

- Archivos `.ts` legacy del bot tienen `// @ts-nocheck`; no quitar salvo que se refactoricen a tipos reales.
- Archivos nuevos deben ser TypeScript válido.
- Preferir dependencias explícitas pasadas por parámetros (factory functions) en lógica de dominio.
- No superar 500 líneas por archivo.
- Textos del juego deben soportar ES/EN/RU.
- Emojis de juego añadirse a `src/data/emojis.ts`.

---

## Seguridad

- `.env` contiene tokens y secrets. No subir a git.
- `node_modules/`, `dist/`, `web/dist/` y `prisma/dev.db` deben estar en `.gitignore`.

---

*Última actualización: 2026-07-01*
