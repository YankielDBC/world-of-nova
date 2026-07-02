# World of Nova – Game Bible (Nightfall v1.0)

Documento de referencia completo. Contiene razas, clases, biomas, recursos, equipo, lugares, talentos, habilidades, criaturas, economía y reglas del mundo.

---

## 1. Visión General

**World of Nova: Nightfall** es un RPG de exploración por tiles ambientado en un mundo oscuro donde dos pueblos marginados —Zolk y Uren— luchan por el control de la frontera, mientras el Reino de Nova intenta mantener la estabilidad.

- **Mundo:** Novaria (mapa 100×100, generación procedural bajo demanda).
- **Estilo:** Dark fantasy con alquimia, magia arcana prohibida y supervivencia.
- **Progresión:** Basada en niveles, equipo, talentos raciales, habilidades de build y reputación.
- **Economía:** Doble moneda (oro/plata), mercado de jugadores, bóveda bancaria y mercader misterioso.
- **Transporte actual:** servidor web Express + React (antes Telegram bot).

---

## 2. Razas

| Raza | Emoji | Descripción | Estilo de juego |
|------|-------|-------------|-----------------|
| **Uren** | 🌑 | Herejes del bosque oscuro. Druidas y arcanos que mezclan naturaleza corrupta con magia primordial. | Tanque/sustain, arcano, control. |
| **Zolk** | 🧪 | Parias alquímicos supervivientes. Dominan toxinas, sabotaje y cacería adaptativa. | Veneno, evasión, daño crítico, movilidad. |

---

## 3. Clases

Cada raza tiene dos clases. Los bonus iniciales se suman a los atributos base del personaje.

### Uren

| Clase | Emoji | Descripción | Bonus |
|-------|-------|-------------|-------|
| **Dark Druid** | 🌿 | Guardianes malditos del bosque. Resisten mucho, pero se mueven lento. | STR +7, DEX +3, INT +5, VIT +9, AGI +4, ENG +5 |
| **Arcane** | 🔮 | Canales de energía pura. Frágiles, pero con poder mágico devastador. | STR +1, DEX +5, INT +11, VIT +3, AGI +6, ENG +9 |

### Zolk

| Clase | Emoji | Descripción | Bonus |
|-------|-------|-------------|-------|
| **Alchemist Rogue** | 🗡️ | Sombras tóxicas y técnicas. Atacan rápido con viales y corrosivos. | STR +4, DEX +9, INT +6, VIT +3, AGI +9, ENG +8 |
| **Curse Hunter** | 🏹 | Cazadores de maldiciones. Balanceados, resistentes y precisos. | STR +8, DEX +6, INT +4, VIT +6, AGI +5, ENG +3 |

### Fórmulas de stats base (nivel 1)

- **HP_max** = 40 + (VIT × 8) + (nivel × 10)
- **STA_max** = 30 + (AGI × 5) + (ENG × 4) + (nivel × 5)
- **Attack** = (STR × 1.2) + (DEX × 0.8) + nivel
- **Arcane PWR** = (INT × 1.5) + (ENG × 0.5) + nivel
- **B. Damage** = min(Attack × 0.3, 10)
- **Attack Speed** = 150 + (AGI × 30) + (DEX × 15)
- **MOV SPD** = 0.05 + (AGI × 0.0025), cap 0.1
- **Crit Chance** = (DEX × 1.2) + (AGI × 0.3) + 2.5%, cap 35%
- **Evasion** = (AGI × 1.0) + (DEX × 0.5) + 1%, cap 30%
- **Defense** = (VIT × 0.8) + (STR × 0.3) + (nivel × 0.5)
- **Resistencias:** VIT/INT física, INT arcana, raza química Zolk +2, raza arcana Uren +1.

---

## 4. Atributos y Stats

### Atributos primarios

