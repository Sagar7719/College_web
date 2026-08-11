import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

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

const SYSTEM_PAGES = [
  { id: 'sys_page_home', title: 'Home', slug: 'home', systemKey: 'home', path: '/', order: 0 },
  { id: 'sys_page_about', title: 'About Us', slug: 'about', systemKey: 'about', path: '/about', order: 1 },
  { id: 'sys_page_academics', title: 'Academics', slug: 'departments', systemKey: 'academics', path: '/departments', order: 2 },
  { id: 'sys_page_admissions', title: 'Admissions', slug: 'admissions', systemKey: 'admissions', path: '/admissions', order: 3 },
  { id: 'sys_page_notices', title: 'Notices', slug: 'notices', systemKey: 'notices', path: '/notices', order: 4 },
  { id: 'sys_page_contact', title: 'Contact Us', slug: 'contact', systemKey: 'contact', path: '/contact', order: 5 },
];

async function initUnifiedArchitecture() {
  console.log('=== INITIALIZING UNIFIED DYNAMIC PAGE & NAVIGATION ARCHITECTURE ===');
  const now = new Date().toISOString();

  // 1. Seed/Ensure System Pages in `pages` collection
  for (const sys of SYSTEM_PAGES) {
    const pageRef = doc(db, 'pages', sys.id);
    await setDoc(
      pageRef,
      {
        id: sys.id,
        title: sys.title,
        slug: sys.slug,
        status: 'published',
        showInNavigation: true,
        navigationOrder: sys.order,
        sections: [],
        seo: { metaTitle: sys.title, metaDescription: `Official ${sys.title} page.` },
        createdAt: now,
        updatedAt: now,
        createdBy: 'System',
        updatedBy: 'System',
        isSystemPage: true,
        systemKey: sys.systemKey,
      },
      { merge: true }
    );
    console.log(`✓ Seeded/Updated System Page: ${sys.title} (${sys.id})`);
  }

  // 2. Seed/Ensure System Nav Items in `navigation` collection
  for (const sys of SYSTEM_PAGES) {
    const navId = `nav_sys_${sys.systemKey}`;
    const navRef = doc(db, 'navigation', navId);
    await setDoc(
      navRef,
      {
        id: navId,
        label: sys.title,
        path: sys.path,
        isCMSPage: true,
        cmsPageId: sys.id,
        isSystemPage: true,
        systemKey: sys.systemKey,
        order: sys.order,
        visible: true,
      },
      { merge: true }
    );
    console.log(`✓ Seeded/Updated System Navigation: ${sys.title} (${navId})`);
  }

  // 3. Clean legacy navigation keys (like nav_home, nav_about if present)
  const legacyNavKeys = ['nav_home', 'nav_about', 'nav_academics', 'nav_admissions', 'nav_notices', 'nav_contact'];
  for (const legacyId of legacyNavKeys) {
    try {
      await deleteDoc(doc(db, 'navigation', legacyId));
    } catch {}
  }

  // 4. Verify Firestore Collections
  const pagesSnap = await getDocs(collection(db, 'pages'));
  const navSnap = await getDocs(collection(db, 'navigation'));

  console.log(`\nVerified Firestore State:`);
  console.log(`Total Pages: ${pagesSnap.size}`);
  console.log(`Total Nav Items: ${navSnap.size}`);

  console.log('\n=== UNIFIED ARCHITECTURE INITIALIZED SUCCESSFULLY ===');
}

initUnifiedArchitecture()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
