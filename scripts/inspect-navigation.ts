import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

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

const SYSTEM_IDS = ['nav_home', 'nav_about', 'nav_academics', 'nav_admissions', 'nav_notices', 'nav_contact'];

async function inspectNavigationCollection() {
  const q = query(collection(db, 'navigation'), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);

  console.log('\n=== CURRENT FIRESTORE navigation COLLECTION ===');
  console.log(`Total documents: ${snapshot.size}`);

  const systemItems: unknown[] = [];
  const cmsItems: unknown[] = [];
  const otherItems: unknown[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const entry = {
      id: docSnap.id,
      label: data.label,
      path: data.path,
      order: data.order,
      visible: data.visible,
      isCMSPage: data.isCMSPage,
      cmsPageId: data.cmsPageId,
    };
    if (SYSTEM_IDS.includes(docSnap.id)) {
      systemItems.push(entry);
    } else if (data.isCMSPage) {
      cmsItems.push(entry);
    } else {
      otherItems.push(entry);
    }
  }

  console.log('\n--- SYSTEM NAV ITEMS (present in Firestore) ---');
  if (systemItems.length === 0) {
    console.log('  [NONE] — None of the 6 canonical system items exist in Firestore!');
    console.log('  Missing:', SYSTEM_IDS.join(', '));
  } else {
    systemItems.forEach((i) => console.log(' ', JSON.stringify(i)));
    const missing = SYSTEM_IDS.filter((id) => !systemItems.some((i: unknown) => (i as { id: string }).id === id));
    if (missing.length > 0) {
      console.log(`  MISSING system items: ${missing.join(', ')}`);
    }
  }

  console.log('\n--- CMS PAGE NAV ITEMS (isCMSPage=true) ---');
  if (cmsItems.length === 0) {
    console.log('  [NONE]');
  } else {
    cmsItems.forEach((i: unknown) => {
      const item = i as { id: string; label: string; order: number };
      const needsNorm = item.order < 100;
      console.log(' ', JSON.stringify(i), needsNorm ? ' ← NEEDS ORDER NORMALIZATION (order < 100)' : ' ✓ order OK');
    });
  }

  console.log('\n--- OTHER NAV ITEMS (not system, not CMS page) ---');
  if (otherItems.length === 0) {
    console.log('  [NONE]');
  } else {
    otherItems.forEach((i) => console.log(' ', JSON.stringify(i)));
  }

  console.log('\n=== DIAGNOSIS ===');
  const missingSystemCount = SYSTEM_IDS.filter(
    (id) => !systemItems.some((i: unknown) => (i as { id: string }).id === id)
  ).length;
  const cmsNeedsNorm = (cmsItems as { order: number }[]).filter((i) => i.order < 100).length;

  if (missingSystemCount > 0) {
    console.log(`❌ ${missingSystemCount} system nav item(s) are MISSING from Firestore → public navbar shows wrong items`);
  } else {
    console.log('✓ All system nav items present');
  }
  if (cmsNeedsNorm > 0) {
    console.log(`⚠️  ${cmsNeedsNorm} CMS nav item(s) have order < 100 and need normalization`);
  } else if (cmsItems.length > 0) {
    console.log('✓ All CMS nav items already have order >= 100');
  }
  console.log('\nDone.');
}

inspectNavigationCollection()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