| Atributo | Efecto principal |
|----------|------------------|
| **STR** | Ataque físico. |
| **DEX** | Crítico, evasión, velocidad de ataque. |
| **INT** | Poder arcano, resistencia arcana. |
| **VIT** | HP máximo, defensa, resistencia física. |
| **AGI** | STA máxima, velocidad de movimiento, evasión. |
| **ENG** | STA máxima, poder arcano, velocidad de ataque. |

### Stats de combate

| Stat | Descripción |
|------|-------------|
| **HP** | Salud. Llegar a 0 activa el sistema de muerte. |
| **STA** | Energía para viajar, recolectar y habilidades. |
| **ATK** | Daño físico base. |
| **ARC** | Daño mágico base. |
| **B.DMG** | Daño bonus mínimo añadido. |
| **DEF** | Reducción de daño físico. |
| **CRIT** | Probabilidad de golpe crítico. |
| **EVA** | Probabilidad de esquivar. |
| **ATK SPD** | Velocidad de ataque (ms entre golpes). |
| **MOV SPD** | Velocidad de movimiento en tiles/s. |
| **Resistencias** | Física, elemental, arcana, sagrada, química. |

---

## 5. Biomas

El mundo Novaria genera 10 biomas proceduralmente según distancia al centro, ruido de terreno, humedad, temperatura, elevación y proximidad a ríos/lagos/volcanes.

| Bioma | Emoji | Nombre UI | Factor Movimiento | Color | Descripción |
|-------|-------|-----------|-------------------|-------|-------------|
| **Plains** | 🌾 | Llanuras | 1.0 | #90EE90 | Extensas llanuras verdes con rica vegetación. |
| **Forest** | 🌲 | Bosque | 1.2 | #228B22 | Bosque denso con árboles altos y sotobosque. |
| **Swamp** | 🪷 | Pantano | 1.5 | #556B2F | Terreno fangoso con aguas estancadas. |
| **Volcano** | 🌋 | Volcán | 1.3 | #8B0000 | Tierras volcánicas con lava y ceniza. |
| **Ashlands** | 🌫️ | Cenizales | 1.1 | #696969 | Llanuras cubiertas de ceniza volcánica. |
| **Highlands** | 🏔️ | Tierras Altas | 1.4 | #A0522D | Montañas escarpadas con aire fino. |
| **Desert** | 🏜️ | Desierto | 1.3 | #F4A460 | Arenales infinitos bajo el sol abrasador. |
| **Tundra** | ❄️ | Tundra | 1.2 | #E0FFFF | Heladas llanuras cubiertas de nieve. |
| **River** | 🌊 | Río | 0.5 | #4169E1 | Corrientes de agua que cruzan el territorio. |
| **Lake** | 🏞️ | Lago | 0.3 | #1E90FF | Tranquilas aguas lacustres. |

### Distribución por bandas de zona

Las probabilidades de aparición varían según la distancia radial:

| Banda | Distancia | Nivel recomendado |
|-------|-----------|-------------------|
| Core | 0–10 | 1–3 |
| Inner | 10–35 | 4–8 |
| Middle | 35–60 | 9–14 |
| Outer | 60–90 | 15–22 |
| Frontier | 90+ | 23–40 |

---

## 6. Recursos

33 recursos divididos en materiales, consumibles y reliquias.

### Materiales

