# AGENTS.md – World of Nova

Guía rápida para agentes que trabajen en este proyecto.

---

## Qué es esto

World of Nova: Nightfall es un RPG web por tiles con:

- Servidor Express + Socket.io
- Frontend React + Vite
- Lógica de juego en TypeScript (`src/services/`)
- Base de datos Prisma + SQLite

---

## Estructura de carpetas

```
D:\HDD\2026\WorldOfNova-no-deps
├── src/
│   ├── server/          # API REST y WebSocket (nueva capa web)
│   ├── services/        # Lógica pura del juego (mapa, combate, inventario, etc.)
│   ├── bot/             # Código legacy del bot de Telegram (a migrar/desactivar)
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
├── docs/                # Documentación
│   ├── GAME_BIBLE.md    # Referencia completa del juego
│   ├── WEB_API.md       # API y frontend
│   ├── ARCHITECTURE_MASTER_MAP.md
│   └── ...
└── vite.config.ts       # Configuración Vite
```

---

## Convenciones

- Todos los archivos `.ts` originales del bot tienen `// @ts-nocheck` en la parte superior. No lo quites salvo que estés refactorizando a tipos reales.
- Los archivos nuevos deben ser TypeScript válido.
- Preferir dependencias explícitas pasadas por parámetros (factory functions) sobre importaciones directas en la lógica de dominio.
- No superar 500 líneas por archivo. Si un archivo crece, dividirlo.
- Los textos del juego deben soportar ES/EN/RU. Usa `t3()` o el sistema i18n existente.
- Los emojis de juego deben añadirse a `src/data/emojis.ts`.

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
```

Esto compila el backend con `tsc`. El frontend se valida con `npm run web:build`.

---

## Dónde encontrar cosas

| Concepto | Archivo(s) |
|----------|------------|
| Razas/Clases | `src/bot/modules/registration-module.ts` |
| Stats/combate | `src/lib/db.ts` (calculateCombatStats), `src/lib/rpg-attributes.ts` |
| Biomas | `src/services/world-biomes.ts`, `prisma/seed-world.ts` |
| Recursos | `prisma/seed-resources.ts`, `src/data/day-cycle.ts` |
| Equipamiento | `src/data/equipment.ts`, `src/data/equipment-catalog.ts` |
| Talentos raciales | `src/data/racial-talents.ts` |
| Habilidades | `src/data/skill-trees/class-skills.ts`, `general-skills.ts` |
| Criaturas | `src/services/creatures-config.ts` |
| Lugares | `prisma/seed-places.ts` |
| API web | `src/server/index.ts` |
| UI React | `web/src/components/` |

---

## Documentos clave

- `docs/GAME_BIBLE.md` – todo el diseño del juego.
- `docs/WEB_API.md` – API y frontend.
- `docs/ARCHITECTURE_MASTER_MAP.md` – mapa de la arquitectura legacy.

---

## Notas de seguridad

- `.env` contiene el token del bot. No lo subas a git.
- `node_modules/`, `dist/`, `web/dist/` y `prisma/dev.db` deben estar en `.gitignore`.

---

*Actualizado: 2026-06-17*
