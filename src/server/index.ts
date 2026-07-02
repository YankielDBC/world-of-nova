// @ts-nocheck
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { prisma, getPlayerByTelegramId, createPlayer, calculateCombatStats } from '../lib/db.js';
import { movePlayer } from '../services/map.js';
import { gather } from '../services/gathering.js';
import { getOrCreateTile, getPlaceAtCoords, getGatherableResources, isTileExplored, markTileExplored } from '../services/map.js';
import { getCanonicalWorldMap } from '../services/world-map.js';
import { ensurePlayerBagSetup } from '../services/bags.js';
import { ensurePlayerProgression } from '../services/progression.js';
import { getTitleForLevel } from '../types/player.js';
import { getClassAttributesAtLevel } from '../lib/rpg-attributes.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

httpServer.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port already in use. Is another server running?');
    process.exit(1);
  }
  throw err;
});

app.use(cors());
app.use(express.json());

// ============================================
// RACE & CLASS DATA (mirrors registration-module)
// ============================================
const RACES = {
  uren: {
    name: 'Uren',
    emoji: '🌑',
    description: 'Herejes del bosque oscuro. Druidas y arcanos que mezclan naturaleza corrupta con magia primordial.',
  },
  zolk: {
    name: 'Zolk',
    emoji: '🧪',
    description: 'Parias alquimicos supervivientes. Dominan toxinas, sabotaje y caceria adaptativa.',
  },
};
const CLASSES = {
  uren: {
    dark_druid: { name: 'Dark Druid', emoji: '🌿', description: 'Guardianes malditos del bosque. Resisten mucho, pero se mueven lento.', bonus: { str: 7, dex: 3, int: 5, vit: 9, agi: 4, eng: 5 } },
    arcane: { name: 'Arcane', emoji: '🔮', description: 'Canales de energia pura. Fragiles, pero con poder magico devastador.', bonus: { str: 1, dex: 5, int: 11, vit: 3, agi: 6, eng: 9 } },
  },
  zolk: {
    alchemist_rogue: { name: 'Alchemist Rogue', emoji: '🗡️', description: 'Sombras toxicas y tecnicas. Atacan rapido con viales y corrosivos.', bonus: { str: 4, dex: 9, int: 6, vit: 3, agi: 9, eng: 8 } },
    curse_hunter: { name: 'Curse Hunter', emoji: '🏹', description: 'Cazadores de maldiciones. Balanceados, resistentes y precisos.', bonus: { str: 8, dex: 6, int: 4, vit: 6, agi: 5, eng: 3 } },
  },
};

