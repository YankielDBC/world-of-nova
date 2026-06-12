import { type BuildSkillDefinition } from '../../data/skill-trees.js';
import { type PlayerBuildSkillState } from '../../services/build-skills.js';
import type { Language } from '../../lib/i18n.js';
export declare function getBuildSkillPreview(def: BuildSkillDefinition, lang: Language): string;
export declare function getBuildSkillPowerLines(state: PlayerBuildSkillState, def: BuildSkillDefinition, lang: Language): string[];
export declare function getBuildCompatibilityLines(state: PlayerBuildSkillState, def: BuildSkillDefinition, lang: Language): string[];
export declare function getBuildArchetypeLine(state: PlayerBuildSkillState, lang: Language): string;