| Recurso | Emoji | Tipo | Peso | Valor | Rarity | Descripción |
|---------|-------|------|------|-------|--------|-------------|
| Wood | 🪵 | material | 0.5 | 1 | common | Madera básica para crafteo inicial. |
| Pine Cone | 🌰 | material | 0.1 | 3 | rare | Semilla de pino usada en recetas simples. |
| Bamboo | 🎋 | material | 0.4 | 3 | uncommon | Material flexible para estructuras ligeras. |
| Ancient Wood | 🪵 | material | 0.8 | 10 | rare | Madera rara de alto valor. |
| Baba Verde | 🟢 | material | 0.3 | 2 | common | Material viscoso para alquimia. |
| Hierbas | 🌿 | material | 0.1 | 1 | common | Planta común de recolección. |
| Insectos | 🐛 | material | 0.05 | 2 | uncommon | Ingrediente común de cebo y recetas. |
| Barro | 🟤 | material | 0.5 | 1 | common | Base para mezclas y crafteo. |
| Hueso | 🦴 | material | 0.4 | 6 | rare | Resto ancestral de criaturas antiguas. |
| Ámbar | 🟡 | material | 0.2 | 25 | epic | Gema fosilizada de gran valor. |
| Ojo Ancestral | 👁️ | material | 0.1 | 50 | legendary | Reliquia legendaria de poder antiguo. |
| Seda | 🧵 | material | 0.1 | 4 | uncommon | Fibra fina para confección. |
| Trigo | 🌽 | material | 0.2 | 1 | common | Grano básico de alimento. |
| Semillas | 🌱 | material | 0.05 | 1 | common | Semillas para plantar o procesar. |
| Hierba | 🌿 | material | 0.1 | 1 | common | Hierba común de recolección. |
| Flores | 🌼 | material | 0.05 | 1 | common | Flores comunes usadas en preparados. |
| Girasol | 🌻 | material | 0.15 | 3 | uncommon | Flor resistente con usos varios. |
| Hierbas Secas | 🥀 | material | 0.05 | 1 | common | Fibra vegetal para mezclas y fuego. |
| Hojas de Viento | 🍁 | material | 0.05 | 20 | epic | Hoja épica usada en recetas avanzadas. |
| Roca Volcánica | 🪨 | material | 1.0 | 2 | common | Mineral pesado de zonas volcánicas. |
| Cenizas | 🌫️ | material | 0.05 | 1 | common | Residuo ligero de origen volcánico. |
| Carbón | ⚫ | material | 0.3 | 3 | uncommon | Combustible mineral útil en hornos. |

### Consumibles

| Recurso | Emoji | Efecto | Valor | Rarity | Peso |
|---------|-------|--------|-------|--------|------|
| Apple | 🍎 | STA +5 | 2 | common | 0.2 |
| Orange | 🍊 | STA +8 | 4 | uncommon | 0.2 |
| Mango | 🥭 | STA +15 | 8 | rare | 0.3 |
| Coconut | 🥥 | STA +12 | 5 | common | 0.6 |
| Water | 💧 | STA +6 | 2 | common | 0.3 |
| Champiñón | 🍄 | HP +3 | 1 | common | 0.1 |
| Champiñón Mágico | 🪻 | HP +25 | 12 | rare | 0.1 |
| FlorDragón | 🌺 | HP +15 | 8 | rare | 0.1 |
| Agua | 💧 | STA +4 | 1 | common | 0.3 |
| Pez Amarillo | 🐠 | STA +10 | 3 | common | 0.3 |
| Pez Azul | 🐟 | STA +18 | 6 | uncommon | 0.4 |

### Ventanas de tiempo por recurso

Cada recurso tiene un periodo del día preferido:

- **all:** siempre disponible.
- **daylight:** amanecer y día.
- **dusk:** atardecer.
- **night:** noche.
- **crepuscular:** amanecer y atardecer.

Ejemplos: Ancient Wood y Champiñón Mágico solo aparecen de noche; Trigo y Flores solo de día.

---

## 7. Herramientas

| Herramienta | Emoji | Tipo | Durabilidad | Peso | Valor | Targets |
|-------------|-------|------|-------------|------|-------|---------|
| Caña de Bambú | 🎣 | fishing | 70 | 1.2 | 22 | river, beach |
| Hacha de Piedra | 🪓 | woodcutting | 85 | 2.1 | 28 | forest |
| Pico de Piedra | ⛏️ | mining | 95 | 2.8 | 32 | volcano, mountain, cave |
| Tijera de Piedra | ✂️ | gathering | 60 | 0.7 | 16 | forest, plains, swamp |
| Vara de Madera | 🦯 | harvesting | 65 | 0.9 | 18 | forest, plains |

---

## 8. Equipamiento

