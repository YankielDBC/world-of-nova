// @ts-nocheck
import { prisma, getPlayerByTelegramId } from '../../lib/db.js';
import { t } from '../../lib/i18n.js';
import { getPlaceUiConfig } from '../../data/place-ui.js';
import { getPlaceAtCoords, renderMap } from '../../services/map.js';
import { sendMapCardSafeViaContext } from '../../services/map-delivery.js';
import { renderMapCardText } from '../../services/map-message.js';
import { formatPopulationLine, getTilePopulationAtCoords } from '../../services/population.js';
import { formatPlaceBuilding, formatPlaceOverview } from '../../services/place-ui-render.js';
function getPlayerLanguage(player) {
    return player?.language ?? 'es';
}
function findBuildingConfig(placeSlug, buildingKey) {
    const config = getPlaceUiConfig(placeSlug);
    if (!config) {
        return null;
    }
    return config.buildings.find((building) => building.key === buildingKey) || null;
}
export function createPlaceModule(deps) {
    async function handlePlaceEntry(ctx) {
        const tgId = String(ctx.from.id);
        const player = await getPlayerByTelegramId(tgId);
        if (!player) {
            await ctx.reply(t('es', 'errorNotRegistered'));
            return;
        }
        const lang = getPlayerLanguage(player);
        const place = await getPlaceAtCoords(player.mapX, player.mapY);
        if (!place) {
            await ctx.reply(t(lang, 'placeNoHere'));
            return;
        }
        const population = await getTilePopulationAtCoords({
            currentPlayerId: player.id,
            x: player.mapX,
            y: player.mapY,
        });
        const populationLine = formatPopulationLine(lang, population);
        const { message, keyboard } = formatPlaceOverview(place, lang, populationLine);
        await ctx.reply(message, { reply_markup: keyboard });
    }
    async function handlePlaceBuilding(ctx, placeId, buildingKey) {
        const tgId = String(ctx.from.id);
        const player = await getPlayerByTelegramId(tgId);
        if (!player) {
            await ctx.answerCallbackQuery(t('es', 'errorNotRegistered'));
            return;
        }
        const lang = getPlayerLanguage(player);
        const place = await prisma.place.findUnique({
            where: { id: placeId },
            include: {
                interactions: {
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });
        if (!place) {
            await ctx.answerCallbackQuery(t(lang, 'placeNoHere'));
            return;
        }
        if (player.mapX !== place.coordX || player.mapY !== place.coordY) {
            await ctx.answerCallbackQuery(t(lang, 'placeNotAt'));
            return;
        }
        const building = findBuildingConfig(place.slug, buildingKey);
        if (!building) {
            await ctx.answerCallbackQuery(t(lang, 'placeInteractionMissing'));
            return;
        }
        if (buildingKey === 'crown-chamber' || buildingKey === 'village-chest') {
            await deps.openBankHub(ctx, {
                mode: 'edit',
                placeId,
                buildingKey,
            });
            return;
        }
        if (buildingKey === 'grand-exchange') {
            await deps.openMarketHub(ctx, {
                mode: 'edit',
                placeId,
                buildingKey,
            });
            return;
        }
        const population = await getTilePopulationAtCoords({
            currentPlayerId: player.id,
            x: player.mapX,
            y: player.mapY,
        });
        const populationLine = formatPopulationLine(lang, population);
        let learnedSkillKeys;
        if (building.key === 'training-yard') {
            const skills = await prisma.playerSkill.findMany({
                where: {
                    playerId: player.id,
                    skillKey: { in: ['chop', 'gather', 'mine', 'fish'] },
                    learned: true,
                },
                select: { skillKey: true },
            });
            learnedSkillKeys = new Set(skills.map((entry) => entry.skillKey));
        }
        const { message, keyboard } = formatPlaceBuilding(place, building, lang, populationLine, {
            learnedSkillKeys,
        });
        await ctx.editMessageText(message, { reply_markup: keyboard });
    }
    async function handlePlaceExit(ctx) {
        const tgId = String(ctx.from.id);
        const player = await getPlayerByTelegramId(tgId);
        if (!player) {
            await ctx.answerCallbackQuery(t('es', 'errorNotRegistered'));
            return;
        }
        const mapResult = await renderMap(tgId);
        if (!mapResult) {
            await ctx.answerCallbackQuery();
            return;
        }
        await sendMapCardSafeViaContext({
            ctx,
            mode: 'edit',
            text: renderMapCardText(mapResult, getPlayerLanguage(player)),
            keyboard: mapResult.keyboard,
            source: 'place:exit-to-map',
        });
    }
    return {
        handlePlaceEntry,
        handlePlaceBuilding,
        handlePlaceExit,
    };
}
