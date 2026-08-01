import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCDraLWWVSD6UXZnCpgWlgRNf1Dr2RCH2I',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'clickgames-entertainment.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'clickgames-entertainment',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'clickgames-entertainment.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '947304072255',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:947304072255:web:becaccbc7e53d6c70fe48a',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-6BBBC0NRQR',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