### Slots de equipo

1. head
2. chest
3. legs
4. boots
5. gloves
6. belt
7. cloak
8. ring_1
9. ring_2
10. amulet
11. main_hand
12. off_hand
13. two_hand
14. fishing_tool

Más slots de herramientas: chopTool, mineTool, gatherTool.

### Rareza

| Rarity | Código UI | Color típico |
|--------|-----------|--------------|
| common | C | gris/blanco |
| uncommon | U | verde |
| rare | R | azul |
| epic | E | púrpura |
| legendary | L | dorado |
| mythic | M | rojo/carmesí |

### Bind types

- `none`
- `bind_on_equip`
- `bind_on_pickup`
- `soulbound`
- `quest_bound`

### Stats de combate soportados

`maxHpFlat`, `maxHpPct`, `maxEnergyFlat`, `maxEnergyPct`, `maxSoulFlat`, `attackFlat`, `attackPct`, `arcaneFlat`, `arcanePct`, `baseDamageFlat`, `defenseFlat`, `defensePct`, `critChanceFlat`, `evasionFlat`, `atkSpeedFlat`, `atkSpeedPct`, `moveSpeedFlat`, `moveSpeedPct`, y todas las resistencias.

### Stats utilitarios soportados

`chopYieldPct`, `mineYieldPct`, `gatherYieldPct`, `fishYieldPct`, `travelStaCostPct`, `passiveStaRegenFlat`, `merchantPriceFavorPct`, `bankFeeReductionPct`, `dropRateMinorPct`.

---

## 9. Catálogo de Equipamiento Base

13 templates iniciales.

| Key | Nombre | Slot | Arquetipo | Nvl | Raza/Clase | Bind | Peso | Implicit Stats |
|-----|--------|------|-----------|-----|------------|------|------|----------------|
| nova_guard_helm | Casco de Guardia de Nova | head | guard | 1 | — | equip | 1.2 | DEF +2, HP +6 |
| ashen_hunter_hood | Capucha del Cazador de Ceniza | head | hunter | 4 | Curse Hunter | equip | 0.6 | CRIT +1.5%, EVA +1 |
| briar_stalker_boots | Botas del Acecho Briar | boots | stalker | 3 | — | equip | 0.8 | MOV +2%, EVA +1 |
| reedwash_treads | Botas de Reed Wash | boots | river | 2 | — | equip | 0.7 | MOV +1.5%, RES química +1 |
| rootbound_vest | Chaleco de Raíz Firme | chest | survivor | 5 | — | equip | 2.1 | HP +12, DEF +3 |
| scoria_plate | Coraza de Escoria | chest | volcanic | 8 | — | pickup | 3.4 | DEF +5, RES elemental +2 |
| watcher_gloves | Guantes del Vigía | gloves | precision | 4 | — | equip | 0.5 | CRIT +1%, ATK SPD +1.5% |
| bogbound_belt | Cinturón de Fango Quieto | belt | swamp | 6 | — | equip | 0.9 | RES química +3, STA +4 |
| cursebreaker_blade | Hoja Rompemaldiciones | main_hand | hunter | 7 | Curse Hunter | equip | 1.6 | ATK +4, B.DMG +1, CRIT +1.2% |
| riverglass_dagger | Daga de Cristal de Río | main_hand | rogue | 5 | Alchemist Rogue | equip | 1.0 | ATK +3, ATK SPD +2%, EVA +1 |
| moon_veil_cloak | Capa del Velo Lunar | cloak | mystic | 6 | — | equip | 0.7 | STA +6, RES arcana +2 |
| nova_oath_amulet | Amuleto del Juramento de Nova | amulet | oath | 3 | — | equip | 0.3 | HP +8, RES sagrada +1 |
| scoria_loop | Anillo de Escoria | ring_1 | volcanic | 9 | — | pickup | 0.1 | ARC +2, RES elemental +2 |

---

## 10. Lugares

### Nova Castle (0,0)

