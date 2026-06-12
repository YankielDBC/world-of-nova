# World of Nova – Nightfall v1.0 Overview

## Objetivo
«World of Nova» es un bot de Telegram que combina onboarding multilenguaje, combate por turnos, exploración de un mapa dinámico y una economía basada en recursos. El código se organiza principalmente en TypeScript y Prisma, y apunta a una experiencia jugable dentro de las limitaciones de un chat.

## Estructura principal
- `src/index.ts`: arranca el bot, registra comandos, callbacks y efectos secundarios (datos/DB, servicios de mapa e inventarios).
- `src/services/*`: lógica de juego aislada (mapa, exploración, recolección, bolsas, progresión).
- `src/lib/*`: utilidades transversales (`db.ts`, `i18n.ts`, `map-exploration.ts`, `player-ui.ts`).
- `src/data/*` y `src/types/*`: constantes, íconos y tipos compartidos.
- `prisma/`: esquema, seeds y base empaquetada (`dev.db`).
- `docs/`: notas de progreso, especificaciones y esta visión general.

## Scripts y flujo de desarrollo
1. `npm run dev` → `tsx watch src/index.ts`: arranque en vivo (requiere `TELEGRAM_BOT_TOKEN` en `.env`).
2. `npm run build` → `tsc`: transpila a `dist/`.
3. `npm start` → `node dist/index.js`.
4. `npm run lint` → `tsc --noEmit` para validación rápida de tipos.
5. `npm test` → alias de `npm run lint`, útil para CI ligera.
4. Prisma: `npm run db:generate`, `db:push`, `db:migrate`, `db:studio`.
5. Seeds concretos: `npm run db:seed:resources` y `npm run db:seed:bags`.
6. Carga típica: copiar `.env` (token + `DATABASE_URL="file:./dev.db"`), instalar deps (`npm install`), ejecutar `npm run dev`.

## Base de datos y entorno
- Prisma usa SQLite (`DATABASE_URL="file:./dev.db"`) y bundle con un archivo de desarrollo (`prisma/dev.db`). Hay migraciones en `prisma/migrations/` y un `.env.example` para copiar y proporcionar tu propio token en `.env`.
- Las tablas más relevantes para la optimización actual son `mapTile`, `player`, `playerExploredTile`, `place` y `resourceNode`.
- El bot lee `TELEGRAM_BOT_TOKEN` desde `.env` y debería cambiarse si este repositorio se comparte.

## Estado actual y mejoras recientes
- La hoja de progreso consolidada resume características implementadas (onboarding, combate, inventario, exploración, misiones, economía); ver [docs/PROGRESS.md](C:\Users\marti\Downloads\WorldOfNova-no-deps\docs\PROGRESS.md).
- Renderizado de mapa actualizado: ahora se precarga la cuadrícula visible y los lugares para evitar 100+ queries por vista; el cálculo se hace en `src/services/map.ts`.
- `markTileExplored` ya no vuelve a buscar el jugador cada vez, lo usa directamente en los flujos de movimiento y ruta.

## Observaciones y riesgos
- No hay pruebas ni lint automáticos definidos.
- `node_modules/`, `dist/` y `prisma/dev.db` están presentes en esta copia y deben excluirse de git en cuanto se inicialice.
- La documentación antigua menciona PostgreSQL, pero el entorno real es SQLite.
- El token del bot está en `.env`; rotarlo y excluir `.env` del control de versiones es imprescindible antes de publicar el proyecto.

## Próximos pasos recomendados
1. Iniciar el repositorio Git oficial, añadir `.gitignore` para `node_modules/`, `dist/`, `docs/PROGRESS` si expone secretos y `prisma/dev.db`.
2. Añadir pruebas y lint básicos, incluso comandos `npm run test`/`lint` mínimos que ejecuten TypeScript o Prisma.
3. Desplegar semillas documentadas y decidir si se mantiene `dev.db` o se vuelve a generar con `prisma db push` + `seed`.
4. Mantener una página de referencia rápida (esta) sincronizada con cualquier refactor grande del bot.

## Referencias clave
- `[docs/PROGRESS.md](C:\Users\marti\Downloads\WorldOfNova-no-deps\docs\PROGRESS.md)` – seguimiento de sistemas implementados y bugs abordados.
- `[docs/ENCYCLOPEDIA.md](C:\Users\marti\Downloads\WorldOfNova-no-deps\docs\ENCYCLOPEDIA.md)` – índice corto de nombres, skills y rarezas para mantener la UI compacta.
- `[src/services/map.ts](C:\Users\marti\Downloads\WorldOfNova-no-deps\src\services\map.ts)` – lógica de mapa y exploración optimizada.
