// @ts-nocheck
import { prisma } from '../lib/db.js';
import { t } from '../lib/i18n.js';
import { compactLabel } from '../lib/ui-compact.js';
import { EMOJIS } from '../data/emojis.js';
const SKILL_META = {
    chop: { emoji: EMOJIS.tools.hachaPiedra, xpBase: 40 },
    mine: { emoji: EMOJIS.tools.picoPiedra, xpBase: 41 },
    gather: { emoji: EMOJIS.tools.canastaPaja, xpBase: 32.5 },
    fish: { emoji: EMOJIS.tools.canapez, xpBase: 48 },
};
function roundOne(value) {
    return Math.round(value * 10) / 10;
}
function getSkillLabel(lang, key) {
    if (key === 'chop') {
        return t(lang, 'skillNameChop');
    }
    if (key === 'mine') {
        return t(lang, 'skillNameMine');
    }
    if (key === 'fish') {
        return t(lang, 'skillNameFish');
    }
    return t(lang, 'skillNameGather');
}
export function getSkillKeyForAction(action) {
    if (action === 'chop') {
        return 'chop';
    }
    if (action === 'mine') {
        return 'mine';
    }
    return 'gather';
}
export function getRequiredSkillXp(skillKey, level) {
    const base = SKILL_META[skillKey].xpBase;
    return roundOne(base * Math.max(level, 1));
}
export function getSkillColorBand(skillLevel, requiredLevel) {
    if (skillLevel < requiredLevel) {
        return 'red';
    }
    if (skillLevel <= requiredLevel + 5) {
        return 'orange';
    }
    if (skillLevel <= requiredLevel + 15) {
        return 'yellow';
    }
    if (skillLevel <= requiredLevel + 25) {
        return 'green';
    }
    return 'gray';
}
export function getSkillXpGain(params) {
    const band = getSkillColorBand(params.skillLevel, params.requiredLevel);
    const baseByBand = {
        red: 0,
        orange: 12,
        yellow: 8,
        green: 3,
        gray: 0,
    };
    const rarityBonusMap = {
        common: 0,
        uncommon: 1,
        rare: 2,
        epic: 4,
        legendary: 6,
    };
    const rarityBonus = rarityBonusMap[params.rarity.toLowerCase()] ?? 0;
    const quantityBonus = Math.max(0, Math.floor(params.actions / 2));
    const gainedXp = roundOne(Math.max(0, baseByBand[band] + rarityBonus + quantityBonus));
    return { gainedXp, band };
}
export async function ensurePlayerProgression(playerId, grantStarterSkills = false, tx = prisma) {
    await tx.playerEquipment.upsert({
        where: { playerId },
        update: {},
        create: { playerId },
    });
    const skillEntries = ['chop', 'mine', 'gather', 'fish'];
    for (const skillKey of skillEntries) {
        await tx.playerSkill.upsert({
            where: {
                playerId_skillKey: { playerId, skillKey },
            },
            update: grantStarterSkills
                ? {
                    learned: true,
                }
                : {},
            create: {
                playerId,
                skillKey,
                level: 1,
                xp: 0,
                learned: grantStarterSkills,
            },
        });
    }
}
export async function getPlayerSkill(playerId, skillKey) {
    await ensurePlayerProgression(playerId);
    return prisma.playerSkill.findUnique({
        where: {
            playerId_skillKey: { playerId, skillKey },
        },
    });
}
export async function awardSkillXp(playerId, skillKey, xpAmount) {
    await ensurePlayerProgression(playerId);
    return prisma.$transaction(async (tx) => {
        const skill = await tx.playerSkill.findUnique({
            where: {
                playerId_skillKey: { playerId, skillKey },
            },
        });
        if (!skill) {
            throw new Error('Skill row missing after ensure.');
        }
        let level = skill.level;
        let xp = roundOne(skill.xp + Math.max(0, xpAmount));
        let requiredXp = getRequiredSkillXp(skillKey, level);
        let gainedLevels = 0;
        while (xp >= requiredXp) {
            xp = roundOne(xp - requiredXp);
            level += 1;
            requiredXp = getRequiredSkillXp(skillKey, level);
            gainedLevels += 1;
        }
        await tx.playerSkill.update({
            where: {
                playerId_skillKey: { playerId, skillKey },
            },
            data: {
                xp,
                level,
            },
        });
        return {
            beforeLevel: skill.level,
            afterLevel: level,
            gainedLevels,
            gainedXp: roundOne(xpAmount),
            currentXp: xp,
            requiredXp,
        };
    });
}
export async function getSkillsCard(playerId, lang = 'es') {
    await ensurePlayerProgression(playerId);
    const skills = await prisma.playerSkill.findMany({
        where: {
            playerId,
            skillKey: { in: ['chop', 'mine', 'gather', 'fish'] },
        },
        orderBy: { skillKey: 'asc' },
    });
    const byKey = new Map(skills.map((skill) => [skill.skillKey, skill]));
    const orderedKeys = ['chop', 'mine', 'gather', 'fish'];
    const rows = [];
    const levelTag = t(lang, 'skillsLevelShort');
    for (const [index, key] of orderedKeys.entries()) {
        const skill = byKey.get(key);
        const level = skill?.level ?? 1;
        const xp = skill?.xp ?? 0;
        const requiredXp = getRequiredSkillXp(key, level);
        const meta = SKILL_META[key];
        const marker = index === 0 ? '┌' : index === orderedKeys.length - 1 ? '└' : '├';
        const lockTag = skill?.learned ? '' : ' 🔒';
        rows.push(`${marker} ${meta.emoji} ${compactLabel(getSkillLabel(lang, key), 10)} • ${levelTag} ${level} • XP ${roundOne(xp)}/${requiredXp}${lockTag}`);
    }
    return [`📋 ${t(lang, 'skillsCardTitle')}`, '✧═══••═══✧', `💡 ${t(lang, 'skillsCardHint')}`, '', ...rows].join('\n');
}
