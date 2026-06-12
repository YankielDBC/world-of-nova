# Load Test Plan (1k -> 5k)

## Objetivo
Medir estabilidad y latencia de:
- map move
- inspect action
- venture scheduling
- workers de llegada

## Escenarios
1. **Smoke (100 concurrentes)**  
   Validar errores funcionales y colas.
2. **Ramp (100 -> 1000 en 10 min)**  
   Medir p95/p99 y backlog de jobs.
3. **Peak (3000-5000 bursts)**  
   Validar estabilidad de DB, worker y API rate.

## Métricas mínimas
- p50/p95/p99 por comando
- jobs `PENDING/RUNNING/FAILED`
- errores Prisma por minuto
- tiempo de finalización de viaje
- mensajes fallidos al API de Telegram

## Criterios de aceptación
- error rate < 1%
- p95 comandos críticos < 500ms (sin contar ETA de viaje)
- sin pérdida de jobs en reinicios controlados
- sin inconsistencias de energía/posición
