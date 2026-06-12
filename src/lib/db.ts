// @ts-nocheck
// World of Nova - Database Service
import { PrismaClient } from '@prisma/client';
import { getClassAttributesAtLevel, getClassGrowthDebug } from './rpg-attributes.js';
const poolConfig = {
    log: ['error', 'warn'],
    connectionTimeout: 10000,
};
export const prisma = new PrismaClient(poolConfig);
export async function connectDB() {
    try {
        await prisma.$connect();
        console.log('DB connected');
    }
    catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
}
export async function disconnectDB() {
    await prisma.$disconnect();
}
// Player operations
export async function getPlayerByTelegramId(tgId) {
    return prisma.player.findUnique({ where: { tgId } });
}
export async function createPlayer(data) {
    return prisma.player.create({
        data: {
            ...data,
            registeredAt: new Date(),
            lastActiveAt: new Date(),
        },
    });
}
export async function updatePlayerLanguage(tgId, language) {
    return prisma.player.update({
        where: { tgId },
        data: { language },
    });
}
export async function findPlayerByNickname(nickname) {
    return prisma.player.findFirst({ where: { nickname } });
}
export async function updateLastActive(tgId) {
    return prisma.player.update({
        where: { tgId },
        data: { lastActiveAt: new Date() },
    });
}
function toNumber(value, fallback = 0) {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}
function round1(value) {
    return Math.round(value * 10) / 10;
}
function round3(value) {
    return Math.round(value * 1000) / 1000;
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function clampPctModifier(value) {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return clamp(Number(value), -0.2, 0.2);
}
function resolvePrimaryAttributes(player) {
    const level = Math.max(0, Math.floor(toNumber(player.level, 1)));
    const preset = getClassAttributesAtLevel({
        race: player.race,
        classKey: player.class,
        level,
    });
    if (preset) {
        return preset;
    }
    const intFromPlayer = typeof player.intelligence === 'number'
        ? player.intelligence
        : typeof player.wis === 'number'
            ? player.wis
            : 5;
    return {
        str: Math.max(1, Math.floor(toNumber(player.str, 5))),
        dex: Math.max(1, Math.floor(toNumber(player.dex, 5))),
        int: Math.max(1, Math.floor(toNumber(intFromPlayer, 5))),
        vit: Math.max(1, Math.floor(toNumber(player.vit, 5))),
        agi: Math.max(1, Math.floor(toNumber(player.agi, 5))),
        eng: Math.max(1, Math.floor(toNumber(player.eng, 5))),
    };
}
function getRaceArcaneBonus(race) {
    return String(race || '').toLowerCase() === 'uren' ? 1 : 0;
}
function getRaceChemicalBonus(race) {
    return String(race || '').toLowerCase() === 'zolk' ? 2 : 0;
}
export function calculateCombatStats(player, modifiers) {
    const level = Math.max(0, Math.floor(toNumber(player.level, 1)));
    const attrs = resolvePrimaryAttributes(player);
    const maxHpFlat = Math.floor(toNumber(modifiers?.maxHpFlat, 0));
    const maxEnergyFlat = Math.floor(toNumber(modifiers?.maxEnergyFlat, 0));
    const maxSoulFlat = Math.floor(toNumber(modifiers?.maxSoulFlat, 0));
    const attackFlat = toNumber(modifiers?.attackFlat, 0);
    const arcaneFlat = toNumber(modifiers?.arcaneFlat, 0);
    const baseDamageFlat = toNumber(modifiers?.baseDamageFlat, 0);
    const defenseFlat = toNumber(modifiers?.defenseFlat, 0);
    const critChanceFlat = toNumber(modifiers?.critChanceFlat, 0);
    const evasionFlat = toNumber(modifiers?.evasionFlat, 0);
    const atkSpeedFlat = toNumber(modifiers?.atkSpeedFlat, 0);
    const moveSpeedFlat = toNumber(modifiers?.moveSpeedFlat, 0);
    const resistPhysicalFlat = Math.floor(toNumber(modifiers?.resistPhysicalFlat, 0));
    const resistElementalFlat = Math.floor(toNumber(modifiers?.resistElementalFlat, 0));
    const resistArcaneFlat = Math.floor(toNumber(modifiers?.resistArcaneFlat, 0));
    const resistHolyFlat = Math.floor(toNumber(modifiers?.resistHolyFlat, 0));
    const resistChemicalFlat = Math.floor(toNumber(modifiers?.resistChemicalFlat, 0));
    const maxHpModifier = clampPctModifier(modifiers?.maxHpPct);
    const maxEnergyModifier = clampPctModifier(modifiers?.maxEnergyPct);
    // Exact formulas provided by design:
    // HP_max = 40 + (VIT * 8) + (nivel * 10)
    const maxHp = Math.max(1, Math.floor((40 + attrs.vit * 8 + level * 10 + maxHpFlat) * (1 + maxHpModifier)));
    // STA_max = 30 + (AGI * 5) + (ENG * 4) + (nivel * 5)
    const maxEnergy = Math.max(1, Math.floor((30 + attrs.agi * 5 + attrs.eng * 4 + level * 5 + maxEnergyFlat) * (1 + maxEnergyModifier)));
    // Attack (físico) = (STR * 1.2) + (DEX * 0.8) + nivel
    const baseAttack = attrs.str * 1.2 + attrs.dex * 0.8 + level;
    // Arcane PWR = (INT * 1.5) + (ENG * 0.5) + nivel
    const baseArcanePower = attrs.int * 1.5 + attrs.eng * 0.5 + level;
    // B. Damage = min(Attack * 0.3, 10)
    const attackModifier = clampPctModifier(modifiers?.attackPct);
    const arcaneModifier = clampPctModifier(modifiers?.arcanePct);
    const defenseModifier = clampPctModifier(modifiers?.defensePct);
    const moveModifier = clampPctModifier(modifiers?.moveSpeedPct);
    const atkSpeedModifier = clampPctModifier(modifiers?.atkSpeedPct);
    const attack = round1(baseAttack * (1 + attackModifier) + attackFlat);
    const arcanePower = round1(baseArcanePower * (1 + arcaneModifier) + arcaneFlat);
    const B_Damage = round1(Math.min(attack * 0.3, 10) + baseDamageFlat);
    // Attack Speed = 150 + (AGI * 30) + (DEX * 15)
    const baseAtkSpeed = 150 + attrs.agi * 30 + attrs.dex * 15;
    const atkSpeed = Math.max(1, Math.round(baseAtkSpeed * (1 + atkSpeedModifier) + atkSpeedFlat));
    // MOV SPD = 0.05 + (AGI * 0.0025), cap ~0.1
    const baseMoveSpeed = 0.05 + attrs.agi * 0.0025;
    const moveSpeed = round3(clamp(baseMoveSpeed * (1 + moveModifier) + moveSpeedFlat, 0, 0.1));
    // Crit Chance = (DEX * 1.2) + (AGI * 0.3) + 2.5%
    const critChance = round1(clamp(attrs.dex * 1.2 + attrs.agi * 0.3 + 2.5 + critChanceFlat, 0, 35));
    // Evasion = (AGI * 1.0) + (DEX * 0.5) + 1%
    const evasion = round1(clamp(attrs.agi * 1.0 + attrs.dex * 0.5 + 1 + evasionFlat, 0, 30));
    // Defense = (VIT * 0.8) + (STR * 0.3) + nivel * 0.5
    const baseDefense = attrs.vit * 0.8 + attrs.str * 0.3 + level * 0.5;
    const defense = round1(baseDefense * (1 + defenseModifier) + defenseFlat);
    // Resistances + racial bonuses + persistent flat bonuses
    const resistPhysical = Math.floor(attrs.vit * 0.2) + Math.floor(toNumber(player.resistPhysical, 0)) + resistPhysicalFlat;
    const resistElemental = Math.floor(attrs.int * 0.15) + Math.floor(toNumber(player.resistElemental, 0)) + resistElementalFlat;
    const resistArcane = Math.floor(attrs.int * 0.25) + getRaceArcaneBonus(player.race) + Math.floor(toNumber(player.resistArcane, 0)) + resistArcaneFlat;
    const resistHoly = Math.floor(toNumber(player.resistHoly, 0)) + resistHolyFlat;
    const resistChemical = getRaceChemicalBonus(player.race) + Math.floor(toNumber(player.resistChemical, 0)) + resistChemicalFlat;
    return {
        attributes: attrs,
        maxHp,
        maxEnergy,
        maxSoul: Math.max(1, Math.floor(toNumber(player.maxSoul, 5)) + maxSoulFlat),
        B_Damage,
        critChance,
        evasion,
        atkSpeed,
        attack,
        arcanePower,
        defense,
        moveSpeed,
        resistPhysical,
        resistElemental,
        resistArcane,
        resistHoly,
        resistChemical,
    };
}
export function buildCombatDebugBreakdown(player) {
    const level = Math.max(0, Math.floor(toNumber(player.level, 1)));
    const stats = calculateCombatStats(player);
    const growth = getClassGrowthDebug({
        race: player.race,
        classKey: player.class,
        level,
    });
    const attrs = stats.attributes;
    const lines = [
        `DEBUG ${String(player.nickname || 'Player')} | ${String(player.race || 'unknown')}/${String(player.class || 'unknown')} | Lv ${level}`,
        ...growth.lines.map((line) => `- ${line}`),
        '',
        'FORMULAS:',
        `- HP_max = 40 + (${attrs.vit}*8) + (${level}*10) = ${stats.maxHp}`,
        `- STA_max = 30 + (${attrs.agi}*5) + (${attrs.eng}*4) + (${level}*5) = ${stats.maxEnergy}`,
        `- Attack = (${attrs.str}*1.2) + (${attrs.dex}*0.8) + ${level} = ${stats.attack}`,
        `- Arcane = (${attrs.int}*1.5) + (${attrs.eng}*0.5) + ${level} = ${stats.arcanePower}`,
        `- B.Dmg = min(${stats.attack}*0.3, 10) = ${stats.B_Damage}`,
        `- Crit% = clamp((${attrs.dex}*1.2)+(${attrs.agi}*0.3)+2.5, 25) = ${stats.critChance}%`,
        `- Evasion% = clamp((${attrs.agi}*1.0)+(${attrs.dex}*0.5)+1, 20) = ${stats.evasion}%`,
        `- AtkSpeed = 150 + (${attrs.agi}*30) + (${attrs.dex}*15) = ${stats.atkSpeed}`,
        `- Move = clamp(0.05 + ${attrs.agi}*0.0025, 0.1) = ${stats.moveSpeed}`,
        `- Defense = (${attrs.vit}*0.8) + (${attrs.str}*0.3) + (${level}*0.5) = ${stats.defense}`,
        `- Resist: P ${stats.resistPhysical}, E ${stats.resistElemental}, A ${stats.resistArcane}, H ${stats.resistHoly}, C ${stats.resistChemical}`,
    ];
    return lines.join('\n');
}
export function buildRpgClassSimulationReport(levels = [1, 5, 10]) {
    const combos = [
        { race: 'zolk', classKey: 'curse_hunter' },
        { race: 'zolk', classKey: 'alchemist_rogue' },
        { race: 'uren', classKey: 'dark_druid' },
        { race: 'uren', classKey: 'arcane' },
    ];
    const lines = ['RPG SIMULATION REPORT'];
    for (const level of levels) {
        lines.push(`\nLV ${level}`);
        for (const combo of combos) {
            const stats = calculateCombatStats({
                level,
                race: combo.race,
                class: combo.classKey,
                maxSoul: 5,
            });
            lines.push(`- ${combo.race}/${combo.classKey}: HP ${stats.maxHp}, STA ${stats.maxEnergy}, ATK ${stats.attack}, ARC ${stats.arcanePower}, CRIT ${stats.critChance}%, EVA ${stats.evasion}%, ASPD ${stats.atkSpeed}, MOV ${stats.moveSpeed}, DEF ${stats.defense}`);
        }
    }
    return lines.join('\n');
}
export async function updatePlayer(tgId, data) {
    return prisma.player.update({
        where: { tgId },
        data: { ...data, lastActiveAt: new Date() },
    });
}
