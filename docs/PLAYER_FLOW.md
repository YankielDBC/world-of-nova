# PLAYER_FLOW.md — Flujo del jugador

> Descripción del recorrido completo de un jugador en World of Nova, desde el registro hasta las mecánicas avanzadas. Agnóstico a plataforma.

---

## 1. Registro y creación de personaje

1. El jugador inicia el juego (`/start` o pantalla de inicio web).
2. Selecciona idioma (`es`, `en`, `ru`).
3. Elige un nickname (3–16 caracteres, único).
4. Elige una raza:
   - **Uren**: Dark Druid o Arcane.
   - **Zolk**: Alchemist Rogue o Curse Hunter.
5. El sistema calcula atributos base, stats de combate y crea:
   - Bolsillos (`pockets`).
   - Equipo inicial según clase.
   - Herramientas iniciales opcionales (`/starterkit`).
6. El jugador aparece en el castillo de Nova (o coordenadas iniciales según diseño).

---

## 2. Ciclo básico de exploración

### Mirar alrededor

- El jugador inspecciona el tile actual (`/inspect`).
- Vee:
  - Bioma, clima y período del día.
  - Nodos de recursos disponibles.
  - Loot en el suelo.
  - Criaturas presentes.
  - Lugares cercanos.

### Decidir acción

- **Recolectar**: requiere herramienta y skill adecuada.
- **Moverse 1 tile**: coste de STA según terreno.
- **Viajar lejos** (`/venture`): a coordenadas ya exploradas.
- **Entrar a un lugar**: acceder a servicios.
- **Atacar criatura**: iniciar combate PvE.

### Ejemplo: recolectar madera

1. Jugador está en bosque.
2. Inspect muestra nodo `Wood` (90% spawn, 1–3 uds).
3. Jugador tiene Hacha de Piedra equipada.
4. Acción `chop`:
   - Valida herramienta, skill, período día/noche.
   - Consume STA según rareza, nivel, clima, ciclo.
   - Reduce durabilidad del hacha.
   - Otorga `Wood` y XP de `chop`.
5. Ítems se añaden a bolsa activa.

---

## 3. Gestión de inventario

1. Jugador abre bolsa (`/bag`).
2. Vee peso usado/total y slots usados/total.
3. Puede:
   - Usar consumibles.
   - Tirar ítems al suelo.
   - Equipar herramientas/equipo.
   - Cambiar a otra bolsa si la tiene.
4. Si la bolsa se llena, no puede recoger más hasta liberar espacio.

### Cambio de bolsa

1. Jugador tiene Bolsa de Viaje vacía en inventario.
2. Selecciona "cambiar a Bolsa de Viaje".
3. Sistema calcula si todo cabe en la nueva bolsa.
4. Si cabe: transfiere contenido, activa nueva bolsa, bolsillos pasan a dormant.
5. Si no cabe: muestra razón (peso o slots).

---

## 4. Progresión de personaje

1. El jugador gana XP al derrotar criaturas y completar actividades.
2. Al acumular suficiente XP sube de nivel.
3. Al subir de nivel:
   - Aumenta +1 atributo según `GROWTH_PRIORITY`.
   - Gana puntos de habilidad de clase (`nivel - 1`).
   - Gana puntos de habilidad general (`floor((nivel-3)/2)` a partir de nivel 4).
   - Gana puntos de talento racial (`floor((nivel-1)/2)` a partir de nivel 3).
4. El jugador asigna puntos en `/bs` y `/racial`.
5. Equipa habilidades/talentos activos en slots de loadout.

---

## 5. Combate PvE

1. Jugador encuentra criatura en su tile.
2. Inicia combate (`/combat`).
3. Turno 1:
   - Se muestra intención del enemigo.
   - Jugador elige acción.
4. Resolución:
   - Se calcula evasión, crítico, daño.
   - Se aplican efectos y reacciones.
   - Enemigo ataca si sigue vivo.
5. Turnos siguientes:
   - Aumenta la presión desde turno 3 (`+4%` por turno, máx 32%).
   - Efectos activos se reducen cada turno.
   - Cooldowns bajan.
6. Fin:
   - Victoria: XP, plata, loot.
   - Derrota: modo fantasma.
   - Huida: encuentro termina.

---

## 6. Lugares y servicios

### Nova Castle (lugar inicial)

1. Jugador entra con `/castle` o `/place`.
2. Vee edificios:
   - **Gilded Rest**: recuperar STA.
   - **Mercy Edge**: recuperar HP.
   - **Crow Forge**: reparar/comprar herramientas.
   - **Crown Chamber**: banco y bóveda.
   - **Training Yard**: aprender/practicar skills.
   - **Grand Exchange**: mercado jugador.
