// @ts-nocheck
import jwt from 'jsonwebtoken';

const JWT_EXPIRES_IN = '7d';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters long');
  }
  return secret;
}

export function signSessionToken(user) {
  return jwt.sign(
    { id: user.id, cfId: user.cfId, username: user.username },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN },
  );
}

export function verifySessionToken(token) {
  return jwt.verify(token, getJwtSecret());
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = verifySessionToken(header.slice('Bearer '.length));
    req.cfUserId = decoded.id;
    req.cfUser = decoded;
    return next();
  } catch (err) {
    console.warn('Session validation failed:', err instanceof Error ? err.message : err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
