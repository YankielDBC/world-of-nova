import type { EquipmentBindType, EquipmentSlotKey } from './equipment.js';
export interface EquipmentTemplateSeed {
    key: string;
    name: string;
    shortName: string;
    emoji: string;
    slot: EquipmentSlotKey;
    archetype: string;
    weaponClass?: string;
    armorClass?: string;
    description: string;
    requiredLevel: number;
    allowedClasses?: string[];
    allowedRaces?: string[];
    bindTypeDefault: EquipmentBindType;
    baseValue: number;
    weightKg: number;
    salvageTableKey?: string;
    implicitStatProfile: Record<string, number>;
    dropFamily: string;
}
export declare const EQUIPMENT_TEMPLATE_CATALOG: EquipmentTemplateSeed[];