Capital del reino. PvP/PvE desactivados.

| Interacción | Tipo | Costo | Efecto |
|-------------|------|-------|--------|
| Plan Free (Gilded Rest) | service | gratis | Descanso lento |
| Básico (Gilded Rest) | service | 10 plata | Descanso medio |
| S. Veloz (Gilded Rest) | service | 25 plata | Descanso rápido |
| Plan Free (Mercy's Edge) | service | gratis | Curación lenta |
| Misericordia (Mercy's Edge) | service | 15 plata | Curación |
| I. Divina (Mercy's Edge) | service | 40 plata | Curación instantánea |
| A. Rápido (Crow Forge) | service | 4 plata | Reparación rápida |
| R. Completa (Crow Forge) | service | 10 plata | Reparación completa |
| Pico de Piedra | shop | 32 plata | Comprar herramienta |
| Hacha de Piedra | shop | 28 plata | Comprar herramienta |
| Caña de Bambú | shop | 22 plata | Comprar herramienta |
| Abrir Bóveda | service | — | Acceder al banco |
| Depositar/Retirar Plata | service | — | Transferencias bancarias |
| Lecciones de Tala/Recolección/Minería/Pesca | service | 5–15 plata | Aprender skill |
| Abrir Mercado | service | — | Acceder al Grand Exchange |

---

## 11. Talentos Raciales

### Zolk

| Key | Tipo | Categoría | Ranks | Nombre ES | Efecto |
|-----|------|-----------|-------|-----------|--------|
| zolk_toxic_blood | passive | offense | 3 | Sangre Tóxica | +RES química, +crítico |
| zolk_lab_reflexes | passive | mobility | 3 | Reflejos de Laboratorio | +EVA, +movilidad |
| zolk_unstable_metabolism | passive | utility | 2 | Metabolismo Inestable | +STA máxima, regen pasiva |
| zolk_alchemical_skin | passive | defense | 3 | Piel Alquímica | +DEF, +RES química |
| zolk_delicate_hand | passive | utility | 3 | Mano Delicada | Mejora drops Gather |
| zolk_quick_escape | passive | mobility | 2 | Fuga Rápida | Reduce costo STA viaje |
| zolk_toxic_cloud | active | active | 1 | Nube Tóxica | Activa ofensiva en combate |
| zolk_venom_glands | passive | offense | 1 | Glándulas Venenosas | Mejora Nube Tóxica |
| zolk_mutation_dash | active | active | 1 | Mutación de Escape | Activa de movilidad |
| zolk_chemical_legs | passive | mobility | 1 | Piernas Químicas | Mejora Mutación de Escape |
| zolk_toxic_shadow | keystone | keystone | 1 | Sombra Tóxica | Keystone evasiva agresiva |
| zolk_reactor_blood | keystone | keystone | 1 | Sangre de Reactor | Keystone daño arcano-crítico |
| zolk_chemical_survivor | keystone | keystone | 1 | Superviviente Químico | Keystone aguante/resistencia |

### Uren

| Key | Tipo | Categoría | Ranks | Nombre ES | Efecto |
|-----|------|-----------|-------|-----------|--------|
| uren_deep_root | passive | defense | 3 | Raíz Profunda | +VIT, +DEF |
| uren_calm_sap | passive | defense | 3 | Savia Serena | +HP/STA máxima |
| uren_living_bark | passive | defense | 3 | Corteza Viva | RES física, DEF |
| uren_natural_pulse | passive | offense | 3 | Pulso Arcano Natural | +INT, RES arcana |
| uren_wild_stride | passive | mobility | 2 | Paso Silvestre | +velocidad movimiento |
| uren_forage_eye | passive | utility | 3 | Ojo de Forraje | Mejora Gather/Chop |
| uren_forest_breath | passive | utility | 2 | Respiro del Bosque | Regeneración pasiva ligera |
| uren_vine_snare | active | active | 1 | Enredadera | Control en combate |
| uren_reflect_thorns | passive | defense | 1 | Espinas Reflejas | Mejora Enredadera |
| uren_arcane_bud | active | active | 1 | Brote Arcano | Impulso arcano |
| uren_green_channel | passive | offense | 1 | Canal Verde | Mejora Brote Arcano |
| uren_forest_heart | keystone | keystone | 1 | Corazón del Bosque | Keystone tanque/sustain |
| uren_arcane_pact | keystone | keystone | 1 | Pacto Arcano | Keystone ofensivo arcano |
| uren_wild_spine | keystone | keystone | 1 | Espina Salvaje | Keystone ataque/defensa balanceado |

---

## 12. Habilidades de Clase

### Curse Hunter

| Key | Tipo | Nombre ES | Efecto |
|-----|------|-----------|--------|
| ch_marked_strike | passive | Marca Letal | +ATK%, +CRIT |
| ch_grim_footwork | passive | Juego de Piernas | +EVA, +MOV SPD, -tiempo viaje |
| ch_last_stand | passive | Última Guardia | <50% HP: +DEF%, +RES física |
| ch_shadow_lunge | active | Zarpazo Sombrío | Buff temporal ATK + MOV SPD |
| ch_counterwire | reaction | Cable de Respuesta | Al esquivar crítico, contraatacas |
| ch_iron_oath | keystone | Juramento de Hierro | ATK% + DEF% + RES física |

### Arcane (Uren)

| Key | Tipo | Nombre ES | Efecto |
|-----|------|-----------|--------|
| ar_focus_lattice | passive | Malla de Foco | +ARC%, +CRIT |
| ar_mana_veil | passive | Velo de Maná | Mitigación + RES arcana |

(El catálogo completo de habilidades de las 4 clases vive en `src/data/skill-trees/class-skills.ts`.)

---

## 13. Habilidades Generales

| Key | Nombre ES | Efecto |
|-----|-----------|--------|
| gen_athletic_form | Forma Atlética | +MOV SPD, +ATK SPD, -tiempo viaje |
| gen_pack_instinct | Instinto de Carga | +yield Gather/Chop |
| gen_stamina_discipline | Disciplina de STA | -costo STA acciones |
| gen_guarded_mind | Mente Guardada | +DEF, +RES arcana/elemental |
| gen_second_wind | Segundo Aire | <30% STA: regen y descuento |
| gen_emergency_shell | Caparazón de Emergencia | <35% HP: +DEF, +HP |

---

## 14. Ciclo Día/Noche

Períodos: **dawn, day, dusk, night**.

### Efectos globales por período

| Período | Spawn | Yield | Costo STA |
|---------|-------|-------|-----------|
| Dawn | +6% | +5% | base |
| Day | base | base | base |
| Dusk | +7% | +5% | base |
| Night | -10% | +10% | +12% |

Cada bioma tiene multiplicadores propios que se suman/overridean. Por ejemplo:

- **Swamp night:** spawn +16%, yield +22%.
- **Desert day:** yield -8% y costo STA +12%.
- **River dusk:** pesca mejorada significativamente.

---

## 15. Criaturas

### Categorías

| Categoría | Emoji | HP | ATK | DEF | XP | Respawn |
|-----------|-------|----|-----|-----|----|---------|
| basic | 🐾 | 1.0× | 1.0× | 1.0× | 6× | 70–220s |
| veteran | ⚔️ | 1.34× | 1.2× | 1.16× | 10× | 150–420s |
| elite | 👹 | 1.72× | 1.42× | 1.35× | 16× | 360–1200s |
| boss | ☠️ | 2.55× | 1.86× | 1.7× | 28× | 1200–7200s |

### Especies por bioma

- **Forest:** Lobo, Jabalí, Cuervo, Araña Corteza, Ciervo Gris, Bestia Musgo.
- **Swamp:** Sapo Venenoso, Babosa Negra, Serpiente Fango, Acechador Turbio, Mosca Daga.
- **Plains:** Zorro de Prado, Carnero Salvaje, Halcón Bajo, Jabalina, Lince Dorado.
- **River:** Pez Diente, Anguila de Cauce, Nutria Feroz, Cangrejo Roca, Piraña Rill.
- **Lake:** Raya Lacustre, Carpa Titán, Nimbo Escama, Garra de Agua, Mordedor Azul.
- **Volcano:** Sabueso Ceniza, Escorpión Lava, Draco Brasa, Golem Escoria, Murciélago Fuego.
- **Ashlands:** Hiena Ceniza, Cuervo Carbón, Bestia Escoria, Araña Humo, Chacal Obsidiana.
- **Highlands:** Cabra Acero, Lobo Cumbre, Águila Pedernal, Raptor Colina, Bisonte Roca.
- **Desert:** Escorpión Seco, Coyote Duna, Víbora Arena, Buitre Sol, Reptil Espina.
- **Tundra:** Lobo Nieve, Caribú Sombrío, Oso Escarcha, Raptor Hielo, Zorro Blanco.

---

## 16. Economía

- **Gold** 💰 — moneda alta.
- **Silver** 🪙 — moneda cotidiana.
- **Grand Exchange:** mercado de órdenes entre jugadores.
- **Crown Vault:** banco real con bóveda personal.
- **Mystery Merchant:** NPC errante con ofertas rotativas.
- **Tiendas de lugares:** herramientas, reparaciones, lecciones.

---

## 17. Sistema de Muerte

1. Al llegar a 0 HP el jugador muere.
2. Se crea un **cadáver persistente** en el tile.
3. El jugador entra en estado **ghost** cerca del cementerio más cercano.
4. Debe recuperar el cuerpo para restaurar inventario/equipo perdido.
5. Mientras es ghost, el mapa se ve en plano astral.

---

## 18. Cuevas

- Instancias de dungeon procedurales.
- Fog of war interno con radio de revelado.
- Celdas de camino (`.`) y pared (`#`).
- Salidas/entradas a distintas capas.

---

## 19. Movimiento

- Movimiento por tiles cardinales: **up, down, left, right**.
- Costo de STA según bioma (movementFactor).
- Modos: walking (base), swimming (agua), climbing (montaña), running/boost, riding, flying.

---

## 20. Inventario y Bolsas

### Tipos de bolsa

| Bolsa | Emoji | Slots | Peso | Notas |
|-------|-------|-------|------|-------|
| Pockets | 👖 | 5 | 5kg | Siempre equipada, no ocupa espacio. |
| Travel Bag | 💼 | 12 | 15kg | Bolsa estándar. |
| Leather Pack | 🎒 | 20 | 25kg | Mochila para expediciones. |
| Crown Vault | 🏦 | 20 | ∞ | Banco real. |
| Village Chest | 🧰 | 10 | ∞ | Baúl de pueblo. |

---

## 21. Arquitectura Web

Ver `docs/WEB_API.md` para endpoints, eventos Socket.io y estructura del frontend React.

---

## 22. Archivos fuente clave

- Razas/Clases/Registro: `src/bot/modules/registration-module.ts`
- Atributos/RPG: `src/lib/rpg-attributes.ts`, `src/lib/db.ts`
- Biomas: `src/services/world-biomes.ts`, `prisma/seed-world.ts`
- Recursos: `prisma/seed-resources.ts`, `src/data/day-cycle.ts`
- Herramientas: `src/types/tools.ts`
- Equipamiento: `src/data/equipment.ts`, `src/data/equipment-catalog.ts`, `src/services/equipment.ts`
- Lugares: `prisma/seed-places.ts`
- Talentos raciales: `src/data/racial-talents.ts`
- Habilidades: `src/data/skill-trees/class-skills.ts`, `src/data/skill-trees/general-skills.ts`
- Criaturas: `src/services/creatures-config.ts`
- Servidor web: `src/server/index.ts`
- Frontend: `web/src/App.tsx`

---

*Actualizado: 2026-06-17*
