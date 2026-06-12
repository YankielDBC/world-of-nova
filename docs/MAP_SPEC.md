# World of Nova - Map System Spec
**Fecha:** 2026-03-22
**Status:** Listo para implementar

---

## 🗺️ MAPA PRINCIPAL

Grid 10x10 tiles centrados en player.

```
🗺 You are in 📍(0, 5) — 🏊 (modo dinámico)
🌊 River
─────────────────────────
⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
⬜⬜⬜⬜⬜⬜🌵⬜⬜⬜⬜
⬜⬜⬜⬜⬜📍⛺️⬜⬜⬜⬜
⬜⬜⬜⬜⬜⬜⛄️⬜⬜⬜⬜
⬜⬜⬜⬜⬜⬜⛰⬜⬜⬜⬜
⬜⬜⬜⬜⬜⬜🌾⬜⬜⬜⬜
⬜⬜⬜⬜⬜⬜🌾⬜⬜⬜⬜
⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
─────────────────────────
🧺 May Find: 💧 🎣
```

**Botones:**
```
[Bag 🎒]   [⬆️ Up]   [Profile]
[⬅️ left]  [Gather]  [➡️ right]
  [soon]   [⬇️ down]  [venture]
```

- **Gather** → Si tile tiene Place, dice "Inspect" y muestra buildings
- **soon** → Botón cosmético, sin función aún
- **venture** → Viajar a coords ya exploradas (pendiente implementación)

---

## 🚶 MOVIMIENTO

**Tile normal:**
```
🏊 Traveling west…

📍 From (-3, 3) → (-4, 3)
⛄️ Snowfield — (-4, 3)

🕒 Arrival in: 0 min 6 sec
```

**Al llegar:**
```
🏁 Arrived at 📍Snowfield (0, 4)
```

---

## 🏁 LLEGADA A PLACE

```
🏁 Arrived at 📍Capital (0, 0)
🗽 You are in Novaria 🏰

🔍 Population: 🧍‍♂️2 💤 0

Buildings:
• The Gilded Rest
• Mercy's Edge
• Blacksmith
[Prueba /inspect para curiosear…]
```

---

## 📍 MODOS DE MOVIMIENTO

| Modo | Emoji | Condición |
|------|-------|-----------|
| Swimming | 🏊 | Tile es agua |
| Climbing | 🧗 | Tile es montaña |
| Walking | 🚶 | Terreno normal |
| Running | 🏃 | Con boost |
| Riding | 🐎 | Con montura |
| Flying | 🦅 | Con mount volador |

---

## 💤 AFK SYSTEM

- Sin acción por 10 min → 💤 1 en DB
- "Welcome back, {nickname}!" al volver

---

## 🧳 VENTURE (pendiente)

- Viajar a coords ya exploradas
- Calcula tiempo según distancia y factores de terreno
- Muestra tiempo total antes de confirmar

---

## 🔍 GATHER vs INSPECT

- **Gather** → Biomas (recursos)
- **Inspect** → Places (buildings)

---

**Spec listo. ¿Procedemos con implementación?**
