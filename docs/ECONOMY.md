# ECONOMY.md — Economía del juego

> Sistemas económicos: moneda, banco, mercado, comerciante misterioso, precios y tarifas. Agnóstico a plataforma.

---

## 1. Moneda

### Oro y plata

```
1 oro = 100 plata
```

El jugador tiene dos campos de moneda:
- `gold`
- `silver`

### Conversiones comunes

- Depósitos/retiros en banco pueden ser en oro o plata.
- El mercado de divisas permite cambiar oro por plata entre jugadores.

---

## 2. Precios base

Archivo de referencia: `src/data/price-index.ts`.

```typescript
PRICE_INDEX = {
  forge: {
    repairQuickSilver: 4,
    repairFullSilver: 10,
    buyStonePickSilver: 8,
    buyStoneAxeSilver: 8,
    buyBambooRodSilver: 9,
  },
  bank: {
    silverPerGold: 100,
    vaultSlotCapacity: 20,
    depositFeeRate: 0.05,
    depositFeeFlatSilver: 10,
    depositFeeFlatThresholdSilver: 100,
  },
  market: {
    tradeFeeRate: 0.05,
    orderBookDepth: 10,
    defaultSilverPerGold: 100,
    maxUnitPriceSilver: 100000,
    maxOrderQuantity: 9999,
    maxGoldPerOrder: 999,
  },
  sell: {
    resourceFactor: 0.25,
    toolFactor: 0.2,
    minResourceSilver: 1,
    minToolSilver: 1,
    minBagSilver: 2,
    bagFactor: 0.35,
  },
}
```

---

## 3. Crown Bank — Banco Real

### Capacidad de bóveda

| Perfil | Slots | Peso máximo |
|--------|-------|-------------|
| Corona (`crown`) | 20 | 9999 kg |
| Pueblo (`village`) | 10 | 9999 kg |

### Depósitos y retiros

Funciones:
- `depositToVault(playerId, currency, amount)` — sin tarifa.
- `depositToVaultWithFee(playerId, currency, amount)` — con tarifa.
- `withdrawFromVault(playerId, currency, amount)` — sin tarifa.

### Tarifa de depósito

```
valorPlata = currency === 'GOLD' ? amount * 100 : amount

if valorPlata <= 0:
  tarifa = 0
elif valorPlata > 100:
  tarifa = 10  // plano
else:
  tarifa = max(1, ceil(valorPlata * 0.05))
```

| Rango (valor plata) | Tarifa |
|---------------------|--------|
| 0 | 0 |
| 1–100 | `max(1, ceil(valor * 0.05))` |
| > 100 | 10 plata |

**Depósito de oro**: se descuenta el oro; la tarifa se paga en plata.

### Movimiento de objetos

`moveVaultObject(playerId, direction, slotUid, quantity, profile)`

- Direcciones: `bag_to_vault`, `vault_to_bag`.
- Restricciones:
  - No mover herramientas equipadas.
  - Respetar peso y slots de la bolsa activa.
  - Apilar recursos según reglas de la bolsa.
  - Objetos no apilables ocupan 1 slot.

### Valor de mercado en bóveda

- Recurso: `max(1, floor(baseValue * quantity))`
- Herramienta: `baseValue * max(0.25, durability/maxDurability)`
- Bolsa almacenada: fórmula específica según capacidad.

---

## 4. Grand Exchange — Mercado jugador

### Tipos de orden

**Ítems (recursos):**
- Solo órdenes de **venta** (`side: 'SELL'`).
- El comprador ejecuta compra al mejor precio (`buyItemAtBestAsks`).

**Divisas (oro/plata):**
- Órdenes `BUY_GOLD` y `SELL_GOLD`.
- Emparejamiento automático.

### Tarifa de transacción

```
TRADE_FEE_RATE = 0.05
tarifa = max(1, ceil(importeBrutoPlata * 0.05))
```

El vendedor recibe `importeBrutoPlata - tarifa`.

### Crear orden de venta de ítem

```
createItemSellOrder(playerId, resourceId, quantity, priceSilver)
quantity ∈ [1, 9999]
priceSilver ∈ [1, 100000]
```

Los ítems se reservan de la bolsa activa.

### Comprar ítem

```
buyItemAtBestAsks(playerId, resourceId, quantity)
```

- Compra al mejor precio (orden ascendente).
- No puede comprarse a sí mismo.
- Puede ser parcial si no alcanza la plata.
- Los ítems se entregan a la bolsa activa.

### Cancelar orden de ítem

```
cancelItemOrder(playerId, orderId)
```

Devuelve los ítems restantes a la bolsa.

### Órdenes de divisa

**Comprar oro (`BUY_GOLD`):**
- Reserva: `goldAmount * priceSilverPerGold` plata.
- Empareja con `SELL_GOLD` cuyo precio sea `<=` precio ofertado.
- Precio de ejecución = precio del maker.

**Vender oro (`SELL_GOLD`):**
- Reserva: `goldAmount` oro.
- Empareja con `BUY_GOLD` cuyo precio sea `>=` precio ofertado.

### Límites del mercado

| Concepto | Límite |
|----------|--------|
| Precio máximo por unidad | 100.000 plata |
| Cantidad máxima ítem | 9.999 |
| Oro máximo por orden | 999 |
| Profundidad del libro | 10 niveles |
| Precio por defecto oro | 100 plata/oro |

---

## 5. Comerciante Misterioso

