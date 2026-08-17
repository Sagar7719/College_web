import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

/**
 * Server-Only Boundary Guard
 * Ensures Firebase Admin SDK is never imported or executed in browser environment.
 */
if (typeof window !== 'undefined') {
  throw new Error('Firebase Admin SDK can only be used on the server.');
}

/**
 * Helper to identify missing environment variables without exposing sensitive values.
 */
function getMissingEnvVars(): string[] {
  const missing: string[] = [];
  if (!process.env.FIREBASE_ADMIN_PROJECT_ID) missing.push('FIREBASE_ADMIN_PROJECT_ID');
  if (!process.env.FIREBASE_ADMIN_CLIENT_EMAIL) missing.push('FIREBASE_ADMIN_CLIENT_EMAIL');
  if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) missing.push('FIREBASE_ADMIN_PRIVATE_KEY');
  return missing;
}

/**
 * Safe Firebase Admin App initialization for Next.js server environment.
 * Prevents re-initialization across hot reloads.
 */
function initAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return getApp();
  }

  const missingEnvVars = getMissingEnvVars();
  if (missingEnvVars.length > 0) {
    throw new Error(
      `Firebase Admin environment variables are not configured yet. Missing: ${missingEnvVars.join(', ')}`
    );
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID!;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL!;
  // Safely handle escaped newlines in private key
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n');

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

let adminAppInstance: App | null = null;
let adminAuthInstance: Auth | null = null;
let adminDbInstance: Firestore | null = null;

/**
 * Returns the initialized Firebase Admin App instance.
 */
export function getAdminApp(): App {
  if (!adminAppInstance) {
    adminAppInstance = initAdminApp();
  }
  return adminAppInstance;
}

/**
 * Returns the Firebase Admin Auth instance.
 */
export function getAdminAuth(): Auth {
  if (!adminAuthInstance) {
    adminAuthInstance = getAuth(getAdminApp());
  }
  return adminAuthInstance;
}

/**
 * Returns the Firebase Admin Firestore instance.
 */
export function getAdminDb(): Firestore {
  if (!adminDbInstance) {
    adminDbInstance = getFirestore(getAdminApp());
  }
  return adminDbInstance;
}
