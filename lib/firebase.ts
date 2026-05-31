import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

console.log('API_KEY', process.env.EXPO_PUBLIC_FIREBASE_API_KEY);
console.log('PROJECT_ID', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);

const missingConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const firebaseConfigError =
  missingConfigKeys.length > 0
    ? `Faltan variables de Firebase: ${missingConfigKeys.join(', ')}`
    : null;

if (firebaseConfigError) {
  console.log('Firebase config error', firebaseConfigError);
} else {
  console.log('Firebase config loaded');
}

const app =
  firebaseConfigError === null
    ? getApps().length > 0
      ? getApp()
      : initializeApp(firebaseConfig)
    : null;

let authInstance: Auth | null = null;

if (app) {
  authInstance = getAuth(app);
}

const firestore = app ? getFirestore(app) : null;

export const firebaseApp = app;
export const auth = authInstance;
export const db: Firestore | null = firestore;
