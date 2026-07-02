# World of Nova — Inspiración: Drops de criaturas en WoW

> Cómo World of Warcraft asigna loot a los diferentes tipos de criaturas.

## Fuentes

- Criatura — Wow Archive Fandom (es): `https://wow-archive.fandom.com/es/wiki/Criatura`

---

## Principio general

En WoW el tipo de criatura determina en gran medida qué categorías de ítems puede dejar al morir. No hay una fórmula pública exacta de probabilidad (eso está en la base de datos de Wowhead), pero sí hay reglas de diseño claras.

## Drops por tipo de criatura

| Tipo de criatura | Drops típicos | Profesión relacionada |
|------------------|---------------|----------------------|
| **Bestias** | Pieles, carne, colmillos, plumas, huesos | Desuello, Cocina, Alquimia |
| **Alimañas** | Nada o materiales de cebo | — |
| **Demonios** | Polvos vil, esencias, grimorios | Encantamiento |
| **Dragonantes** | Escamas, cuero grueso | Desuello, Peletería |
| **Elementales** | Esencias elementales, motas, cristales | Encantamiento, Ingeniería, Alquimia |
| **Gigantes** | Trofeos, materiales épicos, monedas | — |
| **Humanoides** | Tela, monedas, objetos de uso, mapas | Sastrería, Primeros Auxilios |
| **Mecánicos** | Piezas de ingeniería, tornillos, polvos | Ingeniería |
| **No muertos** | Tela, huesos, runas, objetos malditos | Encantamiento |
| **No categorizados** | Únicos, reliquias, trofeos de jefe | — |

## Reglas de loot observadas

- **Bestias desollables**: la mayoría de mamíferos, reptiles y dragonantes. Excepciones: aves y cangrejos.
- **Humanoides dropean tela**: fuente principal para Sastrería y Primeros Auxilios.
- **Elementales dropean esencias/motas**: usadas en encantamientos, ingeniería y transmutaciones.
- **Mecánicos dejan chatarra**: ingredientes de Ingeniería.
- **Criaturas de nivel más alto** dropean materiales de tier más alto.
- **Élites y jefes** tienen tablas de loot propias, a menudo con ítems específicos.

## Fórmula conceptual de drops

```
lootTable(criatura) =
  baseLootPorNivel(tipo, nivel)
  + lootPorBioma(bioma)
  + lootEspecialPorCategoría(básico | veterano | élite | jefe)
  + dropGarantizadoDeMisión(si aplica)
```

**Probabilidad aproximada por calidad (observada en bases de datos):**
- Común (gris/blanco): ~70–90%
- Poco común (verde): ~10–25%
- Raro (azul): ~1–5%
- Épico (morado): ~0.1–1%
- Legendario (naranja): ~<0.1%

## Lecciones de diseño para World of Nova

1. **Tipo de criatura = tipo de loot**: coherencia entre bestia y piel, humanoide y tela, elemental y esencia.
2. **Excepciones memorables**: aves y cangrejos no se desollan; esto añade realismo y obliga a buscar otras fuentes.
3. **Rango de criatura afecta rareza**: básicos dropean común, élites y jefes dropean raro/épico.
4. **Bioma modifica loot**: criaturas de frío pueden dropar pieles gruesas; las volcánicas, escamas ígneas.
5. **Profesiones necesitan fuentes claras**: si queremos que Peletería exista, necesitamos bestias que dropeen pieles.

---

*Última actualización: 2026-07-02*
