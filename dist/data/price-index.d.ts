export declare const PRICE_INDEX: {
    readonly forge: {
        readonly repairQuickSilver: 4;
        readonly repairFullSilver: 10;
        readonly buyStonePickSilver: 8;
        readonly buyStoneAxeSilver: 8;
        readonly buyBambooRodSilver: 9;
    };
    readonly bank: {
        readonly silverPerGold: 100;
        readonly vaultSlotCapacity: 20;
        readonly depositFeeRate: 0.05;
        readonly depositFeeFlatSilver: 10;
        readonly depositFeeFlatThresholdSilver: 100;
    };
    readonly market: {
        readonly tradeFeeRate: 0.05;
        readonly orderBookDepth: 10;
        readonly defaultSilverPerGold: 100;
        readonly maxUnitPriceSilver: 100000;
        readonly maxOrderQuantity: 9999;
        readonly maxGoldPerOrder: 999;
    };
    readonly sell: {
        readonly resourceFactor: 0.25;
        readonly toolFactor: 0.2;
        readonly minResourceSilver: 1;
        readonly minToolSilver: 1;
        readonly minBagSilver: 2;
        readonly bagFactor: 0.35;
    };
};
export declare function getForgeServiceCost(slug: string, fallback?: number): number;
export declare function getResourceSellPrice(baseValue: number): number;
export declare function getToolSellPrice(baseValue: number, durability: number, maxDurability: number): number;
export declare function getStoredBagSellPrice(slotCapacity: number, weightCapacityKg: number): number;
export declare function toSilverValue(currency: 'SILVER' | 'GOLD', amount: number): number;
export declare function getBankDepositFeeSilverByValue(depositSilverValue: number): number;
