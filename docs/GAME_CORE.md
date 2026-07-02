# GAME_CORE.md — Núcleo de reglas de World of Nova

> Documento agnóstico a plataforma. Contiene las reglas, fórmulas y tablas necesarias para replicar el sistema de atributos, combate y progresión del jugador en cualquier motor o tecnología.

---

## 1. Atributos primarios

Todo jugador tiene seis atributos primarios. Cada uno comienza en **5** (`BASE_PRIMARY`) y recibe un bono según la clase elegida.

| Código | Nombre | Rol en combate |
|--------|--------|----------------|
| `STR` | Fuerza | Ataque físico, daño, defensa. |
| `DEX` | Destreza | Crítico, evasión, ataque secundario, velocidad de ataque. |
| `INT` | Inteligencia | Poder arcano, resistencias mágicas/elementales. |
| `VIT` | Vitalidad | HP máximo, defensa, resistencia física. |
| `AGI` | Agilidad | Velocidad de movimiento, energía máxima, evasión, velocidad de ataque. |
| `ENG` | Ingeniería | Energía máxima, poder arcano, costes de viaje. |

### Atributos base nivel 1 por clase

`atributo_nivel_1 = 5 + CLASS_BONUS_TABLE[classKey][atributo]`

| Clase | STR | DEX | INT | VIT | AGI | ENG |
|-------|-----|-----|-----|-----|-----|-----|
| `curse_hunter` | 13 | 11 | 9 | 11 | 10 | 8 |
| `alchemist_rogue` | 9 | 14 | 11 | 8 | 14 | 13 |
| `dark_druid` | 12 | 8 | 10 | 14 | 9 | 10 |
| `arcane` | 6 | 10 | 16 | 8 | 11 | 14 |

### Crecimiento por nivel

Cada nivel por encima de 1 otorga **1 punto** que se asigna rotando por la lista `GROWTH_PRIORITY[classKey]`.

```
puntos_extra = max(0, floor(nivel) - 1)
```

| Clase | Prioridad de crecimiento |
|-------|--------------------------|
| `curse_hunter` | STR, VIT, DEX, AGI, ENG, INT |
| `alchemist_rogue` | DEX, AGI, ENG, INT, DEX, AGI, VIT, STR |
| `dark_druid` | VIT, STR, ENG, INT, AGI, VIT, DEX |
| `arcane` | INT, ENG, AGI, DEX, INT, ENG, VIT, STR |

Ejemplo: un `curse_hunter` nivel 4 tiene 3 puntos extra → +1 STR, +1 VIT, +1 DEX.

---

## 2. Fórmulas de combate

Todas las fórmulas se aplican sobre los atributos primarios resueltos y el nivel del jugador. Los modificadores de equipo se aplican como `Flat` (suma directa) o `Pct` (multiplicador `1 + valor`, clamp ±20%).

### HP máximo

```
HPmax = floor((40 + VIT*8 + nivel*10 + maxHpFlat) * (1 + maxHpModifier))
HPmax = max(1, HPmax)
```

### Energía (STA) máxima

```
STAmax = floor((30 + AGI*5 + ENG*4 + nivel*5 + maxEnergyFlat) * (1 + maxEnergyModifier))
STAmax = max(1, STAmax)
```

### Ataque físico

```
ataque_base = STR*1.2 + DEX*0.8 + nivel
ataque = round1(ataque_base * (1 + attackModifier) + attackFlat)
```

### Poder arcano

```
arcano_base = INT*1.5 + ENG*0.5 + nivel
arcano = round1(arcano_base * (1 + arcaneModifier) + arcaneFlat)
```

### Daño base (B. Damage)

```
B_Damage = round1(min(ataque * 0.3, 10) + baseDamageFlat)
```

### Velocidad de ataque

```
atkSpeed_base = 150 + AGI*30 + DEX*15
atkSpeed = max(1, round(atkSpeed_base * (1 + atkSpeedModifier) + atkSpeedFlat))
```

### Velocidad de movimiento

```
movSpeed_base = 0.05 + AGI*0.0025
movSpeed = round3(clamp(movSpeed_base * (1 + moveModifier) + moveSpeedFlat, 0, 0.1))
```

### Crítico (%)

```
critico = round1(clamp(DEX*1.2 + AGI*0.3 + 2.5 + critChanceFlat, 0, 35))
```

### Evasión (%)

```
evasion = round1(clamp(AGI*1.0 + DEX*0.5 + 1 + evasionFlat, 0, 30))
```

### Defensa

```
defensa_base = VIT*0.8 + STR*0.3 + nivel*0.5
defensa = round1(defensa_base * (1 + defenseModifier) + defenseFlat)
```

### Almas máximas

```
maxSoul = max(1, floor(maxSoul_base + maxSoulFlat))
```

(`maxSoul_base` por defecto es 5.)

---

## 3. Resistencias

| Tipo | Fórmula base | Bono racial |
|------|--------------|-------------|
| Física | `floor(VIT * 0.2) + persistida + equipo` | — |
| Elemental | `floor(INT * 0.15) + persistida + equipo` | — |
| Arcana | `floor(INT * 0.25) + persistida + equipo` | Uren +1 |
| Sagrada | `persistida + equipo` | — |
| Química | `persistida + equipo` | Zolk +2 |

---

## 4. Progresión: niveles y XP

- Nivel máximo actual: **49** (`MAX_LEVEL`).
- Nivel máximo futuro/expandido: **300** (`MAX_LEVEL_EXPANDED`).

### XP necesaria para subir de nivel

```
XP(nivel -> nivel+1) = floor(nivel^2 * 50 + nivel * 50)
```

