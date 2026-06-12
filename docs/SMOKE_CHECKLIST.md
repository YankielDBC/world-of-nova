# World of Nova - Smoke Checklist

## Objetivo

Validar rápido que el refactor no rompió los loops principales del juego.

## Reglas

- Ejecutar después de cada fase grande de refactor.
- No aprobar merge si falla cualquiera de los checks críticos.

## 1. Arranque

- `npm run lint` pasa sin errores.
- `npm run build` pasa sin errores.
- `npm run dev` levanta bot sin crash al iniciar.

## 2. Registro y perfil

- `/start` funciona para jugador nuevo.
- `/profile` abre sin errores.
- `/title` responde correctamente.

## 3. Mapa y movimiento

- `/map` renderiza con keyboard.
- `map_up/down/left/right` mueve sin romper mensaje.
- viaje por coordenadas (`/venture`) confirma y termina.

## 4. Inventario

- `/bag` muestra slots y peso.
- `/equip` abre equipo sin fallar.
- usar/soltar item funciona.
- cambio de mochila a pockets respeta validaciones.

## 5. Inspect y recolección

- `/inspect` muestra nodos.
- flujo nodo -> cantidad -> resultado funciona.
- no hay duplicación de rewards por doble click.

## 6. Lugares

- `/place` abre edificios del lugar.
- servicios de motel/templo arrancan recovery.
- interrumpir recovery funciona.

## 7. Economía

- mercado abre hub.
- buy/sell no rompe conversación.
- banco abre y muestra resumen.
- forja responde con servicios.

## 8. PvE

- `/interact` muestra criaturas cuando hay spawn.
- scout -> combatir abre combat card.
- acciones de turno responden.
- derrota activa flujo de muerte/astral.

## 9. Ghost / Corpse

- estando muerto, comandos no permitidos se bloquean.
- `/map` astral se ve correcto.
- recuperar cuerpo revive y limpia estado.

## 10. Canal y workers

- workers de jobs/clima/merchant activos sin crash.
- patch notes se pueden sincronizar sin duplicado.

## Resultado

- `PASS`: todos los checks críticos completos.
- `FAIL`: cualquier error de flujo principal o crash.

