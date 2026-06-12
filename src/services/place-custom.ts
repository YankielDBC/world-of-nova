// @ts-nocheck
import { prisma } from '../lib/db.js';
import { grantToolToPlayer } from './bags.js';
import { enterCaveForPlayer } from './cave-system.js';
import { getBankSummary, depositToVaultWithFee, withdrawFromVault } from './crown-bank.js';
import { awardSkillXp, ensurePlayerProgression, getPlayerSkill } from './progression.js';
import { getForgeServiceCost } from '../data/price-index.js';
function t3(lang, es, en, ru) {
    if (lang === 'en') {
        return en;
    }
    if (lang === 'ru') {
        return ru;
    }
    return es;
}
async function repairPlayerToolsForForge(playerId, mode, tx = prisma) {
    const tools = await tx.playerTool.findMany({
        where: { playerId },
        orderBy: { id: 'asc' },
    });
    if (tools.length === 0) {
        return {
            success: false,
            repairedCount: 0,
            restoredPoints: 0,
            message: 'No tienes herramientas para reparar.',
        };
    }
    let repairedCount = 0;
    let restoredPoints = 0;
    for (const tool of tools) {
        const targetDurability = mode === 'full'
            ? tool.maxDurability
            : Math.min(tool.maxDurability, tool.durability + Math.max(1, Math.ceil(tool.maxDurability * 0.4)));
        if (targetDurability <= tool.durability) {
            continue;
        }
        repairedCount += 1;
        restoredPoints += targetDurability - tool.durability;
        await tx.playerTool.update({
            where: { id: tool.id },
            data: {
                durability: targetDurability,
                isBroken: targetDurability <= 0 ? true : false,
            },
        });
    }
    if (repairedCount === 0) {
        return {
            success: false,
            repairedCount: 0,
            restoredPoints: 0,
            message: 'Tu equipo ya estaba en buen estado.',
        };
    }
    return {
        success: true,
        repairedCount,
        restoredPoints,
        message: `Reparadas ${repairedCount} herramientas (+${restoredPoints} durabilidad total).`,
    };
}
function getTrainingRule(slug) {
    if (slug === 'training-yard-lesson-chop') {
        return { skillKey: 'chop', requiredLevel: 1, xpGain: 10, label: 'Tala' };
    }
    if (slug === 'training-yard-lesson-gather') {
        return { skillKey: 'gather', requiredLevel: 3, xpGain: 12, label: 'Recoleccion' };
    }
    if (slug === 'training-yard-lesson-mine') {
        return { skillKey: 'mine', requiredLevel: 5, xpGain: 14, label: 'Mineria' };
    }
    if (slug === 'training-yard-lesson-fishing') {
        return { skillKey: 'fish', requiredLevel: 8, xpGain: 16, label: 'Pesca' };
    }
    return null;
}
export async function executeCustomPlaceInteraction(params) {
    const { interaction, lang, playerId, tgId } = params;
    const slug = interaction.slug;
    if (slug === 'crow-forge-repair-quick' || slug === 'crow-forge-repair-full') {
        const cost = getForgeServiceCost(slug, interaction.costAmount ?? (slug === 'crow-forge-repair-full' ? 10 : 4));
        const repairMode = slug === 'crow-forge-repair-full' ? 'full' : 'quick';
        const result = await prisma.$transaction(async (tx) => {
            const freshPlayer = await tx.player.findUnique({
                where: { id: playerId },
                select: { silver: true, gold: true },
            });
            if (!freshPlayer) {
                return { ok: false, error: t3(lang, 'Jugador no encontrado.', 'Player not found.', 'Igrok ne naiden.') };
            }
            if (freshPlayer.silver < cost) {
                return {
                    ok: false,
                    error: t3(lang, `Necesitas ${cost} plata.`, `You need ${cost} silver.`, `Nuzhno ${cost} serebra.`),
                };
            }
            const repair = await repairPlayerToolsForForge(playerId, repairMode, tx);
            if (!repair.success) {
                return { ok: false, error: repair.message };
            }
            await tx.player.update({
                where: { id: playerId },
                data: { silver: { decrement: cost } },
            });
            const after = await tx.player.findUnique({
                where: { id: playerId },
                select: { silver: true, gold: true },
            });
            return {
                ok: true,
                effect: repair.message,
                currency: `💰 ${after?.gold ?? freshPlayer.gold}  | 🪙 ${after?.silver ?? freshPlayer.silver}`,
            };
        });
        if (!result.ok) {
            return { handled: true, success: false, errorMessage: result.error };
        }
        return {
            handled: true,
            success: true,
            effectMessage: slug === 'crow-forge-repair-full'
                ? t3(lang, '🔥 El acero vuelve a cantar. Tu equipo queda listo para expedicion.', '🔥 Steel sings again. Your gear is expedition-ready.', '🔥 Stal snova poet. Tvoe snaryazhenie gotovo k vyhodu.')
                : t3(lang, '🔧 Ajustes completos. Tu equipo vuelve a sentirse confiable.', '🔧 Tune-up complete. Your gear feels reliable again.', '🔧 Nastrojka zavershena. Snaryazhenie snova nadezhno.'),
            extraLines: result.effect ? [result.effect] : [],
            currencyLine: result.currency || '',
        };
    }
    if (slug === 'crow-forge-buy-pick' || slug === 'crow-forge-buy-axe' || slug === 'crow-forge-buy-fishing-rod') {
        const toolKey = slug === 'crow-forge-buy-pick' ? 'picoPiedra' : slug === 'crow-forge-buy-axe' ? 'hachaPiedra' : 'canapez';
        const cost = getForgeServiceCost(slug, interaction.costAmount ?? 12);
        const playerNow = await prisma.player.findUnique({
            where: { id: playerId },
            select: { silver: true, gold: true },
        });
        if (!playerNow) {
            return {
                handled: true,
                success: false,
                errorMessage: t3(lang, 'Jugador no encontrado.', 'Player not found.', 'Igrok ne naiden.'),
            };
        }
        if (playerNow.silver < cost) {
            return {
                handled: true,
                success: false,
                errorMessage: t3(lang, `Necesitas ${cost} plata.`, `You need ${cost} silver.`, `Nuzhno ${cost} serebra.`),
            };
        }
        await prisma.player.update({
            where: { id: playerId },
            data: { silver: { decrement: cost } },
        });
        const granted = await grantToolToPlayer(playerId, toolKey);
        if (!granted.success) {
            await prisma.player.update({
                where: { id: playerId },
                data: { silver: { increment: cost } },
            });
            return {
                handled: true,
                success: false,
                errorMessage: granted.message,
            };
        }
        const after = await prisma.player.findUnique({
            where: { id: playerId },
            select: { silver: true, gold: true },
        });
        const fishingRodLore = t3(lang, 'Compraste una Cana de Bambu. Lista para pescar en rios y aguas someras.', 'You bought a Bamboo Rod. Ready for rivers and shallow waters.', 'Ty kupil bambukovuyu udochku. Gotova k rybalke v rekakh i melkovodye.');
        return {
            handled: true,
            success: true,
            effectMessage: slug === 'crow-forge-buy-fishing-rod' ? fishingRodLore :
                slug === 'crow-forge-buy-pick'
                    ? t3(lang, '⛏️ Compraste un Pico de Piedra. Tosco, pesado y suficiente para partir roca comun.', '⛏️ You bought a Stone Pickaxe. Rough, heavy, and enough for common rock.', '⛏️ Ty kupil kamennuyu kirku. Grubaya, tyazhelaya i nadezhnaya.')
                    : t3(lang, '🪓 Compraste un Hacha de Piedra. No es elegante, pero abre camino.', '🪓 You bought a Stone Axe. Not elegant, but it opens the way.', '🪓 Ty kupil kamennyj topor. Ne izyaschen, no otkryvaet put.'),
            extraLines: [granted.message],
            currencyLine: `💰 ${after?.gold ?? playerNow.gold}  | 🪙 ${after?.silver ?? playerNow.silver}`,
        };
    }
    if (slug === 'crown-chamber-open') {
        const summary = await getBankSummary(playerId);
        return {
            handled: true,
            success: true,
            effectMessage: t3(lang, '📦 El cofre se abre con un chasquido metalico.', '📦 The vault opens with a metallic click.', '📦 Khranilishche otkryvaetsya s metallicheskim shchelchkom.'),
            extraLines: [
                `🖐️ Mano: 💰 ${summary.carried.gold} | 🪙 ${summary.carried.silver}`,
                `🏦 Boveda: 💰 ${summary.vault.gold} | 🪙 ${summary.vault.silver}`,
                `🧮 Total: 💰 ${summary.total.gold} | 🪙 ${summary.total.silver}`,
                '📚 Boveda de objetos: 0/20',
            ],
            currencyLine: `💰 ${summary.carried.gold}  | 🪙 ${summary.carried.silver}`,
        };
    }
    if (slug === 'crown-chamber-deposit-silver') {
        const amount = 25;
        const result = await depositToVaultWithFee(playerId, 'SILVER', amount);
        if (!result.success || !result.summary) {
            return {
                handled: true,
                success: false,
                errorMessage: result.message,
            };
        }
        return {
            handled: true,
            success: true,
            effectMessage: t3(lang, `💰 Depositas ${amount} plata. El escriba sella la entrada de tu cuenta.`, `💰 You deposit ${amount} silver. The clerk seals your ledger entry.`, `💰 Ty vnosish ${amount} serebra. Pisec pechataet zapis scheta.`),
            extraLines: [
                `🏦 Boveda: 🪙 ${result.summary.vault.silver}`,
                `🖐️ Mano: 🪙 ${result.summary.carried.silver}`,
            ],
            currencyLine: `💰 ${result.summary.carried.gold}  | 🪙 ${result.summary.carried.silver}`,
        };
    }
    if (slug === 'crown-chamber-withdraw-silver') {
        const amount = 25;
        const result = await withdrawFromVault(playerId, 'SILVER', amount);
        if (!result.success || !result.summary) {
            return {
                handled: true,
                success: false,
                errorMessage: result.message,
            };
        }
        return {
            handled: true,
            success: true,
            effectMessage: t3(lang, `🪙 Retiras ${amount} plata. El tesorero te entrega una bolsa sellada.`, `🪙 You withdraw ${amount} silver. The treasurer hands you a sealed pouch.`, `🪙 Ty snimaesh ${amount} serebra. Kaznachej vydajot zapechatanny meshochek.`),
            extraLines: [
                `🏦 Boveda: 🪙 ${result.summary.vault.silver}`,
                `🖐️ Mano: 🪙 ${result.summary.carried.silver}`,
            ],
            currencyLine: `💰 ${result.summary.carried.gold}  | 🪙 ${result.summary.carried.silver}`,
        };
    }
    if (slug.startsWith('training-yard-lesson-')) {
        const rule = getTrainingRule(slug);
        if (!rule) {
            return {
                handled: true,
                success: false,
                errorMessage: t3(lang, 'Esa leccion aun no esta disponible.', 'That lesson is not available yet.', 'Etot urok poka nedostupen.'),
            };
        }
        const currentPlayer = await prisma.player.findUnique({
            where: { tgId },
            select: { level: true, silver: true, gold: true },
        });
        if (!currentPlayer) {
            return {
                handled: true,
                success: false,
                errorMessage: t3(lang, 'Jugador no encontrado.', 'Player not found.', 'Igrok ne naiden.'),
            };
        }
        if (currentPlayer.level < rule.requiredLevel) {
            return {
                handled: true,
                success: false,
                errorMessage: t3(lang, `Necesitas nivel ${rule.requiredLevel} para esta leccion.`, `You need level ${rule.requiredLevel} for this lesson.`, `Dlya etogo uroka nuzhen uroven ${rule.requiredLevel}.`),
            };
        }
        const cost = interaction.costAmount ?? 0;
        if (cost > 0 && currentPlayer.silver < cost) {
            return {
                handled: true,
                success: false,
                errorMessage: t3(lang, `Necesitas ${cost} plata.`, `You need ${cost} silver.`, `Nuzhno ${cost} serebra.`),
            };
        }
        await ensurePlayerProgression(playerId);
        if (cost > 0) {
            await prisma.player.update({
                where: { id: playerId },
                data: { silver: { decrement: cost } },
            });
        }
        const skill = await getPlayerSkill(playerId, rule.skillKey);
        if (!skill) {
            return {
                handled: true,
                success: false,
                errorMessage: t3(lang, 'No pude abrir tu progreso de skill.', 'Could not load your skill progress.', 'Ne udalos zagruzit progress navyka.'),
            };
        }
        let unlockedNow = false;
        if (!skill.learned) {
            unlockedNow = true;
            await prisma.playerSkill.update({
                where: {
                    playerId_skillKey: { playerId, skillKey: rule.skillKey },
                },
                data: { learned: true },
            });
        }
        const xpResult = await awardSkillXp(playerId, rule.skillKey, unlockedNow ? rule.xpGain : Math.max(4, Math.floor(rule.xpGain / 2)));
        const after = await prisma.player.findUnique({
            where: { id: playerId },
            select: { silver: true, gold: true },
        });
        return {
            handled: true,
            success: true,
            effectMessage: unlockedNow
                ? t3(lang, `🎓 Has aprendido ${rule.label}.`, `🎓 You learned ${rule.label}.`, `🎓 Ty izuchil navyk ${rule.label}.`)
                : t3(lang, `🎯 Practicaste ${rule.label}.`, `🎯 You practiced ${rule.label}.`, `🎯 Ty potreneroval navyk ${rule.label}.`),
            extraLines: [
                `🏆 XP: +${xpResult.gainedXp}`,
                `⚙️ Nivel skill: ${xpResult.beforeLevel} -> ${xpResult.afterLevel}`,
                `📚 Progreso: ${xpResult.currentXp}/${xpResult.requiredXp}`,
            ],
            currencyLine: `💰 ${after?.gold ?? currentPlayer.gold}  | 🪙 ${after?.silver ?? currentPlayer.silver}`,
        };
    }
    if (slug === 'cave-expedition') {
        if (!params.placeId) {
            return {
                handled: true,
                success: false,
                errorMessage: t3(lang, 'No pude abrir la entrada de la cueva.', 'Could not open the cave entrance.', 'Ne udalos otkryt vhod v peshcheru.'),
            };
        }
        const entered = await enterCaveForPlayer({
            playerId,
            tgId,
            placeId: params.placeId,
        });
        if (!entered.success) {
            return {
                handled: true,
                success: false,
                errorMessage: t3(lang, 'No pude iniciar la expedicion.', 'Could not start the expedition.', 'Ne udalos nachat ekspeditsiyu.'),
            };
        }
        return {
            handled: true,
            success: true,
            effectMessage: t3(lang, '🕳️ Das un paso al interior. La luz del exterior desaparece tras de ti.', '🕳️ You step inside. The outside light fades behind you.', '🕳️ Ty delaesh shag vnutr. Svet sna ruzhi ugasaet pozadi tebya.'),
            extraLines: [
                t3(lang, '🧭 Tu progreso dentro de la cueva quedara guardado.', '🧭 Your progress inside the cave will be saved.', '🧭 Tvoi progress vnutri peschery budet sokhranen.'),
            ],
        };
    }
    return { handled: false };
}
