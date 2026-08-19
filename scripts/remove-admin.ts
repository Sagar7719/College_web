import { getAdminAuth } from '../src/lib/firebase/admin';
import type { UserRecord } from 'firebase-admin/auth';

/**
 * CLI Script to revoke admin privileges by setting { admin: false } custom claim.
 * Target user can be identified by Email or Firebase UID.
 * 
 * Usage:
 *   npx tsx --env-file=.env.local scripts/remove-admin.ts <email-or-uid>
 */
async function main() {
  const args = process.argv.slice(2);
  const identifier = args.find((arg) => !arg.startsWith('--'));

  if (!identifier) {
    console.error('❌ Error: Missing user identifier.');
    console.error('Usage: npx tsx --env-file=.env.local scripts/remove-admin.ts <email-or-uid>');
    process.exit(1);
  }

  try {
    const auth = getAdminAuth();
    let user: UserRecord | null = null;

    // 1. User Lookup by Email or UID
    if (identifier.includes('@')) {
      try {
        user = await auth.getUserByEmail(identifier);
      } catch (err: unknown) {
        const error = err as { code?: string };
        if (error.code !== 'auth/user-not-found' && error.code !== 'auth/invalid-email') {
          throw err;
        }
      }
    }

    if (!user) {
      try {
        user = await auth.getUser(identifier);
      } catch (err: unknown) {
        const error = err as { code?: string };
        if (error.code !== 'auth/user-not-found' && error.code !== 'auth/invalid-uid') {
          throw err;
        }
      }
    }

    if (!user) {
      console.error(`❌ Error: User '${identifier}' not found in Firebase Authentication.`);
      console.error('Operation aborted. No user created or modified.');
      process.exit(1);
    }

    // 2. Read and preserve existing custom claims
    const existingClaims = user.customClaims || {};
    const updatedClaims = {
      ...existingClaims,
      admin: false,
    };

    // 3. Set Custom Claim
    await auth.setCustomUserClaims(user.uid, updatedClaims);

    // 4. Re-read and Verify
    const verifiedUser = await auth.getUser(user.uid);
    const isAdmin = verifiedUser.customClaims?.admin === true;

    if (isAdmin) {
      console.error(`❌ Error: Verification failed. Custom claim 'admin: false' was not applied for UID: ${user.uid}`);
      process.exit(1);
    }

    // 5. Output Safe Confirmation (Never log keys, secrets, or tokens)
    console.log('---------------------------------------------------------');
    console.log('✅ SUCCESS: Firebase Admin Custom Claim revoked successfully');
    console.log(`- UID: ${verifiedUser.uid}`);
    console.log(`- Email: ${verifiedUser.email ?? 'N/A'}`);
    console.log(`- Custom Claim Verified: admin === ${verifiedUser.customClaims?.admin}`);
    console.log('---------------------------------------------------------');
    process.exit(0);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error executing remove-admin: ${message}`);
    process.exit(1);
  }
}

main();
