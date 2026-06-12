// @ts-nocheck
import { prisma } from '../lib/db.js';
const RECOVERY_STATUS_ACTIVE = 'ACTIVE';
const RECOVERY_STATUS_FINALIZING = 'FINALIZING';
function toBigIntChatId(chatId) {
    return BigInt(Math.trunc(chatId));
}
function chatIdToNumber(chatId) {
    return typeof chatId === 'bigint' ? Number(chatId) : chatId;
}
export const TIMED_PLACE_RECOVERY_SECONDS = {
    'gilded-rest': 60,
    'gilded-rest-quick': 20,
    'mercy-edge': 45,
    'mercy-edge-divine': 15,
    'village-rest': 60,
    'village-rest-quick': 20,
    'village-shrine': 45,
    'village-shrine-divine': 15,
};
export const FREE_RECOVERY_PER_15_MIN = 1.0416;
export const FREE_RECOVERY_RATE_PER_SECOND = FREE_RECOVERY_PER_15_MIN / (15 * 60);
export const CUSTOM_PLACE_FREE_SERVICES = new Set([
    'gilded-rest-free',
    'mercy-edge-free',
    'village-rest-free',
    'village-shrine-free',
]);
function t3(lang, es, en, ru) {
    if (lang === 'en') {
        return en;
    }
    if (lang === 'ru') {
        return ru;
    }
    return es;
}
function mapRecoveryRow(row) {
    return {
        token: row.token,
        slug: row.slug,
        placeId: row.placeId,
        buildingKey: row.buildingKey,
        serviceName: row.serviceName,
        lore: row.lore,
        effectType: row.effectType,
        startValue: row.startValue,
        maxValue: row.maxValue,
        ratePerSecond: row.ratePerSecond,
        startedAt: row.startedAt.getTime(),
        endsAt: row.endsAt.getTime(),
        chatId: chatIdToNumber(row.chatId),
    };
}
export async function getActivePlaceRecoveryByTgId(tgId) {
    const row = await prisma.playerRecovery.findUnique({
        where: { tgId },
    });
    if (!row || row.status !== RECOVERY_STATUS_ACTIVE) {
        return null;
    }
    return mapRecoveryRow(row);
}
export async function hasActivePlaceRecovery(tgId) {
    const row = await prisma.playerRecovery.findUnique({
        where: { tgId },
        select: { status: true },
    });
    return Boolean(row && row.status === RECOVERY_STATUS_ACTIVE);
}
export async function upsertActivePlaceRecovery(params) {
    const row = await prisma.playerRecovery.upsert({
        where: { playerId: params.playerId },
        create: {
            playerId: params.playerId,
            tgId: params.tgId,
            token: params.state.token,
            slug: params.state.slug,
            placeId: params.state.placeId,
            buildingKey: params.state.buildingKey,
            serviceName: params.state.serviceName,
            lore: params.state.lore,
            effectType: params.state.effectType,
            startValue: params.state.startValue,
            maxValue: params.state.maxValue,
            ratePerSecond: params.state.ratePerSecond,
            startedAt: new Date(params.state.startedAt),
            endsAt: new Date(params.state.endsAt),
            chatId: toBigIntChatId(params.state.chatId),
            status: RECOVERY_STATUS_ACTIVE,
        },
        update: {
            tgId: params.tgId,
            token: params.state.token,
            slug: params.state.slug,
            placeId: params.state.placeId,
            buildingKey: params.state.buildingKey,
            serviceName: params.state.serviceName,
            lore: params.state.lore,
            effectType: params.state.effectType,
            startValue: params.state.startValue,
            maxValue: params.state.maxValue,
            ratePerSecond: params.state.ratePerSecond,
            startedAt: new Date(params.state.startedAt),
            endsAt: new Date(params.state.endsAt),
            chatId: toBigIntChatId(params.state.chatId),
            status: RECOVERY_STATUS_ACTIVE,
        },
    });
    return mapRecoveryRow(row);
}
export async function listDueRecoveryTgIds(limit = 50) {
    const rows = await prisma.playerRecovery.findMany({
        where: {
            status: RECOVERY_STATUS_ACTIVE,
            endsAt: {
                lte: new Date(),
            },
        },
        select: {
            tgId: true,
        },
        orderBy: {
            endsAt: 'asc',
        },
        take: limit,
    });
    return rows.map((row) => row.tgId);
}
export async function finalizeRecoveryState(params) {
    return prisma.$transaction(async (tx) => {
        const current = await tx.playerRecovery.findUnique({
            where: { tgId: params.tgId },
        });
        if (!current || current.status !== RECOVERY_STATUS_ACTIVE) {
            return null;
        }
        if (params.expectedToken && current.token !== params.expectedToken) {
            return null;
        }
        const claimed = await tx.playerRecovery.updateMany({
            where: {
                id: current.id,
                status: RECOVERY_STATUS_ACTIVE,
                ...(params.expectedToken ? { token: params.expectedToken } : {}),
            },
            data: {
                status: RECOVERY_STATUS_FINALIZING,
            },
        });
        if (claimed.count !== 1) {
            return null;
        }
        const active = mapRecoveryRow(current);
        const player = await tx.player.findUnique({
            where: { id: current.playerId },
            select: {
                id: true,
                hp: true,
                energy: true,
                maxHp: true,
                maxEnergy: true,
                gold: true,
                silver: true,
                language: true,
            },
        });
        if (!player) {
            await tx.playerRecovery.delete({
                where: { id: current.id },
            });
            return null;
        }
        const previousValue = active.effectType === 'ENERGY' ? player.energy : player.hp;
        const projected = getRecoveryProjectedValue(active);
        const cappedProjected = Math.min(active.maxValue, projected);
        const nextValue = Math.max(previousValue, cappedProjected);
        const updatedPlayer = await tx.player.update({
            where: { id: player.id },
            data: active.effectType === 'ENERGY' ? { energy: nextValue } : { hp: nextValue },
            select: {
                gold: true,
                silver: true,
            },
        });
        await tx.playerRecovery.delete({
            where: { id: current.id },
        });
        return {
            active,
            previousValue,
            nextValue,
            gold: updatedPlayer.gold,
            silver: updatedPlayer.silver,
            language: player.language || 'es',
            chatId: active.chatId,
        };
    });
}
export function getTimedPlaceRecoverySeconds(slug) {
    const seconds = TIMED_PLACE_RECOVERY_SECONDS[slug];
    return Number.isFinite(seconds) ? seconds : null;
}
export function getRecoveryEffectTypeFromSlug(slug) {
    return slug.startsWith('mercy-edge') || slug.startsWith('village-shrine') ? 'HP' : 'ENERGY';
}
export function getRecoveryInterruptLabel(slug, lang) {
    if (slug.startsWith('gilded-rest') || slug.startsWith('village-rest')) {
        return t3(lang, 'Despertar', 'Wake up', 'Prosnutsya');
    }
    return t3(lang, 'Interrumpir', 'Interrupt', 'Prervat');
}
export function getRecoveryFocusLabel(slug, lang) {
    if (slug.startsWith('gilded-rest') || slug.startsWith('village-rest')) {
        return t3(lang, 'Ir al descanso', 'Go to rest', 'K otdyhu');
    }
    return t3(lang, 'Ir a sanacion', 'Go to healing', 'K lecheniyu');
}
export function getRecoveryRemainingSeconds(state) {
    return Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000));
}
export function getRecoveryProjectedValue(state) {
    const elapsedMs = Math.max(0, Math.min(Date.now(), state.endsAt) - state.startedAt);
    const elapsedSeconds = elapsedMs / 1000;
    const projected = state.startValue + elapsedSeconds * state.ratePerSecond;
    return Math.min(state.maxValue, Math.floor(projected));
}
