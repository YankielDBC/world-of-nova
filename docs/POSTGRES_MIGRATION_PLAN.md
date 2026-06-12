# PostgreSQL Migration Plan (No Downtime Target)

## Objetivo
Migrar de SQLite a PostgreSQL sin romper la experiencia del jugador y con riesgo operativo bajo.

## Estado actual
- Runtime actual: Prisma + SQLite (`prisma/schema.prisma`).
- Alta concurrencia real MMORPG requiere Postgres (locks, throughput, observabilidad, backups).

## Estrategia recomendada
Usar migracion por fases con dual-readiness (no big-bang):
1. Preparacion de esquema en Postgres.
2. Backfill de datos inicial.
3. Ventana de sync final corta (o dual-write temporal).
4. Cutover por feature flag/env.
5. Verificacion + rollback listo.

## Fase A: Preparacion
1. Crear entorno Postgres (staging y prod) con:
- TLS
- backups automáticos
- monitoreo (CPU, IOPS, conexiones, slow queries)

2. Crear rama de migracion y schema Prisma para Postgres.
- Mantener branch aislada.
- Evitar mezclar cambios de gameplay y cambios de storage en el mismo PR.

3. Ejecutar migraciones en staging y validar:
- indices de hotspots (`Player.tgId`, `MapTile(worldMapId,x,y)`, `PlayerRecovery(status,endsAt)`, etc.)
- constraints unicos y FKs.

## Fase B: Backfill
1. Congelar cambios estructurales durante backfill.
2. Exportar datos desde SQLite y cargar a Postgres por lotes:
- jugadores
- inventario/bolsas/herramientas
- tiles explorados
- place/bank/recovery state

3. Verificaciones obligatorias:
- conteo por tabla
- checksums por entidades clave
- muestreo de jugadores reales (inventario, posicion, stats, skills)

## Fase C: Sync Final y Cutover
Opcion 1 (mas simple): ventana corta de mantenimiento
- Modo solo lectura durante minutos.
- Re-ejecutar delta final.
- Cambiar `DATABASE_URL` a Postgres.
- Reiniciar workers/bot.

Opcion 2 (sin pausa): dual-write temporal
- Escribir en SQLite + Postgres por una ventana acotada.
- Verificar consistencia de escrituras.
- Cambiar lectura principal a Postgres.
- Retirar SQLite al final.

## Fase D: Verificacion Post-Cutover
Checklist primera hora:
- latencia p95/p99 de comandos
- errores de DB/transaccion
- throughput de callbacks
- integridad de inventario y movimiento
- recovery sweeper y place services

Checklist 24h:
- estabilidad general
- costos/recursos
- incidentes de consistencia

## Rollback Plan
Si falla cutover:
1. detener nuevas escrituras en Postgres
2. reconfigurar `DATABASE_URL` a SQLite
3. reiniciar bot
4. publicar estado y postmortem corto

Requisito: conservar snapshot SQLite y snapshot Postgres antes de cutover.

## Cambios tecnicos sugeridos antes de ejecutar la migracion
- Añadir health checks de DB con timeout.
- Añadir metricas de errores Prisma por modelo.
- Añadir script de verificacion automatica de conteos por tabla.
- Practicar el runbook en staging completo al menos 2 veces.
