// @ts-nocheck
import { Router } from 'express';
import { prisma, calculateCombatStats } from '../../lib/db.js';
import { authMiddleware, publicCharacter } from './clickforge.js';
import { ensurePlayerBagSetup } from '../../services/bags.js';
import { ensurePlayerProgression } from '../../services/progression.js';
import { getClassAttributesAtLevel } from '../../lib/rpg-attributes.js';
import { getTitleForLevel } from '../../types/player.js';
import { ensureRuntimeDatabase } from '../lib/runtime-db.js';

const router = Router();
const GAME_ID = 'world-of-nova';
const GAME_TITLE = 'World of Nova: Nightfall';

function generateTgId() {
  return `cf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function summarize(player) {
  return `Level ${player.level || 1} ${player.race || 'unknown'} ${player.class || 'unknown'}`;
}

async function syncGameProfile(cfUserId, player) {
  await prisma.gameProfile.upsert({
    where: { cfUserId_gameId: { cfUserId, gameId: GAME_ID } },
    update: {
      nickname: player.nickname,
      level: player.level || 1,
      race: player.race,
      class: player.class,
      summary: summarize(player),
      lastPlayedAt: new Date(),
    },
    create: {
      cfUserId,
      gameId: GAME_ID,
      gameTitle: GAME_TITLE,
      nickname: player.nickname,
      level: player.level || 1,
      race: player.race,
      class: player.class,
      summary: summarize(player),
      lastPlayedAt: new Date(),
    },
  });
}

async function createInitializedCharacter({ cfUserId, nickname, race, playerClass, language }) {
  const attrs = getClassAttributesAtLevel({ race, classKey: playerClass, level: 1 });
  if (!attrs) {
    const err = new Error('Invalid race or class');
    err.statusCode = 400;
    throw err;
  }

  const stats = calculateCombatStats({ race, class: playerClass, level: 1, maxSoul: 5 });
  const title = getTitleForLevel(1).title;

  const player = await prisma.player.create({
    data: {
      tgId: generateTgId(),
      nickname,
      race,
      class: playerClass,
      language: language || 'es',
      cfUserId,
      title,
      maxHp: stats.maxHp,
      hp: stats.maxHp,
      maxEnergy: stats.maxEnergy,
      energy: stats.maxEnergy,
      str: attrs.str,
      dex: attrs.dex,
      intelligence: attrs.int,
      vit: attrs.vit,
      eng: attrs.eng,
      wis: attrs.int,
      agi: attrs.agi,
      baseDamage: stats.B_Damage,
      critChance: stats.critChance,
      evasion: stats.evasion,
      atkSpeed: stats.atkSpeed,
      defense: stats.defense,
      resistPhysical: stats.resistPhysical,
      resistElemental: stats.resistElemental,
      resistArcane: stats.resistArcane,
      resistHoly: stats.resistHoly,
      resistChemical: stats.resistChemical,
      moveSpeed: stats.moveSpeed,
    },
  });

  try {
    await ensurePlayerBagSetup(player.id);
    await ensurePlayerProgression(player.id, true);
  } catch (err) {
    console.warn('Optional character setup failed:', err instanceof Error ? err.message : err);
  }

  return prisma.player.findUnique({ where: { id: player.id } });
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    await ensureRuntimeDatabase();
    const players = await prisma.player.findMany({
      where: { cfUserId: req.cfUserId },
      orderBy: { lastActiveAt: 'desc' },
    });
    return res.json({ characters: players.map(publicCharacter) });
  } catch (err) {
    console.error('ClickForge list characters error:', err);
    return res.status(500).json({ error: 'Failed to list characters' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    await ensureRuntimeDatabase();
    const { nickname, race, class: playerClass, language } = req.body;
    const cleanNickname = String(nickname || '').trim();

    if (!cleanNickname || !race || !playerClass) {
      return res.status(400).json({ error: 'Nickname, race and class are required' });
    }
    if (cleanNickname.length < 3 || cleanNickname.length > 16) {
      return res.status(400).json({ error: 'Nickname must be 3-16 characters' });
    }

    const existingForAccount = await prisma.player.findFirst({
      where: { cfUserId: req.cfUserId, nickname: { equals: cleanNickname } },
    });
    if (existingForAccount) return res.status(409).json({ error: 'You already have a character with that nickname' });

    const existingNickname = await prisma.player.findFirst({
      where: { nickname: { equals: cleanNickname } },
    });
    if (existingNickname) return res.status(409).json({ error: 'Nickname already taken' });

    const player = await createInitializedCharacter({
      cfUserId: req.cfUserId,
      nickname: cleanNickname,
      race,
      playerClass,
      language,
    });

    await syncGameProfile(req.cfUserId, player);

    return res.status(201).json({ character: publicCharacter(player) });
  } catch (err) {
    console.error('ClickForge create character error:', err);
    return res.status(err.statusCode || 500).json({ error: err.message || 'Failed to create character' });
  }
});

router.post('/:id/select', authMiddleware, async (req, res) => {
  try {
    await ensureRuntimeDatabase();
    const playerId = parseInt(req.params.id, 10);
    if (Number.isNaN(playerId)) return res.status(400).json({ error: 'Invalid character id' });

    const player = await prisma.player.findFirst({
      where: { id: playerId, cfUserId: req.cfUserId },
    });

    if (!player) return res.status(404).json({ error: 'Character not found' });

    const updated = await prisma.player.update({
      where: { id: playerId },
      data: { lastActiveAt: new Date() },
    });

    await syncGameProfile(req.cfUserId, updated);

    return res.json({ character: publicCharacter(updated) });
  } catch (err) {
    console.error('ClickForge select character error:', err);
    return res.status(500).json({ error: 'Failed to select character' });
  }
});

export { router };
