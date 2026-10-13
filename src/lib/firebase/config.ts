import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1234567890:web:demo',
};

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Explicitly initialize Auth with browserLocalPersistence (localStorage) on the client
// to prevent IndexedDBLocalPersistence lifecycle closing errors ("Database is closing/hidden")
// when switching tabs or navigating pages.
let auth: Auth;
if (typeof window !== 'undefined') {
  try {
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
    });
  } catch {
    auth = getAuth(app);
  }
} else {
  auth = getAuth(app);
}

const db: Firestore = getFirestore(app);

export { app, auth, db };
