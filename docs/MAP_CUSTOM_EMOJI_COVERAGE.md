# Map Custom Emoji Coverage

This file tracks which map-facing tokens already have a Telegram `custom_emoji_id`
registered in [`src/data/custom-emojis.ts`](C:/Users/marti/Downloads/WorldOfNova-no-deps/src/data/custom-emojis.ts).

## Covered Right Now

### Core map biomes
- `🌲` Forest
- `🌾` Plains
- `🌋` Volcano

### Forest visual rotation
- `🌲` Pine
- `🌳` Fruit Tree
- `🌴` Coconut / Palm Tree
- `🪾` Dead Tree

### Map footer / loot preview
- `💰` Loot
- `🪵` Wood
- `🌰` Pine Cone
- `🎋` Bamboo
- `💧` Water
- `🌽` Trigo

## Still Pending Custom IDs

These tokens currently render as standard Unicode on the map because there is no
registered custom ID for them yet.

### Biomes
- `🪷` Swamp
- `🌊` River
- `🏞️` Lake
- `🏔️` Highlands
- `🌫️` Ashlands / ash-like weather icon use
- `🏜️` Desert
- `❄️` Tundra

### Common map/POI visuals still using base Unicode
- `📍` Player pin
- `🕳️` Cave
- `🏚️` Ruins
- `🏘️` Village / town cluster
- `🏰` Castle

## Important Notes

- `/map` now prioritizes Telegram `entities` when the map fits inside the entity cap.
  This matches the stable behavior already used by other UIs like bag/profile.
- Dense maps can still fall back to HTML `<tg-emoji>` delivery when needed.
- If a token appears without custom styling and it is listed in **Still Pending Custom IDs**,
  that is expected until its `custom_emoji_id` is added to the central index.
- If a token appears without custom styling and it is listed in **Covered Right Now**,
  that indicates a real delivery/render regression and should be debugged.
