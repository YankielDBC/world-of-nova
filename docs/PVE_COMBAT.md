# PVE_COMBAT.md — Combate contra criaturas

> Reglas detalladas del combate PvE por turnos. Agnóstico a plataforma.

---

## 1. Inicio del encuentro

Condiciones para iniciar:
- Criatura viva (`status === 'ALIVE'`).
- Jugador y criatura en mismo tile.
- Jugador sin otro combate activo.
- Criatura no está siendo atacada por otro jugador.
- Jugador con `HP > 0`.

Estado inicial:
```
turnNumber = 1
creatureCurrentHp = creature.currentHp
playerEffects = []
enemyEffects = []
cooldowns = {}
enemyIntent = createInitialIntent(creature, 1)
```

---

## 2. Turno del jugador

El jugador elige una de estas acciones:

| Acción | Coste STA | Descripción |
|--------|-----------|-------------|
| `attack` | 5 | Ataque básico físico/arcano. |
| `guard` | 3 | +16% def, +1 evasión, -34% daño recibido (1 turno). |
| `flee` | 4 | Intenta huir del combate. |
| `build_skill` | variable | Activa una habilidad de build equipada. |
| `racial_skill` | variable | Activa un talento racial equipado. |

### Multiplicadores de daño por acción

| Acción | físico | arcano | Otros |
|--------|--------|--------|-------|
| Ataque básico | 0.92 | 0.18 | — |
| Build skill (default) | 1.04 | 0.32 | +2% crit |
| Build skill (arcane) | 0.34 | 1.02 | +3% crit |
| Build skill (mobility) | 0.76 | 0.18 | +4% crit, +8% accuracy |
| Build skill (defensa/utilidad) | 0.58 | 0.22 | 0% crit |
| Racial skill | variable | variable | según raza |
| Enemigo strike | 0.92 | 0.22 | — |
| Enemigo heavy | 1.18 | 0.22 | +5% crit |
| Enemigo arcane | 0.55 | 0.95 | +3% crit |
| Enemigo guarded | 0.74 | 0.22 | +18% def enemiga |
| Enemigo rush | 0.92 | 0.22 | +3% crit, +5% accuracy |

---

## 3. Fórmula de daño paso a paso

```
1. critRoll = random(0..100) <= clamp(attacker.critChance + critBonusPct, 0, 100)
2. effectiveEvasion = max(0, target.evasion - accuracyBonusPct)
3. evaded = random(0..100) <= effectiveEvasion
4. blockedCrit = forceCritBlock AND crit AND NOT evaded

Si evaded == true:
   damage = 0

Si no:
5. damage = attacker.baseDamage
        + attacker.attack * physicalMultiplier
        + attacker.arcanePower * arcaneMultiplier

6. Si crit == true y blockedCrit == false:
      damage *= 1.55
   Si blockedCrit == true:
      damage *= 1.08

7. damage -= target.defense * 0.58
8. damage -= resistFlat
9. damage *= 1 - damageReductionPct
10. damage *= 1 + damageBonusPct
11. damage = max(1, round(damage))
```

### Resistencias planas

**Jugador ataca enemigo:**
```
resistFlat = max(0, floor(enemy.defense * 0.05))
```

**Enemigo ataca jugador:**
```
resistFlat = floor(player.resistPhysical * 0.45)
           + floor(player.resistArcane * (arcaneMultiplier > 0.3 ? 0.2 : 0.06))
```

### Orden de aplicación

1. Crítico.
2. Evasión efectiva.
3. Roll de evasión.
4. Bloqueo de crítico.
5. Defensa plana.
6. Resistencia plana.
7. Reducción porcentual.
8. Bonus porcentual.
9. Redondeo y mínimo 1.

---

## 4. Sistema de presión

Aumenta el daño de ambos lados a partir del turno 3.

```
si turno <= 3: presion = 0
presion = clamp((turno - 3) * 0.04, 0, 0.32)
```

| Turno | Presión |
|-------|---------|
| 1–3 | 0% |
| 4 | 4% |
| 5 | 8% |
| 6 | 12% |
| 7 | 16% |
| 8 | 20% |
| 9 | 24% |
| 10 | 28% |
| 11+ | 32% |

La presión se aplica como `damageBonusPct`.

---

## 5. Evasión y crítico

- `critChance` del atacante + `critBonusPct` de la acción.
- `evasion` del defensor - `accuracyBonusPct` del atacante (mínimo 0).
- Ambos se evalúan como porcentajes (roll 0-100).
- Si evade, daño = 0 y se pueden disparar reacciones `on_crit_evaded`.

---

## 6. Habilidades activas

### Build skills

- Slots: `activeSlot1`, `activeSlot2`, `activeSlot3`.
- Coste STA:
  ```
  clamp(8 + ceil(durationSeconds / 6) + ceil(cooldownSeconds / 20), 8, 18)
  ```
- Duración y cooldown en turnos: `max(1, ceil(seconds / 8))`.
- Aplican `playerEffect` con modificadores escalados por rango.

### Racial skills

