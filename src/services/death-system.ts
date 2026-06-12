// @ts-nocheck
import { InlineKeyboard } from 'grammy';
import { prisma, getPlayerByTelegramId } from '../lib/db.js';
import { withPrismaRetry } from '../lib/prisma-retry.js';
import { EMOJIS } from '../data/emojis.js';
import { t3 } from './death-system-utils.js';
import { ensureDeathSystemSchema, getActiveCorpseById, getActiveDeathStateByPlayerId, getActiveDeathStateByTgId, } from './death-system-state.js';
export { ensureDeathSystemSchema, getActiveCorpseById, getActiveCorpseForPlayer, getActiveDeathStateByPlayerId, getActiveDeathStateByTgId, isPlayerGhostByTgId, setSoulAnchorForPlayer, } from './death-system-state.js';
export { getNearestCemeteryCoords, isNearCemetery, killPlayerAndCreateCorpse, recoverOwnCorpse } from './death-system-actions.js';
const GHOST_SPEED_MULTIPLIER = 1.5;

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