Ejemplos:

| De nivel | A nivel | XP necesaria |
|----------|---------|--------------|
| 1 | 2 | 100 |
| 10 | 11 | 5.500 |
| 20 | 21 | 21.000 |
| 40 | 41 | 82.000 |

### XP total acumulada para alcanzar un nivel

```
XPtotal(nivel) = 50 * (n * (n+1) * (n+2) / 6 + n * (n+1) / 2)
```
donde `n = nivel - 1`.

Nivel 49 requiere aproximadamente **~400.000 XP** acumulados.

### Títulos por nivel

| Nivel | Título | Emoji | Nivel | Título | Emoji |
|-------|--------|-------|-------|--------|-------|
| 1 | Novato | 🌱 | 26 | Lobo | 🐺 |
| 2 | Aprendiz | 🌿 | 27 | León | 🦁 |
| 3 | Explorador | 🌳 | 28 | Dragón | 🐉 |
| 4 | Cazador | 🍃 | 29 | Fénix | 🦅 |
| 5 | Tirador | 🎯 | 30 | Diamante | 💎 |
| 6 | Espadachín | 🗡️ | 31 | Esmeralda | 💠 |
| 7 | Guerrero | 🛡️ | 32 | Zafiro | 🔷 |
| 8 | Combatiente | ⚔️ | 33 | Rubí | 🔴 |
| 9 | Soldado | 💪 | 34 | Topacio | 🟡 |
| 10 | Héroe | 🏆 | 35 | Amatista | 🟣 |
| 11 | Estrella | ⭐ | 36 | Obsidiana | ⚫ |
| 12 | Leyenda | 🌟 | 37 | Perla | ⚪ |
| 13 | Guerrero de Fuego | 🔥 | 38 | Luna | 🌙 |
| 14 | Guerrero de Hielo | ❄️ | 39 | Sol | ☀️ |
| 15 | Rayo | ⚡ | 40 | Galaxia | 🌌 |
| 16 | Tormenta | 🌩️ | 41 | Universo | 🪐 |
| 17 | Viento | 🌪️ | 42 | Mago | 🎭 |
| 18 | Oleaje | 🌊 | 43 | Hechicero | 🔮 |
| 19 | Montañés | 🏔️ | 44 | Archimago | 📚 |
| 20 | Caballero | 👑 | 45 | Gran mago | 🏰 |
| 21 | Paladín | 🛡️ | 46 | Elemental | ✨ |
| 22 | Templario | ⚜️ | 47 | Arcoíris | 🌈 |
| 23 | Centurión | 🔱 | 48 | Estrella Fugaz | 💫 |
| 24 | Legado | 🎖️ | 49 | Legendario | 🏅 |
| 25 | Águila | 🦅 | | | |

---

## 5. Modificadores de equipo

### Stats de combate que puede otorgar un objeto

- `maxHpFlat`, `maxHpPct`
- `maxEnergyFlat`, `maxEnergyPct`
- `maxSoulFlat`
- `attackFlat`, `attackPct`
- `arcaneFlat`, `arcanePct`
- `baseDamageFlat`
- `defenseFlat`, `defensePct`
- `critChanceFlat`
- `evasionFlat`
- `atkSpeedFlat`, `atkSpeedPct`
- `moveSpeedFlat`, `moveSpeedPct`
- `resistPhysicalFlat`, `resistElementalFlat`, `resistArcaneFlat`, `resistHolyFlat`, `resistChemicalFlat`

### Stats de utilidad que puede otorgar un objeto

- `chopYieldPct`, `mineYieldPct`, `gatherYieldPct`, `fishYieldPct`
- `travelStaCostPct`
- `passiveStaRegenFlat`
- `merchantPriceFavorPct`
- `bankFeeReductionPct`
- `dropRateMinorPct`

### Límite de modificadores porcentuales

Todos los modificadores `Pct` se clampan al rango **[-0.2, 0.2]** (±20%).

---

## 6. Referencia de implementación

| Archivo | Función/constante clave |
|---------|-------------------------|
| `src/lib/rpg-attributes.ts` | `BASE_PRIMARY`, `CLASS_BONUS_TABLE`, `GROWTH_PRIORITY`, `getClassAttributesAtLevel()` |
| `src/lib/db.ts` | `calculateCombatStats()`, `resolvePrimaryAttributes()`, `getRaceArcaneBonus()`, `getRaceChemicalBonus()` |
| `src/types/player.ts` | `MAX_LEVEL`, `getXpForLevel()`, `getTotalXpForLevel()`, `LEVEL_TITLES` |
| `src/lib/player-ui.ts` | `buildProfileCard()` |
| `src/data/equipment.ts` | `EQUIPMENT_COMBAT_STAT_KEYS`, `EQUIPMENT_UTILITY_STAT_KEYS` |

---

## Notas para reimplementación

1. **Atributos**: comienzan en 5 + bono de clase; crecen +1 por nivel rotando por `GROWTH_PRIORITY`.
2. **Stats derivados**: aplicar fórmulas en el orden presentado; primero stats base, luego flat, luego porcentaje.
3. **Clamps**: crítico 0-35, evasión 0-30, movimiento 0-0.1, modificadores pct ±20%.
4. **Curva de XP**: usar `50*nivel^2 + 50*nivel` como fuente de verdad. La función alternativa `getRequiredXpForLevel()` en `player-ui.ts` es un residuo de UI y no debe usarse para la lógica de nivelación.
5. **Redondeo**: `round1` = 1 decimal, `round3` = 3 decimales, `floor`/`clamp` según corresponda.
