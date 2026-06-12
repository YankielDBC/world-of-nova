import { type DayPeriod } from '../data/day-cycle.js';
import type { Language } from '../lib/i18n.js';
export interface DayCycleSnapshot {
    period: DayPeriod;
    periodIndex: 0 | 1 | 2 | 3;
    cycleIndex: number;
    elapsedInPeriodMs: number;
    remainingInPeriodMs: number;
    nextTransitionAt: Date;
    isEnabled: boolean;
}
export declare function getDayCycleSnapshot(nowMs?: number): DayCycleSnapshot;
export declare function getDayCycleEffectsForBiome(biomeName: string, snapshot: DayCycleSnapshot): import("../data/day-cycle.js").DayPeriodEffects;
export declare function formatDayCycleLine(langRaw: Language | string | null | undefined, snapshot: DayCycleSnapshot): string;
export declare function getDayCycleAmbientLine(langRaw: Language | string | null | undefined, biomeName: string, snapshot: DayCycleSnapshot): string | null;
