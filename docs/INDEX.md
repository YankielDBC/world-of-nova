# World of Nova — Índice de documentación

> Compendio técnico y de diseño del juego. Todo lo aquí documentado es independiente de Telegram; sirve para replicar World of Nova en cualquier plataforma o tecnología.

---

## Documentación de referencia

| Documento | Propósito |
|-----------|-----------|
| [GAME_CORE.md](./GAME_CORE.md) | Atributos primarios, stats de combate, fórmulas exactas, nivelación, títulos y progresión. |
| [RACES_CLASSES.md](./RACES_CLASSES.md) | Razas, clases, atributos base, crecimiento por nivel, talentos raciales y árboles de skills. |
| [RESOURCES.md](./RESOURCES.md) | Catálogo de recursos, rarezas, pesos, valores, herramientas requeridas y ventanas de spawn. |
| [BIOMES_ZONES.md](./BIOMES_ZONES.md) | Biomas, efectos de ciclo día/noche, zonas de dificultad y criaturas por bioma. |
| [CREATURES.md](./CREATURES.md) | Categorías de criaturas, multiplicadores, spawns, drops, respawn y generación. |
| [EQUIPMENT.md](./EQUIPMENT.md) | Slots de equipo, plantillas base, rareza, bind, modifiers y generador procedural. |
| [BAGS.md](./BAGS.md) | Tipos de mochila, capacidad, peso, slots, herramientas y equipamiento. |

## Inspiración y referencia externa

| Documento | Propósito |
|-----------|-----------|
| [WOW_INSPIRATION.md](./WOW_INSPIRATION.md) | Tipologías de criaturas y razas de World of Warcraft como referencia de diseño. |

## Flujo de juego y acciones

| Documento | Propósito |
|-----------|-----------|
| [ACTIONS.md](./ACTIONS.md) | Cada acción/comando del juego: qué hace, costos, validaciones y flujo paso a paso. |
| [PLAYER_FLOW.md](./PLAYER_FLOW.md) | Flujos completos del jugador: registro, movimiento, gather, combate, muerte, cuevas, economía. |
| [PVE_COMBAT.md](./PVE_COMBAT.md) | Combate PvE por turnos: fórmulas, presión, evasión, crítico, muerte y loot. |
| [PLACES.md](./PLACES.md) | Lugares, edificios, recovery, forge, bank, training yard y mercaderes. |
| [ECONOMY.md](./ECONOMY.md) | Crown Bank, Grand Exchange, mercader ambulante, forge, SOS, fees y sinks/faucets. |
| [DEATH_AND_CAVES.md](./DEATH_AND_CAVES.md) | Sistema de muerte, modo fantasma, recuperación de cadáver y cuevas. |

## Migración a webapp

| Documento | Propósito |
|-----------|-----------|
| [WEBAPP_MIGRATION.md](./WEBAPP_MIGRATION.md) | Qué backend reutilizar, qué cambiar, qué hacer nuevo y arquitectura propuesta para web. |
| [WEB_API.md](./WEB_API.md) | Endpoints REST y eventos Socket.io actuales/planificados. |

## Documentación de proyecto

| Documento | Propósito |
|-----------|-----------|
| [../README.md](../README.md) | Pitch, instalación, scripts, stack y estructura general. |
| [../AGENTS.md](../AGENTS.md) | Convenciones para agentes que trabajen en el proyecto. |
| [GAME_BIBLE.md](./GAME_BIBLE.md) | Visión general del juego (mantenido como referencia de diseño). |
| [ARCHITECTURE_MASTER_MAP.md](./ARCHITECTURE_MASTER_MAP.md) | Mapa de la arquitectura legacy del bot. |

---

## Cómo usar este índice

- Si vas a **replicar el juego desde cero**, empieza por `GAME_CORE.md`, `RACES_CLASSES.md` y `ACTIONS.md`.
- Si vas a **hacer la webapp**, lee `WEBAPP_MIGRATION.md` y `WEB_API.md`.
- Si necesitas **consultar una fórmula o tabla**, usa `GAME_CORE.md`, `RESOURCES.md`, `CREATURES.md` o `EQUIPMENT.md`.

---

*Última actualización: 2026-07-02*
