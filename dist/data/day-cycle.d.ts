import type { Language } from '../lib/i18n.js';
export type DayPeriod = 'dawn' | 'day' | 'dusk' | 'night';
export type DayActionKey = 'gather' | 'chop' | 'mine' | 'fish';
export interface DayPeriodEffects {
    spawnMultiplier: number;
    yieldMultiplier: number;
    energyCostMultiplier: number;
    actionSpawnMultiplier: Record<DayActionKey, number>;
    actionYieldMultiplier: Record<DayActionKey, number>;
    actionEnergyCostMultiplier: Record<DayActionKey, number>;
}
export declare function getDayPeriodEmoji(period: DayPeriod): string;
export declare function getDayPeriodLabel(lang: Language, period: DayPeriod): string;
export declare function getDayPeriodEffects(biomeName: string, period: DayPeriod): DayPeriodEffects;
export declare function getAmbientHint(lang: Language, biomeName: string, period: DayPeriod, seed?: number): string | null;
export declare function isResourceAvailableByPeriod(biomeName: string, resourceName: string, period: DayPeriod): boolean;
