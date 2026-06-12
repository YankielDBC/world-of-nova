import type { BagItemInfo, DroppedToolPickupInput, DurabilityDamageResult, EquippedToolResult, GatherActionType, UseSlotResult } from './bags-types.js';
export declare function getActiveBagItemInfoByUidImpl(playerId: number, slotUid: number): Promise<BagItemInfo | null>;
export declare function equipToolFromBagItemImpl(playerId: number, slotUid: number): Promise<UseSlotResult>;
export declare function equipToolByAliasImpl(playerId: number, alias: string): Promise<UseSlotResult>;
export declare function unequipToolByAliasImpl(playerId: number, alias: string): Promise<UseSlotResult>;
export declare function unequipEquipmentByAliasImpl(playerId: number, alias: string): Promise<UseSlotResult>;
export declare function grantToolToPlayerImpl(playerId: number, toolKey: string, options?: {
    merchantLocked?: boolean;
}): Promise<UseSlotResult>;
export declare function pickupDroppedToolImpl(playerId: number, input: DroppedToolPickupInput): Promise<UseSlotResult>;
export declare function getEquippedToolForActionImpl(playerId: number, action: GatherActionType): Promise<EquippedToolResult>;
export declare function applyDurabilityDamageOnEquippedToolImpl(playerId: number, action: GatherActionType, damage: number): Promise<DurabilityDamageResult>;
export declare function getEquipmentCardImpl(playerId: number): Promise<string>;
