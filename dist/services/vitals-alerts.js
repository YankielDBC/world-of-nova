import { prisma } from '../lib/db.js';
import { t } from '../lib/i18n.js';
function getPlayerLanguage(language) {
    if (language === 'en' || language === 'ru' || language === 'es') {
        return language;
    }
    return 'es';
}
export async function consumeLowVitalsAlertByTgId(tgId) {
    const player = await prisma.player.findUnique({
        where: { tgId },
        select: {
            id: true,
            language: true,
            hp: true,
            maxHp: true,
            energy: true,
            maxEnergy: true,
            lowHpThreshold: true,
            lowStaThreshold: true,
            lowHpAlertSent: true,
            lowStaAlertSent: true,
        },
    });
    if (!player) {
        return null;
    }
    const lang = getPlayerLanguage(player.language);
    const isHpLow = player.hp <= player.lowHpThreshold;
    const isStaLow = player.energy <= player.lowStaThreshold;
    const updateData = {};
    const detailLines = [];
    if (isHpLow && !player.lowHpAlertSent) {
        detailLines.push(t(lang, 'vitalsLowHpLine', {
            current: player.hp,
            max: player.maxHp,
            threshold: player.lowHpThreshold,
        }));
        updateData.lowHpAlertSent = true;
    }
    else if (!isHpLow && player.lowHpAlertSent) {
        updateData.lowHpAlertSent = false;
    }
    if (isStaLow && !player.lowStaAlertSent) {
        detailLines.push(t(lang, 'vitalsLowStaLine', {
            current: player.energy,
            max: player.maxEnergy,
            threshold: player.lowStaThreshold,
        }));
        updateData.lowStaAlertSent = true;
    }
    else if (!isStaLow && player.lowStaAlertSent) {
        updateData.lowStaAlertSent = false;
    }
    if (updateData.lowHpAlertSent !== undefined || updateData.lowStaAlertSent !== undefined) {
        await prisma.player.update({
            where: { id: player.id },
            data: updateData,
        });
    }
    if (detailLines.length === 0) {
        return null;
    }
    const text = [t(lang, 'vitalsLowTitle'), ...detailLines, t(lang, 'vitalsLowHint')].join('\n');
    return { text };
}
