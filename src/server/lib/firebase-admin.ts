// @ts-nocheck
import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import type { ServiceAccount } from 'firebase-admin';

function initFirebaseAdmin() {
  if (getApps().length > 0) return;

  const inlineCredentials = process.env.FIREBASE_ADMIN_CREDENTIALS_JSON;
  const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (inlineCredentials) {
    const serviceAccount = JSON.parse(inlineCredentials);
    initializeApp({ credential: cert(serviceAccount as ServiceAccount) });
    return;
  }

  if (credentialPath) {
    const serviceAccount = JSON.parse(readFileSync(credentialPath, 'utf-8'));
    initializeApp({ credential: cert(serviceAccount as ServiceAccount) });
    return;
  }

  initializeApp({ credential: applicationDefault() });
}

initFirebaseAdmin();
export const auth = getAuth();
