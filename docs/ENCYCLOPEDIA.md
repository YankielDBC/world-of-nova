# World of Nova - Encyclopedia (v1)

## Purpose
Compact reference index for names, codes and catalogs used in the game UI.
For full details see `docs/GAME_BIBLE.md`.

## Races
- `uren` 🌑 — Dark forest heretics.
- `zolk` 🧪 — Alchemist outcasts.

## Classes
### Uren
- `dark_druid` 🌿 — Tank/sustain, nature-magic.
- `arcane` 🔮 — Arcane glass cannon.

### Zolk
- `alchemist_rogue` 🗡️ — Poison, speed, evasion.
- `curse_hunter` 🏹 — Balanced precision fighter.

## Attributes
- `str` — Physical attack.
- `dex` — Crit, evasion, atk speed.
- `int` — Arcane power, arcane resist.
- `vit` — HP, defense, physical resist.
- `agi` — STA, movement speed, evasion.
- `eng` — STA, arcane power, atk speed.

## Combat Stats
- `hp` / `maxHp`
- `energy` / `maxEnergy`
- `attack` (ATK)
- `arcanePower` (ARC)
- `B_Damage` (B.DMG)
- `defense` (DEF)
- `critChance` (CRIT)
- `evasion` (EVA)
- `atkSpeed` (SPD)
- `moveSpeed` (MOV)
- Resistances: `physical`, `elemental`, `arcane`, `holy`, `chemical`.

## Biomes
- `plains` 🌾
- `forest` 🌲
- `swamp` 🪷
- `volcano` 🌋
- `ashlands` 🌫️
- `highlands` 🏔️
- `desert` 🏜️
- `tundra` ❄️
- `river` 🌊
- `lake` 🏞️

## Skills / Actions
- `gather` — collect plants/materials.
- `chop` — woodcutting.
- `mine` — mining rock/ore.
- `fish` — fishing.

## Tool Catalog
| Key | Name | Type | Targets |
|-----|------|------|---------|
| `canapez` | Caña de Bambú | fishing | river, beach |
| `hachaPiedra` | Hacha de Piedra | woodcutting | forest |
| `picoPiedra` | Pico de Piedra | mining | volcano, mountain, cave |
| `basket` | Tijera de Piedra | gathering | forest, plains, swamp |
| `varaMadera` | Vara de Madera | harvesting | forest, plains |

## Place Archetypes
- `FIXED`: permanent map place linked to coordinates.
- `town`: safe hub (e.g. Nova Castle).
- `service`: rest, heal, repair, training.
- `shop`: item/tool vendor.

## Rarity Codes (UI)
- `C`: common
- `U`: uncommon
- `R`: rare
- `E`: epic
- `L`: legendary
- `M`: mythic

## Equipment Slots
`head`, `chest`, `legs`, `boots`, `gloves`, `belt`, `cloak`, `ring_1`, `ring_2`, `amulet`, `main_hand`, `off_hand`, `two_hand`, `fishing_tool`.

## Bind Types
- `none`
- `bind_on_equip`
- `bind_on_pickup`
- `soulbound`
- `quest_bound`

## Ground Loot
- `resource`: dropped stackable resources.
- `tool`: dropped tool instances.
- `bag`: dropped bag items.
- `equipment`: dropped gear instances.

## Day Periods
- `dawn` 🌅
- `day` ☀️
- `dusk` 🌇
- `night` 🌙

## Zone Bands
- `core` — levels 1–3
- `inner` — levels 4–8
- `middle` — levels 9–14
- `outer` — levels 15–22
- `frontier` — levels 23+

## Notes for Future Expansion
- Add recipe catalog.
- Add full creature loot tables.
- Add PvE encounter abilities per species.
- Add quest catalog when system is built.
