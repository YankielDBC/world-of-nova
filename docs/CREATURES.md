# CREATURES.md — Criaturas y combate PvE

> Sistema de criaturas: categorías, generación, combate, derrota y loot. Agnóstico a plataforma.

---

## 1. Categorías de criaturas

| Categoría | Emoji | Nivel bonus | HP | ATK | DEF | XP | Monedas (%) | Respawn (s) | Drop bonus |
|-----------|-------|-------------|----|-----|-----|----|-------------|-------------|------------|
| **basic** | 🐾 | -1 a +1 | ×1.0 | ×1.0 | ×1.0 | ×6 | 18–54 | 70–220 | 0 |
| **veteran** | ⚔️ | +1 a +3 | ×1.34 | ×1.20 | ×1.16 | ×10 | 40–76 | 150–420 | 8 |
| **elite** | 👹 | +3 a +6 | ×1.72 | ×1.42 | ×1.35 | ×16 | 65–92 | 360–1200 | 16 |
| **boss** | ☠️ | +6 a +10 | ×2.55 | ×1.86 | ×1.70 | ×28 | 100 | 1200–7200 | 28 |

### Probabilidad de categoría por zona

| Zona | Básico | Veterano | Élite | Jefe |
|------|--------|----------|-------|------|
| core | 82% | 15% | 3% | 0% |
| inner | 70% | 20% | 9% | 1% |
| middle | 56% | 25% | 15% | 4% |
| outer | 45% | 27% | 20% | 8% |
| frontier | 35% | 30% | 22% | 13% |

---

## 2. Generación de criaturas

### Atributos base de una criatura

Una criatura tiene los mismos 6 atributos primarios que un jugador, pero se derivan de su nivel y categoría. El cálculo exacto varía por especie y bioma.

```
nivel_real = nivel_base + bonus_categoria
atributos = funcion_genero_especie(nivel_real, bioma)
```

### Stats derivados

Aplican fórmulas similares a las del jugador (ver `GAME_CORE.md`), multiplicadas por los factores de categoría.

### Prefijos por categoría

| Categoría | Prefijos posibles |
|-----------|-------------------|
| basic | Errante, Feral, Salvaje, Huraño, Rasposo |
| veteran | Veterano, Acechante, Sombrio, Curtido, Rencoroso |
| elite | Alfa, Ancestral, Implacable, Sanguinario, Voraz |
| boss | Señor, Titán, Devorador, Archimonstruo, Condenador |

### Nombre final

- **Boss**: `{Prefijo} {Especie}` → ej. "Señor Lobo".
- **Resto**: `{Especie} {Prefijo}` → ej. "Lobo Errante".

### Presencia y manadas

- `BIOME_PRESENCE_CHANCE`: probabilidad de que aparezca al menos una criatura en el tile. Varía de 0.50 (desierto) a 0.72 (bosque).
- `BIOME_MAX_PACK_SIZE`: tamaño máximo de manada. 3 para bosque, pantano, llanuras, tierras altas; 2 para el resto.

---

## 3. Combate PvE

Ver también `PVE_COMBAT.md` para el flujo detallado por turnos.

### Fórmula de daño de ataque básico

```
damage = baseDamage + ataque * 0.8 + arcano * 0.28
```

Luego:
- Si crítico: multiplicador 1.55 (o 1.08 si es crítico "blunted").
- Restar `defensa_objetivo * 0.58`.
- Aplicar resistencias planas, reducción/aumento de daño.

### Presión de combate

A partir del turno 3, la presión aumenta:

```
presion(turno) = clamp((turno - 3) * 0.04, 0, 0.32)
```

Esto suele aumentar el daño del enemigo o la dificultad del encuentro.

### Evasión y crítico

- El atacante tira crítico según su `critChance`.
- El defensor tira evasión según su `evasion`.
- Si evade, el ataque falla (posiblemente desencadena reacciones del jugador).
- Si es crítico y no evade, aplica multiplicador de crítico.

### Efectos y cooldowns

- Habilidades activas y reacciones consumen STA y entran en cooldown.
- Los efectos tienen duración y se reducen cada turno.
- Algunos efectos condicionales se activan según HP/STA del jugador.

---

## 4. Derrota de criatura y loot

Al morir una criatura se resuelve:

1. **XP**: se otorga al jugador según categoría y nivel.
2. **Monedas**: probabilidad y cantidad según categoría.
3. **Loot**: drops de recursos del pool del bioma, con bonus según categoría.
4. **Respawn**: se programa el respawn según el rango de segundos de la categoría.

### Agrupación de drops

```
groupRolledDrops(drops)
```

Recursos del mismo tipo se apilan respetando `maxStack`.

---

## 5. Muerte del jugador

Ver `DEATH_AND_CAVES.md` para detalles completos.

Resumen:
- El jugador se convierte en fantasma en el cementerio más cercano.
- El cadáver queda en las coordenadas de muerte con plata e ítems.
- Solo el dueño puede reclamar el cadáver durante 10 minutos.
- El fantasma se mueve 1.5× más rápido pero solo puede moverse, ver perfil y recuperar cuerpo.

---

## 6. Referencia de implementación

| Archivo | Función/constante clave |
|---------|-------------------------|
| `src/services/creatures-config.ts` | `CATEGORY_CONFIG`, `CATEGORY_WEIGHTS_BY_ZONE`, `BIOME_SPECIES`, `BIOME_PRESENCE_CHANCE`, `BIOME_MAX_PACK_SIZE`, `CATEGORY_PREFIX` |
| `src/services/creatures.ts` | `computeAttributes()`, `computeDerivedStats()`, `buildCreatureName()`, `getCreatureSnapshotsAtCoords()` |
| `src/services/creature-defeat.ts` | `resolveCreatureDefeat()`, `applyXpGain()`, `groupRolledDrops()` |
| `src/services/pve-combat-engine.ts` | `buildAttackDamage()`, fórmulas de combate |
| `src/services/pve-combat.ts` | `startPveEncounter()`, flujo de encuentro |
| `src/services/pve-combat-actions.ts` | `resolvePveAction()`, acciones del jugador |
| `src/services/pve-combat-state.ts` | Persistencia de encuentros |

---

## Notas para reimplementación

1. **Generación determinista**: usar semilla basada en coordenadas + tiempo/categoría para que la misma criatura sea consistente.
2. **Categoría por zona**: respetar los pesos de zona; en `core` no deben aparecer jefes.
3. **Presencia**: no todos los tiles tienen criaturas; aplicar `BIOME_PRESENCE_CHANCE`.
4. **Manadas**: si hay presencia, generar de 1 a `maxPackSize` criaturas.
5. **Respawn**: usar timers/programación de trabajos para reactivar la criatura tras su tiempo de respawn.
6. **Loot**: el pool de drops proviene de los recursos vinculados al bioma del tile.
