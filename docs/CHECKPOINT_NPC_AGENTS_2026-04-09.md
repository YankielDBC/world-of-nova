# Checkpoint NPC Agents - 2026-04-09

## Proposito

Dejar constancia del estado del trabajo sobre NPCs autonomos tipo OpenClaw para `World of Nova`, tomando como base el backup local:

- `C:\Users\marti\Downloads\NPC-agents-backup.zip`

y transformandolo en una base lista para evolucionar hacia agentes-jugador que vivan dentro del mundo respetando las mismas reglas que cualquier player.

---

## Estado del analisis

Se reviso el backup y se encontraron 3 NPCs base:

- `kaelith`
- `sora`
- `vaxen`

Cada uno traia:

- `AGENTS.md`
- `BOOTSTRAP.md`
- `HEARTBEAT.md`
- `IDENTITY.md`
- `SOUL.md`
- `TOOLS.md`
- `USER.md`

### Problemas detectados en el backup original

1. Estaban escritos como workspaces genericos de agente, no como habitantes reales de Nova.
2. Tenian texto con mojibake/encoding roto.
3. No tenian `MEMORY.md` persistente util para gameplay.
4. No tenian `SKILL.md` operativo para jugar el MMORPG.
5. No conocian los sistemas reales del juego:
   - mapa
   - viaje
   - clima
   - horario
   - inspect/interact
   - tools
   - bag/bank
   - market
   - merchant
   - PvE
   - muerte/cadaver/plano astral
   - progression
   - builds/raciales
   - reglas de fair play

---

## Resultado de esta fase

Se creo una nueva estructura curada dentro del proyecto:

- `NPC-agents/`

Objetivo de esa carpeta:

- servir como base limpia y versionable
- mantener las personalidades de los NPCs
- darles memoria inicial
- explicarles como vivir dentro de Nova
- obligarlos a usar una capa API de jugador, nunca privilegios de admin

---

## NPCs definidos

### Kaelith

- perfil: estratega, calculador, conservador
- rol principal: navegacion segura, evaluacion de riesgo, rutas y economia tactica
- raza/clase sugerida:
  - `Zolk`
  - `Curse Hunter`

### Sora

- perfil: observadora, serena, alquimista de campo
- rol principal: recuperacion, sosten del grupo, lectura del contexto, decisiones lentas y seguras
- raza/clase sugerida:
  - `Zolk`
  - `Alchemist Rogue`

### Vaxen

- perfil: explorador, impulsivo pero leal, cazador de hallazgos
- rol principal: scout, apertura de rutas, exploracion, reaccion rapida a oportunidades
- raza/clase sugerida:
  - `Zolk`
  - `Alchemist Rogue`

---

## Regla central de arquitectura

Estos NPCs no deben jugar por scraping improvisado del bot ni por acceso a DB.

Deben jugar por una capa segura de APIs de jugador.

### Interfaz esperada

Minimo:

- `GET /v1/agent/self`
- `GET /v1/agent/perception`
- `GET /v1/agent/map/local`
- `GET /v1/agent/inventory`
- `GET /v1/agent/actions/available`
- `POST /v1/agent/actions/execute`
- `GET /v1/agent/actions/{actionId}`
- `GET /v1/agent/events/stream`

Y luego dominios:

- movement
- inspect/interact
- bag
- bank
- market
- place recovery
- combat
- corpse recovery
- build / skill allocation
- chat social

### Regla no negociable

Si una accion no existe para un jugador real, el NPC no la puede inventar.

---

## Estado funcional actual

Lo que ya quedo listo en documentacion:

1. checkpoint de NPCs
2. estructura `NPC-agents/`
3. protocolo comun de agente
4. conocimiento comun de gameplay
5. contrato API esperado
6. personalizacion individual de Kaelith, Sora y Vaxen:
   - identidad
   - alma
   - memoria inicial
   - skill operacional
7. alineacion de los tres NPCs al trasfondo Zolk
8. base de lore viva en `docs/LORE_WORLD_OF_NOVA.md`

---

## Lo que aun falta en producto

Para que estos NPCs corran 24/7 de verdad dentro del juego, faltaria implementar o cerrar:

1. la capa `agent API` real del backend
2. autenticacion segura por NPC
3. colas/locks por agente
4. streaming o polling disciplinado de eventos
5. telemetria por agente:
   - supervivencia
   - rentabilidad
   - rutas
   - muertes
   - uso de market
   - encuentros PvE
6. reglas de rate limit y backoff
7. persistencia externa o repositorio de memoria por NPC

---

## Veredicto

El proyecto ya esta en un punto donde tiene sentido serio invertir en NPCs autonomos.

La base del mundo soporta:

- exploracion
- economia
- progreso
- muerte
- riesgo
- builds
- PvE

Eso significa que estos NPCs ya no deben pensarse como "bots de prueba", sino como futuros habitantes persistentes del reino.

La carpeta `NPC-agents/` queda como la base de esa siguiente fase.
