import type { BuildGameplayEffects, BuildSkillRow } from './build-skills-types.js';
export declare function cloneEffects(input: BuildGameplayEffects): BuildGameplayEffects;
export declare function toNumber(value: unknown, fallback?: number): number;
export declare function toDateMs(value: Date | string | null | undefined): number;
export declare function normalizeSkillKey(raw: string | null | undefined): string;
export declare function clamp(value: number, min: number, max: number): number;
export declare function roundTo(value: number, decimals: number): number;
export declare function getSpentPointsForFamily(ranksByKey: Record<string, number>, family: 'class' | 'general'): number;
export declare function rankMap(rows: BuildSkillRow[]): Record<string, number>;
