import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const rawLine of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const line = rawLine.replace(/\r/g, '').trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const idx = line.indexOf('=');
      const key = line.substring(0, idx).trim();
      let val = line.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1).trim();
      }
      process.env[key] = val;
    }
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function inspectPagesCollection() {
  const snapshot = await getDocs(collection(db, 'pages'));
  console.log('Total pages in Firestore:', snapshot.size);
  
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    console.log('\n--- PAGE DOC ---');
    console.log('Document ID:', docSnap.id);
    console.log('title:', data.title);
    console.log('slug (raw):', JSON.stringify(data.slug));
    console.log('status:', data.status);
    console.log('showInNavigation:', data.showInNavigation);
    const sectionsRaw = data.sections;
    const sectionsCount = Array.isArray(sectionsRaw) ? sectionsRaw.length : 'NOT array: ' + typeof sectionsRaw;
    console.log('sections count:', sectionsCount);
    if (Array.isArray(sectionsRaw) && sectionsRaw.length > 0) {
      console.log('sections[0]:', JSON.stringify(sectionsRaw[0], null, 2).substring(0, 500));
    } else {
      console.log('sections:', JSON.stringify(sectionsRaw));
    }
    console.log('updatedAt:', data.updatedAt);
  }
}

inspectPagesCollection().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
