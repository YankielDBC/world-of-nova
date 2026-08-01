// @ts-nocheck
import { dirname, resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';

let ensurePromise = null;

function sqlitePathFromUrl(databaseUrl) {
  if (!databaseUrl || !databaseUrl.startsWith('file:')) return null;
  const rawPath = databaseUrl.slice('file:'.length);
  if (!rawPath) return null;
  return rawPath.startsWith('/') ? rawPath : resolve(process.cwd(), rawPath);
}

function shouldBootstrapSqlite(databaseUrl) {
  if (!databaseUrl?.startsWith('file:')) return false;
  return Boolean(process.env.VERCEL || process.env.WON_DB_AUTO_PUSH === '1');
}

export async function ensureRuntimeDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!shouldBootstrapSqlite(databaseUrl)) return;

  if (!ensurePromise) {
    ensurePromise = Promise.resolve().then(() => {
      const dbPath = sqlitePathFromUrl(databaseUrl);
      if (!dbPath) return;

      const markerPath = `${dbPath}.schema-ready`;
      mkdirSync(dirname(dbPath), { recursive: true });
      if (!existsSync(dbPath)) {
        const templatePath = resolve(process.cwd(), 'prisma/runtime-template.db');
        if (!existsSync(templatePath)) {
          throw new Error('Runtime database template not found');
        }
        copyFileSync(templatePath, dbPath);
      }

      if (!existsSync(markerPath)) {
        writeFileSync(markerPath, new Date().toISOString());
      }
    });
  }

  await ensurePromise;
}
