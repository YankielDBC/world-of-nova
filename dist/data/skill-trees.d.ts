export type SkillFamily = 'class' | 'general';
export type SkillType = 'passive' | 'active' | 'keystone' | 'reaction';
export type SkillCategory = 'offense' | 'defense' | 'mobility' | 'utility' | 'reaction' | 'keystone';
export type SkillClassKey = 'curse_hunter' | 'arcane' | 'dark_druid' | 'alchemist_rogue';
export type SkillEventKey = 'on_turn_start' | 'on_hit_taken' | 'on_crit_taken' | 'on_crit_evaded' | 'on_crit_blocked' | 'on_hp_below_threshold' | 'on_sta_below_threshold';
export type BuildActionKey = 'chop' | 'mine' | 'gather' | 'fish';
export interface LocalizedText3 {
    es: string;
    en: string;
    ru: string;
}
export interface BuildCombatModifierSet {
    attackPct?: number;
    arcanePct?: number;
    defensePct?: number;
    moveSpeedPct?: number;
    atkSpeedPct?: number;
    maxHpFlat?: number;
    maxEnergyFlat?: number;
    attackFlat?: number;
    arcaneFlat?: number;
    defenseFlat?: number;
    critChanceFlat?: number;
    evasionFlat?: number;
    resistPhysicalFlat?: number;
    resistElementalFlat?: number;
    resistArcaneFlat?: number;
    resistHolyFlat?: number;
    resistChemicalFlat?: number;
}
export interface BuildSkillEffectSet {
    combatModifiers?: BuildCombatModifierSet;
    travelStaminaCostMultiplierDelta?: number;
    travelTimeMultiplierDelta?: number;
    actionEnergyCostMultiplierDelta?: Partial<Record<BuildActionKey, number>>;
    actionYieldMultiplierDelta?: Partial<Record<BuildActionKey, number>>;
    passiveStaRegenBonusDelta?: number;
    counterAttackRatio?: number;
}
export interface BuildSkillCondition {
    hpBelowPct?: number;
    hpAbovePct?: number;
    staBelowPct?: number;
    staAbovePct?: number;
}
export interface BuildConditionalEffect {
    condition: BuildSkillCondition;
    effects: BuildSkillEffectSet;
}
export interface BuildActiveConfig {
    cooldownSeconds: number;
    castSeconds: number;
    durationSeconds: number;
    effects: BuildSkillEffectSet;
}
export interface BuildReactionConfig {
    event: SkillEventKey;
    cooldownSeconds: number;
    durationSeconds: number;
    effects: BuildSkillEffectSet;
    condition?: BuildSkillCondition;
}
export interface BuildSkillDefinition {
    key: string;
    family: SkillFamily;
    classKey?: SkillClassKey;
    type: SkillType;
    category: SkillCategory;
    maxRank: number;
    costPerRank: number;
    sortOrder: number;
    name: LocalizedText3;
    summary: LocalizedText3;
    prerequisites?: string[];
    passiveEffectsPerRank?: BuildSkillEffectSet;
    passiveEffectsFlat?: BuildSkillEffectSet;
    conditionalEffectsPerRank?: BuildConditionalEffect[];
    activeConfig?: BuildActiveConfig;
    reactionConfig?: BuildReactionConfig;
}
export declare function getClassSkillDefinitions(classKey: string | null | undefined): BuildSkillDefinition[];
export declare function getGeneralSkillDefinitions(): BuildSkillDefinition[];
export declare function getBuildSkillByKey(skillKeyRaw: string): BuildSkillDefinition | null;
export declare function getClassSkillPointsForLevel(level: number): number;
export declare function getGeneralSkillPointsForLevel(level: number): number;
export declare function getLocalizedText3(text: LocalizedText3, lang: 'es' | 'en' | 'ru'): string;
