# Dynamic Equipment Generator Report

## Objetivo

Definir un sistema de generacion dinamica de equipamiento para `World of Nova` que permita crear:

- cascos
- armas
- botas
- pecheras
- guantes
- cinturones
- anillos
- amuletos
- capas
- escudos

con:

- stats dinamicos
- rareza
- restricciones por clase o raza
- bind rules
- valor de mercado
- identidad visual y narrativa
- integracion limpia con mochila, banco, mercado, PvE, PvP y crafting

El objetivo no es improvisar un sistema aparte, sino proponer uno que nazca bien conectado con lo que ya existe en el backend actual.

---

## 1. Diagnostico del estado actual

Hoy el proyecto ya tiene una base muy util para soportar equipamiento, pero aun no existe un sistema general de gear.

### Ya existe

- `Resource`: bueno para consumibles, loot apilable, materiales, comida, objetos simples.
- `PlayerTool`: bueno para herramientas individuales con durabilidad.
- `PlayerBagSlot`: ya soporta recursos, herramientas y bolsas guardadas.
- `PlayerEquipment`: ya soporta herramientas equipadas por tipo (`chop`, `mine`, `gather`).
- sistema de stats derivados del jugador:
  - HP
  - STA
  - Attack
  - Arcane Power
  - Crit
  - Evasion
  - Defense
  - Move Speed
  - resistencias
- sistema de builds y modifiers runtime
- sistema de mercado
- sistema de muerte/cadaver
- economia y valor base por item 

### Aun no existe

- una entidad general para equipo de combate
- slots de armadura y accesorios
- generacion procedural de affixes
- reglas de bind al alma
- restricciones de uso por clase/raza
- item power o gear score
- sets, implicits y procs de equipo

### Conclusion tecnica

No conviene intentar meter cascos, botas y armas dentro de `Resource` ni dentro de `PlayerTool`.

La razon:

- `Resource` esta pensado para stacks, consumo simple y loot commodity.
- `PlayerTool` esta especializado en herramientas funcionales con durabilidad y tipo de oficio.
- el equipamiento necesita una capa de instancia unica con stats rolados, restricciones, bind state y potencial de mercado propio.

La solucion correcta es crear un dominio nuevo de `EquipmentTemplate` + `EquipmentInstance`.

---

## 2. Propuesta de arquitectura

### 2.1 Catalogo base

Crear una tabla o modulo catalogo de plantillas:

`EquipmentTemplate`

Campos sugeridos:

- `id`
- `key`
- `name`
- `shortName`
- `emoji`
- `slot`
- `archetype`
- `weaponClass` nullable
- `armorClass` nullable
- `description`
- `requiredLevel`
- `allowedClasses` nullable
- `allowedRaces` nullable
- `bindTypeDefault`
- `baseValue`
- `weightKg`
- `stackable = false`
- `salvageTableKey` nullable
- `implicitStatProfile`
- `dropFamily`
- `isEnabled`

Esto representa el objeto base antes del roll.

Ejemplo:

- `iron_guard_helm`
- `ashen_hunter_hood`
- `scoria_edge_blade`
- `nova_patrol_boots`

### 2.2 Instancia real del objeto

Crear una entidad de item unico:

`EquipmentInstance`

Campos sugeridos:

- `id`
- `templateKey`
- `ownerPlayerId` nullable
- `currentContainerType`
- `currentContainerId`
- `slotIndex` nullable
- `rarity`
- `itemLevel`
- `qualityScore`
- `bindType`
- `boundPlayerId` nullable
- `boundAt` nullable
- `requiredLevel`
- `requiredClass` nullable
- `requiredRace` nullable
- `durability`
- `maxDurability`
- `isBroken`
- `prefixKey` nullable
- `suffixKey` nullable
- `implicitStatsJson`
- `explicitStatsJson`
- `specialEffectKey` nullable
- `merchantLocked`
- `tradable`
- `baseMarketValue`
- `rolledMarketValue`
- `createdFrom`
- `createdAt`

Esto ya es el objeto vivo que existe en el mundo.

---

