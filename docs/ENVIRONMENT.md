# Environment

## Required For Web/Auth

- `DATABASE_URL`: Prisma database connection.
- `JWT_SECRET`: required, at least 32 characters. Used for all ClickForge/WoN session JWTs.
- `FIREBASE_ADMIN_CREDENTIALS_JSON`: Firebase Admin service account JSON, stored as a secret.

For local development, `GOOGLE_APPLICATION_CREDENTIALS` may point to a service account JSON outside the repo.

## Public Firebase Web Config

The Vite frontend can use:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

These are browser config values. They are not Admin SDK secrets.

## Security

Never commit:

- `.env`, `.env.local`
- `firebase-admin*.json`
- SQLite DB files under `prisma/`
- Vercel project metadata
