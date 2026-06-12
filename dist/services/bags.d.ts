import { addResourceToActiveBag, storeGatheredItems, useBagSlot, dropBagSlot, grantBagToPlayer, pickupDroppedEquipment } from './bags-actions.js';
export { addResourceToActiveBag, storeGatheredItems, useBagSlot, dropBagSlot, grantBagToPlayer, pickupDroppedEquipment };
export declare function ensurePlayerBagSetup(playerId: any): Promise<void>;
export declare function getActiveBagView(playerId: any, lang?: string): Promise<{
    text: string;
    keyboard: import("grammy").InlineKeyboard;
    usage: {
        usedSlots: any;
        totalSlots: any;
        usedWeightKg: number;
        totalWeightKg: any;
    };
    slots: any;
    toolAliasMap: {};
}>;
export declare function getActiveBagUsage(playerId: any): Promise<{
    usedSlots: any;
    totalSlots: any;
    usedWeightKg: number;
    totalWeightKg: any;
}>;
export declare function listBagSwitchOptions(playerId: any): Promise<any[]>;
export declare function previewBagSwitch(playerId: any, targetId: any): Promise<{
    success: boolean;
    reason: string;
    option?: undefined;
    targetUsage?: undefined;
} | {
    success: boolean;
    option: {
        bagId: any;
        emoji: any;
        label: any;
        usageLabel: string;
    };
    targetUsage: {
        slotUsage: string;
        weightUsage: string;
    };
    reason?: undefined;
}>;
export declare function executeBagSwitch(playerId: any, targetId: any): Promise<{
    success: boolean;
    message: string;
}>;
export declare function getActiveBagItemInfoByUid(playerId: any, slotUid: any): Promise<{
    slotUid: number;
    slotIndex: number;
    bagId: number;
    kind: string;
    emoji: string;
    label: string;
    rarityCode: string;
    quantity: number;
    usable: boolean;
    effectType: string;
    effectValue: number;
    description: string;
    uniqueObjectId: string;
    equipmentInstanceId?: undefined;
    durability?: undefined;
    maxDurability?: undefined;
    isBroken?: undefined;
    equipmentSlot?: undefined;
    bindType?: undefined;
    itemLevel?: undefined;
    requiredLevel?: undefined;
    requiredClass?: undefined;
    requiredRace?: undefined;
    specialEffectKey?: undefined;
    toolKey?: undefined;
    playerToolId?: undefined;
    requiredSkill?: undefined;
} | {
    slotUid: number;
    slotIndex: number;
    bagId: number;
    kind: string;
    emoji: string;
    label: string;
    rarityCode: string;
    quantity: number;
    usable: boolean;
    description: string;
    uniqueObjectId: string;
    effectType?: undefined;
    effectValue?: undefined;
    equipmentInstanceId?: undefined;
    durability?: undefined;
    maxDurability?: undefined;
    isBroken?: undefined;
    equipmentSlot?: undefined;
    bindType?: undefined;
    itemLevel?: undefined;
    requiredLevel?: undefined;
    requiredClass?: undefined;
    requiredRace?: undefined;
    specialEffectKey?: undefined;
    toolKey?: undefined;
    playerToolId?: undefined;
    requiredSkill?: undefined;
} | {
    slotUid: number;
    slotIndex: number;
    bagId: number;
    kind: string;
    emoji: string;
    label: string;
    rarityCode: string;
    quantity: number;
    usable: boolean;
    equipmentInstanceId: number;
    durability: number;
    maxDurability: number;
    isBroken: boolean;
    description: string;
    equipmentSlot: any;
    bindType: string;
    itemLevel: number;
    requiredLevel: number;
    requiredClass: string;
    requiredRace: string;
    specialEffectKey: string;
    uniqueObjectId: string;
    effectType?: undefined;
    effectValue?: undefined;
    toolKey?: undefined;
    playerToolId?: undefined;
    requiredSkill?: undefined;
} | {
    slotUid: number;
    slotIndex: number;
    bagId: number;
    kind: string;
    emoji: any;
    label: any;
    rarityCode: string;
    quantity: number;
    usable: boolean;
    toolKey: any;
    playerToolId: number;
    durability: number;
    maxDurability: number;
    isBroken: boolean;
    description: any;
    requiredSkill: string;
    requiredLevel: number;
    uniqueObjectId: string;
    effectType?: undefined;
    effectValue?: undefined;
    equipmentInstanceId?: undefined;
    equipmentSlot?: undefined;
    bindType?: undefined;
    itemLevel?: undefined;
    requiredClass?: undefined;
    requiredRace?: undefined;
    specialEffectKey?: undefined;
}>;
export declare function equipToolFromBagItem(playerId: any, slotUid: any): Promise<{
    success: boolean;
    message: string;
}>;
export declare function equipToolByAlias(playerId: any, alias: any): Promise<{
    success: boolean;
    message: string;
}>;
export declare function unequipToolByAlias(playerId: any, alias: any): Promise<{
    success: boolean;
    message: string;
}>;
export declare function unequipEquipmentByAlias(playerId: any, alias: any): Promise<{
    success: boolean;
    message: string;
}>;
export declare function grantToolToPlayer(playerId: any, toolKey: any, options: any): Promise<{
    success: boolean;
    message: string;
}>;
export declare function pickupDroppedTool(playerId: any, input: any): Promise<{
    success: boolean;
    message: string;
}>;
export declare function pickupDroppedBag(playerId: any, bagSlug: any): Promise<{
    success: boolean;
    message: string;
}>;
export declare function getEquippedToolForAction(playerId: any, action: any): Promise<{
    instance: {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        rarity: string;
        playerId: number;
        toolKey: string;
        merchantLocked: boolean;
        durability: number;
        maxDurability: number;
        isBroken: boolean;
    };
    toolKey: string;
}>;
export declare function applyDurabilityDamageOnEquippedTool(playerId: any, action: any, damage: any): Promise<{
    brokeNow: boolean;
    nowBroken: boolean;
    durability: number;
    maxDurability: number;
    toolName: any;
    emoji: any;
}>;
export declare function getEquipmentCard(playerId: any): Promise<string>;
