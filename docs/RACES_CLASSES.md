# RACES_CLASSES.md — Razas, clases, talentos y skills

> Reglas de creación de personaje, talentos raciales y árboles de habilidades. Agnóstico a plataforma.

---

## 1. Razas

| Raza | Emoji | Descripción |
|------|-------|-------------|
| **Uren** | 🌑 | Herejes del bosque oscuro. Druidas y arcanos que mezclan naturaleza corrupta con magia primordial. |
| **Zolk** | 🧪 | Parias alquímicos supervivientes. Dominan toxinas, sabotaje y cacería adaptativa. |

### Bonos raciales base

- **Uren**: +1 resistencia arcana.
- **Zolk**: +2 resistencia química.

---

## 2. Clases por raza

### Uren

| Clave | Clase | Emoji | Descripción | Bonus atributos base (sobre 5) |
|-------|-------|-------|-------------|--------------------------------|
| `dark_druid` | Dark Druid | 🌿 | Guardianes malditos del bosque. Resisten mucho, pero se mueven lento. | STR +7, DEX +3, INT +5, VIT +9, AGI +4, ENG +5 |
| `arcane` | Arcane | 🔮 | Canales de energía pura. Frágiles, pero con poder mágico devastador. | STR +1, DEX +5, INT +11, VIT +3, AGI +6, ENG +9 |

### Zolk

| Clave | Clase | Emoji | Descripción | Bonus atributos base (sobre 5) |
|-------|-------|-------|-------------|--------------------------------|
| `curse_hunter` | Curse Hunter | 🏹 | Cazadores de maldiciones. Balanceados, resistentes y precisos. | STR +8, DEX +6, INT +4, VIT +6, AGI +5, ENG +3 |
| `alchemist_rogue` | Alchemist Rogue | 🗡️ | Sombras tóxicas y técnicas. Atacan rápido con viales y corrosivos. | STR +4, DEX +9, INT +6, VIT +3, AGI +9, ENG +8 |

### Atributos finales nivel 1

Ver `GAME_CORE.md` para la tabla completa de atributos nivel 1 por clase.

---

## 3. Talentos raciales

### Reglas generales

- Tipo: `passive` / `active` / `keystone`.
- Categoría: `offense`, `defense`, `mobility`, `utility`, `active`, `keystone`.
- Pasivas aplican según rango aprendido.
- Activas solo aplican si están equipadas en un slot activo.
- Keystones solo aplican si están equipados en el slot de keystone (solo uno a la vez).

### Puntos de talento racial

```
puntos_raciales(nivel) =
  nivel 1-2 → 0
  nivel 3+  → floor((nivel - 1) / 2)
```

Ejemplos: nivel 3 → 1, nivel 5 → 2, nivel 7 → 3, nivel 10 → 4.

### Coste de reset racial

```
coste_reset_racial = 25 + puntos_gastados * 5  (plata)
```

### Slots de loadout racial

- 2 slots activos (`activeSlot1`, `activeSlot2`).
- 1 slot de keystone (`keystoneKey`).

---

## 4. Talentos raciales — Zolk

| Clave | Nombre | Tipo | Categoría | Max | Coste | Prerrequisito | Efecto |
|-------|--------|------|-----------|-----|-------|---------------|--------|
| `zolk_toxic_blood` | Sangre Tóxica | passive | offense | 3 | 1 | — | +0.5 crítico/rango; +1 resistencia química/rango |
| `zolk_lab_reflexes` | Reflejos de Laboratorio | passive | mobility | 3 | 1 | — | +0.8 evasión/rango; +1% velocidad movimiento/rango; +1% velocidad ataque/rango |
| `zolk_unstable_metabolism` | Metabolismo Inestable | passive | utility | 2 | 1 | — | +5 STA máxima/rango; +1 regeneración pasiva STA/rango |
| `zolk_alchemical_skin` | Piel Alquímica | passive | defense | 3 | 1 | — | +1% defensa/rango; +1 resistencia química/rango |
| `zolk_delicate_hand` | Mano Delicada | passive | utility | 3 | 1 | — | +4% yield en Gather/rango |
| `zolk_quick_escape` | Fuga Rápida | passive | mobility | 2 | 1 | — | -7% coste STA de viaje/rango |
| `zolk_toxic_cloud` | Nube Tóxica | active | active | 1 | 2 | — | Activa ofensiva. Equipada: +2% ataque, +1% arcano |
| `zolk_venom_glands` | Glándulas Venenosas | passive | offense | 1 | 1 | `zolk_toxic_cloud` | +1.1 crítico; +1% ataque |
| `zolk_mutation_dash` | Mutación de Escape | active | active | 1 | 2 | — | Activa de movilidad. Equipada: -9% tiempo viaje; +2% velocidad movimiento |
| `zolk_chemical_legs` | Piernas Químicas | passive | mobility | 1 | 1 | `zolk_mutation_dash` | Mejora Mutación de Escape: -5% tiempo viaje, -4% coste STA viaje |
| `zolk_toxic_shadow` | Sombra Tóxica | keystone | keystone | 1 | 2 | — | Keystone evasiva agresiva. Equipado: +2.2 evasión, +1.4 crítico |
| `zolk_reactor_blood` | Sangre de Reactor | keystone | keystone | 1 | 2 | — | Keystone daño arcano-crítico. Equipado: +4% arcano, +2% ataque |
| `zolk_chemical_survivor` | Superviviente Químico | keystone | keystone | 1 | 2 | — | Keystone aguante/resistencia. Equipado: +3% defensa, +2 resistencia química, +10 HP máx, +1 regen STA pasiva |

