import type { EquipmentInstanceRuntimeLike, EquipmentModifierAggregate, EquipmentModifierBreakdown, EquipmentStatMap } from './equipment-types.js';
export declare function parseEquipmentStatsJson(raw: string | null | undefined): EquipmentStatMap;
export declare function buildEquipmentModifierBreakdown(item: EquipmentInstanceRuntimeLike): EquipmentModifierBreakdown;
export declare function collectEquipmentModifiers(items: EquipmentInstanceRuntimeLike[]): EquipmentModifierAggregate;
