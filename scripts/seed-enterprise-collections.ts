import * as fs from 'fs';
import * as path from 'path';

// 1. Bootstrap environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      let val = line.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'college-cms-8f700';

async function seedEnterpriseData() {
  console.log('================================================================');
  console.log('🚀 SEEDING DECOUPLED FIRESTORE DOCUMENTS 🚀');
  console.log(`Target Project: ${projectId}`);
  console.log('================================================================\n');

  // 1. Authenticate or Sign Up Admin User via Identity Toolkit REST API
  let idToken = '';
  const authEmail = `enterprise_admin_${Date.now()}@college.internal`;
  const authPassword = `AdminSecret@${Date.now()}`;

  console.log(`🔑 Registering fresh Admin session: ${authEmail}`);

  try {
    const signUpRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail, password: authPassword, returnSecureToken: true }),
    });
    const signUpData: any = await signUpRes.json();
    if (signUpData.idToken) {
      idToken = signUpData.idToken;
      console.log('✅ Admin Auth Session established successfully! ID Token generated.');
    } else {
      console.error('❌ Failed to establish auth session:', signUpData);
      return;
    }
  } catch (err: any) {
    console.error('❌ Auth REST error:', err.message);
    return;
  }

  // Import default enterprise schemas
  const {
    defaultHomepageData,
    defaultAboutData,
    defaultAdmissionsData,
    defaultContactData,
  } = await import('../src/services/enterprise-cms.service');

  // Helper to convert JS Object into Firestore REST API Value format
  function toFirestoreValue(val: any): any {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (typeof val === 'number') {
      if (Number.isInteger(val)) return { integerValue: val.toString() };
      return { doubleValue: val };
    }
    if (typeof val === 'string') return { stringValue: val };
    if (Array.isArray(val)) {
      return { arrayValue: { values: val.map((item) => toFirestoreValue(item)) } };
    }
    if (typeof val === 'object') {
      const fields: Record<string, any> = {};
      for (const [k, v] of Object.entries(val)) {
        if (v !== undefined) {
          fields[k] = toFirestoreValue(v);
        }
      }
      return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
  }

  async function writeDocument(docId: string, dataObj: Record<string, any>) {
    const docUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/siteSettings/${docId}`;
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(dataObj)) {
      if (v !== undefined) {
        fields[k] = toFirestoreValue(v);
      }
    }

    console.log(`\n📤 Writing document [siteSettings/${docId}]...`);
    const res = await fetch(docUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ fields }),
    });

    const resData: any = await res.json();
    if (resData.name) {
      console.log(`✅ Document [siteSettings/${docId}] created/updated in Firestore!`);
    } else {
      console.error(`❌ Failed to write [siteSettings/${docId}]:`, resData);
    }
  }

  // Seed decoupled documents in siteSettings collection
  await writeDocument('homepage', defaultHomepageData);
  await writeDocument('about', defaultAboutData);
  await writeDocument('admissions', defaultAdmissionsData);
  await writeDocument('contact', defaultContactData);

  console.log('\n================================================================');
  console.log('🎉 ALL DECOUPLED FIRESTORE DOCUMENTS SEEDED SUCCESSFULLY! 🎉');
  console.log('================================================================');
}

seedEnterpriseData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
