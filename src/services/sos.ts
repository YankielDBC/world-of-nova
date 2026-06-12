// @ts-nocheck
import { prisma } from '../lib/db.js';
import { storeGatheredItems } from './bags.js';
import { t } from '../lib/i18n.js';
import { EMOJIS } from '../data/emojis.js';
const SOS_COST_SILVER = 5;
const SOS_DAILY_LIMIT = 2;
const SOS_MONTHLY_LIMIT = 10;
const SOS_FRUITS = [
    { item: 'Apple', emoji: EMOJIS.items.apple },
    { item: 'Orange', emoji: EMOJIS.items.orange },
    { item: 'Mango', emoji: '🥭' },
    { item: 'Coconut', emoji: EMOJIS.items.coconut },
];
function utcDayKey(now) {
    return now.toISOString().slice(0, 10);
}
function utcMonthKey(now) {
    return now.toISOString().slice(0, 7);
}
function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function rollSosDrops() {
    const count = Math.random() < 0.5 ? 1 : 2;
    const grouped = new Map();
    for (let i = 0; i < count; i += 1) {
        const picked = randomFrom(SOS_FRUITS);
        const current = grouped.get(picked.item);
        if (current) {
            current.quantity += 1;
        }
        else {
            grouped.set(picked.item, {
                item: picked.item,
                emoji: picked.emoji,
                quantity: 1,
            });
        }
    }
    return Array.from(grouped.values());
}
export async function requestSosDelivery(playerId, lang) {
    const now = new Date();
    const dayKey = utcDayKey(now);
    const monthKey = utcMonthKey(now);
    const charge = await prisma.$transaction(async (tx) => {
        const player = await tx.player.findUnique({
            where: { id: playerId },
            select: {
                id: true,
                silver: true,
                sosDailyKey: true,
                sosDailyCount: true,
                sosMonthlyKey: true,
                sosMonthlyCount: true,
            },
        });
        if (!player) {
            return { ok: false, reason: 'NO_PLAYER' };
        }
        const dailyUsed = player.sosDailyKey === dayKey ? player.sosDailyCount : 0;
        const monthlyUsed = player.sosMonthlyKey === monthKey ? player.sosMonthlyCount : 0;
        if (dailyUsed >= SOS_DAILY_LIMIT) {
            return {
                ok: false,
                reason: 'DAILY_LIMIT',
                dailyUsed,
            };
        }
        if (monthlyUsed >= SOS_MONTHLY_LIMIT) {
            return {
                ok: false,
                reason: 'MONTHLY_LIMIT',
                monthlyUsed,
            };
        }
        if (player.silver < SOS_COST_SILVER) {
            return {
                ok: false,
                reason: 'NO_SILVER',
                silver: player.silver,
            };
        }
        const nextDaily = dailyUsed + 1;
        const nextMonthly = monthlyUsed + 1;
        const updated = await tx.player.update({
            where: { id: player.id },
            data: {
                silver: { decrement: SOS_COST_SILVER },
                sosDailyKey: dayKey,
                sosDailyCount: nextDaily,
                sosMonthlyKey: monthKey,
                sosMonthlyCount: nextMonthly,
            },
            select: {
                silver: true,
            },
        });
        return {
            ok: true,
            dailyUsed: nextDaily,
            monthlyUsed: nextMonthly,
            silverLeft: updated.silver,
        };
    });
    if (!charge.ok) {
        if (charge.reason === 'DAILY_LIMIT') {
            return {
                success: false,
                message: t(lang, 'sosDailyLimit', {
                    used: charge.dailyUsed ?? SOS_DAILY_LIMIT,
                    limit: SOS_DAILY_LIMIT,
                }),
            };
        }
        if (charge.reason === 'MONTHLY_LIMIT') {
            return {
                success: false,
                message: t(lang, 'sosMonthlyLimit', {
                    used: charge.monthlyUsed ?? SOS_MONTHLY_LIMIT,
                    limit: SOS_MONTHLY_LIMIT,
                }),
            };
        }
        if (charge.reason === 'NO_SILVER') {
            return {
                success: false,
                message: t(lang, 'sosNoSilver', {
                    cost: SOS_COST_SILVER,
                    silver: charge.silver ?? 0,
                }),
            };
        }
        return {
            success: false,
            message: t(lang, 'uiErrorOccurred'),
        };
    }
    const rolledDrops = rollSosDrops();
    const storedResult = await storeGatheredItems(playerId, rolledDrops);
    const storedLine = storedResult.stored.length > 0
        ? storedResult.stored.map((entry) => `${entry.emoji}x${entry.quantity}`).join(' ')
        : t(lang, 'sosNone');
    const rejectedLine = storedResult.rejected.length > 0
        ? storedResult.rejected.map((entry) => `${entry.emoji}x${entry.quantity}`).join(' ')
        : '';
    const lines = [
        t(lang, 'sosArrivedTitle'),
        `┌📦 ${t(lang, 'sosDelivered')}: ${storedLine}`,
        rejectedLine ? `├⚠️ ${t(lang, 'sosRejected')}: ${rejectedLine}` : '',
        `├${EMOJIS.ui.silver} ${t(lang, 'sosCostLine', { cost: SOS_COST_SILVER, silver: charge.silverLeft })}`,
        `└${EMOJIS.ui.stats} ${t(lang, 'sosUsageLine', {
            daily: charge.dailyUsed,
            dailyLimit: SOS_DAILY_LIMIT,
            monthly: charge.monthlyUsed,
            monthlyLimit: SOS_MONTHLY_LIMIT,
        })}`,
    ].filter((line) => line.length > 0);
    return {
        success: true,
        message: lines.join('\n'),
    };
}
