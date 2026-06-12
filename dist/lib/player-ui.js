import { EMOJIS } from '../data/emojis.js';
export function getRequiredXpForLevel(level) {
    return Math.max(150, level * 150);
}
export function formatClassName(classKey, fallback = 'Unclassed') {
    if (!classKey) {
        return fallback;
    }
    return classKey
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}
export function formatTokenName(token, fallback = 'Unknown') {
    if (!token) {
        return fallback;
    }
    return token
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}
function formatWeight(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
function formatStatValue(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
export function buildProfileCard(data, lang = 'es') {
    void lang;
    const lines = [
        `${data.profileEmoji} ${data.nickname} | ${EMOJIS.ui.scroll} ${data.title}`,
        `${EMOJIS.ui.map} (${data.x}, ${data.y}) - ${data.locationName}`,
        '✧═══••═══✧',
        '',
        `┌${EMOJIS.ui.race} Race: ${String(data.raceName || '').toLowerCase()}`,
        `└♟️ Class: ${data.className}`,
        '',
        `├${EMOJIS.ui.level}: ${data.level} | ${EMOJIS.ui.book}: ${data.currentXp}/${data.requiredXp}`,
        '',
        `${EMOJIS.ui.stats} Attributes:`,
        '✧═══••═══✧',
        `┌💪 STR: ${data.strength} 🌀 DEX: ${data.dexterity}`,
        `├🔮 INT: ${data.intelligence} ⚡️ ENG: ${data.engineering}`,
        `└💚 VIT: ${data.vitality} 🦶 AGI: ${data.agility}`,
        '',
        `${EMOJIS.ui.stats} Stats:`,
        '✧═══••═══✧',
        `┌${EMOJIS.ui.heart} HP: ${data.hp}/${data.maxHp}`,
        `└${EMOJIS.ui.stamina} STA: ${data.stamina}/${data.maxStamina}`,
        '',
        `┌🗡 B. Damage: ${formatStatValue(data.baseDamage)}`,
        `├💢 Crit Chance: ${formatStatValue(data.critChance)}%`,
        `├🤸‍♀️ Evasion: ${formatStatValue(data.evasion)}%`,
        `├💨 Atk Speed: ${formatStatValue(data.atkSpeed)}`,
        `├🤺 Attack: ${formatStatValue(data.attack)}`,
        `├🔮 Arcane PWR: ${formatStatValue(data.arcanePower)}`,
        `├${EMOJIS.ui.shield} Defense: ${formatStatValue(data.defense)}`,
        `└${EMOJIS.ui.movement} MOV SPD: ${data.moveSpeed.toFixed(3)} tiles/s`,
        '',
        '🤕 Resistances',
        '✧═══••═══✧',
        `┌${EMOJIS.ui.shield} Physical: ${data.resistPhysical}`,
        `├🔥 Elemental: ${data.resistElemental}`,
        `├🧙‍♂️ Arcane: ${data.resistArcane}`,
        `├😇 Holy: ${data.resistHoly}`,
        `└🧪Chemical: ${data.resistChemical}`,
        '',
        `${EMOJIS.ui.stats} Economia:`,
        `┌${EMOJIS.ui.gold}: ${data.gold}  | ${EMOJIS.ui.silver}: ${data.silver}`,
        `└${EMOJIS.ui.bag}${data.usedSlots}/${data.totalSlots}    ${EMOJIS.ui.weight} ${formatWeight(data.usedWeightKg)}/${formatWeight(data.totalWeightKg)} Kg`,
    ];
    return lines.join('\n');
}
