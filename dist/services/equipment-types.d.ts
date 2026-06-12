import type { EquipmentBindType, EquipmentContainerType, EquipmentCombatStatKey, EquipmentRarity, EquipmentSlotKey, EquipmentUtilityStatKey } from '../data/equipment.js';
export interface EquipmentStatMap extends Partial<Record<EquipmentCombatStatKey | EquipmentUtilityStatKey, number>> {
}
export interface EquipmentTemplateRuntimeLike {
    id?: number;
    key?: string;
    name?: string;
    shortName?: string | null;
    emoji?: string;
    slot?: EquipmentSlotKey | string | null;
    archetype?: string | null;
    weaponClass?: string | null;
    armorClass?: string | null;
    requiredLevel?: number | null;
    allowedClassesJson?: string | null;
    allowedRacesJson?: string | null;
    bindTypeDefault?: EquipmentBindType | string | null;
    baseValue?: number | null;
    weightKg?: number | null;
    implicitStatProfileJson?: string | null;
    dropFamily?: string | null;
}
export interface EquipmentInstanceRuntimeLike {
    id?: number;
    templateId?: number;
    ownerPlayerId?: number | null;
    currentContainerType?: EquipmentContainerType | string | null;
    currentContainerId?: number | null;
    rarity?: EquipmentRarity | string | null;
    itemLevel?: number | null;
    qualityScore?: number | null;
    bindType?: EquipmentBindType | string | null;
    boundPlayerId?: number | null;
    requiredLevel?: number | null;
    requiredClass?: string | null;
    requiredRace?: string | null;
    durability?: number | null;
    maxDurability?: number | null;
    isBroken?: boolean | null;
    prefixKey?: string | null;
    suffixKey?: string | null;
    implicitStatsJson?: string | null;
    explicitStatsJson?: string | null;
    specialEffectKey?: string | null;
    merchantLocked?: boolean | null;
    tradable?: boolean | null;
    baseMarketValue?: number | null;
    rolledMarketValue?: number | null;
    createdFrom?: string | null;
    template?: EquipmentTemplateRuntimeLike | null;
}
export interface EquipmentUtilityModifiers {
    chopYieldPct?: number;
    mineYieldPct?: number;
    gatherYieldPct?: number;
    fishYieldPct?: number;
    travelStaCostPct?: number;
    passiveStaRegenFlat?: number;
    merchantPriceFavorPct?: number;
    bankFeeReductionPct?: number;
    dropRateMinorPct?: number;
}
export interface EquipmentCombatModifiers {
    maxHpFlat?: number;
    maxHpPct?: number;
    maxEnergyFlat?: number;
    maxEnergyPct?: number;
    maxSoulFlat?: number;
    attackFlat?: number;
    attackPct?: number;
    arcaneFlat?: number;
    arcanePct?: number;
    baseDamageFlat?: number;
    defenseFlat?: number;
    defensePct?: number;
    critChanceFlat?: number;
    evasionFlat?: number;
    atkSpeedFlat?: number;
    atkSpeedPct?: number;
    moveSpeedFlat?: number;
    moveSpeedPct?: number;
    resistPhysicalFlat?: number;
    resistElementalFlat?: number;
    resistArcaneFlat?: number;
    resistHolyFlat?: number;
    resistChemicalFlat?: number;
}
export interface EquipmentModifierBreakdown {
    itemId: number | null;
    templateKey: string;
    slot: string;
    rarity: string;
    implicit: EquipmentStatMap;
    explicit: EquipmentStatMap;
    combined: EquipmentStatMap;
}
export interface EquipmentModifierAggregate {
    combat: EquipmentCombatModifiers;
    utility: EquipmentUtilityModifiers;
    breakdown: EquipmentModifierBreakdown[];
    gearScore: number;
}
