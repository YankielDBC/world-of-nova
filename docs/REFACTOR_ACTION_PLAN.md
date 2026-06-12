# World of Nova - Plan de Acción Integral (Refactor v2.0)

**Objetivo**: Proyecto mantenible, escalable a 4000 jugadores concurrentes, sin archivos >500 líneas, con TypeScript completo, GitHub como source of truth, y despliegue predecible.

---

## Diagnóstico Actual

### Archivos que exceden 500 líneas (deben partirse)

| Archivo | Líneas | Prioridad |
|---------|--------|-----------|
| data/place-ui.js | 929 | ALTA |
| services/pve-combat.js | 731 | ALTA |
| services/bags-tools.js | 725 | ALTA |
| bot/modules/market-module.js | 722 | ALTA |
| services/bags.js | 704 | ALTA |
| data/skill-trees.js | 698 | ALTA |
| services/build-skills.js | 666 | ALTA |
| data/community-patches.js | 630 | ALTA |
| services/cave-system.js | 607 | ALTA |
| services/mystery-merchant.js | 580 | ALTA |
| bot/modules/racial-ui.js | 576 | ALTA |
| lib/i18n.js | 571 | ALTA |
| services/death-system.js | 567 | ALTA |
| lib/telegram-custom-emojis.js | 552 | ALTA |
| bot/modules/bank-module.js | 539 | ALTA |
| services/climate-core.js | 523 | ALTA |
| bot/modules/build-ui.js | 515 | ALTA |
| bot/modules/mystery-merchant-module.js | 512 | ALTA |
| app-main.js | 495 | MEDIA |

### Problemas estructurales
1. No existe `src/` — el código fuente real está en `dist/` (JS compilado)
2. No existe `prisma/` — schema solo en `node_modules/.prisma/client/`
3. Esquema híbrido: Prisma + tablas runtime con `CREATE TABLE IF NOT EXISTS`
4. Servicios mezclan: reglas puras + persistencia + render UI
5. Sin tests automatizados (solo typecheck)
6. Sin CI/CD
7. Sin Docker/deployment reproducible

---

## Estrategia de Ramas (GitHub)

```
master         → estable, releases
├─ develop     → integración de fases completadas
├─ phase-0     → foundation (estructura src/, prisma/, tooling)
├─ phase-1     → split data files
├─ phase-2     → split services (pve, bags, inspect, merchant, death, build)
├─ phase-3     → split bot modules
├─ phase-4     → split lib files
├─ phase-5     → app-main refactor
├─ phase-6     → postgres + convergencia esquema
├─ phase-7     → performance 4k users
└─ backup-*    → snapshots pre-refactor
```

Cada fase se trabaja en su rama, se mergea a `develop`, se prueba con smoke checklist, y luego a `master`.

---

## Fase 0: Foundation (Semana 1)

### 0.1 Restaurar src/ desde dist/
Convertir `dist/` a `src/` con estructura TypeScript:
```
src/
├── index.ts                  # Entry point
├── app-main.ts               # Orchestrator
├── worker.ts                 # Background worker
├── bootstrap/                # Startup helpers
├── bot/
│   ├── handlers/             # Inline handlers
│   ├── middleware/            # Global middleware
│   ├── modules/              # UI modules
│   ├── runtime/              # Command/callback/message routers
│   └── state/                # Conversation scopes
├── data/                     # Static catalogs
├── lib/                      # Shared infrastructure
├── services/                 # Game domain logic
└── types/                    # Shared types
```

### 0.2 Restaurar prisma/
- Copiar `schema.prisma` desde `node_modules/.prisma/client/` a `prisma/schema.prisma`
- Añadir seeds desde `docs/DB_STATUS.md` y documentación existente
- Configurar `prisma/seed*.ts` con los datos actuales

### 0.3 Configurar tooling
- TypeScript strict mode
- ESLint + Prettier
- Husky + lint-staged (pre-commit hooks)
- Jest para tests unitarios (o vitest)

### 0.4 CI/CD básico (GitHub Actions)
```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run lint
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm test
```

### 0.5 Backup inicial
- Backup local en `../WorldOfNova-backup-<timestamp>/`
- Tag de git: `git tag v1.0-pre-refactor`
- Rama de backup subida a GitHub: `backup-pre-refactor`

