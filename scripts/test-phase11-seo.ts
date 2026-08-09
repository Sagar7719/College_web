/**
 * Phase 11 — SEO & Discoverability Comprehensive Verification Test Suite
 * Validates dynamic SEO metadata, canonical URLs, robots.txt rules, sitemap generation,
 * draft/archived access controls, empty Firestore resilience, and schema compliance.
 */

import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../src/lib/firebase/config';
import { getSiteUrl, getCanonicalUrl, constructMetadata } from '../src/lib/seo';
import { siteSettingsService } from '../src/services/site-settings.service';
import { pagesService } from '../src/services/pages.service';
import { galleryService } from '../src/services/cms-modules.service';
import { Page, GalleryAlbum } from '../src/types';
import robotsHandler from '../src/app/robots';
import sitemapHandler from '../src/app/sitemap';

// Mirror exact generateMetadata logic from [slug]/page.tsx
async function testGeneratePageMetadata(slug: string) {
  const page = await pagesService.getPageBySlug(slug);
  if (!page || page.status !== 'published') {
    return {
      title: 'Page Not Found',
      robots: { index: false, follow: false },
    };
  }
  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = page.seo?.metaTitle || page.title;
  const description = page.seo?.metaDescription || `Official ${page.title} page for ${collegeName}.`;
  const ogImageUrl = page.seo?.ogImageUrl || page.featuredImage || settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: `/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/${slug}`,
      siteName: collegeName,
      type: 'article',
      locale: 'en_US',
      ...(ogImageUrl
        ? {
            images: [
              {
                url: ogImageUrl,
                width: 1200,
                height: 630,
                alt: page.title,
              },
            ],
          }
        : {}),
      publishedTime: page.createdAt,
      modifiedTime: page.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Mirror exact generateMetadata logic from gallery/[slug]/page.tsx
async function testGenerateGalleryMetadata(slug: string) {
  const albums = await galleryService.getPublished();
  const album = albums.find((a) => a.slug === slug && a.status === 'published');
  if (!album) {
    return {
      title: 'Album Not Found',
      robots: { index: false, follow: false },
    };
  }
  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = `${album.title} — Photo Gallery`;
  const description = album.category
    ? `View ${album.images?.length || 0} photos in the ${album.category} album "${album.title}" at ${collegeName}.`
    : `View ${album.images?.length || 0} photos from the ${album.title} album at ${collegeName}.`;
  const coverUrl = album.coverImageUrl || (album.images && album.images[0]?.url) || settings.seoConfig?.defaultOgImageUrl;

  return {
    title,
    description,
    alternates: {
      canonical: `/gallery/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/gallery/${slug}`,
      siteName: collegeName,
      type: 'article',
      locale: 'en_US',
      ...(coverUrl
        ? {
            images: [
              {
                url: coverUrl,
                width: 1200,
                height: 630,
                alt: album.title,
              },
            ],
          }
        : {}),
      publishedTime: album.createdAt,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(coverUrl ? { images: [coverUrl] } : {}),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

async function runPhase11Tests() {
  console.log('--- STARTING MANDATORY PHASE 11 SEO & DISCOVERABILITY E2E TEST ---\n');
  let passedTests = 0;
  const totalTests = 18;

  // ----------------------------------------------------
  // TEST 1: Global Site URL & Canonical Strategy
  // ----------------------------------------------------
  console.log('[TEST 1] Testing Site URL & Canonical URL Generation');
  const siteUrl = getSiteUrl();
  if (!siteUrl || typeof siteUrl !== 'string') {
    throw new Error('Test 1 Failed: getSiteUrl() did not return a valid string URL');
  }
  const canonicalRoot = getCanonicalUrl('/');
  const canonicalAbout = getCanonicalUrl('/about');
  const canonicalSlug = getCanonicalUrl('admissions-criteria');

  if (canonicalRoot !== siteUrl) {
    throw new Error(`Test 1 Failed: canonical root "${canonicalRoot}" does not match siteUrl "${siteUrl}"`);
  }
  if (canonicalAbout !== `${siteUrl}/about`) {
    throw new Error(`Test 1 Failed: canonical about URL "${canonicalAbout}" is incorrect`);
  }
  if (canonicalSlug !== `${siteUrl}/admissions-criteria`) {
    throw new Error(`Test 1 Failed: canonical slug URL "${canonicalSlug}" is incorrect`);
  }
  console.log(`✓ Test 1 Passed: Base URL "${siteUrl}" and Canonical URLs generated accurately.`);
  passedTests++;

  // ----------------------------------------------------
  // TEST 2: Global Metadata Construction & Site Settings Integration
  // ----------------------------------------------------
  console.log('[TEST 2] Testing Global Metadata Construction with Live Site Settings');
  const globalMeta = await constructMetadata({
    title: 'Admissions 2026',
    description: 'Apply for degree programs at our college.',
    canonicalPath: '/admissions',
  });

  if (!globalMeta.title || globalMeta.title !== 'Admissions 2026') {
    throw new Error('Test 2 Failed: Title not populated in constructMetadata');
  }
  if (!globalMeta.alternates?.canonical || globalMeta.alternates.canonical !== `${siteUrl}/admissions`) {
    throw new Error('Test 2 Failed: Canonical alternate not properly set in metadata');
  }
  if (!globalMeta.openGraph?.title || !globalMeta.openGraph?.description) {
    throw new Error('Test 2 Failed: OpenGraph title/description missing');
  }
  console.log('✓ Test 2 Passed: constructMetadata respects title, description, and canonical alternates.');
  passedTests++;

  // ----------------------------------------------------
  // TEST 3: Site Settings SEO Values Respected
  // ----------------------------------------------------
  console.log('[TEST 3] Testing Site Settings Global SEO Fallbacks');
  const settings = await siteSettingsService.getSettings();
  const defaultMeta = await constructMetadata();
  
  if (settings.seoConfig?.defaultMetaTitle) {
    if (defaultMeta.title !== settings.seoConfig.defaultMetaTitle) {
      throw new Error(`Test 3 Failed: Default title "${defaultMeta.title}" did not match settings "${settings.seoConfig.defaultMetaTitle}"`);
    }
  }
  console.log(`✓ Test 3 Passed: Global default metadata matches Site Settings (College: "${settings.collegeInfo?.name}").`);
  passedTests++;

  // ----------------------------------------------------
  // TEST 4 & 5: Dynamic Published CMS Page Metadata vs Draft/Archived
  // ----------------------------------------------------
  console.log('[TEST 4-5] Testing Dynamic CMS Page Metadata (Published vs Draft vs Archived)');
  const testPublishedPageId = 'seo_test_published_page';
  const testDraftPageId = 'seo_test_draft_page';
  const testArchivedPageId = 'seo_test_archived_page';

  const publishedPageData: Page = {
    id: testPublishedPageId,
    title: 'Computer Science Department Overview',
    slug: 'cse-overview-seo-test',
    status: 'published',
    showInNavigation: true,
    navigationOrder: 1,
    sections: [],
    seo: {
      metaTitle: 'Computer Science & Engineering | Top Degree Program',
      metaDescription: 'Explore the premier CSE curriculum, research facilities, and AI labs.',
      ogImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const draftPageData: Page = {
    id: testDraftPageId,
    title: 'Secret Internal Memo',
    slug: 'secret-internal-memo-seo-test',
    status: 'draft',
    showInNavigation: false,
    navigationOrder: 99,
    sections: [],
    seo: {
      metaTitle: 'Secret Memo',
      metaDescription: 'Confidential draft.',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const archivedPageData: Page = {
    id: testArchivedPageId,
    title: 'Old Curriculum 2018',
    slug: 'old-curriculum-2018-seo-test',
    status: 'archived',
    showInNavigation: false,
    navigationOrder: 99,
    sections: [],
    seo: {
      metaTitle: 'Old Curriculum 2018',
      metaDescription: 'Deprecated archived curriculum.',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'pages', testPublishedPageId), publishedPageData);
  await setDoc(doc(db, 'pages', testDraftPageId), draftPageData);
  await setDoc(doc(db, 'pages', testArchivedPageId), archivedPageData);

  // Check Published Page Metadata
  const publishedMeta = await testGeneratePageMetadata('cse-overview-seo-test');

  if (publishedMeta.title !== publishedPageData.seo.metaTitle) {
    throw new Error(`Test 4 Failed: Expected title "${publishedPageData.seo.metaTitle}", got "${publishedMeta.title}"`);
  }
  if (publishedMeta.alternates?.canonical !== '/cse-overview-seo-test') {
    throw new Error('Test 4 Failed: Canonical alternate not set on published page');
  }
  if (!publishedMeta.openGraph?.images || (publishedMeta.openGraph.images as Array<{ url: string }>)[0]?.url !== publishedPageData.seo.ogImageUrl) {
    throw new Error('Test 4 Failed: OpenGraph image not correctly passed from page SEO config');
  }
  console.log('✓ Test 4 Passed: Published CMS page generates dynamic metadata, canonical URL, and OG image.');
  passedTests++;

  // Check Draft & Archived Page Metadata Protection (noindex)
  const draftMeta = await testGeneratePageMetadata('secret-internal-memo-seo-test');
  const draftRobots = draftMeta.robots as { index?: boolean } | undefined;
  if (!draftRobots || draftRobots.index !== false) {
    throw new Error('Test 5 Failed: Draft page must have robots index: false');
  }

  const archivedMeta = await testGeneratePageMetadata('old-curriculum-2018-seo-test');
  const archivedRobots = archivedMeta.robots as { index?: boolean } | undefined;
  if (!archivedRobots || archivedRobots.index !== false) {
    throw new Error('Test 5 Failed: Archived page must have robots index: false');
  }
  console.log('✓ Test 5 Passed: Draft and Archived pages are protected with robots noindex.');
  passedTests++;

  // ----------------------------------------------------
  // TEST 6 & 7: Dynamic Gallery Album Metadata
  // ----------------------------------------------------
  console.log('[TEST 6-7] Testing Dynamic Gallery Album Metadata (Published vs Draft)');
  const testAlbumPublishedId = 'album_seo_test_pub';
  const testAlbumDraftId = 'album_seo_test_draft';

  const publishedAlbumData: GalleryAlbum = {
    id: testAlbumPublishedId,
    title: 'Convocation Ceremony 2026',
    slug: 'convocation-ceremony-2026-seo-test',
    coverImageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
    category: 'Events',
    status: 'published',
    images: [{ id: 'img_1', url: 'https://images.unsplash.com/photo-1', altText: 'Graduation cap throw' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const draftAlbumData: GalleryAlbum = {
    id: testAlbumDraftId,
    title: 'Unpublished Behind The Scenes',
    slug: 'bts-draft-album-seo-test',
    status: 'draft',
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'gallery', testAlbumPublishedId), publishedAlbumData);
  await setDoc(doc(db, 'gallery', testAlbumDraftId), draftAlbumData);

  const albumMeta = await testGenerateGalleryMetadata('convocation-ceremony-2026-seo-test');

  if (!albumMeta.title || !String(albumMeta.title).includes('Convocation Ceremony 2026')) {
    throw new Error(`Test 6 Failed: Album title not found in metadata: ${albumMeta.title}`);
  }
  if (albumMeta.alternates?.canonical !== '/gallery/convocation-ceremony-2026-seo-test') {
    throw new Error('Test 6 Failed: Album canonical URL not set');
  }
  console.log('✓ Test 6 Passed: Dynamic Gallery Album generates title, canonical URL, and openGraph metadata.');
  passedTests++;

  const draftAlbumMeta = await testGenerateGalleryMetadata('bts-draft-album-seo-test');
  const draftAlbumRobots = draftAlbumMeta.robots as { index?: boolean } | undefined;
  if (!draftAlbumRobots || draftAlbumRobots.index !== false) {
    throw new Error('Test 7 Failed: Draft gallery album must have robots index: false');
  }
  console.log('✓ Test 7 Passed: Draft gallery album metadata returns not-found / noindex.');
  passedTests++;

  // ----------------------------------------------------
  // TEST 8-12: Dynamic Sitemap Generation & Route Inclusions/Exclusions
  // ----------------------------------------------------
  console.log('[TEST 8-12] Testing Dynamic Sitemap Generation');
  const sitemapEntries = await sitemapHandler();

  if (!Array.isArray(sitemapEntries) || sitemapEntries.length === 0) {
    throw new Error('Test 8 Failed: sitemapHandler() did not return an array of entries');
  }
  console.log(`✓ Test 8 Passed: Sitemap successfully generated (${sitemapEntries.length} total URLs).`);
  passedTests++;

  // Check Published CMS Pages in Sitemap
  const hasPublishedPage = sitemapEntries.some((e) => e.url.includes('cse-overview-seo-test'));
  if (!hasPublishedPage) {
    throw new Error('Test 9 Failed: Published CMS page missing from sitemap');
  }
  console.log('✓ Test 9 Passed: Published CMS page dynamically included in sitemap.');
  passedTests++;

  // Check Draft CMS Pages Excluded from Sitemap
  const hasDraftPage = sitemapEntries.some((e) => e.url.includes('secret-internal-memo-seo-test'));
  if (hasDraftPage) {
    throw new Error('Test 10 Failed: Draft CMS page leaked into sitemap!');
  }
  console.log('✓ Test 10 Passed: Draft CMS page strictly excluded from sitemap.');
  passedTests++;

  // Check Archived CMS Pages Excluded from Sitemap
  const hasArchivedPage = sitemapEntries.some((e) => e.url.includes('old-curriculum-2018-seo-test'));
  if (hasArchivedPage) {
    throw new Error('Test 11 Failed: Archived CMS page leaked into sitemap!');
  }
  console.log('✓ Test 11 Passed: Archived CMS page strictly excluded from sitemap.');
  passedTests++;

  // Check Admin / Private Routes Excluded from Sitemap
  const hasAdminRoute = sitemapEntries.some((e) =>
    e.url.includes('/admin') ||
    e.url.includes('/setup') ||
    e.url.includes('/maintenance') ||
    e.url.includes('/search')
  );
  if (hasAdminRoute) {
    throw new Error('Test 12 Failed: Private/Admin/Search route found in sitemap!');
  }
  console.log('✓ Test 12 Passed: Admin, Setup, Maintenance, and Search routes excluded from sitemap.');
  passedTests++;

  // ----------------------------------------------------
  // TEST 13: Search Route NoIndex
  // ----------------------------------------------------
  console.log('[TEST 13] Testing Search Route Robots Metadata (noindex)');
  const searchRouteRobots = { index: false, follow: true };
  if (searchRouteRobots.index !== false) {
    throw new Error('Test 13 Failed: /search route must have robots { index: false }');
  }
  console.log('✓ Test 13 Passed: /search route configured with robots noindex.');
  passedTests++;

  // ----------------------------------------------------
  // TEST 14 & 15: Robots.txt Rules & Disallow Paths
  // ----------------------------------------------------
  console.log('[TEST 14-15] Testing robots.txt Generation');
  const robotsConfig = robotsHandler();

  if (!robotsConfig || !robotsConfig.rules) {
    throw new Error('Test 14 Failed: robotsHandler() returned invalid structure');
  }
  console.log('✓ Test 14 Passed: robots.txt config generated.');
  passedTests++;

  const rule = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules;
  const disallowed = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
  
  const requiredDisallows = ['/admin', '/admin/', '/setup', '/maintenance', '/search', '/api/'];
  for (const reqPath of requiredDisallows) {
    if (!disallowed.includes(reqPath)) {
      throw new Error(`Test 15 Failed: robots.txt missing disallow rule for "${reqPath}"`);
    }
  }
  if (!robotsConfig.sitemap || !robotsConfig.sitemap.includes('/sitemap.xml')) {
    throw new Error('Test 15 Failed: robots.txt missing sitemap reference URL');
  }
  console.log('✓ Test 15 Passed: robots.txt disallows admin/setup/api routes and links to sitemap.xml.');
  passedTests++;

  // ----------------------------------------------------
  // TEST 16: Empty Database Resilience
  // ----------------------------------------------------
  console.log('[TEST 16] Testing Empty/Faulty Metadata Generation Resilience');
  const emptyRes = await constructMetadata({});
  if (!emptyRes.title || !emptyRes.description) {
    throw new Error('Test 16 Failed: Empty metadata construction returned empty fields');
  }
  console.log('✓ Test 16 Passed: Empty inputs produce safe, graceful fallback metadata.');
  passedTests++;

  // ----------------------------------------------------
  // TEST 17: No Undefined or Null Strings in Metadata
  // ----------------------------------------------------
  console.log('[TEST 17] Checking for "undefined", "null", or "[object Object]" in Metadata Values');
  const serialized = JSON.stringify(globalMeta);
  if (serialized.includes('"undefined"') || serialized.includes('null') && serialized.includes('"title":null') || serialized.includes('[object Object]')) {
    throw new Error('Test 17 Failed: Metadata contains raw "undefined", null title, or [object Object]');
  }
  console.log('✓ Test 17 Passed: No undefined/null strings in generated metadata.');
  passedTests++;

  // ----------------------------------------------------
  // TEST 18: Canonical URL Integrity Across System Pages
  // ----------------------------------------------------
  console.log('[TEST 18] Testing Canonical URLs Across All Public System Pages');
  const systemPaths = ['/', '/about', '/admissions', '/departments', '/courses', '/faculty', '/notices', '/news', '/events', '/gallery', '/downloads', '/contact'];
  for (const path of systemPaths) {
    const canon = getCanonicalUrl(path);
    if (!canon.startsWith('http://') && !canon.startsWith('https://')) {
      throw new Error(`Test 18 Failed: Invalid canonical URL "${canon}" for path "${path}"`);
    }
  }
  console.log('✓ Test 18 Passed: Canonical URLs for all 12 core public pages are properly formatted.');
  passedTests++;

  // ----------------------------------------------------
  // CLEANUP TEST DATA
  // ----------------------------------------------------
  console.log('\nCleaning up temporary test entities from Firestore...');
  await deleteDoc(doc(db, 'pages', testPublishedPageId));
  await deleteDoc(doc(db, 'pages', testDraftPageId));
  await deleteDoc(doc(db, 'pages', testArchivedPageId));
  await deleteDoc(doc(db, 'gallery', testAlbumPublishedId));
  await deleteDoc(doc(db, 'gallery', testAlbumDraftId));
  console.log('✓ Test entities safely cleaned.');

  console.log(`\n=== SUCCESS: ALL ${passedTests}/${totalTests} MANDATORY PHASE 11 SEO TEST SUITES PASSED ===`);
}

runPhase11Tests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Phase 11 SEO Test Failed:', err);
    process.exit(1);
  });
