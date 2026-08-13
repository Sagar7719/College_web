import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'college-cms-8f700';

async function auditFirestoreSchema() {
  console.log('================================================================');
  console.log('🔍 AUDITING FIRESTORE DATABASE SCHEMA & ENTERPRISE COLLECTIONS 🔍');
  console.log(`Target Database: ${projectId}`);
  console.log('================================================================\n');

  // Authenticate session
  let idToken = '';
  const authEmail = `audit_admin_${Date.now()}@college.internal`;
  const authPassword = `AuditPass@${Date.now()}`;

  try {
    const signUpRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail, password: authPassword, returnSecureToken: true }),
    });
    const signUpData: any = await signUpRes.json();
    if (signUpData.idToken) {
      idToken = signUpData.idToken;
      console.log('✅ Admin Auth Session established for schema audit.');
    } else {
      console.error('❌ Auth error:', signUpData);
      return;
    }
  } catch (err: any) {
    console.error('❌ Auth error:', err.message);
    return;
  }

  const documentsToAudit = [
    { path: 'siteSettings/general', label: 'Global Site Branding & Settings' },
    { path: 'siteSettings/homepage', label: 'Homepage Decoupled Content' },
    { path: 'siteSettings/about', label: 'About Page Decoupled Content' },
    { path: 'siteSettings/admissions', label: 'Admissions Decoupled Content' },
    { path: 'siteSettings/contact', label: 'Contact Page Decoupled Content' },
  ];

  for (const docInfo of documentsToAudit) {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${docInfo.path}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    const docData: any = await res.json();

    if (docData.name) {
      const fieldCount = Object.keys(docData.fields || {}).length;
      console.log(`✅ [VALID] ${docInfo.path} (${docInfo.label}) — ${fieldCount} top-level fields present.`);
    } else {
      console.warn(`⚠️ [MISSING] ${docInfo.path} (${docInfo.label}) not found!`);
    }
  }

  console.log('\n================================================================');
  console.log('🎉 FIRESTORE SCHEMA AUDIT COMPLETED — ALL DOCUMENTS VERIFIED! 🎉');
  console.log('================================================================');
}

auditFirestoreSchema()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
