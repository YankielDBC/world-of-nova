export declare const PRICE_INDEX: {
    forge: {
        repairQuickSilver: number;
        repairFullSilver: number;
        buyStonePickSilver: number;
        buyStoneAxeSilver: number;
        buyBambooRodSilver: number;
    };
    bank: {
        silverPerGold: number;
        vaultSlotCapacity: number;
        depositFeeRate: number;
        depositFeeFlatSilver: number;
        depositFeeFlatThresholdSilver: number;
    };
    market: {
        tradeFeeRate: number;
        orderBookDepth: number;
        defaultSilverPerGold: number;
        maxUnitPriceSilver: number;
        maxOrderQuantity: number;
        maxGoldPerOrder: number;
    };
    sell: {
        resourceFactor: number;
        toolFactor: number;
        minResourceSilver: number;
        minToolSilver: number;
        minBagSilver: number;
        bagFactor: number;
    };
};
export declare function getForgeServiceCost(slug: any, fallback?: number): any;
export declare function getResourceSellPrice(baseValue: any): number;
export declare function getToolSellPrice(baseValue: any, durability: any, maxDurability: any): number;
export declare function getStoredBagSellPrice(slotCapacity: any, weightCapacityKg: any): number;
export declare function toSilverValue(currency: any, amount: any): any;
export declare function getBankDepositFeeSilverByValue(depositSilverValue: any): number;
