# Deployment Modes (Bot + Worker)

## Variables clave
- `BOT_TRANSPORT_MODE=polling|webhook`
- `WEBHOOK_URL` (requerida en webhook)
- `WEBHOOK_PORT` (puerto local del webhook listener)
- `ENABLE_BACKGROUND_WORKERS=true|false`
- `REDIS_URL` (opcional, recomendado en multi-instancia)

## Modo simple (1 proceso)
- `ENABLE_BACKGROUND_WORKERS=true`
- `BOT_TRANSPORT_MODE=polling` (o webhook)
- Ejecutar:
  - `npm run dev:bot`

## Modo separado recomendado
1. Proceso Bot API:
   - `ENABLE_BACKGROUND_WORKERS=false`
   - `npm run dev:bot`
2. Proceso Worker:
   - `npm run dev:worker`

## Notas
- En produccion, usar PostgreSQL + pooler.
- Redis habilita estado conversacional compartido entre instancias.
