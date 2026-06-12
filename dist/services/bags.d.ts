import type { Language } from '../lib/i18n.js';
import { type AddToBagResult, type BagItemInfo, type BagRenderData, type BagSwitchOption, type BagSwitchPreview, type BagUsage, type DroppedToolPickupInput, type DropSlotResult, type GatherActionType, type GatherStoreResult, type UseSlotResult } from './bags-types.js';
export type { BagSlotView, ToolAliasMap, GatherActionType, BagUsage, BagItemInfo, BagRenderData, AddToBagResult, GatherStoreResult, UseSlotResult, DropSlotResult, BagSwitchOption, BagSwitchPreview, } from './bags-types.js';
export declare function ensurePlayerBagSetup(playerId: number): Promise<void>;
export declare function getActiveBagView(playerId: number, lang?: Language): Promise<BagRenderData>;
export declare function getActiveBagUsage(playerId: number): Promise<BagUsage | null>;
export declare function addResourceToActiveBag(playerId: number, resourceName: string, quantity: number): Promise<AddToBagResult>;
export declare function storeGatheredItems(playerId: number, items: Array<{
    item: string;
    emoji: string;
    quantity: number;
}>): Promise<GatherStoreResult>;
export declare function useBagSlot(playerId: number, slotIndex: number, quantity: number): Promise<UseSlotResult>;
export declare function dropBagSlot(playerId: number, slotIndex: number, quantity: number): Promise<DropSlotResult>;
export declare function listBagSwitchOptions(playerId: number): Promise<BagSwitchOption[]>;
export declare function previewBagSwitch(playerId: number, targetId: number | 'pockets'): Promise<BagSwitchPreview>;
export declare function executeBagSwitch(playerId: number, targetId: number | 'pockets'): Promise<UseSlotResult>;
export declare function grantBagToPlayer(playerId: number, bagSlug: string): Promise<UseSlotResult>;
export declare function getActiveBagItemInfoByUid(playerId: number, slotUid: number): Promise<BagItemInfo | null>;
export declare function equipToolFromBagItem(playerId: number, slotUid: number): Promise<UseSlotResult>;
export declare function equipToolByAlias(playerId: number, alias: string): Promise<UseSlotResult>;
export declare function unequipToolByAlias(playerId: number, alias: string): Promise<UseSlotResult>;
export declare function unequipEquipmentByAlias(playerId: number, alias: string): Promise<UseSlotResult>;
export declare function grantToolToPlayer(playerId: number, toolKey: string, options?: {
    merchantLocked?: boolean;
}): Promise<UseSlotResult>;
export declare function pickupDroppedTool(playerId: number, input: DroppedToolPickupInput): Promise<UseSlotResult>;
export declare function pickupDroppedBag(playerId: number, bagSlug?: string): Promise<UseSlotResult>;
export declare function pickupDroppedEquipment(playerId: number, input: {
    equipmentInstanceId?: number;
    templateKey?: string;
    emoji: string;
    name: string;
}): Promise<UseSlotResult>;
export declare function getEquippedToolForAction(playerId: number, action: GatherActionType): Promise<import("./bags-types.js").EquippedToolResult>;
export declare function applyDurabilityDamageOnEquippedTool(playerId: number, action: GatherActionType, damage: number): Promise<import("./bags-types.js").DurabilityDamageResult>;
export declare function getEquipmentCard(playerId: number): Promise<string>;