---

## 5. Talentos raciales — Uren

| Clave | Nombre | Tipo | Categoría | Max | Coste | Prerrequisito | Efecto |
|-------|--------|------|-----------|-----|-------|---------------|--------|
| `uren_deep_root` | Raíz Profunda | passive | defense | 3 | 1 | — | +1.1% defensa/rango; +1 resistencia física/rango |
| `uren_calm_sap` | Savia Serena | passive | defense | 3 | 1 | — | +7 HP máx/rango; +4 STA máx/rango |
| `uren_living_bark` | Corteza Viva | passive | defense | 3 | 1 | — | +1% defensa/rango; +1 resistencia física/rango |
| `uren_natural_pulse` | Pulso Arcano Natural | passive | offense | 3 | 1 | — | +1.1% arcano/rango; +1 resistencia arcana/rango |
| `uren_wild_stride` | Paso Silvestre | passive | mobility | 2 | 1 | — | +1.4% velocidad movimiento/rango; -4.5% tiempo viaje/rango |
| `uren_forage_eye` | Ojo de Forraje | passive | utility | 3 | 1 | — | +3.5% yield Gather/rango; +3.5% yield Chop/rango |
| `uren_forest_breath` | Respiro del Bosque | passive | utility | 2 | 1 | — | +1 regen STA pasiva/rango; -1.8% coste STA Gather/rango; -1.4% coste STA Chop/rango |
| `uren_vine_snare` | Enredadera | active | active | 1 | 2 | — | Activa de control. Equipada: +1% defensa, -3% coste STA Chop |
| `uren_reflect_thorns` | Espinas Reflejas | passive | defense | 1 | 1 | `uren_vine_snare` | +1.4 defensa plana; +1 resistencia física |
| `uren_arcane_bud` | Brote Arcano | active | active | 1 | 2 | — | Activa de impulso arcano. Equipada: +1% ataque, +2% arcano |
| `uren_green_channel` | Canal Verde | passive | offense | 1 | 1 | `uren_arcane_bud` | +2% arcano |
| `uren_forest_heart` | Corazón del Bosque | keystone | keystone | 1 | 2 | — | Keystone tanque/sustain. Equipado: +15 HP máx, +4% defensa, +1 regen STA pasiva |
| `uren_arcane_pact` | Pacto Arcano | keystone | keystone | 1 | 2 | — | Keystone ofensivo arcano. Equipado: +5% arcano, +1.1 crítico |
| `uren_wild_spine` | Espina Salvaje | keystone | keystone | 1 | 2 | — | Keystone balanceado ataque/defensa. Equipado: +3% ataque, +2% defensa, +1 resistencia física |

---

## 6. Árboles de habilidades de clase

### Reglas

- Cada clase tiene 6 habilidades: 3-4 pasivas, 1 activa, 1 reacción, 1 keystone.
- Efectos por rango escalan linealmente.
- Solo se pueden equipar habilidades aprendidas (rango >= 1).
- Slots activos solo para tipo `active`. Slot keystone solo para tipo `keystone`.

### Puntos de habilidad de clase

```
puntos_clase(nivel) = max(0, nivel - 1)
```

### Puntos de habilidad general

```
puntos_general(nivel) =
  nivel 1-3 → 0
  nivel 4+  → floor((nivel - 3) / 2)
```

### Coste de reset de build

```
coste_reset_build = 40 + (puntos_clase_gastados + puntos_general_gastados) * 6  (plata)
```

### Slots de loadout de build

