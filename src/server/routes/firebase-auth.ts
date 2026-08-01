// @ts-nocheck
import { Router } from 'express';
import { prisma } from '../../lib/db.js';
import { signSessionToken } from '../lib/session.js';
import { ensureRuntimeDatabase } from '../lib/runtime-db.js';

const router = Router();
const FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY || 'AIzaSyCDraLWWVSD6UXZnCpgWlgRNf1Dr2RCH2I';

function generateCfId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'CF-';
  for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function buildUsername(decoded) {
  const fromName = String(decoded.name || '').trim().replace(/\s+/g, '_');
  const fromEmail = String(decoded.email || '').split('@')[0];
  const base = (fromName || fromEmail || `user_${decoded.uid.slice(0, 8)}`)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20);
  return base.length >= 3 ? base : `cf_${decoded.uid.slice(0, 8)}`;
}

async function generateUniqueUsername(decoded) {
  const base = buildUsername(decoded);
  let username = base;
  let suffix = 1;
  while (await prisma.clickForgeUser.findUnique({ where: { username } })) {
    const tail = String(suffix++);
    username = `${base.slice(0, Math.max(3, 20 - tail.length))}${tail}`;
  }
  return username;
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

async function verifyFirebaseIdToken(idToken) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_WEB_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error('firebase_token_invalid');
  }

  const data = await response.json();
  const account = Array.isArray(data.users) ? data.users[0] : null;
  if (!account?.localId) {
    throw new Error('firebase_token_invalid');
  }

  return {
    uid: account.localId,
    email: account.email,
    name: account.displayName,
    emailVerified: Boolean(account.emailVerified),
  };
}

router.post('/firebase', async (req, res) => {
  try {
    await ensureRuntimeDatabase();
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'Missing credentials' });

    const decoded = await verifyFirebaseIdToken(idToken);
    const { uid, email } = decoded;
    if (!email) return res.status(400).json({ error: 'Account needs an email address' });
    if (!decoded.emailVerified) return res.status(403).json({ error: 'Email verification required' });

    let cfUser = await prisma.clickForgeUser.findUnique({ where: { firebaseUid: uid } });
    if (!cfUser) cfUser = await prisma.clickForgeUser.findUnique({ where: { email } });

    if (!cfUser) {
      cfUser = await prisma.clickForgeUser.create({
        data: {
          cfId: await generateUniqueCfId(),
          firebaseUid: uid,
          email,
          username: await generateUniqueUsername(decoded),
          passwordHash: 'firebase:' + uid,
        },
      });
    } else if (!cfUser.firebaseUid) {
      cfUser = await prisma.clickForgeUser.update({
        where: { id: cfUser.id },
        data: { firebaseUid: uid, passwordHash: cfUser.passwordHash || 'firebase:' + uid },
      });
    }

    return res.json({
      token: signSessionToken(cfUser),
      user: {
        cfId: cfUser.cfId,
        email: cfUser.email,
        username: cfUser.username,
        avatarUrl: cfUser.avatarUrl,
        premium: cfUser.premium,
        createdAt: cfUser.createdAt,
      },
    });
  } catch (err) {
    console.error('Firebase auth error:', err);
    return res.status(503).json({ error: 'Unable to complete sign in' });
  }
});

export { router };
