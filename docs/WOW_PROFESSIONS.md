# World of Nova — Inspiración: Profesiones de WoW

> Resumen del sistema de profesiones de World of Warcraft (Retail) como referencia de diseño para World of Nova.

## Fuentes

- Profesión — Wow Archive Fandom (es): `https://wow-archive.fandom.com/es/wiki/Profesión`
- Profession — WoWpedia (en): `https://wow.gamepedia.com/Profession`

---

## Visión general

En WoW los jugadores pueden aprender **profesiones** independientemente de clase, raza o facción. Se aprenden de instructores y de fórmulas/recetas obtenidas en el mundo. Al practicarlas suben de nivel de habilidad, permitiendo crear objetos de mayor valor.

- Cada jugador puede tener **2 profesiones primarias** simultáneas (opcionales).
- Puede aprender **todas las profesiones secundarias** que quiera.
- Algunas profesiones son habilidades de clase (ganzúa del pícaro, forja de runas del DK).

---

## Profesiones primarias

### Recolección

| Profesión | Qué recolecta | Uso principal |
|-----------|---------------|---------------|
| **Herboristería** | Hierbas del mundo y elementales | Alquimia, Inscripción |
| **Minería** | Menas, gemas, piedras de filones | Herrería, Ingeniería, Joyería |
| **Desuello** | Pieles de bestias muertas | Peletería |

### Producción

| Profesión | Qué crea | Especializaciones típicas |
|-----------|----------|---------------------------|
| **Alquimia** | Pociones, elíxires, aceites, transmutaciones | Pociones, Elíxires, Transmutación |
| **Herrería** | Armas y armaduras de placas/metal, beneficios temporales | Forjador de armas, Forjador de armaduras |
| **Encantamiento** | Mejoras para armas/armaduras; desencanta objetos mágicos | — |
| **Ingeniería** | Dispositivos mecánicos, munición, explosivos, artefactos | Ingeniería goblin, Ingeniería gnoma |
| **Inscripción** | Glifos, cartas, pergaminos | — |
| **Joyería** | Anillos, collares, gemas | — |
| **Peletería** | Armaduras de cuero, parches, objetos de piel | Dragonscale, Elemental, Tribal |
| **Sastrería** | Bolsas, armaduras de tela, monturas, camisas, hilos | Primal Mooncloth, Shadowcloth, Spellcloth |

## Profesiones secundarias

| Profesión | Qué hace |
|-----------|----------|
| **Cocina** | Prepara comidas con beneficios temporales |
| **Pesca** | Atrapa peces de lagos, ríos y océanos |
| **Primeros Auxilios** | Vendajes y remedios para curación |
| **Arqueología** | Desentierra objetos de valor y recompensas |

## Profesiones variadas / de clase

| Habilidad | Tipo | Uso |
|-----------|------|-----|
| **Ganzúa** | Clase (Pícaro) | Abrir puertas, cofres y cajas cerradas |
| **Forja de runas** | Clase (Caballero de la Muerte) | Engarzar armas con runas |
| **Equitación** | Habilidad | Usar monturas más rápidas |
| **Reajustar** | Servicio (Cataclysm+) | Modificar bonus de objetos para joyeros/ingenieros/etc. |

---

## Curva de habilidad (Retail aproximada)

| Rango | Nivel típico | Color de receta | Probabilidad de subir |
|-------|--------------|-----------------|----------------------|
| Óptimo | Actual + 0–10 | Naranja | 100% |
| Medio | Actual + 11–20 | Amarillo | Alta, decreciente |
| Difícil | Actual + 21–30 | Verde | Baja |
| Trivial | Actual + 31+ | Gris | 0% |

En Retail las profesiones actuales usan un sistema de niveles por expansión (1–100 por expansión) y conocimiento de especialización. Para Classic/Vanilla el cap era 300, TBC 375, WotLK 450.

**Fórmula conceptual de XP/habilidad:**
- Cada receta otorga un punto de habilidad si está en rango naranja o amarillo.
- Verde puede dar puntos ocasionalmente.
- Gris nunca da puntos.
- El coste de materiales escala con la dificultad y la rareza de la receta.

---

## Lecciones de diseño para World of Nova

1. **Profesiones primarias limitadas**: obliga a elegir y fomenta el comercio entre jugadores.
2. **Sinergia recolección → producción**: Minería alimenta Herrería/Ingeniería; Desuello alimenta Peletería; Herboristería alimenta Alquimia/Inscripción.
3. **Profesiones secundarias universales**: Cocina, Pesca y Primeros Auxilios dan utilidad sin forzar elecciones difíciles.
4. **Especializaciones**: ramas dentro de una profesión permiten diferenciación (pociones vs transmutación, armas vs armaduras).
5. **Recetas descubribles**: algunas se compran, otras se lootan, otras se descubren; esto incentiva exploración y economía.
6. **Habilidades de clase vinculadas**: Ganzúa y Forja de Runas muestran que no todo tiene que ser profesión genérica.

---

## Texto original resumido

> center
> Una profesión es un arte o habilidad que los jugadores de  pueden aprender sin distinción de su clase, facción o raza. Las profesiones se aprenden de los instructores específicos y de fórmulas obtenibles de diversas formas. Adicionalmente cada profesión puede ir acompañada de habilidades específicas que se complementan con las del propio personaje y que le ayudan a aumentar el nivel de habilidad de dicha profesión.
> A través de la práctica, los jugadores puede aumentar su nivel de habilidad hasta las más altas cotas consiguiendo objetos de mayor valor tanto para él como para los demás jugadores a quienes puede ofrecérselos a través de intercambios. Cada jugador puede elegir 2 profesiones principales a las que dedicarse, muchas de las cuales están íntimamente relacionadas. Adicionalmente existen profesiones secundarias que todo jugador puede desempeñar sin límite de ellas y otras específicas de clase.
>  Historia 
> {| class="darktable zebra"
> ! Expansión !! Profesiones primarias y secundarias
> |-
> |  || Alquimia - Desuello - Encantamiento - Herboristería - Herrería - Ingeniería - Minería - Peletería - Sastrería - Cocina - Pesca - Primeros Auxilios - Equitación
> |-
> |  || Joyería
> |-
> |  || Inscripción
> |-
> |  || Arqueología - Reajustar
> |}
>  Tipos de profesiones 
> Las profesiones se dividen en dos tipos: primarias y secundarias. Sólo puedes tener 2 profesiones primarias al mismo tiempo, pero no es obligatorio aprenderlas. En cambio, puedes aprender todas las profesiones secundarias que quieras.
> Así mismo las profesiones también pueden dividirse en:
> *Recolección: Son para recoger y colectar objetos que se encuentran en el mundo para incrementar su habilidad.
> *Producción: Profesiones para crear objetos consumibles como armas, armaduras y hechizos.
> *Servicio: Se trata de mejorar los objetos que se recolectan como: cuero, barras de metal y hierbas.Profesiones para crear objetos consumibles como armas, armaduras y hechizos.
>  Profesiones Primarias 
> Recolección
> {| class="darktable zebra"
> |- align=center
> ! Profesión !! Descripción
> |- align=center

---

*Última actualización: 2026-07-02*