// ============================================
// AUTH ROUTES
// ============================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nickname, race, class: classKey, language } = req.body;
    if (!nickname || nickname.length < 3 || nickname.length > 16) {
      return res.status(400).json({ error: 'Nickname must be 3-16 characters' });
    }
    if (!RACES[race]) {
      return res.status(400).json({ error: 'Invalid race' });
    }
    if (!CLASSES[race]?.[classKey]) {
      return res.status(400).json({ error: 'Invalid class' });
    }

    const existing = await prisma.player.findFirst({ where: { nickname: { equals: nickname } } });
    if (existing) {
      return res.status(409).json({ error: 'Nickname already taken' });
    }

    const tgId = `web_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const lang = language || 'es';

    const player = await createPlayer({
      tgId,
      nickname,
      language: lang,
      race,
      class: classKey,
    });

    const attrs = getClassAttributesAtLevel({ race, classKey, level: 1 });
    const stats = calculateCombatStats({ race, class: classKey, level: 1 });
    const title = getTitleForLevel(1).title;

    await prisma.player.update({
      where: { id: player.id },
      data: {
        title,
        maxHp: stats.maxHp, hp: stats.maxHp,
        maxEnergy: stats.maxEnergy, energy: stats.maxEnergy,
        str: attrs.str, dex: attrs.dex, intelligence: attrs.int, vit: attrs.vit,
        eng: attrs.eng, wis: attrs.int, agi: attrs.agi,
        baseDamage: stats.B_Damage, critChance: stats.critChance, evasion: stats.evasion,
        atkSpeed: stats.atkSpeed, defense: stats.defense,
        resistPhysical: stats.resistPhysical, resistElemental: stats.resistElemental,
        resistArcane: stats.resistArcane, resistHoly: stats.resistHoly,
        resistChemical: stats.resistChemical, moveSpeed: stats.moveSpeed,
      },
    });

    await ensurePlayerBagSetup(player.id);
    await ensurePlayerProgression(player.id, true);

    const fullPlayer = await prisma.player.findUnique({ where: { id: player.id } });

    return res.json({
      player: {
        id: fullPlayer.id,
        nickname: fullPlayer.nickname,
        race: fullPlayer.race,
        class: fullPlayer.class,
        language: fullPlayer.language,
        level: fullPlayer.level || 1,
        mapX: fullPlayer.mapX || 0,
        mapY: fullPlayer.mapY || 0,
        hp: fullPlayer.hp,
        maxHp: fullPlayer.maxHp,
        energy: fullPlayer.energy,
        maxEnergy: fullPlayer.maxEnergy,
        attrs: {
          str: fullPlayer.str, dex: fullPlayer.dex, int: fullPlayer.intelligence,
          vit: fullPlayer.vit, agi: fullPlayer.agi, eng: fullPlayer.eng,
        },
        combatStats: calculateCombatStats(fullPlayer),
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { nickname } = req.body;
    if (!nickname) return res.status(400).json({ error: 'Nickname required' });

    const player = await prisma.player.findFirst({
      where: { nickname: { equals: nickname } },
    });
    if (!player) return res.status(404).json({ error: 'Player not found' });

    return res.json({
      player: {
        id: player.id,
        nickname: player.nickname,
        race: player.race,
        class: player.class,
        language: player.language,
        level: player.level || 1,
        mapX: player.mapX || 0,
        mapY: player.mapY || 0,
        hp: player.hp,
        maxHp: player.maxHp,
        energy: player.energy,
        maxEnergy: player.maxEnergy,
        attrs: {
          str: player.str, dex: player.dex, int: player.intelligence,
          vit: player.vit, agi: player.agi, eng: player.eng,
        },
        combatStats: calculateCombatStats(player),
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/races', (_req, res) => {
  res.json({ races: RACES, classes: CLASSES });
});

// ============================================
// PLAYER ROUTES
// ============================================
app.get('/api/player/:id', async (req, res) => {
  try {
    const player = await prisma.player.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const combatStats = calculateCombatStats(player);

    res.json({
      id: player.id,
      nickname: player.nickname,
      race: player.race,
      raceName: RACES[player.race]?.name || player.race,
      raceEmoji: RACES[player.race]?.emoji || '',
      class: player.class,
      className: CLASSES[player.race]?.[player.class]?.name || player.class,
      classEmoji: CLASSES[player.race]?.[player.class]?.emoji || '',
      level: player.level || 1,
      title: player.title || '',
      mapX: player.mapX || 0,
      mapY: player.mapY || 0,
      hp: player.hp,
      maxHp: player.maxHp,
      energy: player.energy,
      maxEnergy: player.maxEnergy,
      gold: player.gold || 0,
      silver: player.silver || 0,
      attrs: {
        str: player.str, dex: player.dex, int: player.intelligence,
        vit: player.vit, agi: player.agi, eng: player.eng,
      },
      combatStats,
    });
  } catch (err) {
    console.error('Player fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

// ============================================
// MAP ROUTES
// ============================================
app.get('/api/map/world', async (_req, res) => {
  try {
    const worldMap = await getCanonicalWorldMap();
    res.json({ success: true, worldMap });
  } catch (err) {
    console.error('World map error:', err);
    res.status(500).json({ error: 'Failed to load world map' });
  }
});

app.get('/api/map/tile/:x/:y', async (req, res) => {
  try {
    const x = parseInt(req.params.x);
    const y = parseInt(req.params.y);
    const tile = await getOrCreateTile(x, y);
    const place = await getPlaceAtCoords(x, y);
    const gatherable = await getGatherableResources(x, y);

    res.json({
      tile: {
        x: tile.x, y: tile.y,
        biome: tile.biome,
        baseTile: tile.baseTile,
        name: tile.displayName || `(${x}, ${y})`,
        emoji: tile.displayEmoji || '⬛',
      },
      place: place ? { id: place.id, name: place.name, type: place.type, emoji: place.emoji } : null,
      gatherable,
    });
  } catch (err) {
    console.error('Tile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch tile' });
  }
});

app.post('/api/map/move', async (req, res) => {
  try {
    const { playerId, direction } = req.body;
    if (!playerId || !direction) return res.status(400).json({ error: 'playerId and direction required' });

    const player = await prisma.player.findUnique({ where: { id: parseInt(playerId) } });
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const result = await movePlayer(player.tgId, direction);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    const updatedPlayer = await prisma.player.findUnique({ where: { id: parseInt(playerId) } });
    const tile = await getOrCreateTile(updatedPlayer.mapX, updatedPlayer.mapY);
    const gatherable = await getGatherableResources(updatedPlayer.mapX, updatedPlayer.mapY);

    const tileData = {
      x: tile.x, y: tile.y,
      biome: tile.biome,
      baseTile: tile.baseTile,
      name: tile.displayName || `(${tile.x}, ${tile.y})`,
      emoji: tile.displayEmoji || '⬛',
    };

    // Notify other players about movement
    io.to(`map_${result.fromX}_${result.fromY}`).emit('player:left', { playerId: parseInt(playerId), x: result.fromX, y: result.fromY });
    io.to(`map_${result.toX}_${result.toY}`).emit('player:entered', { playerId: parseInt(playerId), nickname: updatedPlayer.nickname, x: result.toX, y: result.toY, race: updatedPlayer.race });

    res.json({
      success: true,
      player: {
        mapX: updatedPlayer.mapX,
        mapY: updatedPlayer.mapY,
        energy: updatedPlayer.energy,
        maxEnergy: updatedPlayer.maxEnergy,
      },
      from: { x: result.fromX, y: result.fromY },
      to: { x: result.toX, y: result.toY },
      energyCost: result.energyCost,
      tile: tileData,
      gatherable,
    });
  } catch (err) {
    console.error('Move error:', err);
    res.status(500).json({ error: 'Move failed' });
  }
});

app.post('/api/map/gather', async (req, res) => {
  try {
    const { playerId } = req.body;
    if (!playerId) return res.status(400).json({ error: 'playerId required' });

    const player = await prisma.player.findUnique({ where: { id: parseInt(playerId) } });
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const tile = await getOrCreateTile(player.mapX, player.mapY);
    const biomeName = tile.biome || 'plains';

    const result = await gather(biomeName, { x: player.mapX, y: player.mapY });

    res.json({
      success: true,
      gathered: {
        resourceKey: result.resourceKey || result.key,
        resourceName: result.resourceName || result.name,
        quantity: result.quantity || result.amount || 1,
        emoji: result.emoji || '📦',
      },
    });
  } catch (err) {
    console.error('Gather error:', err);
    res.status(500).json({ error: 'Gather failed' });
  }
});

// ============================================
// SOCKET.IO
// ============================================
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('player:join', (data) => {
    const { playerId, mapX, mapY } = data;
    socket.join(`map_${mapX}_${mapY}`);
    socket.data.playerId = playerId;
    socket.data.mapX = mapX;
    socket.data.mapY = mapY;
    socket.to(`map_${mapX}_${mapY}`).emit('player:entered', { playerId, nickname: data.nickname, x: mapX, y: mapY, race: data.race });
  });

  socket.on('disconnect', () => {
    if (socket.data.mapX !== undefined) {
      socket.to(`map_${socket.data.mapX}_${socket.data.mapY}`).emit('player:left', {
        playerId: socket.data.playerId,
        x: socket.data.mapX,
        y: socket.data.mapY,
      });
    }
  });
});

// ============================================
// PRODUCTION STATIC SERVING
// ============================================
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve('web/dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve('web/dist/index.html'));
  });
}

export { app, httpServer, io };
