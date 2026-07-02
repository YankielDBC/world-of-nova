# World of Nova - Estado de DB
Creado: 2026-03-21 | Actualizado: 2026-06-17

## ✅ Tablas Creadas (Seed Ejecutado)

### 1. Biomas (10) - ✅ Completo
| Biome | Emoji | Factor Movimiento | Color |
|-------|-------|-------------------|-------|
| Plains | 🌾 | 1.0x | #90EE90 |
| Forest | 🌲 | 1.2x | #228B22 |
| Swamp | 🪷 | 1.5x | #556B2F |
| Volcano | 🌋 | 1.3x | #8B0000 |
| Ashlands | 🌫️ | 1.1x | #696969 |
| Highlands | 🏔️ | 1.4x | #A0522D |
| Desert | 🏜️ | 1.3x | #F4A460 |
| Tundra | ❄️ | 1.2x | #E0FFFF |
| River | 🌊 | 0.5x | #4169E1 |
| Lake | 🏞️ | 0.3x | #1E90FF |

### 2. Resources (33) - ✅ Completo
- Materiales: Wood, Pine Cone, Bamboo, Ancient Wood, Baba Verde, Hierbas, Insectos, Barro, Hueso, Ámbar, Ojo Ancestral, Seda, Trigo, Semillas, Hierba, Flores, Girasol, Hierbas Secas, Hojas de Viento, Roca Volcánica, Cenizas, Carbón.
- Consumibles: Apple, Orange, Mango, Coconut, Water, Champiñón, Champiñón Mágico, FlorDragón, Agua, Pez Amarillo, Pez Azul.

### 3. BiomeResource - ✅ Completo
- Relaciones por bioma con spawnChance, min/maxQuantity.
- Ver `prisma/seed-world.ts` y `docs/GAME_BIBLE.md` sección 6.

### 4. WorldMap + MapTile - ✅ Estructura lista
- Mapa 100×100 para Nightfall.
- **Tiles generados bajo demanda** (no pregenerar 10000 tiles).

### 5. BagDefinitions (5) - ✅ Completo
- Pockets, Travel Bag, Leather Pack, Crown Vault, Village Chest.

### 6. EquipmentTemplates (13) - ✅ Completo
- Ver `prisma/seed-equipment.ts` y `docs/GAME_BIBLE.md` sección 9.

### 7. Places (1 town + 19 interactions) - ✅ Completo
- Nova Castle en (0,0) con servicios de descanso, curación, forja, banco, entrenamiento y mercado.

### 8. Modelos Prisma (47) - ✅ Completo
- Todos los modelos declarados en `prisma/schema.prisma`.
- Incluye tablas runtime migradas a Prisma (PlayerBuildSkill, PlayerBuildLoadout, PlayerCorpse, etc.).

---

## 📌 Sistema de Emojis Progresivo

**Regla:** Cada vez que agreguemos datos nuevos (items, monstruos, equipamiento, etc.) que usen emojis, debemos agregarlos también a `src/data/emojis.ts`.

## 📌 Generación de MapTiles

Los tiles del mapa se generan **bajo demanda** cuando el jugador explora, no pregenerados.

## Tech Stack
- Prisma 6.19.2 + SQLite
- Seeds ejecutados ✅