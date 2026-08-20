import { cookies } from 'next/headers';
import { getAdminAuth } from './admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

export const SESSION_COOKIE_NAME = '__session';
// 5 days in milliseconds (valid Firebase Admin session cookie duration: 5 mins to 14 days)
export const SESSION_EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000;

/**
 * Creates a Firebase Session Cookie directly from a verified ID token
 * using Firebase Admin SDK and sets an HttpOnly, Secure cookie on the client.
 */
export async function createFirebaseSessionCookie(idToken: string): Promise<void> {
  const adminAuth = getAdminAuth();
  
  // Directly create session cookie via Firebase Admin SDK (which validates the ID token internally)
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN_MS,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Verifies the HttpOnly session cookie using Firebase Admin SDK.
 * Returns decoded token claims if valid and unrevoked; null otherwise.
 */
export async function verifyFirebaseSessionCookie(
  sessionCookie?: string
): Promise<DecodedIdToken | null> {
  try {
    let token = sessionCookie;
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    }

    if (!token) {
      return null;
    }

    const adminAuth = getAdminAuth();
    // Verify session cookie and check if revoked (checkRevoked = true)
    const decodedClaims = await adminAuth.verifySessionCookie(token, true);
    return decodedClaims;
  } catch {
    return null;
  }
}

/**
 * Clears the HttpOnly session cookie.
 */
export async function revokeFirebaseSessionCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, '', {
      maxAge: 0,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  } catch {
    // Ignore cookie clearing errors
  }
}