---

## Fase 1: Split Data Files (Semana 2)

### 1.1 `data/place-ui.js` (929 → <500)
Split en:
```
data/
├── place-ui/
│   ├── index.ts          # Facade (imports all)
│   ├── castles.ts        # Nova Castle services
│   ├── towns.ts          # Town services
│   ├── hotels.ts         # Recovery places
│   ├── temples.ts        # Divine services
│   ├── forge-shop.ts     # Blacksmith services
│   └── localization.ts   # getLocalizedText
```

### 1.2 `data/skill-trees.js` (698 → <500)
Split en:
```
data/
├── skill-trees/
│   ├── index.ts
│   ├── types.ts
│   ├── alchemist-rogue.ts
│   ├── curse-hunter.ts
│   ├── dark-druid.ts
│   ├── arcane.ts
│   └── shared.ts          # Common helpers
```

### 1.3 `data/community-patches.js` (630 → <500)
Split en:
```
data/
├── community-patches/
│   ├── index.ts
│   ├── patches-v1.ts
│   ├── patches-v2.ts
│   └── render.ts
```

### 1.4 Otros data files
- `data/day-cycle.js` (331) → evaluar si necesita split
- `data/racial-talents.js` (343) → ok por ahora
- `data/emojis.js` (150) → ok

---

## Fase 2: Split Core Services (Semanas 3-5)

### 2.1 `services/pve-combat.js` (731 → <500)
Ya tiene pre-splits iniciados. Completar:
```
services/pve/
├── index.ts              # Facade (public API)
├── schema.ts             # Schema runtime
├── repository.ts         # CRUD encounters
├── turn-resolver.ts      # Turn resolution logic
├── damage.ts             # Damage calculation
├── effects.ts            # Buff/debuff logic
├── intents.ts            # Enemy AI intent
├── player-adapter.ts     # Player → combat snapshot
├── creature-adapter.ts   # Creature → combat snapshot
└── view.ts               # Combat UI rendering
```

### 2.2 `services/bags.js` + `services/bags-tools.js` (704 + 725)
Ya tiene pre-splits. Reorganizar:
```
services/bags/
├── index.ts              # Facade
├── repository.ts         # DB operations
├── read.ts               # Bag reading queries
├── write.ts              # Bag mutations
├── switch.ts             # Bag switch logic
├── render.ts             # Bag UI text/keyboard
├── ground-loot.ts        # Drop/pickup
├── items.ts              # Item operations
├── tools.ts              # Tool equip/unequip
├── weight.ts             # Weight calculations
└── equipment.ts          # Equipment integration
```

### 2.3 `services/build-skills.js` (666)
```
services/build/
├── index.ts
├── schema.ts
├── state.ts
├── loadout.ts
├── effects.ts
├── telemetry.ts
└── cooldowns.ts
```

### 2.4 `services/mystery-merchant.js` (580)
```
services/merchant/
├── index.ts
├── state.ts
├── pathing.ts
├── offers.ts
├── pricing.ts
├── rumors.ts
├── trades.ts
└── alerts.ts
```

### 2.5 `services/death-system.js` (567)
```
services/death/
├── index.ts
├── corpse.ts
├── ghost.ts
├── astral.ts
├── recovery.ts
└── render.ts
```

### 2.6 `services/cave-system.js` (607)
```
services/cave/
├── index.ts
├── instance.ts
├── exploration.ts
├── combat.ts
└── render.ts
```

### 2.7 `services/climate-core.js` (523) + `services/climate.js`
```
services/climate/
├── index.ts
├── zones.ts
├── weather.ts
├── effects.ts
└── render.ts
```

### 2.8 Otros servicios existentes que ya están bien
- `services/map.js` (8) → facade, ok
- `services/map-*.js` → todos <300 líneas, ok
- `services/market-exchange-*.js` → ya modulares, ok
- `services/creatures.js` (465) → borderline, evaluar

---

## Fase 3: Split Bot Modules (Semanas 6-7)

### 3.1 `bot/modules/market-module.js` (722)
```
bot/modules/market/
├── index.ts
├── hub.ts
├── buy.ts
├── sell.ts
├── history.ts
├── orders.ts
└── ui.ts
```

