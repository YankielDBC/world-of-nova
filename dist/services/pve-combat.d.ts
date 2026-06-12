import type { Language } from '../lib/i18n.js';
import type { PveActionRequest, PveActionResult, PveEncounterState, PveEncounterView } from './pve-combat-types.js';
export type { CombatAbilityChoice, PveActionRequest, PveActionResult, PveEncounterState, PveEncounterView, } from './pve-combat-types.js';
export { getCreatureScoutText } from './pve-combat-content.js';
export { getPvePressurePct } from './pve-combat-engine.js';
export declare function getActivePveEncounterByPlayerId(playerId: number): Promise<PveEncounterState | null>;
export declare function getActivePveEncounterByTgId(tgId: string): Promise<PveEncounterState | null>;
export declare function getActivePveEncounterViewByPlayerId(playerId: number, lang: Language): Promise<PveEncounterView | null>;
export declare function startPveEncounter(params: {
    playerId: number;
    worldMapId: number;
    x: number;
    y: number;
    creatureId: number;
    lang: Language;
}): Promise<{
    success: boolean;
    message: string;
}>;
export declare function clearActivePveEncounter(playerId: number): Promise<void>;
export declare function resolvePveAction(params: {
    playerId: number;
    action: PveActionRequest;
    lang: Language;
}): Promise<PveActionResult>;