## 3. Slots de equipamiento recomendados

Para que el juego gane profundidad sin saturar demasiado la UX, recomiendo empezar con:

### Armadura

- `head`
- `chest`
- `legs`
- `boots`
- `gloves`
- `belt`
- `cloak`

### Accesorios

- `ring_1`
- `ring_2`
- `amulet`

### Armas

- `main_hand`
- `off_hand`
- `two_hand`

### Herramientas

Las herramientas actuales pueden seguir separadas como estan:

- `chop_tool`
- `mine_tool`
- `gather_tool`
- `fishing_tool`

No hace falta mezclarlas con el sistema de gear de combate en la primera fase.

---

## 4. Rareza y filosofia de loot

Recomiendo esta escala:

- `common`
- `uncommon`
- `rare`
- `epic`
- `legendary`
- `mythic`

### Rol de cada tier

`common`
- base estable
- 0 o 1 afijo
- objetos de early game

`uncommon`
- 1 afijo claro
- transicion natural

`rare`
- 2 o 3 afijos
- primer tier realmente emocionante

`epic`
- 3 o 4 afijos
- mejor presupuesto de stats
- posible efecto especial simple

`legendary`
- identidad propia
- efecto especial garantizado
- nombre mas fuerte
- mas restringido en fuentes

`mythic`
- muy raro
- ideal para bosses, temporadas, ruinas profundas, cuevas elite

---

## 5. Bind rules

Esto le da vida economica al juego.

Tipos recomendados:

- `none`
- `bind_on_equip`
- `bind_on_pickup`
- `soulbound`
- `quest_bound`

### Uso recomendado

`none`
- materiales simples, gear muy basico, drops comunes

`bind_on_equip`
- ideal para mercado
- el item puede circular hasta que alguien lo use

`bind_on_pickup`
- ideal para botines importantes de dungeon/boss

`soulbound`
- equipo unico, reliquias, rewards de historia, progresion personal

`quest_bound`
- objetos de mision o progreso narrativo

### Recomendacion de diseño

No llenaria el juego temprano de `soulbound`.

Lo mas sano:

- early game: mucho `none` y `bind_on_equip`
- mid game: mezcla con `bind_on_pickup`
- high end: piezas clave `soulbound`

Asi el mercado respira y no matas la fantasia de encontrar, vender y especular.

---

## 6. Restricciones por clase y raza

Tu juego ya tiene razas y clases con identidad clara. Eso se debe reflejar, pero sin volverlo excesivamente cerrado.

### Filosofia recomendada

#### Gear universal

La mayor parte del gear comun y raro debe poder usarlo cualquiera, siempre que cumpla nivel.

#### Gear especializado

Algunas piezas deben estar orientadas a:

- `Curse Hunter`
- `Alchemist Rogue`
- `Dark Druid`
- `Arcane`

#### Gear racial

Mas raro y mas identitario:

- reliquias Zolk
- reliquias Uren

### Ejemplos

`Capucha del Cazador de Ceniza`
- clase: `curse_hunter`
- bonus: crit, evasion, resist arcane

`Botas del Rastro Toxico`
- clase: `alchemist_rogue`
- bonus: agi, move speed, chemical resist

`Yelmo de Raiz Negra`
- clase: `dark_druid`
- bonus: vit, defense, hp

`Corona de Chispa Silente`
- clase: `arcane`
- bonus: int, eng, arcane power

`Reliquia de Sangre Zolk`
- raza: `zolk`

`Amuleto de Savia Uren`
- raza: `uren`

### Recomendacion

Usa restricciones como sabor y build identity, no como carcel.

Lo ideal:

- 65% gear universal
- 25% gear de clase
- 10% gear racial o especial

---

## 7. Sistema de stats para gear

El gear debe alimentar el sistema de stats actual, no inventar otro paralelo.

### Stats base recomendados

- `maxHpFlat`
- `maxStaFlat`
- `attackFlat`
- `arcanePowerFlat`
- `baseDamageFlat`
- `critChanceFlat`
- `evasionFlat`
- `defenseFlat`
- `moveSpeedFlat`
- `atkSpeedFlat`
- `resistPhysicalFlat`
- `resistElementalFlat`
- `resistArcaneFlat`
- `resistHolyFlat`
- `resistChemicalFlat`

