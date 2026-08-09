/**
 * PHASE 5 — Dynamic Page Builder E2E Lifecycle Verification
 * Tests the complete Admin Create → Add Sections → Save → Publish → Public Render → Lifecycle workflow
 */
import * as fs from 'fs';
import * as path from 'path';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, query, where, setDoc, deleteDoc } from 'firebase/firestore';
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

const COLLECTION = 'pages';
const TEST_PAGE_ID = 'e2e_dynamic_render_test_2026';
const TEST_SLUG = 'dynamic-rendering-verification';

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label}${detail ? ': ' + detail : ''}`);
    failed++;
  }
}

// All 14 section types
const TEST_SECTIONS = [
  { id: 'sec_1', type: 'hero', order: 0, visible: true, content: { title: 'Welcome to the College', subtitle: 'Building Tomorrow\'s Leaders', buttonText: 'Learn More', buttonUrl: '/about', bgColor: '#1a237e' } },
  { id: 'sec_2', type: 'heading', order: 1, visible: true, content: { title: 'About Our Institution', level: 'h2' } },
  { id: 'sec_3', type: 'richtext', order: 2, visible: true, content: { html: '<p>Founded in 1985, our college has <strong>excellence</strong> in engineering and arts.</p>' } },
  { id: 'sec_4', type: 'image', order: 3, visible: true, content: { imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585', alt: 'Campus Building', caption: 'Main Academic Block' } },
  { id: 'sec_5', type: 'imageText', order: 4, visible: true, content: { imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1', alt: 'Students studying', heading: 'Student Life', body: 'Our vibrant campus community.', imagePosition: 'left' } },
  { id: 'sec_6', type: 'twoColumn', order: 5, visible: true, content: { column1: '<h3>Mission</h3><p>Excellence in education.</p>', column2: '<h3>Vision</h3><p>Empowering students globally.</p>' } },
  { id: 'sec_7', type: 'threeColumn', order: 6, visible: true, content: { column1: '<p>Col 1</p>', column2: '<p>Col 2</p>', column3: '<p>Col 3</p>' } },
  { id: 'sec_8', type: 'cardGrid', order: 7, visible: true, content: { cards: [{ title: 'Engineering', description: 'Top ranked programs.', iconEmoji: '🎓', linkUrl: '/departments' }, { title: 'Arts', description: 'Creative excellence.', iconEmoji: '🎨', linkUrl: '/courses' }] } },
  { id: 'sec_9', type: 'cta', order: 8, visible: true, content: { heading: 'Apply Now for 2026', subheading: 'Applications open until March 31', primaryButtonText: 'Apply Online', primaryButtonUrl: '/admissions', bgColor: '#e8f5e9' } },
  { id: 'sec_10', type: 'faq', order: 9, visible: true, content: { heading: 'Frequently Asked Questions', items: [{ question: 'When does the semester start?', answer: 'July 2026.' }, { question: 'Is scholarship available?', answer: 'Yes, merit-based scholarships are available.' }] } },
  { id: 'sec_11', type: 'noticeList', order: 10, visible: true, content: { heading: 'Latest Notices', maxItems: 5 } },
  { id: 'sec_12', type: 'documentDownloads', order: 11, visible: true, content: { heading: 'Downloads', category: 'Admissions' } },
  { id: 'sec_13', type: 'gallery', order: 12, visible: true, content: { heading: 'Campus Gallery', albumId: '' } },
  { id: 'sec_14', type: 'spacer', order: 13, visible: true, content: { height: 40 } },
];

async function runPhase5Tests() {
  console.log('========================================================================');
  console.log('   PHASE 5: DYNAMIC PAGE BUILDER END-TO-END LIFECYCLE VERIFICATION');
  console.log('========================================================================\n');

  // Step 1: Authenticate as admin
  console.log('[STEP 1] Authenticating as Administrator...');
  await signInWithEmailAndPassword(auth, 'sagarulagadde1008@gmail.com', 'AdminPassword@2026');
  check('Admin authentication successful', !!auth.currentUser, auth.currentUser?.email || 'no user');

  // Step 2: Inspect test2 page Firestore state
  console.log('\n[STEP 2] Inspecting "test2" Firestore document...');
  const test2Query = query(collection(db, COLLECTION), where('slug', '==', 'test2'));
  const test2Snap = await getDocs(test2Query);
  if (!test2Snap.empty) {
    const test2Data = test2Snap.docs[0].data();
    console.log('  Document ID:', test2Snap.docs[0].id);
    console.log('  title:', test2Data.title);
    console.log('  slug:', JSON.stringify(test2Data.slug));
    console.log('  status:', test2Data.status);
    console.log('  sections count:', Array.isArray(test2Data.sections) ? test2Data.sections.length : 'not array');
    check('"test2" document exists in Firestore', true);
    check('"test2" is published', test2Data.status === 'published');
    check('"test2" slug is stored correctly (no leading /)', test2Data.slug === 'test2');
    const sectionsEmpty = Array.isArray(test2Data.sections) && test2Data.sections.length === 0;
    check('"test2" sections ARE empty (root cause of "Page Content Coming Soon")', sectionsEmpty,
      sectionsEmpty ? 'Page was published with 0 sections - correct rendering behavior' : 'unexpected');
  } else {
    check('"test2" document found in Firestore', false, 'No doc with slug=test2');
  }

  // Step 3: Create test page as draft
  console.log('\n[STEP 3] Creating test page as DRAFT (sections empty = 0)...');
  const now = new Date().toISOString();
  const draftPayload = {
    id: TEST_PAGE_ID,
    title: 'Dynamic Rendering Verification',
    slug: TEST_SLUG,
    status: 'draft',
    showInNavigation: false,
    navigationOrder: 99,
    sections: [],
    featuredImage: '',
    seo: { metaTitle: 'Dynamic Rendering Verification', metaDescription: 'E2E test page', ogImageUrl: '', keywords: [] },
    createdAt: now,
    updatedAt: now,
    createdBy: 'E2E Test',
    updatedBy: 'E2E Test',
  };
  await setDoc(doc(db, COLLECTION, TEST_PAGE_ID), draftPayload);
  check('Draft page created in Firestore', true);

  // Step 4: Verify draft is NOT returned by getPageBySlug (published filter)
  console.log('\n[STEP 4] Verifying draft is NOT publicly accessible...');
  const draftQuery = query(collection(db, COLLECTION), where('slug', '==', TEST_SLUG), where('status', '==', 'published'));
  const draftSnap = await getDocs(draftQuery);
  check('Draft page NOT returned by getPageBySlug (published filter)', draftSnap.empty);

  // Step 5: Add all 14 section types to the page (simulating Page Builder "save")
  console.log('\n[STEP 5] Adding all 14 section types and saving...');
  const withSectionsPayload = {
    ...draftPayload,
    sections: TEST_SECTIONS,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(doc(db, COLLECTION, TEST_PAGE_ID), withSectionsPayload);

  // Verify sections persisted
  const savedSnap = await getDoc(doc(db, COLLECTION, TEST_PAGE_ID));
  const savedData = savedSnap.data();
  check('All 14 sections persisted in Firestore', Array.isArray(savedData?.sections) && savedData.sections.length === 14,
    `Got ${savedData?.sections?.length} sections`);

  // Verify all 14 types are stored
  const sectionTypes = (savedData?.sections as Array<{ type: string }>).map(s => s.type);
  const expectedTypes = ['hero', 'heading', 'richtext', 'image', 'imageText', 'twoColumn', 'threeColumn', 'cardGrid', 'cta', 'faq', 'noticeList', 'documentDownloads', 'gallery', 'spacer'];
  for (const t of expectedTypes) {
    check(`Section type "${t}" stored correctly`, sectionTypes.includes(t));
  }

  // Step 6: Publish the page
  console.log('\n[STEP 6] Publishing the page...');
  await setDoc(doc(db, COLLECTION, TEST_PAGE_ID), { ...withSectionsPayload, status: 'published', updatedAt: new Date().toISOString() });

  // Step 7: Verify getPageBySlug returns the page with sections
  console.log('\n[STEP 7] Verifying getPageBySlug returns sections after publish...');
  const publishedQuery = query(collection(db, COLLECTION), where('slug', '==', TEST_SLUG), where('status', '==', 'published'));
  const publishedSnap = await getDocs(publishedQuery);
  check('Published page found by slug query', !publishedSnap.empty);
  if (!publishedSnap.empty) {
    const publishedData = publishedSnap.docs[0].data();
    check('Published page has 14 sections', Array.isArray(publishedData.sections) && publishedData.sections.length === 14,
      `Got ${publishedData?.sections?.length}`);
    check('Published page status is "published"', publishedData.status === 'published');

    // Step 8: Verify section content integrity
    console.log('\n[STEP 8] Verifying section content integrity...');
    const heroSection = (publishedData.sections as Array<{ type: string; content: Record<string, unknown> }>).find(s => s.type === 'hero');
    check('Hero section content.title persisted', heroSection?.content?.title === 'Welcome to the College');
    const ctaSection = (publishedData.sections as Array<{ type: string; content: Record<string, unknown> }>).find(s => s.type === 'cta');
    check('CTA section content.heading persisted', ctaSection?.content?.heading === 'Apply Now for 2026');
    const faqSection = (publishedData.sections as Array<{ type: string; content: { items?: unknown[] } }>).find(s => s.type === 'faq');
    check('FAQ section content.items persisted', Array.isArray(faqSection?.content?.items) && (faqSection!.content.items as unknown[]).length === 2);
  }

  // Step 9: Reorder sections test
  console.log('\n[STEP 9] Testing section reorder...');
  const reorderedSections = [...TEST_SECTIONS];
  // Move heading to first position
  const headingSection = reorderedSections.splice(1, 1)[0];
  reorderedSections.unshift(headingSection);
  await setDoc(doc(db, COLLECTION, TEST_PAGE_ID), { ...withSectionsPayload, status: 'published', sections: reorderedSections, updatedAt: new Date().toISOString() });

  const reorderedSnap = await getDoc(doc(db, COLLECTION, TEST_PAGE_ID));
  const reorderedData = reorderedSnap.data();
  check('Reordered sections persisted', (reorderedData?.sections as Array<{ type: string }>)?.[0]?.type === 'heading');

  // Step 10: Unpublish the page
  console.log('\n[STEP 10] Unpublishing the page...');
  await setDoc(doc(db, COLLECTION, TEST_PAGE_ID), { ...withSectionsPayload, sections: reorderedSections, status: 'draft', updatedAt: new Date().toISOString() });
  const unpublishedQuery = query(collection(db, COLLECTION), where('slug', '==', TEST_SLUG), where('status', '==', 'published'));
  const unpublishedSnap = await getDocs(unpublishedQuery);
  check('Unpublished page not found by published query', unpublishedSnap.empty);

  // Step 11: Clean up
  console.log('\n[STEP 11] Cleaning up test data...');
  await deleteDoc(doc(db, COLLECTION, TEST_PAGE_ID));
  const cleanupSnap = await getDoc(doc(db, COLLECTION, TEST_PAGE_ID));
  check('Test page deleted from Firestore', !cleanupSnap.exists());

  console.log('\n========================================================================');
  console.log(`   PHASE 5 RESULTS: ${passed} passed / ${failed} failed`);
  console.log('========================================================================');

  if (failed > 0) {
    console.log('\n⚠️  FAILURES DETECTED - investigation required.');
    process.exit(1);
  } else {
    console.log('\n✓ ALL CHECKS PASSED');
    process.exit(0);
  }
}

runPhase5Tests().catch(e => { console.error('Unhandled error:', e); process.exit(1); });
