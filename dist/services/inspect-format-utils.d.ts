import { type Language } from '../lib/i18n.js';
import type { SkillKey } from './progression.js';
type InspectNodeLite = {
    listIndex: number;
    rarity: string;
    emoji: string;
    available: number;
    displayName: string;
    requiredSkill: SkillKey;
    requiredLevel: number;
};
export declare function getSkillReqLabel(skillKey: SkillKey): string;
export declare function getSkillReqEmoji(skillKey: SkillKey): string;
export declare function compactNodeName(name: string): string;
export declare function buildInspectRow(node: InspectNodeLite): string;
export declare function getSkillDisplayName(lang: Language, skillKey: SkillKey): string;
export {};
