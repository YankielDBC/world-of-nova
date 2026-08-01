// @ts-nocheck
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/db.js';
import { authMiddleware, signSessionToken } from '../lib/session.js';
import { ensureRuntimeDatabase } from '../lib/runtime-db.js';

const router = Router();
const SALT_ROUNDS = 10;
const WON_LOGIN_URL = process.env.WON_LOGIN_URL || 'https://login-one-phi-78.vercel.app';

function generateCfId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'CF-';
  for (let i = 0; i < 8; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
}

async function generateUniqueCfId() {
  let cfId = generateCfId();
  let attempts = 0;
  while (await prisma.clickForgeUser.findUnique({ where: { cfId } })) {
    cfId = generateCfId();
    attempts++;
    if (attempts > 10) throw new Error('Failed to generate unique CF ID');
  }
  return cfId;
}

function publicUser(user) {
  return {
    cfId: user.cfId,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
    premium: user.premium,
    createdAt: user.createdAt,
  };
}

function publicCharacter(player) {
  return {
    id: player.id,
    nickname: player.nickname,
    race: player.race,
    class: player.class,
    level: player.level,
    language: player.language,
    mapX: player.mapX ?? 0,
    mapY: player.mapY ?? 0,
    hp: player.hp,
    maxHp: player.maxHp,
    energy: player.energy,
    maxEnergy: player.maxEnergy,
    lastActiveAt: player.lastActiveAt,
  };
}

function publicGameProfile(gameProfile) {
  return {
    id: gameProfile.id,
    gameId: gameProfile.gameId,
    gameTitle: gameProfile.gameTitle,
    nickname: gameProfile.nickname,
    level: gameProfile.level,
    race: gameProfile.race,
    class: gameProfile.class,
    summary: gameProfile.summary,
    lastPlayedAt: gameProfile.lastPlayedAt,
  };
}

router.post('/register', async (req, res) => {
  try {
    await ensureRuntimeDatabase();
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be 3-20 characters' });
    }

    const existingEmail = await prisma.clickForgeUser.findUnique({ where: { email } });
    if (existingEmail) return res.status(409).json({ error: 'Email already registered' });

    const existingUsername = await prisma.clickForgeUser.findUnique({ where: { username } });
    if (existingUsername) return res.status(409).json({ error: 'Username already taken' });

    const user = await prisma.clickForgeUser.create({
      data: {
        cfId: await generateUniqueCfId(),
        email,
        username,
        passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
      },
    });

    return res.status(201).json({
      message: 'Account created successfully',
      user: publicUser(user),
      token: signSessionToken(user),
    });
  } catch (err) {
    console.error('ClickForge register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    await ensureRuntimeDatabase();
    const { email, password, username } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    const user = email
      ? await prisma.clickForgeUser.findUnique({ where: { email } })
      : await prisma.clickForgeUser.findUnique({ where: { username } });

    if (!user || user.passwordHash.startsWith('firebase:')) {
      return res.status(401).json({ error: 'Use Firebase login for this account' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    return res.json({
      message: 'Login successful',
      user: publicUser(user),
      token: signSessionToken(user),
    });
  } catch (err) {
    console.error('ClickForge login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    await ensureRuntimeDatabase();
    const user = await prisma.clickForgeUser.findUnique({
      where: { id: req.cfUserId },
      include: {
        players: { orderBy: { lastActiveAt: 'desc' } },
        gameProfiles: { orderBy: { lastPlayedAt: 'desc' } },
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      ...publicUser(user),
      players: user.players.map(publicCharacter),
      gameProfiles: user.gameProfiles.map(publicGameProfile),
    });
  } catch (err) {
    console.error('ClickForge profile error:', err);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    await ensureRuntimeDatabase();
    const { username, email, avatarUrl } = req.body;
    const data = {};
    if (username !== undefined) data.username = username.trim();
    if (email !== undefined) data.email = email.trim();
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;

    const user = await prisma.clickForgeUser.update({
      where: { id: req.cfUserId },
      data,
    });

    return res.json(publicUser(user));
  } catch (err) {
    console.error('ClickForge profile update error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/games', (_req, res) => {
  return res.json({
    games: [
      {
        id: 'world-of-nova',
        title: 'World of Nova: Nightfall',
        tagline: 'The first ClickForge-connected RPG world.',
        description: 'Create your hero, select your realm, and enter Nightfall with your ClickForge account.',
        coverUrl: '/artwork.png',
        genre: 'RPG',
        status: 'available',
        launchUrl: WON_LOGIN_URL,
      },
    ],
  });
});

export { router, authMiddleware, publicCharacter };
