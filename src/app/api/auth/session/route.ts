import { NextResponse } from 'next/server';
import {
  createFirebaseSessionCookie,
  revokeFirebaseSessionCookie,
  verifyFirebaseSessionCookie,
} from '@/lib/firebase/session';
import { getAdminAuth } from '@/lib/firebase/admin';

/**
 * POST /api/auth/session
 * Receives a Firebase ID token from client login, creates an HttpOnly session cookie
 * using Firebase Admin SDK, and sets it on the client response.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { idToken } = body;

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json(
        { error: 'ID token is required.' },
        { status: 400 }
      );
    }

    // Directly create session cookie via Firebase Admin SDK
    await createFirebaseSessionCookie(idToken);

    // Return safe success confirmation without exposing token or cookie values
    return NextResponse.json(
      { status: 'success' },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    // Log safe diagnostic server-side without leaking secrets
    console.error(`[API Session POST] Error creating session cookie: ${message}`);

    return NextResponse.json(
      { error: 'Failed to establish server session.' },
      { status: 401 }
    );
  }
}

/**
 * DELETE /api/auth/session
 * Revokes the user's refresh tokens on the Firebase Auth server if a valid session exists,
 * and clears the HttpOnly session cookie.
 */
export async function DELETE() {
  try {
    // 1. Verify existing session cookie to retrieve user UID if session is valid
    try {
      const decodedClaims = await verifyFirebaseSessionCookie();
      if (decodedClaims && decodedClaims.uid) {
        const adminAuth = getAdminAuth();
        await adminAuth.revokeRefreshTokens(decodedClaims.uid);
      }
    } catch {
      // If token verification or revocation fails (e.g. already expired/invalid), proceed safely to clear cookie
    }

    // 2. Clear HttpOnly session cookie
    await revokeFirebaseSessionCookie();

    return NextResponse.json(
      { status: 'success' },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[API Session DELETE] Error during logout: ${message}`);

    // Even on unexpected error, ensure the cookie is cleared
    await revokeFirebaseSessionCookie().catch(() => {});

    return NextResponse.json(
      { error: 'Failed to clear session.' },
      { status: 500 }
    );
  }
}