3. Selecciona servicio, paga costo, espera o recibe efecto inmediato.

### Pueblo fronterizo

- Similar a Nova Castle pero con servicios reducidos.
- Tiene baúl comunitario (`village_chest`).

### Cuevas

- Algunos lugares permiten entrada a cueva.
- Dentro: movimiento por pasadizos, 1 STA por paso, revelado de mapa.
- Salida: regresa al lugar exterior.

---

## 7. Economía

### Ganar plata

- Derrotar criaturas (drop de monedas).
- Vender recursos/herramientas/bolsas a NPCs.
- Vender recursos en Grand Exchange.
- Vender oro en Grand Exchange.

### Gastar plata

- Recuperación en lugares.
- Reparar/comprar herramientas.
- Entrenamiento.
- Tarifas de banco (depósitos pequeños).
- Tarifas de mercado (5% por transacción).
- SOS de emergencia.
- Reset de build/talentos.

### Banco

1. Jugador deposita plata u oro.
2. Si el depósito > 100 plata de valor, tarifa plana de 10 plata.
3. Si es menor, tarifa del 5% (mínimo 1 plata).
4. Retiros no tienen tarifa.
5. Puede mover objetos entre bolsa y bóveda (20 slots Corona, 10 Pueblo).

### Grand Exchange

1. Jugador crea orden de venta de recurso con precio.
2. Otro jugador compra al mejor precio disponible.
3. Se aplica tarifa del 5% al vendedor.
4. También se pueden crear órdenes de compra/venta de oro.

### Comerciante misterioso

1. Comerciante aparece en coordenadas aleatorias.
2. Envía pistas a un canal (si está configurado).
3. Jugador lo encuentra y puede comprar recursos/herramientas.
4. También puede venderle ítems con multiplicador aleatorio 2–20×.

---

## 8. Muerte y recuperación

1. Jugador muere en combate (HP <= 0).
2. Sistema:
   - Crea cadáver en coordenadas de muerte.
   - Teletransporta jugador a cementerio más cercano.
   - Reduce plata un 10%.
   - Pone HP=0, STA=0, estado=GHOST.
3. Modo fantasma:
   - Solo puede moverse, ver perfil, recuperar cuerpo.
   - Se mueve 1 tile por acción sin consumir STA.
4. Jugador llega a coordenadas del cadáver.
5. Recupera cadáver:
   - Recupera ítems y plata restante.
   - HP y STA restaurados a 50% del máximo.
   - Estado fantasma eliminado.
6. Cadáver pasa a `RECOVERED`.

---

## 9. Flujos de alto nivel

```
[Registro]
   ↓
[Explorar] ──→ [Recolectar] ──→ [Craft/Usar/Vender]
   ↓              ↓
[Combate] ──→ [Victoria] ──→ [XP/Loot]
   ↓
[Derrota] ──→ [Ghost] ──→ [Recuperar cadáver]
   ↓
[Lugares] ──→ [Recovery/Forge/Bank/Market/Training]
   ↓
[Cuevas/Venture/Merchant] ──→ [Progresión]
```

---

## 10. Referencia de implementación

| Flujo | Archivos clave |
|-------|----------------|
| Registro | `src/bot/modules/registration-module.ts` |
| Exploración | `src/services/inspect.ts`, `src/services/map-move.ts` |
| Inventario | `src/services/bags.ts`, `src/services/bags-core.ts` |
| Progresión | `src/types/player.ts`, `src/lib/rpg-attributes.ts`, `src/lib/db.ts` |
| Combate | `src/services/pve-combat*.ts`, `src/services/creature-defeat.ts` |
| Lugares | `src/bot/modules/place-module.ts`, `src/services/place-custom.ts`, `src/services/place-recovery.ts` |
| Economía | `src/services/crown-bank.ts`, `src/services/market-exchange*.ts`, `src/services/mystery-merchant*.ts` |
| Muerte | `src/services/death-system*.ts` |
| Cuevas | `src/services/cave-system*.ts` |
| Viajes | `src/services/travel-countdown.ts`, `src/services/game-jobs.ts` |

---

## Notas para reimplementación

1. **Estado del jugador**: mantener consistente HP, STA, coordenadas, nivel, XP, bolsa activa, equipo, efectos activos, cooldowns.
2. **Persistencia**: todos los cambios deben guardarse antes de enviar respuesta al cliente.
3. **Concurrencia**: evitar que dos acciones simultáneas modifiquen el mismo recurso (locks o transacciones).
4. **Scheduler**: usar trabajos diferidos para acciones que toman tiempo (recovery, venture, respawn, merchant).
5. **Feedback**: cada acción debe informar claramente costo, resultado y próximos pasos.