### Configuración

```
merchantCount = 2
merchantSweepIntervalMs = 15000
merchantStayMinSeconds = 300
merchantStayMaxSeconds = 3600
merchantRumorRadius = 18
merchantEtaSecondsPerTile = 3
merchantPerimeterMargin = 10
merchantMaxDistanceToDiscovered = 12
merchantFallbackRadius = 25
```

### Movimiento

- Se mueve 1 tile cardinal (N/S/E/O).
- Evita volver al tile anterior si es posible.
- No puede compartir tile con otro comerciante.
- Debe permanecer dentro de área descubierta + margen de 10 tiles.
- Debe estar a máximo 12 tiles de una casilla descubierta.
- Tiempo de estancia aleatorio entre 5 y 60 minutos.

### Rumores

- Envía pista a canal configurado (`@rpgalert` por defecto).
- Incluye coordenadas aproximadas y ETA.
- Si `communityProgressOnly = true`, no envía alertas.

### Ofertas

`generateMerchantOffers()`:
- 3–4 recursos aleatorios.
- 2 herramientas aleatorias.
- Total 5–6 ofertas.
- Stock recursos: `random(1, min(maxStack, 12))`.
- Stock herramientas: 1.
- Precio: `floor(baseValue * randomFloat(0.7, 1.3))`, mínimo 1 plata.

### Venta al comerciante

```
buybackMultiplier = randomInt(2, 20)

Recursos:
  price = floor(baseValue * buybackMultiplier) por unidad

Herramientas:
  price = floor(baseValue * toolFactor * durabilityRatio * buybackMultiplier)

Bolsas vacías:
  price = floor((slotCapacity + weightCapacityKg * 2) * 0.75 * buybackMultiplier)
```

**Restricción**: no se puede vender un objeto comprado al mismo comerciante (bloqueo `merchantLocked`).

### Compra al comerciante

- Precio fijo de la oferta.
- Si no cabe en la bolsa, se reembolsa el dinero.

---

## 6. SOS — Entrega de emergencia

```
SOS_COST_SILVER = 5
SOS_DAILY_LIMIT = 2
SOS_MONTHLY_LIMIT = 10
```

Contenido:
- 1 o 2 frutas (Apple, Orange, Mango, Coconut) con 50% de probabilidad cada una.
- Se entrega mediante `storeGatheredItems()`.
- Si la bolsa está llena, los ítems pueden ser rechazados.

---

## 7. Venta a NPCs genéricos

### Recursos

```
getResourceSellPrice(baseValue) = max(1, floor(baseValue * 0.25))
```

### Herramientas

```
durabilityRatio = max(0.2, min(1, durability/maxDurability))
getToolSellPrice(baseValue) = max(1, floor(baseValue * 0.2 * durabilityRatio))
```

### Bolsas almacenadas

```
getStoredBagSellPrice(slotCapacity, weightCapacityKg) =
  max(2, floor((slotCapacity + weightCapacityKg * 2) * 0.35))
```

---

## 8. Sinks y faucets

### Faucets (entradas de dinero)

- Drop de plata de criaturas.
- Venta a NPCs y comerciante misterioso.
- Venta en Grand Exchange.

### Sinks (salidas de dinero)

- Recuperación en lugares.
- Reparación y compra de herramientas.
- Entrenamiento.
- Tarifas de banco (depósitos pequeños).
- Tarifas de mercado (5%).
- SOS.
- Reset de build/talentos.

---

## 9. Referencia de implementación

| Archivo | Función/constante clave |
|---------|-------------------------|
| `src/data/price-index.ts` | `PRICE_INDEX`, `getForgeServiceCost`, `getResourceSellPrice`, `getToolSellPrice`, `getStoredBagSellPrice`, `getBankDepositFeeSilverByValue`, `toSilverValue` |
| `src/services/crown-bank.ts` | `depositToVault`, `withdrawFromVault`, `moveVaultObject`, `getBankSummary` |
| `src/services/crown-bank-core.ts` | `VAULT_PROFILE_CONFIG`, `getSlotMarketValueSilver` |
| `src/services/market-exchange-item.ts` | `createItemSellOrder`, `buyItemAtBestAsks`, `cancelItemOrder` |
| `src/services/market-exchange-fx.ts` | `placeCurrencyOrderAndMatch`, `cancelCurrencyOrder` |
| `src/services/market-exchange-constants.ts` | `TRADE_FEE_RATE`, `calcTradeFeeSilver` |
| `src/services/mystery-merchant-state.ts` | `generateMerchantOffers`, `getRandomStaySeconds` |
| `src/services/mystery-merchant-actions.ts` | `sellToMerchant`, `buyFromMerchant` |
| `src/services/sos.ts` | `requestSosDelivery`, `rollSosDrops` |

---

## Notas para reimplementación

1. **Dos divisas**: mantener oro y plata separados; 1:100 es la relación base.
2. **Tarifas**: siempre calcular y mostrar antes de confirmar transacción.
3. **Reservas de mercado**: al crear orden, bloquear ítems/dinero hasta que se llene o cancele.
4. **Comerciante misterioso**: usar scheduler para moverlo y enviar pistas.
5. **SOS**: respetar límites diarios/mensuales por jugador.
6. **Precios NPC**: son referencias; el mercado jugador determina precio real.
7. **Persistencia**: todas las transacciones deben ser atómicas para evitar duplicación de dinero/ítems.
