import { abbreviateName } from '../lib/ui-compact.js';
import { toStrikeText, getToolMeta } from './bags-utils.js';
export function parseEquipAlias(alias) {
    const raw = alias.trim().toLowerCase();
    const match = raw.match(/^\/?eq_(\d+)(?:\.\.\.)?$/);
    if (!match)
        return null;
    const value = Number(match[1]);
    return Number.isFinite(value) ? value : null;
}
export function parseUnequipAlias(alias) {
    const raw = alias.trim().toLowerCase();
    const match = raw.match(/^\/?u_(\d+)(?:\.\.\.)?$/);
    if (!match)
        return null;
    const value = Number(match[1]);
    return Number.isFinite(value) ? value : null;
}
export function getEquipmentSlotLabel(slot) {
    if (slot === 'chopToolId')
        return 'Tala';
    if (slot === 'mineToolId')
        return 'Mineria';
    return 'Recoleccion';
}
export function formatToolInstanceLine(playerTool, fallback = 'None') {
    if (!playerTool)
        return fallback;
    const toolMeta = getToolMeta(playerTool.toolKey);
    if (!toolMeta)
        return fallback;
    const baseName = abbreviateName(toolMeta.name);
    const name = playerTool.isBroken ? toStrikeText(baseName) : baseName;
    const brokenTag = playerTool.isBroken ? ' [Broken]' : '';
    return `${toolMeta.emoji} ${name} (${playerTool.durability}/${playerTool.maxDurability})${brokenTag}`;
}
export function getToolRequirement(toolType) {
    if (toolType === 'mining')
        return { skill: 'MINE', level: 1 };
    if (toolType === 'woodcutting' || toolType === 'harvesting')
        return { skill: 'CHOP', level: 1 };
    return { skill: 'GATHER', level: 1 };
}
