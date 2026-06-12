import { compactLabel } from '../lib/ui-compact.js';
import { t } from '../lib/i18n.js';
import { EMOJIS } from '../data/emojis.js';
export function getSkillReqLabel(skillKey) {
    if (skillKey === 'chop')
        return 'Tala';
    if (skillKey === 'mine')
        return 'Mine';
    if (skillKey === 'fish')
        return 'Fish';
    return 'Gather';
}
export function getSkillReqEmoji(skillKey) {
    if (skillKey === 'chop')
        return EMOJIS.tools.hachaPiedra;
    if (skillKey === 'mine')
        return EMOJIS.tools.picoPiedra;
    if (skillKey === 'fish')
        return EMOJIS.tools.canapez;
    return EMOJIS.tools.canastaPaja;
}
export function compactNodeName(name) {
    return compactLabel(name, 16);
}
export function buildInspectRow(node) {
    const idx = String(node.listIndex).padStart(2, '0');
    const req = `${getSkillReqEmoji(node.requiredSkill)}${node.requiredLevel}`;
    return `┌ #${idx}(${node.rarity}) ${node.emoji} ${node.available}x ${compactNodeName(node.displayName)} [${req}]`;
}
export function getSkillDisplayName(lang, skillKey) {
    if (skillKey === 'chop')
        return t(lang, 'skillNameChop');
    if (skillKey === 'mine')
        return t(lang, 'skillNameMine');
    if (skillKey === 'fish')
        return t(lang, 'skillNameFish');
    return t(lang, 'skillNameGather');
}
