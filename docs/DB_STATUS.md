# World of Nova - Estado de DB
Creado: 2026-03-21 | Actualizado: 2026-03-21

## ✅ Tablas Creadas (Seed Ejecutado)

### 0. EmojiIndex (PROGRESIVO)
- **14 emojis iniciales** (biomas + UI)
- ✅ Se llena progresivamente cada vez que se agregan datos nuevos con emojis
- Categorías: bioma, item, monstruo, ui

### 1. Biomas (7) - ✅ Completo
| Biome | Emoji | Factor Movimiento |
|-------|-------|------------------|
| Desierto | 🏜️ | 1.5x |
| Pradera | 🌾 | 1.0x |
| Bosque | 🌳 | 1.2x |
| Río | 🌊 | 1.3x |
| Pantano | 🪷 | 1.4x |
| Montaña | 🏔️ | 1.6x |
| Volcán | 🌋 | 2.0x |

### 2. Resources (14) - ✅ Completo
- Materiales: madera 🪵, piedra 🪨, hierro ⛓️, oro 🪙, cobre 🥉
- Hierbas: hierba_curativa 🌿, flor_de_loto 🪷, seta 🍄
- Comida: carne 🥩, fruta_salvaje 🍎, pescado 🐟
- Artesanía: cuero 📜, hilo 🧵, gema 💎

### 3. BiomeResource (26 relaciones) - ✅ Completo
- Recursos por bioma con spawnChance, min/maxQuantity

### 4. WorldMap + MapTile - ✅ Estructura lista
- Mapa 50x50 para Nightfall
- **Tiles generados bajo demanda** (no pregenerar 2500 tiles)

### 5. Recipe + RecipeInput - ✅ Estructura lista
- Sistema de crafting

---

## 📌 Sistema de Emojis Progresivo

**Regla:** Cada vez que agreguemos datos nuevos (items, monstruos, equipamiento, etc.) que usen emojis, debemos agregarlos también a `EmojiIndex`.

```typescript
// Ejemplo: agregar nuevo emoji
await prisma.emojiIndex.upsert({
  where: { emoji: '🗡️' },
  update: {},
  create: { emoji: '🗡️', name: 'espada', category: 'item', description: 'Arma cuerpo a cuerpo' }
})
```

## 📌 Generación de MapTiles

Los tiles del mapa se generan **bajo demanda** cuando el jugador explora, no pregenerados.

## Tech Stack
- Prisma 6.19.2 + SQLite
- Seed ejecutado ✅