### Stats percentuales recomendados

- `attackPct`
- `arcanePowerPct`
- `defensePct`
- `moveSpeedPct`
- `atkSpeedPct`
- `maxHpPct`
- `maxStaPct`

### Utility / life skills

Muy importante para darle vida al MMORPG:

- `chopYieldPct`
- `mineYieldPct`
- `gatherYieldPct`
- `fishYieldPct`
- `travelStaCostPct`
- `passiveStaRegen`
- `corpseRecoverySpeedPct`
- `merchantPriceFavorPct`
- `bankFeeReductionPct`
- `dropRateMinorPct`

Esto hace que no todo el gear sea solo PvP/PvE. Tambien puede existir gear de farmeo, exploracion y economia.

---

## 8. Power budget e item level

Para generar equipo dinamico sin romper el balance necesitas un presupuesto de poder.

### Recomendacion

Cada item debe tener:

- `itemLevel`
- `slotCoefficient`
- `rarityMultiplier`
- `sourceTier`
- `statBudget`

### Formula conceptual

`statBudget = baseByItemLevel * slotCoefficient * rarityMultiplier * sourceModifier`

### Ejemplo de slot coefficient

- head: `1.00`
- chest: `1.35`
- legs: `1.15`
- boots: `0.90`
- gloves: `0.85`
- belt: `0.80`
- cloak: `0.75`
- ring: `0.70`
- amulet: `0.95`
- one hand weapon: `1.30`
- two hand weapon: `1.80`
- shield/offhand: `1.10`

### Ejemplo de rarity multiplier

- common: `1.00`
- uncommon: `1.15`
- rare: `1.35`
- epic: `1.65`
- legendary: `2.10`
- mythic: `2.75`

### Ventaja

Esto te deja escalar el juego por:

- zona
- cuevas
- ruinas
- bosses
- ciudades lejanas
- temporadas

sin tener que balancear item por item manualmente.

---

## 9. Sistema de afijos

Aqui esta la magia real del generador.

### Tipos de afijos

#### Prefijos ofensivos

- Cruel
- Agudo
- Implacable
- Voraz
- del Acecho

Ejemplos de bonus:

- attack
- crit
- base damage
- atk speed

#### Prefijos defensivos

- Firme
- Blindado
- del Guardian
- de Piedra

Ejemplos:

- hp
- defense
- resist physical

#### Prefijos arcanos

- del Eco Arcano
- de Chispa
- del Velo
- del Ritual

Ejemplos:

- int
- eng
- arcane power
- resist arcane

#### Prefijos de movilidad

- Ligero
- del Rastro
- del Paso Silente

Ejemplos:

- agi
- dex
- move speed
- evasion

#### Prefijos de oficio

- del Leñador
- del Minero
- del Recolector
- del Pescador

Ejemplos:

- yield
- stamina efficiency
- tool support

### Sufijos

Los sufijos ayudan a narrar.

Ejemplos:

- del Cuervo
- de Nova
- de la Ceniza
- de Briar
- del Pantano Quieto
- del Vigia
- del Juramento
- del Exilio

### Regla recomendada

- common: 0 o 1 afijo
- uncommon: 1
- rare: 2
- epic: 3
- legendary: 3 + 1 efecto especial
- mythic: 4 + 1 efecto especial

---

## 10. Efectos especiales

No todos los items deben tenerlos, pero son claves para builds memorables.

### Tipos

#### Proc ofensivo

- 8% de chance de infligir herida
- 10% de chance de aplicar maldicion
- golpe critico da escudo menor

#### Trigger defensivo

- si HP baja de 50%, ganas defensa temporal
- tras esquivar, ganas velocidad
- tras resistir critico, contraataque automatico ligero

#### Trigger utilitario

- despues de recolectar, recupera 1 STA
- al viajar, 5% menos costo
- al vender al mercado, +2% valor

