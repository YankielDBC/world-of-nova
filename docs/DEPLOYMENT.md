# Deployment

## World Of Nova

1. Set `DATABASE_URL`.
2. Set `JWT_SECRET` with a 32+ character random value.
3. Set `FIREBASE_ADMIN_CREDENTIALS_JSON` from a freshly generated Firebase Admin key.
4. Run `npm run build` and `npm run web:build`.
5. Apply Prisma schema changes with the chosen production migration process.
6. Deploy the backend/web target.

## ClickForge

Set `WON_BACKEND_URL` in the ClickForge Vercel project to this WoN backend URL.

## Mandatory Rotation

Rotate any Firebase Admin key that was ever copied to `clickforge/public`, local attachments, chat, or committed history.
Also rotate the GitHub token that was embedded in the previous WoN remote URL.
