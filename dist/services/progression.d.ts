import { Prisma, type PlayerSkill } from '@prisma/client';
import { prisma } from '../lib/db.js';
import { type Language } from '../lib/i18n.js';
import type { GatherActionType } from './bags.js';
export type SkillKey = 'chop' | 'mine' | 'gather' | 'fish';
export type SkillColorBand = 'red' | 'orange' | 'yellow' | 'green' | 'gray';
type DbClient = typeof prisma | Prisma.TransactionClient;
export declare function getSkillKeyForAction(action: GatherActionType): SkillKey;
export declare function getRequiredSkillXp(skillKey: SkillKey, level: number): number;
export declare function getSkillColorBand(skillLevel: number, requiredLevel: number): SkillColorBand;
export declare function getSkillXpGain(params: {
    skillLevel: number;
    requiredLevel: number;
    rarity: string;
    actions: number;
}): {
    gainedXp: number;
    band: SkillColorBand;
};
export declare function ensurePlayerProgression(playerId: number, grantStarterSkills?: boolean, tx?: DbClient): Promise<void>;
export declare function getPlayerSkill(playerId: number, skillKey: SkillKey): Promise<PlayerSkill | null>;
export declare function awardSkillXp(playerId: number, skillKey: SkillKey, xpAmount: number): Promise<{
    beforeLevel: number;
    afterLevel: number;
    gainedLevels: number;
    gainedXp: number;
    currentXp: number;
    requiredXp: number;
}>;
export declare function getSkillsCard(playerId: number, lang?: Language): Promise<string>;
export {};
