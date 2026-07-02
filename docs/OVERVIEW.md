# World of Nova – Nightfall v1.0 Overview

## Objetivo
«World of Nova» es un RPG por tiles con onboarding multilenguaje, combate por turnos, exploración de un mapa dinámico y una economía basada en recursos. Originalmente nació como bot de Telegram; desde 2026-06-17 la interfaz principal es una **aplicación web React + Express + Socket.io**.

## Estructura principal
- `src/server/index.ts`: servidor Express + Socket.io que expone la API web.
- `src/server/start.ts`: entry point del servidor web.
- `web/`: frontend React + Vite.
- `src/services/*`: lógica de juego aislada (mapa, exploración, recolección, bolsas, progresión, combate).
- `src/lib/*`: utilidades transversales (`db.ts`, `i18n.ts`, `player-ui.ts`).
- `src/data/*` y `src/types/*`: constantes, íconos y tipos compartidos.
- `src/bot/*`: código legacy del bot de Telegram (en desuso).
- `prisma/`: esquema, seeds y base empaquetada (`dev.db`).
- `docs/`: notas de progreso, especificaciones y referencias.

## Scripts y flujo de desarrollo
1. `npm run dev` → arranca servidor Express :3000 + Vite :5173 en paralelo.
2. `npm run server:dev` → servidor con watch.
3. `npm run web:dev` → solo frontend Vite.
4. `npm run web:build` → build de producción en `web/dist`.
5. `npm run build` → `tsc`: transpila backend a `dist/`.
6. `npm run lint` → `tsc --noEmit` para validación rápida de tipos.
7. Prisma: `npm run db:generate`, `db:push`, `db:migrate`, `db:studio`.
8. Seeds: `npm run db:seed:all`.
9. Carga típica: copiar `.env` (`DATABASE_URL="file:./dev.db"`), instalar deps (`npm install`), ejecutar `npm run dev`.

## Base de datos y entorno
- Prisma usa SQLite (`DATABASE_URL="file:./dev.db"`) y bundle con un archivo de desarrollo (`prisma/dev.db`). Hay migraciones en `prisma/migrations/` y un `.env.example` para copiar.
- Las tablas más relevantes son `mapTile`, `player`, `playerExploredTile`, `place`, `resource`, `biome`, `equipmentTemplate` y las tablas runtime migradas a Prisma.
- El token del bot legacy sigue en `.env`; rotarlo y excluir `.env` del control de versiones es imprescindible antes de publicar el proyecto.

## Estado actual y mejoras recientes
- Capa web creada: Express + Socket.io + React + Vite (2026-06-17).
- API funcional: registro/login, datos de jugador, movimiento, recolección.
- UI de juego: layout 3-columnas con mapa, acciones y panel de personaje.
- Ver `docs/WEB_API.md` para detalles de la API web.
- Ver `docs/GAME_BIBLE.md` para referencia completa del juego.

## Observaciones y riesgos
- No hay pruebas ni lint automáticos definidos.
- `node_modules/`, `dist/`, `web/dist/` y `prisma/dev.db` deben excluirse de git.
- La documentación antigua menciona PostgreSQL, pero el entorno real es SQLite.

## Próximos pasos recomendados
1. Inicializar el repositorio Git oficial con `.gitignore` correcto.
2. Añadir pruebas y lint básicos.
3. Extender la API web con inventario, combate, crafteo y mercado.
4. Mantener esta página sincronizada con cada refactor.

## Referencias clave
- `[docs/PROGRESS.md](./PROGRESS.md)` – seguimiento de sistemas implementados.
- `[docs/GAME_BIBLE.md](./GAME_BIBLE.md)` – referencia completa del juego.
- `[docs/WEB_API.md](./WEB_API.md)` – API y frontend web.
- `[docs/ENCYCLOPEDIA.md](./ENCYCLOPEDIA.md)` – índice compacto de nombres y códigos.