- Slots: `activeSlot1`, `activeSlot2`.
- Ejemplos:
  - **Zolk Nube Tóxica**: 2 turnos, CD 4, 12 STA, `attackPct +2%`, `arcanePct +1%`, efecto enemigo `defensePct -4%`.
  - **Zolk Mutación de Escape**: 2 turnos, CD 4, 10 STA, `moveSpeedPct +2%`, `evasionFlat +4`, `damageReductionPct 12%`.
  - **Uren Enredadera**: 2 turnos, CD 4, 12 STA, `defensePct +1%`, efecto enemigo `defensePct -6%`, `evasionFlat -2`.
  - **Uren Brote Arcano**: 2 turnos, CD 4, 12 STA, `attackPct +1%`, `arcanePct +2%`.

---

## 7. Reacciones

Habilidades tipo `reaction` equipadas se activan ante eventos:

- `on_hit_taken`
- `on_crit_taken`
- `on_crit_blocked`
- `on_crit_evaded`

Requisitos:
- Estar equipada.
- Cumplir condición de HP/STA si la tiene.
- No estar en cooldown.

Efectos:
- Aplican buffs al jugador.
- Pueden tener `counterAttackRatio` para contraatacar.
- Contraataque limitado a `counterAttackRatio <= 1.0`.

Daño de contraataque:
```
fisico = max(0.28, counterAttackRatio)
arcano = max(0.08, counterAttackRatio * 0.22)
critBonusPct = 1
accuracyBonusPct = 6
```

---

## 8. Intención del enemigo

Cada turno la criatura genera una intención:

| Tipo | Características |
|------|-----------------|
| `strike` | Ataque estándar. físico 0.92, arcano 0.22. |
| `heavy` | Golpe fuerte. físico 1.18, arcano 0.22, +5% crit. |
| `arcane` | Ataque mágico. físico 0.55, arcano 0.95, +3% crit. |
| `guarded` | Ataque cauteloso. físico 0.74, arcano 0.22, +18% def. |
| `rush` | Ataque veloz. físico 0.92, arcano 0.22, +3% crit, +5% accuracy. |

La intención se muestra al jugador al inicio del turno.

---

## 9. Huida

- Acción `flee` consume 4 STA.
- Probabilidad base calculada con velocidad, evasión y categoría de la criatura.
- Si tiene éxito: encuentro termina, se conservan HP/STA actuales.
- Si falla: el enemigo ataca normalmente.

---

## 10. Fin del encuentro

### Victoria

- `creatureCurrentHp <= 0`.
- Se llama a `resolveCreatureDefeat`:
  - XP según `creature.xpReward`.
  - Plata según `coinDropChance` y rango `silverMin..silverMax`.
  - Loot según drops de la criatura.
  - Rechaza lo que no quepa en la bolsa.
- Se borra el encuentro.

### Derrota

- `playerHp <= 0`.
- Se llama a `killPlayerAndCreateCorpse`.
- Jugador entra en modo fantasma.

### Huida

- Roll de huida exitoso.
- Se actualizan HP/STA y se borra el encuentro.

---

## 11. Recompensas de criatura

### XP
```
xpAwarded = max(0, creature.xpReward)
```

### Plata
```
si random(0..100) <= creature.coinDropChance:
   silver = randomInt(creature.silverMin, creature.silverMax)
```

### Loot
```
para cada drop:
  si random(0..100) <= drop.chancePct:
    cantidad = randomInt(drop.minQty, drop.maxQty)
```

Los drops se agrupan por recurso y se añaden a la bolsa activa.

---

## 12. Subida de nivel tras combate

```
classPointsGained   = getClassSkillPointsForLevel(nuevo) - getClassSkillPointsForLevel(anterior)
generalPointsGained = getGeneralSkillPointsForLevel(nuevo) - getGeneralSkillPointsForLevel(anterior)
racialPointsGained  = getRacialPointsForLevel(nuevo) - getRacialPointsForLevel(anterior)
```

Se invalidan caches de efectos de build y racial.

---

## 13. Referencia de implementación

| Archivo | Función clave |
|---------|---------------|
| `src/services/pve-combat.ts` | `startPveEncounter`, `computeEncounterViewFromState`, `clearActivePveEncounter` |
| `src/services/pve-combat-actions.ts` | `resolvePveAction` |
| `src/services/pve-combat-engine.ts` | `buildAttackDamage`, `getPvePressurePct`, `triggerLocalReactions` |
| `src/services/pve-combat-state.ts` | Persistencia de encuentros |
| `src/services/pve-combat-content.ts` | `createInitialIntent`, `getBuildSkillSpec`, `getRacialSkillSpec` |
| `src/services/pve-combat-utils.ts` | Conversión de segundos a turnos, agregación de efectos |
| `src/services/creature-defeat.ts` | `resolveCreatureDefeat`, `applyXpGain` |
| `src/services/death-system-actions.ts` | `killPlayerAndCreateCorpse` |

---

## Notas para reimplementación

1. **Turnos**: cada acción del jugador + contraataque/enemigo = un turno.
2. **Efectos**: reducir duración al final del turno; eliminar cuando lleguen a 0.
3. **Cooldowns**: reducir al final del turno.
4. **Presión**: aplicar como bonus de daño a ambos lados.
5. **Evasión**: si evade, todo el daño se anula; no aplicar defensa ni resistencias.
6. **Crítico bloqueado**: guardia contra heavy reduce multiplicador de 1.55 a 1.08.
7. **Persistencia**: guardar estado del encuentro tras cada turno para soportar reconexiones.
8. **Contraataques**: limitar ratio total a 1.0 para evitar bucles infinitos.