### Recomendacion

Empieza con efectos simples y medibles. Nada de magia oscura imposible de balancear al principio.

---

## 11. Pipeline de generacion

### Fuentes posibles

- drop de criatura
- boss
- ruinas
- cuevas
- cofre
- crafting
- mercader misterioso
- tienda especial
- recompensa de evento
- recompensa de mision

### Pipeline sugerido

1. elegir `source profile`
2. elegir `template pool` por slot/bioma/zona
3. definir `itemLevel`
4. tirar `rarity`
5. calcular `statBudget`
6. aplicar `implicit`
7. aplicar `affixes`
8. decidir `bindType`
9. decidir `durability`
10. generar nombre final
11. generar valor base y valor de mercado sugerido
12. persistir como `EquipmentInstance`

---

## 12. Naming pipeline

El nombre importa mucho para dar vida.

### Formula sugerida

`[BaseName]`

`[Prefix] [BaseName]`

`[BaseName] [Suffix]`

`[Prefix] [BaseName] [Suffix]`

### Ejemplos

- Casco de Guardia
- Casco Firme del Vigia
- Botas del Rastro Ligero
- Espada Corta Cruel de Nova
- Capucha del Acecho Silente
- Broquel de Ceniza del Cuervo

### Regla

No hagas nombres excesivamente largos en la UI.

Ideal:

- nombre completo interno
- short name para mochila/mercado

---

## 13. Si se liga o no al alma

Esta parte debe sentirse como regla del mundo, no solo del backend.

### Reglas sugeridas

#### Gear comun y comerciable

- `bind_on_equip`
- perfecto para mercado

#### Gear especial de ruina/cueva profunda

- mezcla entre `bind_on_equip` y `bind_on_pickup`

#### Gear de boss o progresion

- `bind_on_pickup` o `soulbound`

#### Gear unico narrativo

- `soulbound`

### Tip extra

Un item soulbound puede aun tener valor de “salvage” o “memory essence” para no sentirse muerto economicamente.

---

## 14. Integracion con mercado

El mercado actual ya tiene una base util. El gear generico debe integrarse con cuidado.

### Recomendacion

Solo items no ligados deben poder:

- listarse
- venderse
- transferirse
- guardarse para especulacion

### Pantallas futuras utiles

- mercado por slot
- mercado por clase
- mercado por rareza
- mercado por item level
- comparador contra lo equipado

### Importante

El gear con roll procedural da una economia mucho mas viva que un item plano.

Ejemplo:

Dos cascos iguales de plantilla base pueden:

- diferir en rareza
- diferir en afijos
- diferir en bind
- diferir en valor

Eso genera demanda real.

---

## 15. Integracion con bolsa, banco y UI

Tu sistema actual de mochila ya esta listo para extenderse.

### Se necesita

Agregar nuevo `kind` a nivel de bag slot view:

- `equipment`

Y ampliar `PlayerEquipment` para slots reales de gear.

### UI recomendada

#### Mochila

Mostrar:

- rareza
- short name
- slot
- comando de info

#### Info de item

Debe mostrar:

- nombre
- slot
- rareza
- bind state
- nivel requerido
- clase/raza requerida si aplica
- durabilidad
- stats
- efecto especial
- valor estimado
- id unico

#### Comparacion

Muy importante:

Cuando el jugador vea un item equipable, mostrar:

- lo que gana
- lo que pierde

Ejemplo:

- `+4 DEF`
- `+2% Crit`
- `-1.5% Evasion`

Eso mejora muchisimo la UX.

---

## 16. Integracion con PvE y PvP

El gear debe alimentar directamente la fantasia del combate.

### PvE

- loot de criaturas y bosses
- gear por bioma
- gear por zona de nivel
- gear tematico de ruinas/cuevas

### PvP

El gear debe apoyar builds, no reemplazar skill.

Recomendacion:

- los stats del gear deben importar
- pero la ventaja principal debe venir de build + timing + pasivos + posicionamiento

Asi el juego no se vuelve “gana el que tenga 3 items rotos”.

---