### 3.2 `bot/modules/racial-ui.js` (576)
```
bot/modules/racial/
├── index.ts
├── talent-list.ts
├── loadout.ts
├── effects.ts
└── ui.ts
```

### 3.3 `bot/modules/bank-module.js` (539)
```
bot/modules/bank/
├── index.ts
├── deposit.ts
├── withdraw.ts
├── vault.ts
└── ui.ts
```

### 3.4 `bot/modules/build-ui.js` (515)
→ Ya tiene `build-ui.js` + `build-module.js`. Unificar bajo:
```
bot/modules/build/
├── index.ts
├── skills.ts
├── loadout.ts
├── effects.ts
└── ui.ts
```

### 3.5 `bot/modules/mystery-merchant-module.js` (512)
→ Simplificar: que sea solo UI, la lógica de negocio ya vive en `services/merchant/`

---

## Fase 4: Split Lib Files (Semana 8)

### 4.1 `lib/i18n.js` (571)
```
lib/i18n/
├── index.ts              # Facade + t() function
├── es.ts                 # Spanish translations
├── en.ts                 # English translations
├── ru.ts                 # Russian translations
└── detect.ts             # Language detection
```

### 4.2 `lib/telegram-custom-emojis.js` (552)
```
lib/telegram-custom-emojis/
├── index.ts
├── transformer.ts
├── availability.ts
├── prime.ts
└── types.ts
```

---

## Fase 5: app-main.ts Refactor (Semana 8)

Reducir de 495 a <300 líneas:

```
src/
├── app-main.ts              # Solo composición: crear bot, importar módulos, start()
├── bootstrap/
│   ├── startup-sequence.ts  # Ya existe
│   ├── register-all.ts      # Unificar registro de comandos/callbacks/messages
│   └── dependency-graph.ts  # DI container simple
```

Extraer de app-main.ts:
- ✓ Bootstrap → ya está en `bootstrap/`
- ✓ Middleware → ya está en `bot/middleware/`
- ✓ Handlers → ya están en `bot/handlers/`
- ✓ Profiles → ya está en `bot/handlers/player-profile-handlers.js`
- ⚠ Recovery coordinator → mover a `services/recovery-sweeper.ts`
- ⚠ Constant definitions → mover a `lib/runtime-config.ts`
- ⚠ Factory helpers → mover a `bot/handlers/factories.ts`

---

## Fase 6: PostgreSQL + Unified Schema (Semanas 9-10)

### 6.1 Migrar tablas runtime a Prisma
Tablas actualmente creadas con `CREATE TABLE IF NOT EXISTS`:
1. `CommunityAnnouncement`
2. `PlayerRacialTalent` / `PlayerRacialLoadout`
3. `PlayerBuildSkill` / `PlayerBuildLoadout` / `PlayerBuildEffect` / `PlayerBuildCooldown`
4. `PlayerPveEncounter`
5. `PlayerSoulAnchor` / `PlayerCorpse` / `PlayerDeathState`
6. `WorldCreatureSpawn`
7. `BuildTelemetryEvent`

### 6.2 Añadir a schema.prisma
Cada modelo runtime debe ser añadido al schema Prisma con `@@map()` o `@map()` para mantener compatibilidad con nombres existentes.

### 6.3 Migrar de SQLite a PostgreSQL
- Seguir `docs/POSTGRES_MIGRATION_PLAN.md`
- Cambiar datasource en schema.prisma a `postgresql`
- Configurar connection pool (pgBouncer recomendado)
- Migración por fases con dual-readiness

---

## Fase 7: Performance 4000 Concurrent Users (Semanas 11-12)

### 7.1 Base de datos
- Connection pooling (Prisma + pgBouncer)
- Índices adicionales en hotspots:
  - `Player(mapX, mapY, isActive, lastActiveAt)`
  - `MapTile(worldMapId, x, y)`
  - `PlayerRecovery(status, endsAt)`
  - `GameJob(status, executeAt)`
  - `MarketItemOrder(resourceId, status, priceSilver)`
- Read replicas para consultas pesadas (map rendering)

### 7.2 Caching con Redis
- Session state (ya soportado en `distributed-kv.ts`)
- Tile cache (reducir lecturas de DB en renderMap)
- Player profile cache
- Resource node catalog cache

