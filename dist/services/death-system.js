import { InlineKeyboard } from 'grammy';
import { prisma, calculateCombatStats, getPlayerByTelegramId } from '../lib/db.js';
import { withPrismaRetry } from '../lib/prisma-retry.js';
import { EMOJIS } from '../data/emojis.js';
import { getCellCoords, pickOffset, t3, toNumber } from './death-system-utils.js';
import { ensureDeathSystemSchema, mapCorpseRow, mapDeathStateRow, getActiveCorpseById, getActiveDeathStateByPlayerId, getActiveDeathStateByTgId, } from './death-system-state.js';
export { ensureDeathSystemSchema, getActiveCorpseById, getActiveCorpseForPlayer, getActiveDeathStateByPlayerId, getActiveDeathStateByTgId, isPlayerGhostByTgId, setSoulAnchorForPlayer, } from './death-system-state.js';
const CORPSE_OWNER_GRACE_MS = 10 * 60 * 1000;
const CORPSE_SILVER_DROP_RATIO = 0.1;
const GHOST_SPEED_MULTIPLIER = 1.5;
const CEMETERY_CELL_SIZE = 24;
function getDeterministicCemeteryForCell(cellX, cellY) {
    const baseX = cellX * CEMETERY_CELL_SIZE;
    const baseY = cellY * CEMETERY_CELL_SIZE;
    return {
        x: baseX + pickOffset(4, CEMETERY_CELL_SIZE - 5, `cemetery-x:${cellX}:${cellY}`),
        y: baseY + pickOffset(4, CEMETERY_CELL_SIZE - 5, `cemetery-y:${cellX}:${cellY}`),
        label: `Cementerio ${cellX},${cellY}`,
    };
}
export function getNearestCemeteryCoords(x, y) {
    const { cellX, cellY } = getCellCoords(x, y);
    let best = {
        x: 0,
        y: 0,
        label: 'Cementerio',
        distance: Number.POSITIVE_INFINITY,
    };
    for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -1; dy <= 1; dy += 1) {
            const candidate = getDeterministicCemeteryForCell(cellX + dx, cellY + dy);
            const dist = Math.sqrt((candidate.x - x) ** 2 + (candidate.y - y) ** 2);
            if (dist < best.distance) {
                best = {
                    x: candidate.x,
                    y: candidate.y,
                    label: candidate.label,
                    distance: dist,
                };
            }
        }
    }
    return best;
}
export function isNearCemetery(x, y, radius = 4) {
    return getNearestCemeteryCoords(x, y).distance <= radius;
}
function getProtectedEquippedToolIds(equipment) {
    return new Set([equipment?.chopToolId, equipment?.mineToolId, equipment?.gatherToolId].filter((value) => typeof value === 'number'));
}
export async function killPlayerAndCreateCorpse(params) {
    await ensureDeathSystemSchema();
    return withPrismaRetry('death.kill-and-corpse', async () => prisma.$transaction(async (tx) => {
        const [player, equipment, activeBag, soulAnchorRows] = await Promise.all([
            tx.player.findUnique({
                where: { id: params.playerId },
                select: {
                    id: true,
                    tgId: true,
                    silver: true,
                    level: true,
                    race: true,
                    class: true,
                    hp: true,
                    maxHp: true,
                    energy: true,
                    maxEnergy: true,
                    str: true,
                    dex: true,
                    intelligence: true,
                    vit: true,
                    eng: true,
                    wis: true,
                    agi: true,
                    moveSpeed: true,
                    resistPhysical: true,
                    resistElemental: true,
                    resistArcane: true,
                    resistHoly: true,
                    resistChemical: true,
                },
            }),
            tx.playerEquipment.findUnique({
                where: { playerId: params.playerId },
            }),
            tx.playerBag.findFirst({
                where: { playerId: params.playerId, status: 'ACTIVE' },
                include: {
                    definition: true,
                    slots: {
                        orderBy: { slotIndex: 'asc' },
                        include: {
                            resource: true,
                            playerTool: true,
                            storedBag: {
                                include: { definition: true },
                            },
                        },
                    },
                },
            }),
            tx.$queryRawUnsafe('SELECT worldMapId, mapX, mapY, placeLabel FROM "PlayerSoulAnchor" WHERE playerId = ? LIMIT 1', params.playerId),
        ]);
        if (!player) {
            throw new Error('Player not found for death transition.');
        }
        await tx.$executeRawUnsafe('DELETE FROM "PlayerDeathState" WHERE playerId = ?', params.playerId);
        await tx.$executeRawUnsafe('UPDATE "PlayerCorpse" SET status = ? WHERE playerId = ? AND status = ?', 'ABANDONED', params.playerId, 'ACTIVE');
        const protectedToolIds = getProtectedEquippedToolIds(equipment);
        const snapshot = [];
        for (const slot of activeBag?.slots || []) {
            if (slot.resource && slot.quantity > 0) {
                const freeQuantity = Math.max(0, slot.quantity - (slot.merchantLockedQty || 0));
                if (freeQuantity <= 0) {
                    continue;
                }
                snapshot.push({
                    kind: 'resource',
                    slotIndex: slot.slotIndex,
                    resourceId: slot.resource.id,
                    resourceName: slot.resource.name,
                    emoji: slot.resource.emoji,
                    quantity: freeQuantity,
                });
                if ((slot.merchantLockedQty || 0) > 0) {
                    await tx.playerBagSlot.update({
                        where: { id: slot.id },
                        data: { quantity: slot.merchantLockedQty },
                    });
                }
                else {
                    await tx.playerBagSlot.delete({ where: { id: slot.id } });
                }
                continue;
            }
            if (slot.playerTool && !protectedToolIds.has(slot.playerTool.id) && !slot.playerTool.merchantLocked) {
                snapshot.push({
                    kind: 'tool',
                    slotIndex: slot.slotIndex,
                    playerToolId: slot.playerTool.id,
                    toolKey: slot.playerTool.toolKey,
                    toolName: slot.playerTool.toolKey,
                    emoji: slot.playerTool.toolKey,
                });
                await tx.playerBagSlot.delete({ where: { id: slot.id } });
                continue;
            }
            if (slot.storedBag?.definition) {
                snapshot.push({
                    kind: 'storedBag',
                    slotIndex: slot.slotIndex,
                    storedBagId: slot.storedBag.id,
                    bagName: slot.storedBag.definition.displayName,
                    emoji: slot.storedBag.definition.emoji,
                });
                await tx.playerBagSlot.delete({ where: { id: slot.id } });
            }
        }
        const cemetery = getNearestCemeteryCoords(params.deathX, params.deathY);
        const soulAnchor = soulAnchorRows[0]
            ? {
                worldMapId: toNumber(soulAnchorRows[0].worldMapId),
                x: toNumber(soulAnchorRows[0].mapX),
                y: toNumber(soulAnchorRows[0].mapY),
                label: String(soulAnchorRows[0].placeLabel || ''),
            }
            : null;
        const silverDropped = Math.max(0, Math.floor(player.silver * CORPSE_SILVER_DROP_RATIO));
        const graceUntil = new Date(Date.now() + CORPSE_OWNER_GRACE_MS);
        await tx.$executeRawUnsafe(`INSERT INTO "PlayerCorpse" (
          playerId, tgId, worldMapId, mapX, mapY, snapshotJson, silverDropped, silverRemaining, graceUntil, status, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`, params.playerId, params.tgId, params.worldMapId, params.deathX, params.deathY, JSON.stringify(snapshot), silverDropped, silverDropped, graceUntil.toISOString(), 'ACTIVE');
        const corpseRows = await tx.$queryRawUnsafe('SELECT id FROM "PlayerCorpse" WHERE playerId = ? AND status = ? ORDER BY id DESC LIMIT 1', params.playerId, 'ACTIVE');
        const corpseId = toNumber(corpseRows[0]?.id);
        if (!corpseId) {
            throw new Error('Could not create corpse row.');
        }
        await tx.$executeRawUnsafe(`INSERT INTO "PlayerDeathState" (
          playerId, tgId, corpseId, worldMapId, deathX, deathY, cemeteryX, cemeteryY,
          anchorWorldMapId, anchorX, anchorY, anchorLabel, status, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`, params.playerId, params.tgId, corpseId, params.worldMapId, params.deathX, params.deathY, cemetery.x, cemetery.y, soulAnchor?.worldMapId ?? null, soulAnchor?.x ?? null, soulAnchor?.y ?? null, soulAnchor?.label || '', 'GHOST');
        await tx.player.update({
            where: { id: params.playerId },
            data: {
                hp: 0,
                energy: 0,
                silver: { decrement: silverDropped },
                mapX: cemetery.x,
                mapY: cemetery.y,
                lastActiveAt: new Date(),
                isActive: true,
            },
        });
        const death = {
            playerId: params.playerId,
            tgId: params.tgId,
            corpseId,
            worldMapId: params.worldMapId,
            deathX: params.deathX,
            deathY: params.deathY,
            cemeteryX: cemetery.x,
            cemeteryY: cemetery.y,
            anchorWorldMapId: soulAnchor?.worldMapId ?? null,
            anchorX: soulAnchor?.x ?? null,
            anchorY: soulAnchor?.y ?? null,
            anchorLabel: soulAnchor?.label || '',
            status: 'GHOST',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        const corpse = mapCorpseRow({
            id: corpseId,
            playerId: params.playerId,
            tgId: params.tgId,
            worldMapId: params.worldMapId,
            mapX: params.deathX,
            mapY: params.deathY,
            snapshotJson: JSON.stringify(snapshot),
            silverDropped,
            silverRemaining: silverDropped,
            graceUntil,
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date(),
            recoveredAt: null,
        });
        return {
            death,
            corpse,
            droppedStacks: snapshot.length,
            droppedSilver: silverDropped,
        };
    }));
}
function getFirstFreeSlotIndex(used, totalSlots) {
    for (let index = 1; index <= totalSlots; index += 1) {
        if (!used.has(index)) {
            return index;
        }
    }
    return null;
}
export async function recoverOwnCorpse(tgId) {
    await ensureDeathSystemSchema();
    return withPrismaRetry('death.recover-corpse', async () => prisma.$transaction(async (tx) => {
        const player = await tx.player.findUnique({
            where: { tgId },
            select: {
                id: true,
                tgId: true,
                hp: true,
                energy: true,
                maxHp: true,
                maxEnergy: true,
                level: true,
                race: true,
                class: true,
                str: true,
                dex: true,
                intelligence: true,
                vit: true,
                eng: true,
                wis: true,
                agi: true,
                moveSpeed: true,
                resistPhysical: true,
                resistElemental: true,
                resistArcane: true,
                resistHoly: true,
                resistChemical: true,
                mapX: true,
                mapY: true,
            },
        });
        if (!player) {
            return { success: false, message: 'No pude leer tu estado astral.' };
        }
        const deathRows = await tx.$queryRawUnsafe('SELECT * FROM "PlayerDeathState" WHERE playerId = ? AND status = ? LIMIT 1', player.id, 'GHOST');
        const death = deathRows[0] ? mapDeathStateRow(deathRows[0]) : null;
        if (!death) {
            return { success: false, message: 'No tienes un cuerpo pendiente por recuperar.' };
        }
        if (player.mapX !== death.deathX || player.mapY !== death.deathY) {
            return { success: false, message: 'Debes volver a la coordenada de tu cuerpo antes de recuperarlo.' };
        }
        const corpseRows = await tx.$queryRawUnsafe('SELECT * FROM "PlayerCorpse" WHERE id = ? AND status = ? LIMIT 1', death.corpseId, 'ACTIVE');
        const corpse = corpseRows[0] ? mapCorpseRow(corpseRows[0]) : null;
        if (!corpse) {
            await tx.$executeRawUnsafe('DELETE FROM "PlayerDeathState" WHERE playerId = ?', player.id);
            return { success: false, message: 'Tu cuerpo ya no estaba disponible.' };
        }
        const activeBag = await tx.playerBag.findFirst({
            where: { playerId: player.id, status: 'ACTIVE' },
            include: {
                definition: true,
                slots: {
                    orderBy: { slotIndex: 'asc' },
                    include: {
                        resource: true,
                        playerTool: true,
                        storedBag: { include: { definition: true } },
                    },
                },
            },
        });
        if (!activeBag) {
            return { success: false, message: 'No encontre tu mochila activa para restaurar el cuerpo.' };
        }
        const usedSlots = new Set(activeBag.slots.map((slot) => slot.slotIndex));
        const totalSlots = activeBag.definition.slotCapacity;
        let restoredEntries = 0;
        for (const entry of corpse.snapshot) {
            if (entry.kind === 'resource') {
                const sameSlot = activeBag.slots.find((slot) => slot.slotIndex === entry.slotIndex && slot.resourceId === entry.resourceId && !!slot.resource);
                if (sameSlot) {
                    await tx.playerBagSlot.update({
                        where: { id: sameSlot.id },
                        data: { quantity: { increment: entry.quantity } },
                    });
                    restoredEntries += 1;
                    continue;
                }
                let targetSlot = entry.slotIndex;
                if (usedSlots.has(targetSlot)) {
                    const freeSlot = getFirstFreeSlotIndex(usedSlots, totalSlots);
                    if (!freeSlot)
                        continue;
                    targetSlot = freeSlot;
                }
                await tx.playerBagSlot.create({
                    data: {
                        bagId: activeBag.id,
                        slotIndex: targetSlot,
                        resourceId: entry.resourceId,
                        quantity: entry.quantity,
                    },
                });
                usedSlots.add(targetSlot);
                restoredEntries += 1;
                continue;
            }
            if (entry.kind === 'tool') {
                const targetSlot = usedSlots.has(entry.slotIndex)
                    ? getFirstFreeSlotIndex(usedSlots, totalSlots)
                    : entry.slotIndex;
                if (!targetSlot)
                    continue;
                const alreadySlotted = await tx.playerBagSlot.findFirst({
                    where: { playerToolId: entry.playerToolId },
                    select: { id: true },
                });
                if (alreadySlotted)
                    continue;
                await tx.playerBagSlot.create({
                    data: {
                        bagId: activeBag.id,
                        slotIndex: targetSlot,
                        playerToolId: entry.playerToolId,
                        quantity: 1,
                    },
                });
                usedSlots.add(targetSlot);
                restoredEntries += 1;
                continue;
            }
            const targetSlot = usedSlots.has(entry.slotIndex)
                ? getFirstFreeSlotIndex(usedSlots, totalSlots)
                : entry.slotIndex;
            if (!targetSlot)
                continue;
            const alreadyStored = await tx.playerBagSlot.findFirst({
                where: { storedBagId: entry.storedBagId },
                select: { id: true },
            });
            if (alreadyStored)
                continue;
            await tx.playerBagSlot.create({
                data: {
                    bagId: activeBag.id,
                    slotIndex: targetSlot,
                    storedBagId: entry.storedBagId,
                    quantity: 1,
                },
            });
            usedSlots.add(targetSlot);
            restoredEntries += 1;
        }
        const stats = calculateCombatStats(player);
        const restoredHp = Math.max(1, Math.floor(stats.maxHp * 0.5));
        const restoredSta = Math.max(1, Math.floor(stats.maxEnergy * 0.5));
        await tx.player.update({
            where: { id: player.id },
            data: {
                hp: restoredHp,
                energy: restoredSta,
                silver: { increment: corpse.silverRemaining },
                lastActiveAt: new Date(),
                isActive: true,
            },
        });
        await tx.$executeRawUnsafe('DELETE FROM "PlayerDeathState" WHERE playerId = ?', player.id);
        await tx.$executeRawUnsafe('UPDATE "PlayerCorpse" SET status = ?, recoveredAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', 'RECOVERED', corpse.id);
        return {
            success: true,
            message: `☠️ Recuperaste tu cuerpo.\n✧═══••═══✧\n❤️ HP: ${restoredHp}/${stats.maxHp}\n🔋 STA: ${restoredSta}/${stats.maxEnergy}\n🎒 Restos recuperados: ${restoredEntries}\n🪙 Plata recuperada: ${corpse.silverRemaining}`,
        };
    }));
}
export async function moveGhostPlayer(tgId, direction) {
    await ensureDeathSystemSchema();
    const player = await getPlayerByTelegramId(tgId);
    if (!player) {
        return { success: false, message: 'No estas registrado.' };
    }
    const death = await getActiveDeathStateByPlayerId(player.id);
    if (!death) {
        return { success: false, message: 'No estas en el plano astral.' };
    }
    const directions = {
        up: { dx: 0, dy: 1 },
        down: { dx: 0, dy: -1 },
        left: { dx: -1, dy: 0 },
        right: { dx: 1, dy: 0 },
    };
    const delta = directions[direction];
    await withPrismaRetry('death.move-ghost', () => prisma.player.update({
        where: { id: player.id },
        data: {
            mapX: player.mapX + delta.dx,
            mapY: player.mapY + delta.dy,
            lastActiveAt: new Date(),
            isActive: true,
        },
    }));
    return { success: true };
}
export async function renderGhostMap(tgId) {
    await ensureDeathSystemSchema();
    const player = await getPlayerByTelegramId(tgId);
    if (!player)
        return null;
    const lang = player.language ?? 'es';
    const death = await getActiveDeathStateByPlayerId(player.id);
    if (!death)
        return null;
    const corpse = (await getActiveCorpseById(death.corpseId)) || {
        id: death.corpseId,
        playerId: death.playerId,
        tgId,
        worldMapId: death.worldMapId,
        mapX: death.deathX,
        mapY: death.deathY,
        snapshot: [],
        silverDropped: 0,
        silverRemaining: 0,
        graceUntil: Date.now(),
        status: 'ACTIVE',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        recoveredAt: null,
    };
    const half = 5;
    const rows = [];
    for (let dy = half; dy >= -half; dy -= 1) {
        const row = [];
        for (let dx = -half; dx <= half; dx += 1) {
            const tx = player.mapX + dx;
            const ty = player.mapY + dy;
            if (tx === player.mapX && ty === player.mapY) {
                row.push('👻');
            }
            else if (tx === corpse.mapX && ty === corpse.mapY) {
                row.push('☠️');
            }
            else if (tx === death.cemeteryX && ty === death.cemeteryY) {
                row.push('⚰️');
            }
            else {
                row.push('⬛');
            }
        }
        rows.push(row.join(''));
    }
    const bodyDistance = Math.abs(corpse.mapX - player.mapX) + Math.abs(corpse.mapY - player.mapY);
    const onCorpse = player.mapX === corpse.mapX && player.mapY === corpse.mapY;
    const graceRemainingMs = Math.max(0, corpse.graceUntil - Date.now());
    const graceMinutes = Math.ceil(graceRemainingMs / 60000);
    const header = t3(lang, `👻 Plano Astral ${EMOJIS.ui.pin}(${player.mapX}, ${player.mapY})`, `👻 Astral Plane ${EMOJIS.ui.pin}(${player.mapX}, ${player.mapY})`, `👻 Astralnyy plan ${EMOJIS.ui.pin}(${player.mapX}, ${player.mapY})`);
    const biomeName = [
        t3(lang, `☠️ Tu cuerpo: (${corpse.mapX}, ${corpse.mapY})`, `☠️ Your body: (${corpse.mapX}, ${corpse.mapY})`, `☠️ Tvoyo telo: (${corpse.mapX}, ${corpse.mapY})`),
        t3(lang, `⚰️ Cementerio: (${death.cemeteryX}, ${death.cemeteryY})`, `⚰️ Graveyard: (${death.cemeteryX}, ${death.cemeteryY})`, `⚰️ Kladbishche: (${death.cemeteryX}, ${death.cemeteryY})`),
        t3(lang, `💨 Velocidad astral x${GHOST_SPEED_MULTIPLIER.toFixed(1)}`, `💨 Astral speed x${GHOST_SPEED_MULTIPLIER.toFixed(1)}`, `💨 Astralnaya skorost x${GHOST_SPEED_MULTIPLIER.toFixed(1)}`),
        t3(lang, `📏 Distancia al cuerpo: ${bodyDistance}`, `📏 Distance to body: ${bodyDistance}`, `📏 Distantsiya do tela: ${bodyDistance}`),
    ].join('\n');
    const footer = onCorpse
        ? t3(lang, '☠️ Tu cuerpo te espera aqui. Puedes recuperarlo.', '☠️ Your body is here. You can recover it now.', '☠️ Tvoyo telo zdes. Ego mozhno vernut.')
        : t3(lang, `🕯️ Solo ves sombras. La proteccion del cuerpo dura ${graceMinutes}m.`, `🕯️ Only shadows answer. Body protection lasts ${graceMinutes}m.`, `🕯️ Zdes tolko teni. Zashchita tela eshche ${graceMinutes}m.`);
    const keyboard = new InlineKeyboard()
        .text(`👤 ${t3(lang, 'Perfil', 'Profile', 'Profil')}`, 'map_profile')
        .text(`⬆️ ${t3(lang, 'Arriba', 'Up', 'Vverkh')}`, 'map_up')
        .text(`☠️ ${t3(lang, 'Cuerpo', 'Body', 'Telo')}`, onCorpse ? 'ghost_recover' : 'ghost_hint')
        .row()
        .text(`⬅️ ${t3(lang, 'Izq', 'Left', 'Vlevo')}`, 'map_left')
        .text(`⚰️ ${t3(lang, 'Tumba', 'Grave', 'Mogila')}`, 'ghost_hint')
        .text(`➡️ ${t3(lang, 'Der', 'Right', 'Vpravo')}`, 'map_right')
        .row()
        .text(`⬇️ ${t3(lang, 'Abajo', 'Down', 'Vniz')}`, 'map_down');
    return {
        header,
        biomeName,
        grid: `----------------------------\n${rows.join('\n')}\n----------------------------`,
        footer,
        keyboard,
    };
}
export async function getGhostHintText(tgId) {
    const player = await getPlayerByTelegramId(tgId);
    if (!player)
        return null;
    const lang = player.language ?? 'es';
    const death = await getActiveDeathStateByPlayerId(player.id);
    if (!death)
        return null;
    const corpse = await getActiveCorpseById(death.corpseId);
    if (!corpse)
        return null;
    return t3(lang, `Tu cuerpo sigue en (${corpse.mapX}, ${corpse.mapY}). Solo el plano astral importa ahora.`, `Your body remains at (${corpse.mapX}, ${corpse.mapY}). Only the astral plane matters now.`, `Tvoyo telo vse eshche v (${corpse.mapX}, ${corpse.mapY}). Seychas vazhen tolko astralny plan.`);
}
export async function buildGhostBlockedText(tgId) {
    const player = await getPlayerByTelegramId(tgId);
    if (!player)
        return null;
    const lang = player.language ?? 'es';
    const death = await getActiveDeathStateByPlayerId(player.id);
    if (!death)
        return null;
    return t3(lang, 'Estas muerto. Mientras sigas en el plano astral solo puedes moverte, ver tu perfil y recuperar tu cuerpo.', 'You are dead. While in the astral plane you can only move, view your profile, and recover your body.', 'Ty mertv. Poka ty v astralnom plane, mozhno tolko dvigatsya, smotret profil i vozvrashchat telo.');
}
export async function getDeathSummaryForProfile(tgId) {
    const death = await getActiveDeathStateByTgId(tgId);
    if (!death)
        return null;
    return `Plano Astral • cuerpo (${death.deathX}, ${death.deathY})`;
}
export function buildPveDeathCard(lang, outcome, combatLog) {
    const lines = [
        t3(lang, '☠️ Has muerto.', '☠️ You died.', '☠️ Ty pogib.'),
        '✧═══••═══✧',
        t3(lang, `👻 Despiertas en el plano astral, cerca del cementerio (${outcome.death.cemeteryX}, ${outcome.death.cemeteryY}).`, `👻 You awaken in the astral plane near the graveyard (${outcome.death.cemeteryX}, ${outcome.death.cemeteryY}).`, `👻 Ty prosypaeshsya v astralnom plane ryadom s kladbishchem (${outcome.death.cemeteryX}, ${outcome.death.cemeteryY}).`),
        t3(lang, `☠️ Tu cuerpo quedo en (${outcome.corpse.mapX}, ${outcome.corpse.mapY}).`, `☠️ Your body remains at (${outcome.corpse.mapX}, ${outcome.corpse.mapY}).`, `☠️ Tvoyo telo ostalos v (${outcome.corpse.mapX}, ${outcome.corpse.mapY}).`),
        `🎒 ${t3(lang, 'Restos en cuerpo', 'Corpse remains', 'Ostatki v tele')}: ${outcome.droppedStacks}`,
        `🪙 ${t3(lang, 'Plata en cuerpo', 'Silver on corpse', 'Serebro v tele')}: ${outcome.droppedSilver}`,
        t3(lang, '🛠️ Lo equipado no cae en PvE base.', '🛠️ Equipped gear does not drop in base PvE.', '🛠️ Ekipirovannoe snaryazhenie ne padaet v bazovom PvE.'),
        t3(lang, '🛡️ Solo tu puedes recuperarlo durante 10m.', '🛡️ Only you can reclaim it for 10m.', '🛡️ Tolko ty mozhesh vernut ego v techenie 10m.'),
    ];
    if (combatLog.length > 0) {
        lines.push('');
        lines.push(t3(lang, '📜 Ultima ronda', '📜 Final round', '📜 Posledniy raund'));
        combatLog.slice(-4).forEach((entry, index, arr) => {
            const marker = index === 0 ? '┌' : index === arr.length - 1 ? '└' : '├';
            lines.push(`${marker} ${entry}`);
        });
    }
    lines.push('');
    lines.push(t3(lang, '🗺️ Usa /map para volver a tu cuerpo.', '🗺️ Use /map to return to your body.', '🗺️ Ispolzuy /map chtoby vernutsya k telu.'));
    return lines.join('\n');
}