- 3 slots activos (`activeSlot1`, `activeSlot2`, `activeSlot3`).
- 1 slot keystone (`keystoneKey`).

### Reacciones

Las habilidades tipo `reaction` se disparan automáticamente ante eventos si están equipadas, cumplen condición y no están en cooldown:
- `on_crit_evaded`
- `on_crit_blocked`
- `on_crit_taken`
- `on_hit_taken`

---

## 7. Habilidades de clase

### Curse Hunter

| Clave | Nombre | Tipo | Categoría | Max | Coste | Efecto |
|-------|--------|------|-----------|-----|-------|--------|
| `ch_marked_strike` | Marca Letal | passive | offense | 3 | 1 | +1.5% ataque/rango; +0.4 crítico/rango |
| `ch_grim_footwork` | Juego de Piernas | passive | mobility | 3 | 1 | +0.7 evasión/rango; +0.8% movimiento/rango; -2% tiempo viaje/rango |
| `ch_last_stand` | Última Guardia | passive | defense | 2 | 1 | Si HP < 50%: +3% defensa/rango; +1 resistencia física/rango |
| `ch_shadow_lunge` | Zarpazo Sombrío | active | offense | 1 | 2 | CD 40s, cast 2s, duración 18s: +5% ataque, +4% movimiento |
| `ch_counterwire` | Cable de Respuesta | reaction | reaction | 1 | 1 | Al esquivar crítico: CD 25s, duración 8s, +4% ataque, +1.2 crítico, contraataque 35% |
| `ch_iron_oath` | Juramento de Hierro | keystone | keystone | 1 | 2 | +2% ataque, +4% defensa, +1 resistencia física |

### Arcane

| Clave | Nombre | Tipo | Categoría | Max | Coste | Efecto |
|-------|--------|------|-----------|-----|-------|--------|
| `ar_focus_lattice` | Malla de Foco | passive | offense | 3 | 1 | +1.5% arcano/rango; +0.35 crítico/rango |
| `ar_mana_veil` | Velo de Maná | passive | defense | 2 | 1 | +1.5% defensa/rango; +1 resistencia arcana/rango |
| `ar_arcane_overflow` | Desborde Arcano | passive | offense | 2 | 1 | Si STA > 70%: +2% arcano/rango |
| `ar_ether_burst` | Ráfaga Éter | active | offense | 1 | 2 | CD 35s, cast 1s, duración 12s: +8% arcano, +3% velocidad ataque |
| `ar_spell_reflex` | Reflejo de Hechizo | reaction | reaction | 1 | 1 | Al bloquear crítico: CD 28s, duración 8s, +5% arcano, +2% ataque |
| `ar_void_pact` | Pacto del Vacío | keystone | keystone | 1 | 2 | +5% arcano, +1.2 crítico, -4% coste STA mine, -3% coste STA gather |

### Dark Druid

| Clave | Nombre | Tipo | Categoría | Max | Coste | Efecto |
|-------|--------|------|-----------|-----|-------|--------|
| `dd_bark_flesh` | Carne de Corteza | passive | defense | 3 | 1 | +7 HP máx/rango; +1% defensa/rango |
| `dd_rooted_stride` | Paso Enraizado | passive | mobility | 2 | 1 | -4% coste STA viaje/rango; -3% tiempo viaje/rango; +1% movimiento/rango |
| `dd_thorn_guard` | Guardia de Espinas | passive | defense | 2 | 1 | Si HP < 50%: +3% defensa/rango; +1 resistencia física/rango |
| `dd_wild_regrowth` | Regrowth Salvaje | active | utility | 1 | 2 | CD 50s, cast 3s, duración 20s: +1 regen STA pasiva, +10 HP máx, +3% defensa |
| `dd_thorn_rebound` | Rebote de Espinas | reaction | reaction | 1 | 1 | Al recibir crítico: CD 32s, duración 10s, +5% defensa, contraataque 25% |
| `dd_heartwood_core` | Núcleo de Duramen | keystone | keystone | 1 | 2 | +18 HP máx, +4% defensa, +1 regen STA pasiva |

### Alchemist Rogue

