# Mystery Merchant System

## Overview

The `Comerciante Misterioso` is a roaming NPC that:

- Moves forever using a random walk.
- Can traverse unexplored map tiles.
- Never marks map exploration.
- Stays on each tile for a random duration.
- Publishes rumor/confirmation alerts to `@rpgalert` (or configured channel).

## Persistence

Prisma models:

- `MysteryMerchant`: singleton state (`id = 1`) with current position, previous position, stay window, active offers and buyback multiplier.
- `MysteryMerchantWitness`: unique player sightings per `stayToken`.

## Movement Rules

1. Wait until `departsAt`.
2. Pick one of 4 cardinal directions with equal probability.
3. Exclude immediate backtracking to the previous tile (`prevX`, `prevY`).
4. Generate a new stay token, offer list, and buyback multiplier.

Configurable via env:

- `MERCHANT_ENABLED`
- `MERCHANT_SWEEP_INTERVAL_MS`
- `MERCHANT_STAY_MIN_SECONDS`
- `MERCHANT_STAY_MAX_SECONDS`
- `MERCHANT_RUMOR_RADIUS`
- `MERCHANT_ETA_SECONDS_PER_TILE`
- `MERCHANT_ALERTS_CHANNEL`

## Channel Alerts

### Rumor alert

When the merchant appears near discovered territory (using `MapTile.firstDiscoveredById`), the system posts a hint message with:

- Nearby discovered coordinate.
- Approximate ETA by distance.
- No exact merchant coordinate.

### Confirmation alert

When a player who was negotiating leaves the merchant flow (map/other command), the system:

1. Marks rumor as confirmed for current stay.
2. Sends a confirmation message (`one or many players confirmed`).
3. Forces merchant disappearance (immediate move to a new tile).

## Player Interaction Flow

- Discover via `/inspect` button (`🕵️ Comerciante`) or `/merchant`.
- Main card shows rotating intro lore, current offers, and buyback multiplier.
- Buy menu: pick offer, optionally choose quantity, confirm.
- Sell menu: sell from active bag (non-equipped only), with quantity handling.
- Exit to map from merchant UI triggers confirmation+vanish behavior.

## Trade Behavior

- Merchant sells a rotating stock (`5-6` offers) from existing resources/tools.
- Merchant buyback is intentionally generous: `x2` to `x20` market baseline.
- Buy transactions reserve currency/stock first; if delivery fails, system refunds and restores stock.