## 17. Tematizacion por bioma y fuente

Aqui es donde el mundo se siente vivo.

### Ejemplos por bioma

#### Forest

- cuero
- capuchas
- botas ligeras
- arcos cortos
- amuletos de savia

#### Volcano

- cascos de ceniza
- hojas de escoria
- guantes de forja
- armaduras pesadas
- resist fire/elemental

#### Swamp

- botas de fango
- capas de musgo
- collares toxicos
- resist chemical
- evasión

#### River / Lake

- botas impermeables
- amuletos de pesca
- dagas de coral
- gear de movilidad

#### Highlands / Tundra

- capas densas
- yelmos duros
- resist elemental
- defense

---

## 18. Ejemplos de items generados

### Ejemplo 1

`Capucha del Rastro Silente`

- slot: `head`
- rarity: `rare`
- class: `alchemist_rogue`
- bind: `bind_on_equip`
- stats:
  - `+7 evasion`
  - `+4 crit chance`
  - `+0.006 move speed`

### Ejemplo 2

`Yelmo de Ceniza del Vigia`

- slot: `head`
- rarity: `epic`
- class: `curse_hunter`
- bind: `bind_on_pickup`
- stats:
  - `+18 defense`
  - `+32 maxHp`
  - `+4 resistArcane`
- effect:
  - `cuando HP baja de 50%, ganas +8 defense por 2 turnos`

### Ejemplo 3

`Botas del Pantano Quieto`

- slot: `boots`
- rarity: `rare`
- class: `universal`
- stats:
  - `+0.007 move speed`
  - `+5 chemical resist`
  - `+4 evasion`

### Ejemplo 4

`Espada Corta Cruel de Nova`

- slot: `main_hand`
- rarity: `legendary`
- class: `curse_hunter`
- bind: `soulbound`
- stats:
  - `+24 attack`
  - `+11 crit chance`
  - `+6 base damage`
- effect:
  - `el primer critico del combate aplica herida`

---

## 19. Recomendacion de implementacion por fases

### Fase 1

- crear `EquipmentTemplate`
- crear `EquipmentInstance`
- ampliar `PlayerEquipment`
- ampliar bag slots para `equipment`
- ampliar render de item info

### Fase 2

- integrar stats del gear al runtime
- comparador de item equipado vs item nuevo
- soportar durabilidad y repair

### Fase 3

- drops y generacion procedural base
- loot tables por bioma/zona/fuente
- restricciones clase/raza/bind

### Fase 4

- mercado de gear
- filtros por slot y rareza
- historial de ventas de gear

### Fase 5

- efectos especiales
- sets
- boss loot
- crafting de gear
- salvage y reroll

---

## 20. Recomendacion final

La mejor forma de darle vida al juego no es solo meter “armaduras”.

Lo que realmente hara que el sistema se sienta vivo es combinar:

- gear universal
- gear especializado
- gear soulbound memorable
- gear comerciable con buenos rolls
- gear de oficios/exploracion ademas del gear de combate
- nombres tematicos por bioma, faccion y fuente
- comparacion clara en UI
- valor real en el mercado

### Mi veredicto

El proyecto ya esta en un punto donde este sistema se puede construir bien.

La base actual soporta:

- stats derivados
- economy hooks
- inventario
- mercado
- builds
- muerte
- progression

Lo que falta es abrir el dominio `equipment` como sistema propio y conectarlo a esas piezas.

Si se implementa asi, el gear no sera solo “numeros mas altos”, sino una capa central del MMORPG:

- identidad de build
- fantasia de loot
- economia real
- competencia PvP
- progresion PvE
- exploracion con recompensa

---

## 21. Siguiente paso recomendado

Si quieres construirlo bien desde ya, el siguiente paso correcto es:

1. disenar el schema Prisma de `EquipmentTemplate`, `EquipmentInstance` y slots nuevos
2. definir el catalogo inicial de templates por bioma y tier
3. definir el primer generador procedural con budget y afijos
4. integrarlo a mochila + profile + combate

Ese seria el punto de entrada ideal para empezar la implementacion sin deuda.
