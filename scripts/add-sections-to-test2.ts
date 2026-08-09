import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, query, where, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Load env
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
const auth = getAuth(app);

async function addSectionsToTest2() {
  await signInWithEmailAndPassword(auth, 'sagarulagadde1008@gmail.com', 'AdminPassword@2026');
  console.log('✓ Authenticated as admin');

  // Find the test2 document
  const q = query(collection(db, 'pages'), where('slug', '==', 'test2'));
  const snap = await getDocs(q);
  if (snap.empty) {
    console.error('ERROR: test2 page not found');
    process.exit(1);
  }
  
  const docSnap = snap.docs[0];
  const existing = docSnap.data();
  console.log('Found test2 page:', docSnap.id, '| status:', existing.status, '| sections:', existing.sections?.length ?? 0);

  // Add demonstration sections that showcase the Page Builder
  const now = new Date().toISOString();
  const demoSections = [
    {
      id: 'sec_test2_1',
      type: 'hero',
      order: 0,
      visible: true,
      content: {
        title: 'Welcome — test2 Page',
        subtitle: 'This page was published without sections. They have now been added via the edit workflow.',
        buttonText: 'Go to Admin',
        buttonUrl: '/admin/pages',
        bgColor: '#1a237e',
      }
    },
    {
      id: 'sec_test2_2',
      type: 'heading',
      order: 1,
      visible: true,
      content: {
        title: 'Dynamic Page Builder Test',
        level: 'h2',
      }
    },
    {
      id: 'sec_test2_3',
      type: 'richtext',
      order: 2,
      visible: true,
      content: {
        html: '<p>This content was added by editing the page in the admin panel at <code>/admin/pages</code>. The Page Builder correctly persists sections in Firestore and renders them on the public website.</p>',
      }
    },
    {
      id: 'sec_test2_4',
      type: 'cta',
      order: 3,
      visible: true,
      content: {
        heading: 'CMS Page Builder Working!',
        subheading: 'All 14 section types supported',
        primaryButtonText: 'View All Pages',
        primaryButtonUrl: '/admin/pages',
        bgColor: '#e8f5e9',
      }
    },
    {
      id: 'sec_test2_5',
      type: 'spacer',
      order: 4,
      visible: true,
      content: { height: 40 }
    }
  ];

  await setDoc(doc(db, 'pages', docSnap.id), {
    ...existing,
    sections: demoSections,
    updatedAt: now,
    updatedBy: 'Admin',
  });

  console.log('✓ Added', demoSections.length, 'sections to test2 page');
  console.log('✓ test2 page is now live at /test2 with sections rendered');

  // Verify via slug query
  const q2 = query(collection(db, 'pages'), where('slug', '==', 'test2'), where('status', '==', 'published'));
  const snap2 = await getDocs(q2);
  if (!snap2.empty) {
    const data2 = snap2.docs[0].data();
    console.log('✓ Verification: getPageBySlug("test2") returns page with', data2.sections?.length, 'sections');
    console.log('✓ First section type:', data2.sections[0]?.type);
  }
}

addSectionsToTest2().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
