import { type Language } from '../lib/i18n.js';
import type { CreatureSnapshot } from './creatures-types.js';
export type { CreatureAttributes, CreatureCategory, CreatureDrop, CreatureSnapshot, CreatureStatus, } from './creatures-types.js';
export declare function ensureCreatureSchema(): Promise<void>;
export declare function getCreatureSnapshotsAtCoords(params: {
    worldMapId: number;
    x: number;
    y: number;
    biomeName: string;
    biomeId?: number | null;
    includeDead?: boolean;
}): Promise<CreatureSnapshot[]>;
export declare function getCreatureSnapshotById(creatureId: number, opts?: {
    worldMapId?: number;
    x?: number;
    y?: number;
}): Promise<CreatureSnapshot | null>;
export declare function markCreatureDefeated(params: {
    creatureId: number;
    killerPlayerId?: number | null;
}): Promise<CreatureSnapshot | null>;
export declare function formatCreatureRespawnLabel(seconds: number, lang: Language): string;
export declare function buildCreatureInfoCard(snapshot: CreatureSnapshot, lang: Language): string;
