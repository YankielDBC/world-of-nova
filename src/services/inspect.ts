// @ts-nocheck
import { InlineKeyboard } from 'grammy';
import { calculateCombatStats, prisma } from '../lib/db.js';
import { EMOJIS } from '../data/emojis.js';
import { TOOLS } from '../types/tools.js';
import { compactCoordLabel, compactLabel } from '../lib/ui-compact.js';
import { getActiveBagUsage, getEquippedToolForAction, applyDurabilityDamageOnEquippedTool, storeGatheredItems, } from './bags.js';
import { ensurePlayerProgression, getPlayerSkill, getRequiredSkillXp, getSkillXpGain, awardSkillXp, } from './progression.js';
import { getLocationDisplayLabel } from './map.js';
import { buildGroundNodeView, getNodeRequiredSkill, getOrCreateTileInspectState, getPlayerBiomeContext, } from './inspect-state.js';
import { t } from '../lib/i18n.js';
import { formatPopulationLine, getTilePopulationAtCoords } from './population.js';
import { getLocalizedText, getPlaceUiConfig } from '../data/place-ui.js';
import { observePerf } from '../lib/perf-metrics.js';
import { formatClimateLine, getClimateEffectsForBiome, getClimateForTile } from './climate.js';
import { formatDayCycleLine, getDayCycleAmbientLine, getDayCycleEffectsForBiome, getDayCycleSnapshot, } from './day-cycle.js';
import { getMerchantSnapshotAtCoords } from './mystery-merchant.js';
import { getGameplayEffectsForPlayer } from './gameplay-effects.js';
import { triggerBuildReactions } from './build-skills.js';
import { detectActionFromTool, filterYieldsByPeriod, getDayActionKey, getDurabilityDamage, getEnergyCostPerAction, normalizeRejectedReason, parseYields, toRarityCode, } from './inspect-utils.js';
import { buildInspectRow, getSkillDisplayName, getSkillReqLabel } from './inspect-format-utils.js';
import { applyLootMultiplier, applyNodeHarvest, executeGroundLootPickup, rollNodeLoot, } from './inspect-loot.js';
export async function renderInspectForPlayer(playerTgId) {
    const startedAt = Date.now();
    try {
        const context = await getPlayerBiomeContext(playerTgId);
        if (!context) {
            return null;
        }
        const lang = context.player.language ?? 'es';
        if (context.place) {
            const config = getPlaceUiConfig(context.place.slug);
            const placeName = getLocalizedText(config?.name, lang, context.place.displayName);
            const shortDescription = lang === 'en'
                ? `${placeName} is a safe city hub.`
                : lang === 'ru'
                    ? `${placeName} - bezopasnaya gorodskaya zona.`
                    : `${placeName} es una zona segura de ciudad.`;
            const actionsHint = lang === 'en'
                ? 'You can rest, heal, train, and manage services here.'
                : lang === 'ru'
                    ? 'Zdes mozhno otdohnut, lechitsya, trenirovatsya i upravlyat servisami.'
                    : 'Aqui puedes descansar, curarte, entrenar y gestionar servicios.';
            const keyboard = new InlineKeyboard()
                .text(`🏰 ${t(lang, 'mapBuildingsTitle')}`, 'inspect_place_open_buildings')
                .text(`🗺 ${t(lang, 'inspectViewMap')}`, 'inspect_place_open_map');
            return {
                isPlace: true,
                text: `${context.place.emoji} ${placeName}\n` +
                    `✧═══••═══✧\n` +
                    `${compactLabel(shortDescription, 64)}\n` +
                    `💡 ${compactLabel(actionsHint, 72)}`,
                keyboard,
                nodes: [],
            };
        }
        await ensurePlayerProgression(context.player.id);
        const dayCycle = getDayCycleSnapshot();
        const climate = await getClimateForTile({
            worldMapId: context.worldMap.id,
            x: context.tile.x,
            y: context.tile.y,
            biomeName: context.tile.biome?.name,
            biomeDisplayName: context.tile.biome?.displayName,
        });
        const tileState = await getOrCreateTileInspectState({
            tileId: context.tile.id,
            tileX: context.tile.x,
            tileY: context.tile.y,
            biomeId: context.tile.biomeId,
            biomeName: context.tile.biome?.name || 'plains',
            climate,
            dayCycle,
            resourcesJson: context.tile.resourcesJson,
        });
        const visibleNodes = tileState.nodes
            .filter((node) => node.available > 0)
            .map((node, index) => {
            const action = detectActionFromTool(node.requiredTool, node.nodeType);
            return {
                listIndex: index + 1,
                kind: 'node',
                nodeId: node.nodeId,
                nodeType: node.nodeType,
                emoji: node.emoji,
                displayName: node.displayName,
                available: node.available,
                requiredLevel: node.requiredLevel,
                requiredSkill: getNodeRequiredSkill(action, node.nodeType, node.requiredTool),
                action,
                rarity: node.rarity,
                rarityCode: toRarityCode(node.rarity),
            };
        });
        const groundNodes = tileState.groundLoot
            .filter((entry) => entry.quantity > 0)
            .map((entry, index) => buildGroundNodeView(entry, visibleNodes.length + index + 1));
        const nodes = [...visibleNodes, ...groundNodes];
        const locationName = getLocationDisplayLabel(context.tile, null, lang);
        const bagUsage = await getActiveBagUsage(context.player.id);
        const population = await getTilePopulationAtCoords({
            currentPlayerId: context.player.id,
            x: context.player.mapX,
            y: context.player.mapY,
        });
        const populationLine = formatPopulationLine(lang, population);
        const merchant = await getMerchantSnapshotAtCoords({
            worldMapId: context.worldMap.id,
            x: context.player.mapX,
            y: context.player.mapY,
        });
        const lines = [
            `${context.tile.biome?.emoji || EMOJIS.biome.plains} ${t(lang, 'mapYouAreIn')} ${compactCoordLabel(context.player.mapX, context.player.mapY)} - ${compactLabel(locationName, 28)}`,
        ];
        if (nodes.length === 0) {
            lines.push('');
            lines.push(`👀${t(lang, 'inspectLookNone1')}`);
            lines.push(t(lang, 'inspectLookNone2'));
            lines.push('');
        }
        else {
            lines.push(`👀 ${t(lang, 'inspectLookFound')}`);
            lines.push('┌────────┐');
            for (const [index, node] of nodes.entries()) {
                const marker = index === 0 ? '┌' : index === nodes.length - 1 ? '└' : '├';
                lines.push(`${marker} ${buildInspectRow(node)}`);
            }
            lines.push('');
        }
        if (populationLine) {
            lines.push(populationLine);
        }
        if (merchant) {
            const merchantHint = lang === 'en'
                ? '🕵️ A Mysterious Merchant is lurking in this area.'
                : lang === 'ru'
                    ? '🕵️ V etoi zone zamechen Tainstvennyi Torgovets.'
                    : '🕵️ Un Comerciante Misterioso merodea esta zona.';
            lines.push(merchantHint);
        }
        lines.push(formatClimateLine(lang, climate));
        lines.push(formatDayCycleLine(lang, dayCycle));
        const ambientLine = getDayCycleAmbientLine(lang, context.tile.biome?.name || 'plains', dayCycle);
        if (ambientLine) {
            lines.push(ambientLine);
        }
        lines.push('');
        lines.push(`${EMOJIS.ui.stamina} STA ${context.player.energy}/${context.player.maxEnergy}`);
        lines.push(`${EMOJIS.ui.bag} ${t(lang, 'bagSlots')} ${bagUsage?.usedSlots ?? 0}/${bagUsage?.totalSlots ?? 0}   ${EMOJIS.ui.weight} ${(bagUsage?.usedWeightKg ?? 0).toFixed(1)}/${(bagUsage?.totalWeightKg ?? 0).toFixed(1)} kg`);
        const keyboard = new InlineKeyboard();
        const hasChop = nodes.some((node) => node.action === 'chop');
        const hasMine = nodes.some((node) => node.action === 'mine');
        const hasGather = nodes.some((node) => node.action === 'gather');
        const hasFishNodes = nodes.some((node) => node.action === 'gather' && node.requiredSkill === 'fish');
        const hasGatherNodes = nodes.some((node) => node.action === 'gather' && node.requiredSkill !== 'fish');
        if (hasChop) {
            keyboard.text(t(lang, 'inspectActionChop'), 'inspect_action:chop');
        }
        if (hasMine) {
            keyboard.text(t(lang, 'inspectActionMine'), 'inspect_action:mine');
        }
        if (hasGather) {
            const gatherLabel = hasFishNodes && !hasGatherNodes ? t(lang, 'inspectActionFish') : t(lang, 'inspectActionGather');
            keyboard.text(gatherLabel, 'inspect_action:gather');
        }
        if (merchant) {
            const merchantButton = lang === 'en'
                ? '🕵️ Merchant'
                : lang === 'ru'
                    ? '🕵️ Torgovec'
                    : '🕵️ Comerciante';
            keyboard.row().text(merchantButton, 'inspect_merchant');
        }
        keyboard.row().text(t(lang, 'inspectActionExit'), 'inspect_exit');
        return {
            isPlace: false,
            text: lines.join('\n'),
            keyboard,
            tileId: context.tile.id,
            nodes,
        };
    }
    finally {
        observePerf('inspect.render', Date.now() - startedAt);
    }
}
export async function getInspectNodesForPlayer(playerTgId) {
    const rendered = await renderInspectForPlayer(playerTgId);
    if (!rendered || rendered.isPlace || !rendered.tileId) {
        return null;
    }
    return {
        tileId: rendered.tileId,
        nodes: rendered.nodes,
    };
}
export async function executeInspectAction(params) {
    const startedAt = Date.now();
    try {
        const context = await getPlayerBiomeContext(params.playerTgId);
        if (!context) {
            return { success: false, message: 'No pude ubicar tu posicion actual.' };
        }
        if (context.place) {
            const lang = context.player.language ?? 'es';
            return { success: false, message: t(lang, 'inspectPlaceHint') };
        }
        const lang = context.player.language ?? 'es';
        await ensurePlayerProgression(context.player.id);
        const inspectData = await renderInspectForPlayer(params.playerTgId);
        if (!inspectData || inspectData.isPlace || !inspectData.tileId) {
            return { success: false, message: 'No hay recursos inspeccionables aqui.' };
        }
        const selected = inspectData.nodes.find((node) => node.listIndex === params.listIndex);
        if (!selected) {
            return { success: false, message: `No existe el recurso #${String(params.listIndex).padStart(2, '0')}.` };
        }
        if (selected.action !== params.action) {
            return { success: false, message: 'Ese recurso requiere otra accion.' };
        }
        if (params.quantity < 1 || params.quantity > selected.available) {
            return {
                success: false,
                message: `Cantidad invalida. En ese nodo tienes ${selected.available} unidades disponibles.`,
            };
        }
        if (selected.kind === 'ground') {
            return executeGroundLootPickup({
                tileId: inspectData.tileId,
                playerId: context.player.id,
                selected,
                quantity: params.quantity,
            });
        }
        const skill = await getPlayerSkill(context.player.id, selected.requiredSkill);
        if (!skill || !skill.learned) {
            return {
                success: false,
                message: `No has aprendido ${getSkillReqLabel(selected.requiredSkill)} aun.`,
            };
        }
        if (skill.level < selected.requiredLevel) {
            return {
                success: false,
                message: `Necesitas ${getSkillReqLabel(selected.requiredSkill)} LvL ${selected.requiredLevel}. Tu nivel actual es ${skill.level}.`,
            };
        }
        const equipped = await getEquippedToolForAction(context.player.id, params.action);
        if (!equipped) {
            return { success: false, message: 'No tienes herramienta equipada para esta accion.' };
        }
        const equippedMeta = TOOLS[equipped.toolKey];
        if (!equippedMeta) {
            return { success: false, message: 'La herramienta equipada no es valida.' };
        }
        if (equipped.instance.isBroken || equipped.instance.durability <= 0) {
            return { success: false, message: `Tu ${equippedMeta.emoji} ${equippedMeta.name} esta rota.` };
        }
        if (selected.action === 'chop' && equippedMeta.type !== 'woodcutting' && equippedMeta.type !== 'harvesting') {
            return { success: false, message: 'Necesitas una herramienta de tala para este nodo.' };
        }
        if (selected.action === 'mine' && equippedMeta.type !== 'mining') {
            return { success: false, message: 'Necesitas una herramienta minera para este nodo.' };
        }
        if (selected.action === 'gather' && selected.requiredSkill === 'fish' && equippedMeta.type !== 'fishing') {
            return { success: false, message: 'Necesitas una cana de pescar para este nodo.' };
        }
        if (selected.action === 'gather' &&
            selected.requiredSkill !== 'fish' &&
            equippedMeta.type !== 'gathering' &&
            equippedMeta.type !== 'harvesting') {
            return { success: false, message: 'Necesitas una herramienta de recoleccion para este nodo.' };
        }
        const climate = await getClimateForTile({
            worldMapId: context.worldMap.id,
            x: context.tile.x,
            y: context.tile.y,
            biomeName: context.tile.biome?.name,
            biomeDisplayName: context.tile.biome?.displayName,
        });
        const dayCycle = getDayCycleSnapshot();
        const climateEffects = getClimateEffectsForBiome(context.tile.biome?.name || 'plains', climate);
        const dayEffects = getDayCycleEffectsForBiome(context.tile.biome?.name || 'plains', dayCycle);
        const dayActionKey = getDayActionKey(selected.action, selected.nodeType);
        const gameplayEffects = await getGameplayEffectsForPlayer(context.player.id);
        const actionKey = selected.requiredSkill === 'fish' ? 'fish' : selected.action;
        const racialActionEnergyMultiplier = gameplayEffects.actionEnergyCostMultiplier[actionKey] ?? 1;
        const dayActionEnergyCost = dayEffects.actionEnergyCostMultiplier[dayActionKey] ?? 1;
        const baseEnergyPerAction = getEnergyCostPerAction(selected.action, selected.rarity, selected.requiredLevel);
        const energyPerAction = Math.max(1, Math.ceil(baseEnergyPerAction *
            climateEffects.energyCostMultiplier *
            dayEffects.energyCostMultiplier *
            dayActionEnergyCost *
            racialActionEnergyMultiplier));
        const totalEnergyCost = energyPerAction * params.quantity;
        if (context.player.energy < totalEnergyCost) {
            return {
                success: false,
                message: `Te faltan ${totalEnergyCost - context.player.energy} STA.`,
            };
        }
        const nodeRow = await prisma.resourceNode.findUnique({
            where: { id: selected.nodeId },
        });
        if (!nodeRow) {
            return { success: false, message: 'El nodo seleccionado ya no existe.' };
        }
        const yields = filterYieldsByPeriod(parseYields(nodeRow.yieldsJson), context.tile.biome?.name || 'plains', dayCycle.period);
        if (yields.length === 0) {
            const blockedByPeriodMsg = lang === 'en'
                ? 'This resource is inactive during this time period.'
                : lang === 'ru'
                    ? 'Etot resurs seychas neaktiven v etot period.'
                    : 'Este recurso no esta activo en este horario.';
            return { success: false, message: blockedByPeriodMsg };
        }
        const baseLoot = rollNodeLoot(yields, params.quantity);
        const yieldMultiplier = gameplayEffects.actionYieldMultiplier[actionKey] ?? 1;
        const rolledLoot = applyLootMultiplier(baseLoot, yieldMultiplier);
        const storage = await storeGatheredItems(context.player.id, rolledLoot);
        const nextEnergy = Math.max(0, context.player.energy - totalEnergyCost);
        await prisma.player.update({
            where: { id: context.player.id },
            data: {
                energy: {
                    decrement: totalEnergyCost,
                },
            },
        });
        const baseStats = calculateCombatStats(context.player);
        const hpPct = baseStats.maxHp > 0 ? (context.player.hp / baseStats.maxHp) * 100 : 100;
        const staPct = baseStats.maxEnergy > 0 ? (nextEnergy / baseStats.maxEnergy) * 100 : 100;
        try {
            await triggerBuildReactions({
                playerId: context.player.id,
                event: 'on_sta_below_threshold',
                condition: { hpPct, staPct },
            });
            await triggerBuildReactions({
                playerId: context.player.id,
                event: 'on_hp_below_threshold',
                condition: { hpPct, staPct },
            });
        }
        catch {
            // Ignore build reaction trigger failures during inspect action.
        }
        await applyNodeHarvest(inspectData.tileId, selected.nodeId, params.quantity);
        const durabilityDamage = getDurabilityDamage(selected.requiredLevel, selected.rarity);
        const toolDurability = await applyDurabilityDamageOnEquippedTool(context.player.id, params.action, durabilityDamage);
        const xpDetails = getSkillXpGain({
            skillLevel: skill.level,
            requiredLevel: selected.requiredLevel,
            rarity: selected.rarity,
            actions: params.quantity,
        });
        const gainedXp = xpDetails.gainedXp;
        const xpResult = gainedXp > 0 ? await awardSkillXp(context.player.id, selected.requiredSkill, gainedXp) : null;
        const bandEmoji = {
            red: '🔴',
            orange: '🟠',
            yellow: '🟡',
            green: '🟢',
            gray: '⚪',
        };
        const bagUsageAfter = await getActiveBagUsage(context.player.id);
        const lines = [
            t(lang, 'inspectResultTitle'),
            '✧═══••═══✧',
            '',
            formatClimateLine(lang, climate),
            formatDayCycleLine(lang, dayCycle),
            '',
            `┌⚡ STA: -${totalEnergyCost} (${energyPerAction} por accion)`,
            `└🧱 Durabilidad: -${durabilityDamage}`,
            '',
        ];
        if (storage.stored.length > 0) {
            lines.push(t(lang, 'inspectLootTitle'));
            for (const [index, item] of storage.stored.entries()) {
                const marker = index === 0 ? '┌' : index === storage.stored.length - 1 ? '└' : '├';
                lines.push(`${marker} ${item.emoji} ${compactLabel(item.name, 20)} x${item.quantity}`);
            }
        }
        if (storage.rejected.length > 0) {
            if (storage.stored.length > 0) {
                lines.push('');
            }
            lines.push(`${EMOJIS.ui.warning} ${t(lang, 'inspectNoSpace')}`);
            lines.push(`▬ ${normalizeRejectedReason(storage.rejected[0].reason)}`);
            for (const [index, item] of storage.rejected.entries()) {
                const marker = index === 0 ? '┌' : index === storage.rejected.length - 1 ? '└' : '├';
                lines.push(`${marker} ${item.emoji} ${compactLabel(item.name, 20)} x${item.quantity}`);
            }
            if (bagUsageAfter) {
                lines.push(`└ ${EMOJIS.ui.bag} Bolsa: ${bagUsageAfter.usedSlots}/${bagUsageAfter.totalSlots}  ${EMOJIS.ui.weight} ${bagUsageAfter.usedWeightKg.toFixed(1)}/${bagUsageAfter.totalWeightKg.toFixed(1)} kg`);
            }
            lines.push('');
        }
        lines.push(`🏆 XP ${selected.requiredSkill.toUpperCase()}: +${gainedXp} ${bandEmoji[xpDetails.band]}`);
        lines.push('');
        let toolBroken = false;
        const skillName = getSkillDisplayName(lang, selected.requiredSkill);
        const currentSkillLevel = xpResult?.afterLevel ?? skill.level;
        if (xpResult && xpResult.afterLevel > xpResult.beforeLevel) {
            lines.push(`┌ ⚙️ ${skillName} ⇪ ${t(lang, 'inspectLevelUp')} ${xpResult.beforeLevel} >🏆${xpResult.afterLevel}`);
        }
        else {
            lines.push(`┌ ⚙️ ${skillName} Lvl ${currentSkillLevel}`);
        }
        lines.push(`├ ${EMOJIS.ui.book} Progreso XP: ${xpResult?.currentXp ?? skill.xp} / ${xpResult?.requiredXp ?? getRequiredSkillXp(selected.requiredSkill, currentSkillLevel)}`);
        if (toolDurability) {
            lines.push(`└ ${equippedMeta.emoji} ${compactLabel(equippedMeta.name, 20)} ${toolDurability.durability}/${toolDurability.maxDurability}`);
            if (toolDurability.brokeNow) {
                toolBroken = true;
                lines.push('Tu herramienta se rompio.');
            }
        }
        else {
            lines.push('└ Sin herramienta equipada');
        }
        return {
            success: true,
            message: lines.join('\n').trim(),
            tileId: inspectData.tileId,
            toolBroken,
        };
    }
    finally {
        observePerf('inspect.action', Date.now() - startedAt);
    }
}
