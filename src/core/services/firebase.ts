import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/** Same project as `spot-war/core/firebase.ts` (difference-battle). */
const fallback: FirebaseOptions = {
  apiKey: 'AIzaSyCUTYX9SDZ2pj8gGjQVssxg93ZcXtZLpfo',
  authDomain: 'difference-battle.firebaseapp.com',
  projectId: 'difference-battle',
  storageBucket: 'difference-battle.firebasestorage.app',
  messagingSenderId: '343048419115',
  appId: '1:343048419115:web:050281012f04ae6d5df76e',
  databaseURL: 'https://difference-battle-default-rtdb.firebaseio.com',
};

function buildConfig(): FirebaseOptions {
  const e = import.meta.env;
  return {
    apiKey: e.VITE_FIREBASE_API_KEY ?? fallback.apiKey,
    authDomain: e.VITE_FIREBASE_AUTH_DOMAIN ?? fallback.authDomain,
    projectId: e.VITE_FIREBASE_PROJECT_ID ?? fallback.projectId,
    storageBucket: e.VITE_FIREBASE_STORAGE_BUCKET ?? fallback.storageBucket,
    messagingSenderId: e.VITE_FIREBASE_MESSAGING_SENDER_ID ?? fallback.messagingSenderId,
    appId: e.VITE_FIREBASE_APP_ID ?? fallback.appId,
    databaseURL: e.VITE_FIREBASE_DATABASE_URL ?? fallback.databaseURL,
  };
}

export const firebaseApp = getApps().length ? getApp() : initializeApp(buildConfig());

export const auth = getAuth(firebaseApp);
export const fireStoreDb = getFirestore(firebaseApp);
export const realtimeDb = getDatabase(firebaseApp);
export const storage = getStorage(firebaseApp);
