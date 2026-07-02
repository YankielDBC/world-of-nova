# World of Nova – Progreso del proyecto (Nightfall v1.0)

## Estado general
El juego ejecuta los flujos base de onboarding, combate, inventario, exploración y economía. La interfaz principal ahora es una **aplicación web React + Express + Socket.io**. El código legacy del bot de Telegram permanece en `src/bot/` pero no es el target activo.

## Sistemas implementados
- **Onboarding / Registro web**: input de nickname, selección de raza (Uren/Zolk) y clase (dos por raza).
- **Combate**: sistema por turnos con estadísticas (HP, energía, daño, defensa, velocidad) y daño aleatorio con variaciones de ±20%.
- **Inventario**: soporte para ítems, equipamiento, bolsas, capacidad limitada y operaciones de agregar/quitar.
- **Exploración**: mapa procedural por tiles, fog of war, 10 biomas reales, generación bajo demanda.
- **Economía**: sistema de recompensas, tiendas, doble moneda (gold/silver), mercado de jugadores y mercader misterioso.
- **Habilidades**: talentos raciales, skills de clase y skills generales.
- **Web UI**: layout 3-columnas, mini-mapa, panel de personaje, D-pad, recolectar.

## Migración a web (2026-06-17)
- Creado servidor Express en `src/server/`.
- Creado frontend React en `web/`.
- API funcional: auth, player, map (move + gather).
- Socket.io para presencia de jugadores en el mismo tile.
- Vite con proxy a Express en desarrollo.
- Ver `docs/WEB_API.md` para detalles.

## Infraestructura y stack
- **Lenguajes / frameworks**: Node.js (ESM), TypeScript, React, Vite, Express, Socket.io, Prisma ORM.
- **Base de datos**: SQLite con `.env` apuntando a `file:./dev.db`. Migraciones en `prisma/migrations/` y seeds independientes (`prisma/seed-*.ts`).
- **Scripts**:
  - `npm run dev` (Express :3000 + Vite :5173)
  - `npm run server:dev` (solo servidor con watch)
  - `npm run web:dev` (solo Vite)
  - `npm run web:build` (build a `web/dist`)
  - `npm run build` (tsc → `dist/`)
  - `npm run lint` (tsc --noEmit)
  - Prisma: `db:generate`, `db:push`, `db:migrate`, `db:studio`, `db:seed:all`.

## Sistema de lugares y biomas
- **Nova Castle (0,0)**: PvP/PvE desactivados, servicios de descanso, curación, forja, banco, entrenamiento y mercado.
- **Biomas reales**: plains, forest, swamp, volcano, ashlands, highlands, desert, tundra, river, lake. Cada uno tiene recursos asociados.

## Notas de seguridad y mantenimiento
- El token legacy del bot sigue en `.env`; rotarlo y excluir `.env` del control de versiones es imprescindible.
- `node_modules/`, `dist/`, `web/dist/` y `prisma/dev.db` no deben estar en git.

## Mejoras recientes
1. Capa web funcional con registro, login, movimiento y recolección.
2. Documentación centralizada: `GAME_BIBLE.md`, `WEB_API.md`, `ENCYCLOPEDIA.md` actualizados.
3. Seeds completos: 10 biomas, 33 recursos, 5 bolsas, 13 equipos, 1 lugar + 19 interacciones.

## Próximos pasos
1. Extender API web: inventario, equipar, combate PvE, crafteo, mercado.
2. Sincronizar UI React con nuevos endpoints.
3. Añadir pruebas automatizadas mínimas.
4. Definir despliegue de producción (servir `web/dist` desde Express).
