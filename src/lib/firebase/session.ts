import { NextResponse } from 'next/server';
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

/**
 * Custom error thrown when a request lacks a valid, unexpired, or unrevoked Firebase session cookie.
 * Maps to HTTP 401 Unauthorized.
 */
export class AuthenticationRequiredError extends Error {
  readonly status = 401;
  constructor(message = 'Authentication required.') {
    super(message);
    this.name = 'AuthenticationRequiredError';
  }
}

/**
 * Custom error thrown when a user has a valid Firebase session cookie but lacks the `admin === true` custom claim.
 * Maps to HTTP 403 Forbidden.
 */
export class AdminRequiredError extends Error {
  readonly status = 403;
  constructor(message = 'Administrator privileges required.') {
    super(message);
    this.name = 'AdminRequiredError';
  }
}

/**
 * Server-only authorization helper.
 * Verifies the HttpOnly session cookie via Firebase Admin SDK and strictly validates custom claim `admin === true`.
 * Returns decoded session claims if authorized.
 * Throws `AuthenticationRequiredError` (401) if unauthenticated/invalid session.
 * Throws `AdminRequiredError` (403) if authenticated user lacks admin claim.
 */
export async function requireAdmin(sessionCookie?: string): Promise<DecodedIdToken> {
  const claims = await verifyFirebaseSessionCookie(sessionCookie);

  if (!claims) {
    throw new AuthenticationRequiredError();
  }

  if (claims.admin !== true) {
    throw new AdminRequiredError();
  }

  return claims;
}

/**
 * Helper to handle authorization errors consistently in API route handlers.
 * Returns a standardized NextResponse with 401 or 403 status code if the error
 * is an AuthenticationRequiredError or AdminRequiredError; returns null otherwise.
 */
export function handleApiAuthError(error: unknown): NextResponse | null {
  if (error instanceof AuthenticationRequiredError) {
    return NextResponse.json(
      { success: false, error: 'Authentication required.' },
      { status: 401 }
    );
  }
  if (error instanceof AdminRequiredError) {
    return NextResponse.json(
      { success: false, error: 'Administrator privileges required.' },
      { status: 403 }
    );
  }
  return null;
}

