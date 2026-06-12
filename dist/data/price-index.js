// @ts-nocheck
export const PRICE_INDEX = {
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
};
const FORGE_COST_BY_SLUG = {
    'crow-forge-repair-quick': PRICE_INDEX.forge.repairQuickSilver,
    'crow-forge-repair-full': PRICE_INDEX.forge.repairFullSilver,
    'crow-forge-buy-pick': PRICE_INDEX.forge.buyStonePickSilver,
    'crow-forge-buy-axe': PRICE_INDEX.forge.buyStoneAxeSilver,
    'crow-forge-buy-fishing-rod': PRICE_INDEX.forge.buyBambooRodSilver,
};
export function getForgeServiceCost(slug, fallback = 0) {
    return FORGE_COST_BY_SLUG[slug] ?? fallback;
}
export function getResourceSellPrice(baseValue) {
    const raw = Math.floor(baseValue * PRICE_INDEX.sell.resourceFactor);
    return Math.max(PRICE_INDEX.sell.minResourceSilver, raw);
}
export function getToolSellPrice(baseValue, durability, maxDurability) {
    const durabilityRatio = maxDurability > 0 ? Math.max(0.2, Math.min(1, durability / maxDurability)) : 0.2;
    const raw = Math.floor(baseValue * PRICE_INDEX.sell.toolFactor * durabilityRatio);
    return Math.max(PRICE_INDEX.sell.minToolSilver, raw);
}
export function getStoredBagSellPrice(slotCapacity, weightCapacityKg) {
    const valueSeed = slotCapacity + weightCapacityKg * 2;
    const raw = Math.floor(valueSeed * PRICE_INDEX.sell.bagFactor);
    return Math.max(PRICE_INDEX.sell.minBagSilver, raw);
}
export function toSilverValue(currency, amount) {
    return currency === 'GOLD' ? amount * PRICE_INDEX.bank.silverPerGold : amount;
}
export function getBankDepositFeeSilverByValue(depositSilverValue) {
    if (depositSilverValue <= 0) {
        return 0;
    }
    if (depositSilverValue > PRICE_INDEX.bank.depositFeeFlatThresholdSilver) {
        return PRICE_INDEX.bank.depositFeeFlatSilver;
    }
    return Math.max(1, Math.ceil(depositSilverValue * PRICE_INDEX.bank.depositFeeRate));
}
//# sourceMappingURL=price-index.js.map