// @ts-nocheck
import { prisma } from '../lib/db.js';
import { compactLabel } from '../lib/ui-compact.js';
import { getRequiredXpForLevel } from '../lib/player-ui.js';
import { EMOJIS } from '../data/emojis.js';
import { getClassSkillPointsForLevel, getGeneralSkillPointsForLevel } from '../data/skill-trees.js';
import { getRacialPointsForLevel } from '../data/racial-talents.js';
import { addResourceToActiveBag, getActiveBagUsage } from './bags.js';
import { invalidateBuildGameplayEffectsCache } from './build-skills.js';
import { formatCreatureRespawnLabel, getCreatureSnapshotById, markCreatureDefeated, } from './creatures.js';
import { invalidateRacialGameplayEffectsCache } from './racial-effects.js';
function t3(lang, es, en, ru) {
    if (lang === 'en')
        return en;
    if (lang === 'ru')
        return ru;
    return es;
}
function randomInt(min, max) {
    const low = Math.floor(Math.min(min, max));
    const high = Math.floor(Math.max(min, max));
    return low + Math.floor(Math.random() * (high - low + 1));
}
function rollDrop(drop) {
    const chance = Math.max(0, Math.min(100, drop.chancePct));
    const passed = chance >= 100 || Math.random() * 100 <= chance;
    if (!passed)
        return 0;
    return randomInt(Math.max(1, drop.minQty), Math.max(drop.minQty, drop.maxQty));
}
function normalizeRejectReason(reason) {
    if (!reason || !reason.trim()) {
        return 'No cupo en la bolsa.';
    }
    return reason.replace(/\s+/g, ' ').trim();
}
function applyXpGain(level, currentXp, gainedXp) {
    let levelCursor = Math.max(1, Math.floor(level));
    let xpCursor = Math.max(0, Math.floor(currentXp)) + Math.max(0, Math.floor(gainedXp));
    let required = getRequiredXpForLevel(levelCursor);
    let levelsGained = 0;
    while (xpCursor >= required) {
        xpCursor -= required;
        levelCursor += 1;
        levelsGained += 1;
        required = getRequiredXpForLevel(levelCursor);
    }
    return {
        levelBefore: Math.max(1, Math.floor(level)),
        levelAfter: levelCursor,
        levelsGained,
        currentXp: xpCursor,
        requiredXp: required,
    };
}
function groupRolledDrops(drops) {
    const grouped = new Map();
    for (const drop of drops) {
        const qty = rollDrop(drop);
        if (qty <= 0)
            continue;
        const current = grouped.get(drop.resourceId);
        if (current) {
            current.quantity += qty;
            continue;
        }
        grouped.set(drop.resourceId, {
            emoji: drop.emoji,
            name: drop.name,
            quantity: qty,
        });
    }
    return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name));
}
function formatRespawnRemaining(snapshot, lang) {
    const now = Date.now();
    if (!snapshot.nextRespawnAt) {
        return formatCreatureRespawnLabel(snapshot.respawnSeconds, lang);
    }
    const remaining = Math.max(1, Math.ceil((snapshot.nextRespawnAt.getTime() - now) / 1000));
    return formatCreatureRespawnLabel(remaining, lang);
}
export async function resolveCreatureDefeat(params) {
    const player = await prisma.player.findUnique({
        where: { id: params.playerId },
        select: {
            id: true,
            level: true,
            currentXp: true,
            totalXp: true,
        },
    });
    if (!player) {
        return {
            success: false,
            message: t3(params.lang, 'No pude leer tu perfil.', 'Could not read your profile.', 'Ne udalos prochitat profil.'),
        };
    }
    const creatureAny = await getCreatureSnapshotById(params.creatureId);
    if (!creatureAny) {
        return {
            success: false,
            message: t3(params.lang, 'La criatura ya no existe.', 'That creature no longer exists.', 'Sushchestvo bolshe ne sushchestvuet.'),
        };
    }
    if (creatureAny.worldMapId !== params.worldMapId ||
        creatureAny.x !== params.x ||
        creatureAny.y !== params.y) {
        return {
            success: false,
            message: t3(params.lang, 'Esa criatura ya no está en tu coordenada.', 'That creature is no longer on your coordinate.', 'Eto sushchestvo bolshe ne na tvoey koordinate.'),
        };
    }
    if (creatureAny.status !== 'ALIVE') {
        return {
            success: false,
            message: t3(params.lang, `Esa criatura está en respawn (${formatRespawnRemaining(creatureAny, params.lang)}).`, `That creature is respawning (${formatRespawnRemaining(creatureAny, params.lang)}).`, `Eto sushchestvo v respavne (${formatRespawnRemaining(creatureAny, params.lang)}).`),
        };
    }
    const claimed = await markCreatureDefeated({
        creatureId: params.creatureId,
        killerPlayerId: params.playerId,
    });
    if (!claimed) {
        return {
            success: false,
            message: t3(params.lang, 'Otro aventurero la derrotó primero.', 'Another adventurer defeated it first.', 'Drugoy avantyurist pobedil ee pervym.'),
        };
    }
    const xpAwarded = Math.max(0, creatureAny.xpReward);
    const xpProgress = applyXpGain(player.level, player.currentXp, xpAwarded);
    const classPointsGained = Math.max(0, getClassSkillPointsForLevel(xpProgress.levelAfter) - getClassSkillPointsForLevel(player.level));
    const generalPointsGained = Math.max(0, getGeneralSkillPointsForLevel(xpProgress.levelAfter) - getGeneralSkillPointsForLevel(player.level));
    const racialPointsGained = Math.max(0, getRacialPointsForLevel(xpProgress.levelAfter) - getRacialPointsForLevel(player.level));
    let silverAwarded = 0;
    if (creatureAny.silverMax > 0 && creatureAny.coinDropChance > 0) {
        const coinRollPassed = creatureAny.coinDropChance >= 100 || Math.random() * 100 <= creatureAny.coinDropChance;
        if (coinRollPassed) {
            silverAwarded = randomInt(Math.max(0, creatureAny.silverMin), Math.max(creatureAny.silverMin, creatureAny.silverMax));
        }
    }
    await prisma.player.update({
        where: { id: params.playerId },
        data: {
            level: xpProgress.levelAfter,
            currentXp: xpProgress.currentXp,
            totalXp: {
                increment: xpAwarded,
            },
            ...(silverAwarded > 0
                ? {
                    silver: {
                        increment: silverAwarded,
                    },
                }
                : {}),
        },
    });
    if (xpProgress.levelAfter > player.level) {
        // Level up changes available build/racial points, so invalidate cached state immediately.
        invalidateBuildGameplayEffectsCache(params.playerId);
        invalidateRacialGameplayEffectsCache(params.playerId);
    }
    const storedDrops = [];
    const rejectedDrops = [];
    const rolledDrops = groupRolledDrops(creatureAny.drops);
    for (const drop of rolledDrops) {
        const added = await addResourceToActiveBag(params.playerId, drop.name, drop.quantity);
        if (added.success) {
            storedDrops.push(drop);
            continue;
        }
        rejectedDrops.push({
            ...drop,
            reason: normalizeRejectReason(added.reason),
        });
    }
    const bagUsageAfter = rejectedDrops.length > 0 ? await getActiveBagUsage(params.playerId) : null;
    return {
        success: true,
        creature: creatureAny,
        xpAwarded,
        silverAwarded,
        xpProgress,
        classPointsGained,
        generalPointsGained,
        racialPointsGained,
        storedDrops,
        rejectedDrops,
        bagUsageAfter,
    };
}
export function buildCreatureDefeatCard(result, lang) {
    const lines = [
        t3(lang, 'Resultado', 'Result', 'Rezultat'),
        '✧═══••═══✧',
        '',
        `✅ ${t3(lang, 'Derrotaste', 'Defeated', 'Pobezhden')}: ${result.creature.displayName}`,
        `🏆 XP +${result.xpAwarded}`,
        `🪙 ${t3(lang, 'Plata', 'Silver', 'Serebro')}: +${result.silverAwarded}`,
    ];
    if (result.xpProgress.levelAfter > result.xpProgress.levelBefore) {
        lines.push(`⚙️ ${t3(lang, 'Nivel', 'Level', 'Uroven')}: ${result.xpProgress.levelBefore} -> ${result.xpProgress.levelAfter}`);
        lines.push(`🧩 ${t3(lang, 'Build', 'Build', 'Build')}: +${result.classPointsGained} ${t3(lang, 'clase', 'class', 'class')} | +${result.generalPointsGained} ${t3(lang, 'general', 'general', 'general')}`);
        if (result.racialPointsGained > 0) {
            lines.push(`🧬 ${t3(lang, 'Racial', 'Racial', 'Racial')}: +${result.racialPointsGained}`);
        }
        else if (result.xpProgress.levelAfter < 3) {
            lines.push(`🧬 ${t3(lang, 'Racial: aun sin puntos (se activa en Lv 3)', 'Racial: no points yet (unlocks at Lv 3)', 'Racial: ochki otkroyutsya na Lv 3')}`);
        }
        lines.push(`📌 /bs ${t3(lang, 'para gastar build', 'to spend build points', 'dlya build ochkov')}`);
        lines.push(`📌 /racial ${t3(lang, 'para talentos raciales', 'for racial talents', 'dlya rasovykh talantov')}`);
    }
    else {
        lines.push(`⚙️ ${t3(lang, 'Nivel', 'Level', 'Uroven')}: ${result.xpProgress.levelAfter}`);
    }
    lines.push(`📚 XP: ${result.xpProgress.currentXp}/${result.xpProgress.requiredXp}`);
    if (result.storedDrops.length > 0) {
        lines.push('');
        lines.push(t3(lang, '✧═ Loot obtenido ═✧', '✧═ Loot gained ═✧', '✧═ Dobytaya dobycha ═✧'));
        result.storedDrops.forEach((drop, index) => {
            const marker = index === 0 ? '┌' : index === result.storedDrops.length - 1 ? '└' : '├';
            lines.push(`${marker} ${drop.emoji} ${compactLabel(drop.name, 19)} x${drop.quantity}`);
        });
    }
    if (result.rejectedDrops.length > 0) {
        lines.push('');
        lines.push(`${EMOJIS.ui.warning} ${t3(lang, 'Sin espacio:', 'No space:', 'Net mesta:')}`);
        lines.push(`▬ ${result.rejectedDrops[0].reason}`);
        result.rejectedDrops.forEach((drop, index) => {
            const marker = index === 0 ? '┌' : index === result.rejectedDrops.length - 1 ? '└' : '├';
            lines.push(`${marker} ${drop.emoji} ${compactLabel(drop.name, 19)} x${drop.quantity}`);
        });
        if (result.bagUsageAfter) {
            lines.push(`└ ${EMOJIS.ui.bag} ${result.bagUsageAfter.usedSlots}/${result.bagUsageAfter.totalSlots}  ${EMOJIS.ui.weight} ${result.bagUsageAfter.usedWeightKg.toFixed(1)}/${result.bagUsageAfter.totalWeightKg.toFixed(1)} kg`);
        }
    }
    lines.push('');
    lines.push(`⏱️ ${t3(lang, 'Respawn aprox', 'Respawn approx', 'Respavn primerno')}: ${formatCreatureRespawnLabel(result.creature.respawnSeconds, lang)}`);
    return lines.join('\n');
}