### 7.3 Worker scaling
- Separar procesos: bot API + worker pool
- Worker pool horizontal con Redis como message broker
- Rate limiting por jugador (ya existe `player-action-queue.ts`)
- Job queue con backpressure

### 7.4 Query optimization
- batch reads para map rendering
- `SELECT ... IN (...)` vs N queries individuales
- Paginación en market orders
- Materializar join pesados

### 7.5 Monitoreo
- Métricas de DB (slow queries, lock contention)
- Métricas de cola (wait time, queue depth)
- Health endpoint
- Dashboard de jugadores concurrentes

---

## Fase 8: Testing y Calidad (Semanas 12-13)

### 8.1 Tests unitarios (Jest)
Prioridad:
1. `pve-combat/` (damage, effects, intents)
2. `bags/` (weight, slots, stack limits)
3. `map/` (movement, exploration)
4. `i18n/` (translations complete)
5. `player-action-queue/` (concurrency)

### 8.2 Tests de integración
- Flujos críticos del smoke checklist automatizados
- Test DB con SQLite en memoria

### 8.3 Smoke checklist automatizada
Convertir `docs/SMOKE_CHECKLIST.md` en script ejecutable:
```bash
npm run smoke  # Ejecuta checks críticos
```

### 8.4 Cobertura mínima
- Lines: 40% (mínimo)
- Branches: 30%
- Funciones core (combate, inventario): 70%

---

## Cronograma Resumido

| Fase | Duración | Semanas | Depende de |
|------|----------|---------|------------|
| 0 - Foundation | 1 sem | 1 | - |
| 1 - Split Data | 1 sem | 2 | Fase 0 |
| 2 - Split Services | 3 sem | 3-5 | Fase 0 |
| 3 - Split Bot Modules | 2 sem | 6-7 | Fase 2 |
| 4 - Split Lib | 1 sem | 8 | Fase 0 |
| 5 - app-main Refactor | 1 sem | 8 | Fases 0-4 |
| 6 - PostgreSQL | 2 sem | 9-10 | Fase 5 |
| 7 - Performance | 2 sem | 11-12 | Fase 6 |
| 8 - Testing | 2 sem | 12-13 | Fases 0-5 |

**Total estimado: 13 semanas (3 meses)**

---

## Reglas de Oro

1. **Un archivo = una responsabilidad** → máximo 500 líneas
2. **4 capas por dominio**: reglas puras / persistencia / render / orquestación
3. **No mezclar refactor con features nuevos** cada fase es solo reordenamiento
4. **Un commit por cambio atómico** mensaje descriptivo con prefijo:
   - `phase-N:` para cambios de refactor
   - `fix:` para bugs
   - `perf:` para optimizaciones
5. **Smoke checklist antes de mergear a develop**
6. **Backup branch antes de cada fase grande** (`git tag phase-N-start`)
7. **TypeScript strict mode** sin `any` (excepto JSON.parse)
8. **Tests obligatorios** en funciones de cálculo (daño, peso, stack)

---

## Cómo Ejecutar Cada Fase

```bash
# 1. Crear rama para la fase
git checkout -b phase-2 develop
git push origin phase-2

# 2. Hacer cambios
# ... refactorizar archivos ...

# 3. Verificar
npm run lint
npm run build
npm test

# 4. Commit atómico
git add -A
git commit -m "phase-2: split pve-combat into submodules"

# 5. Smoke check manual
# Seguir docs/SMOKE_CHECKLIST.md

# 6. Merge a develop
git checkout develop
git merge phase-2
git push origin develop

# 7. Tag checkpoint
git tag phase-2-complete
git push origin phase-2-complete
```

---

## Verificación de Éxito

- [ ] Todos los archivos <500 líneas
- [ ] TypeScript strict mode sin errores
- [ ] `npm run lint` pasa limpio
- [ ] `npm run build` produce dist/ sin errores
- [ ] Smoke checklist completa (PASS)
- [ ] GitHub Actions CI verde
- [ ] Cobertura de tests ≥40%
- [ ] PostgreSQL listo para migración
- [ ] Redis integrado para caché y sesiones
- [ ] Documentación actualizada
