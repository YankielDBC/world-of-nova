# World of Nova – Progreso del proyecto (Nightfall v1.0)

## Estado general
El bot ya ejecuta los flujos base de onboarding, combate, inventario, exploración y economía. La rama actual se centra en estabilizar el mapa dinámico y pulir la interacción con lugares fijos mientras se consolida la experiencia principal de Nightfall.

## Sistemas implementados
- **Onboarding / Registro**: idiomas ES/EN, selección de nickname, raza (Uren/Zolk) y clase (dos por raza). Los botones se limpian al avanzar entre pasos.
- **Combate**: sistema por turnos con estadísticas (HP, energía, daño, defensa, velocidad) y daño aleatorio con variaciones de ±20%.
- **Inventario**: soporte para ítems, capacidad limitada y operaciones de agregar/quitar.
- **Exploración**: mapa procedural 10×10 con fog of war, biomas reales (forest, swamp, plains, river, volcano), generación con tiles y lugares.
- **Misiones y economía**: quest principal Nightfall, quests secundarias y sistema de recompensas con tiendas y moneda (gold/silver).
- **Habilidades**: spells y skills por clase disponibles en combate.

## Bugs arreglados
1. `prisma is not defined` → se importó correctamente el cliente en `src/index.ts`.
2. Los botones del onboarding seguían visibles → se agregó `editMessageReplyMarkup` en cada callback para limpiarlos.
3. El renderizado de mapa realizaba cientos de queries por vista → ahora se precargan los tiles, lugares y exploraciones visibles antes de iterar el grid.

## Infraestructura y stack
- **Lenguajes / frameworks**: Node.js (ESM), TypeScript, [grammy](https://grammy.dev/) para Telegram, Prisma ORM.
- **Base de datos**: SQLite con `.env` apuntando a `file:./dev.db`. Ya existen migraciones en `prisma/migrations/` y seeds independientes (`prisma/seed-*.ts`).
- **Scripts**:
  - `npm run dev` (tsx watch `src/index.ts`)
  - `npm run build` (tsc → `dist/`)
  - `npm start` (node `dist/index.js`)
  - `npm run lint` (tsc --noEmit)
  - `npm test` (alias a `npm run lint`, para pruebas rápidas)
  - Prisma: `db:generate`, `db:push`, `db:migrate`, `db:studio`, `db:seed:resources`, `db:seed:bags`.

## Sistema de lugares y biomas
- **Nova Castle (0,0)**: PvP/PvE desactivados, servicios curativos y de energía (The Gilded Rest, Mercy's Edge, Swift Slumber, Divine Intervention).
- **Comandos próximos**: `/castle` y `/place` para teletransportarse al lugar actual.
- **Biomas reales**: forest, swamp, plains, river y volcano. Cada uno tiene recursos asociados (madera, frutas, hierbas, agua, lava, etc.) y nodos con `yieldsJson` para la recolección.

## Notas de seguridad y mantenimiento
- El token de Telegram no se almacena aquí; usa `docs/OVERVIEW.md` junto a `.env.example` como plantilla y genera tu propio `.env` con marcas rotas antes de compartir.
- `node_modules/`, `dist/` y `prisma/dev.db` no deberían seguir en el control de versiones. Añadir `.gitignore` antes de crear el historial es urgente.
- `docs/PROGRESS.md` y el resto de documentación deben reescribirse si el flujo de datos o la infraestructura cambian (ya no se usa PostgreSQL como indicaban versiones previas).

## Mejoras recientes
1. El mapa ahora consulta las exploraciones (`playerExploredTile`), tiles y lugares dentro de la ventana visible con una sola llamada, lo que reduce la cantidad de queries cuadráticamente.
2. `markTileExplored` utiliza la información del jugador que ya se trajo (id + tgId), evitando una consulta extra al actualizar tiles o seguir un plan de movimiento.

## Próximos pasos
1. Inicializar Git con `.gitignore` y limpiar dependencias/artefactos que no deben compartirse.
2. Definir cronogramas de pruebas/lint (aunque sea `tsc` + `prisma fmt`).
3. Automatizar seeds y documentar qué archivos se regeneran.
4. Confirmar quién gestiona el token y cómo se despliega en el entorno final.
