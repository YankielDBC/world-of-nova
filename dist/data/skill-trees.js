// @ts-nocheck
import CLASS_SKILLS from './skill-trees/class-skills.js';
import GENERAL_SKILLS from './skill-trees/general-skills.js';
const SKILL_MAP = new Map([...CLASS_SKILLS, ...GENERAL_SKILLS].map((skill) => [skill.key, skill]));
export function getClassSkillDefinitions(classKey) {
    const normalized = String(classKey || '').trim().toLowerCase();
    return CLASS_SKILLS.filter((skill) => skill.classKey === normalized).sort((a, b) => a.sortOrder - b.sortOrder);
}
export function getGeneralSkillDefinitions() {
    return GENERAL_SKILLS.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}
export function getBuildSkillByKey(skillKeyRaw) {
    const key = String(skillKeyRaw || '').trim().toLowerCase();
    return SKILL_MAP.get(key) || null;
}
export function getClassSkillPointsForLevel(level) {
    const safeLevel = Math.max(1, Math.floor(level || 1));
    return Math.max(0, safeLevel - 1);
}
export function getGeneralSkillPointsForLevel(level) {
    const safeLevel = Math.max(1, Math.floor(level || 1));
    return safeLevel < 4 ? 0 : Math.floor((safeLevel - 3) / 2);
}
export function getLocalizedText3(text, lang) {
    if (lang === 'en')
        return text.en;
    if (lang === 'ru')
        return text.ru;
    return text.es;
}
//# sourceMappingURL=skill-trees.js.map