| Clave | Nombre | Tipo | Categoría | Max | Coste | Efecto |
|-------|--------|------|-----------|-----|-------|--------|
| `alx_precision_mix` | Mezcla Precisa | passive | offense | 3 | 1 | +0.5 crítico/rango; +1% ataque/rango |
| `alx_volatile_step` | Paso Volátil | passive | mobility | 3 | 1 | +1% movimiento/rango; +0.6 evasión/rango; -2% tiempo viaje/rango |
| `alx_pain_converter` | Conversor de Dolor | passive | offense | 2 | 1 | Si HP < 50%: +2% ataque/rango; +2% arcano/rango |
| `alx_smoke_vial` | Vial de Humo | active | mobility | 1 | 2 | CD 30s, cast 0s, duración 14s: +2 evasión, +5% movimiento |
| `alx_auto_injector` | Auto-Inyector | reaction | reaction | 1 | 1 | Al recibir golpe fuerte y HP < 70%: CD 26s, duración 9s, +4% defensa, +1.2 evasión |
| `alx_reactive_catalyst` | Catalizador Reactivo | keystone | keystone | 1 | 2 | +3% ataque, +3% movimiento, +1 crítico |

---

## 8. Habilidades generales

Disponibles a partir de nivel 4.

| Clave | Nombre | Tipo | Categoría | Max | Coste | Efecto |
|-------|--------|------|-----------|-----|-------|--------|
| `gen_athletic_form` | Forma Atlética | passive | mobility | 3 | 1 | +0.8% movimiento/rango; +1% velocidad ataque/rango; -1.5% tiempo viaje/rango |
| `gen_pack_instinct` | Instinto de Carga | passive | utility | 3 | 1 | +3% yield Gather/rango; +3% yield Chop/rango |
| `gen_stamina_discipline` | Disciplina de STA | passive | utility | 3 | 1 | -3% coste STA Gather/rango; -2% coste STA Chop/rango; -2% coste STA Mine/rango |
| `gen_guarded_mind` | Mente Guardada | passive | defense | 2 | 1 | +1.5% defensa/rango; +1 resistencia arcana/rango; +1 resistencia elemental/rango |
| `gen_second_wind` | Segundo Aire | passive | utility | 2 | 1 | Si STA < 30%: +1 regen STA pasiva/rango; -4% coste STA viaje/rango; -3% coste STA gather/chop/mine/fish/rango |
| `gen_emergency_shell` | Caparazón de Emergencia | passive | defense | 2 | 1 | Si HP < 35%: +3% defensa/rango; +6 HP máx/rango |
| `gen_battle_focus` | Foco de Batalla | active | offense | 1 | 2 | CD 45s, cast 1s, duración 15s: +4% ataque, +4% arcano, +0.8 crítico |
| `gen_steady_heart` | Corazón Firme | keystone | keystone | 1 | 2 | +2% defensa, +2% ataque, +8 STA máx, +1 regen STA pasiva |

---

## 9. Referencia de implementación

| Archivo | Función/constante clave |
|---------|-------------------------|
| `src/bot/modules/registration-module.ts` | `RACES`, `CLASSES`, `getLevelOneAttributes()` |
| `src/data/racial-talents.ts` | `getRacialPointsForLevel()`, `getAllRacialTalents()` |
| `src/data/racial-balance.ts` | `RACIAL_TALENT_BALANCE`, `RACIAL_EFFECT_LIMITS` |
| `src/services/racial-talents.ts` | `learnRacialTalentRank()`, `equipRacialTalent()`, `resetRacialTalents()` |
| `src/services/racial-effects.ts` | `computeEffectsFromState()`, `getRacialGameplayEffectsForPlayer()` |
| `src/data/skill-trees.ts` | `getClassSkillDefinitions()`, `getGeneralSkillDefinitions()`, `getClassSkillPointsForLevel()`, `getGeneralSkillPointsForLevel()` |
| `src/data/skill-trees/class-skills.ts` | `CLASS_SKILLS` |
| `src/data/skill-trees/general-skills.ts` | `GENERAL_SKILLS` |
| `src/services/build-skills-actions.ts` | `learnBuildSkillRank()`, `equipBuildSkill()`, `activateBuildSkill()`, `resetBuildSkills()` |
| `src/services/build-skills-state.ts` | Persistencia de build/loadout |
| `src/services/build-skills.ts` | `getBuildGameplayEffectsForPlayer()` |

---

## Notas para reimplementación

1. **Restricción racial de clase**: `zolk` solo `curse_hunter` / `alchemist_rogue`; `uren` solo `dark_druid` / `arcane`.
2. **Puntos**: raciales y generales crecen más lentamente que los de clase.
3. **Loadout**: validar que no se equipen skills no aprendidas ni duplicadas; una misma skill en un nuevo slot libera el anterior.
4. **Reacciones**: requieren estar equipadas y cumplir condición de HP/STA; respetan cooldown.
5. **Efectos activos**: almacenar duración, cooldown y modificadores; aplicarlos en `getBuildGameplayEffectsForPlayer()` o equivalente.
