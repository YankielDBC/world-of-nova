# Day/Night Cycle System

## Global Cycle

The game now uses one global deterministic cycle (no per-tile timers):

- Dawn: 20 min
- Day: 4h 40m
- Dusk: 20 min
- Night: 2h 40m

Default total: 8 hours per full loop.

Configured in `.env` via:

- `DAY_CYCLE_ENABLED`
- `DAY_CYCLE_ANCHOR_ISO`
- `DAY_CYCLE_DAWN_MINUTES`
- `DAY_CYCLE_DAY_MINUTES`
- `DAY_CYCLE_DUSK_MINUTES`
- `DAY_CYCLE_NIGHT_MINUTES`

## Architecture

- `src/services/day-cycle.ts`
  - Resolves the current global period from wall clock time.
  - Exposes UI formatters (`formatDayCycleLine`).
  - Exposes biome-aware ambient hints.
  - Exposes biome+period gameplay effects.
- `src/data/day-cycle.ts`
  - Central index for per-biome/per-period multipliers.
  - Central labels and period emojis.
  - Ambient hint dictionary by language and biome.

## Gameplay Integration

- `map.ts`
  - Map header section now shows climate line + current day/night line.
  - `May find` list now filters resources by current period.
- `inspect.ts`
  - Inspect now shows climate line + day/night line + ambient hint.
  - Node generation applies:
    - climate multipliers
    - day/night global multipliers
    - action-specific multipliers (gather/chop/mine/fish)
    - resource availability windows by biome and period
  - Energy usage per action now also includes day/night cost multipliers.
- `gathering.ts`
  - `/explore` loot table also respects day/night resource windows.

## Resource Windows

`src/data/day-cycle.ts` now centralizes availability rules:

- `all`: available all day.
- `daylight`: available at dawn + day.
- `crepuscular`: available at dawn + dusk.
- `night`: available only at night.
- `dawn` / `dusk`: available only in that specific period.

Rules are configurable globally and per biome (biome overrides global).

## Tile-State Compatibility

`resourcesJson` now tracks `generatedPeriodKey`.

- If period changes and a tile is in a safe refresh state (no pending cooldown and full availability), inspect nodes are regenerated for the new period.
- If nodes are currently harvested/cooling down, state is preserved to avoid exploits or abrupt resets.
