import type { Language } from '../lib/i18n.js';
import { type BagUsage } from './bags.js';
import { type CreatureSnapshot } from './creatures.js';
interface StoredDropLine {
    emoji: string;
    name: string;
    quantity: number;
}
interface RejectedDropLine extends StoredDropLine {
    reason: string;
}
interface XpProgress {
    levelBefore: number;
    levelAfter: number;
    levelsGained: number;
    currentXp: number;
    requiredXp: number;
}
export interface CreatureDefeatSuccess {
    success: true;
    creature: CreatureSnapshot;
    xpAwarded: number;
    silverAwarded: number;
    xpProgress: XpProgress;
    classPointsGained: number;
    generalPointsGained: number;
    racialPointsGained: number;
    storedDrops: StoredDropLine[];
    rejectedDrops: RejectedDropLine[];
    bagUsageAfter: BagUsage | null;
}
export interface CreatureDefeatFailure {
    success: false;
    message: string;
}
export type CreatureDefeatResult = CreatureDefeatSuccess | CreatureDefeatFailure;
export declare function resolveCreatureDefeat(params: {
    playerId: number;
    worldMapId: number;
    x: number;
    y: number;
    creatureId: number;
    lang: Language;
}): Promise<CreatureDefeatResult>;
export declare function buildCreatureDefeatCard(result: CreatureDefeatSuccess, lang: Language): string;
export {};
