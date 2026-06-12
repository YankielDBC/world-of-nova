import { type RacialRace, type RacialTalentCategory, type RacialTalentDefinition } from '../data/racial-talents.js';
export interface PlayerRacialLoadout {
    activeSlot1: string | null;
    activeSlot2: string | null;
    keystoneKey: string | null;
}
export interface PlayerRacialTalentState {
    playerId: number;
    race: RacialRace;
    level: number;
    silver: number;
    talents: RacialTalentDefinition[];
    ranksByKey: Record<string, number>;
    loadout: PlayerRacialLoadout;
    totalPoints: number;
    spentPoints: number;
    freePoints: number;
}
export declare function ensureRacialTalentSchema(): Promise<void>;
export declare function getPlayerRacialTalentState(playerId: number): Promise<PlayerRacialTalentState | null>;
export declare function learnRacialTalentRank(playerId: number, talentKeyRaw: string): Promise<{
    success: boolean;
    message: string;
    state?: PlayerRacialTalentState;
}>;
export declare function equipRacialTalent(playerId: number, talentKeyRaw: string, slot: 'active1' | 'active2' | 'keystone'): Promise<{
    success: boolean;
    message: string;
    state?: PlayerRacialTalentState;
}>;
export declare function unequipRacialTalent(playerId: number, slot: 'active1' | 'active2' | 'keystone'): Promise<{
    success: boolean;
    message: string;
    state?: PlayerRacialTalentState;
}>;
export declare function getRacialResetCost(spentPoints: number): number;
export declare function resetRacialTalents(playerId: number): Promise<{
    success: boolean;
    message: string;
    state?: PlayerRacialTalentState;
}>;
export declare function getTalentsByCategory(state: PlayerRacialTalentState, category: RacialTalentCategory): RacialTalentDefinition[];
export declare function canLearnTalent(state: PlayerRacialTalentState, talent: RacialTalentDefinition): {
    ok: boolean;
    reason?: string;
};
