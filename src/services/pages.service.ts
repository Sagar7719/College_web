import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Page, PageStatus } from '@/types';
import { sanitizeForFirestore } from '@/lib/firestore-utils';
import { SYSTEM_PAGES_CONFIG, isSystemPageCheck } from '@/constants/system-pages';
import { siteSettingsService } from '@/services/site-settings.service';

const COLLECTION_NAME = 'pages';

/**
 * Safe, idempotent initialization of required institutional system pages.
 * Ensures that Home, About Us, Academics, Admissions, Notices, and Contact Us
 * exist in the Firestore `pages` collection with isSystemPage: true.
 *
 * Rules:
 * - Creates only missing system page documents (using sys_page_<key> ID).
 * - Never overwrites existing page content if doc already exists.
 * - Never duplicates records.
 */
async function ensureSystemPages(): Promise<void> {
  try {
    const snapshots = await Promise.all(
      SYSTEM_PAGES_CONFIG.map((p) => getDoc(doc(db, COLLECTION_NAME, p.id)))
    );

    // Query all pages to inspect and remove legacy/duplicate Home documents safely
    const allPagesSnap = await getDocs(collection(db, COLLECTION_NAME));
    const duplicateHomeDocs = allPagesSnap.docs.filter((d) => {
      if (d.id === 'sys_page_home') return false;
      const data = d.data();
      const slugClean = (data.slug || '').toLowerCase().replace(/^\//, '');
      const titleLower = (data.title || '').toLowerCase().trim();

      return (
        data.systemKey === 'home' ||
        (slugClean === 'home' && data.isSystemPage === true) ||
        (slugClean === '' && (titleLower === 'home' || data.isSystemPage === true))
      );
    });

    const batch = writeBatch(db);
    let hasChanges = false;
    const now = new Date().toISOString();

    // Check if canonical Home doc sys_page_home exists
    const canonicalHomeSnap = snapshots[0];
    let canonicalHomeData = canonicalHomeSnap.exists() ? canonicalHomeSnap.data() as Page : null;
    let preservedSections = canonicalHomeData?.sections || [];

    // If canonical home has empty sections, preserve sections from duplicate home docs if present
    if (preservedSections.length === 0) {
      for (const dup of duplicateHomeDocs) {
        const dupData = dup.data();
        if (dupData.sections && Array.isArray(dupData.sections) && dupData.sections.length > 0) {
          preservedSections = dupData.sections;
          break;
        }
      }
    }

    // Delete identified duplicate Home records
    duplicateHomeDocs.forEach((dup) => {
      batch.delete(dup.ref);
      hasChanges = true;
    });

    // Ensure all 6 system pages exist with canonical identity
    snapshots.forEach((snap, idx) => {
      const sysDef = SYSTEM_PAGES_CONFIG[idx];
      if (!snap.exists()) {
        const payload: Page = {
          id: sysDef.id,
          title: sysDef.title,
          slug: sysDef.slug,
          status: 'published',
          showInNavigation: true,
          navigationOrder: sysDef.order,
          sections: sysDef.id === 'sys_page_home' ? preservedSections : [],
          seo: {
            metaTitle: sysDef.title,
            metaDescription: `Official ${sysDef.title} page.`,
          },
          createdAt: now,
          updatedAt: now,
          createdBy: 'System',
          updatedBy: 'System',
          isSystemPage: true,
          systemKey: sysDef.systemKey,
        };
        batch.set(doc(db, COLLECTION_NAME, sysDef.id), sanitizeForFirestore(payload));
        hasChanges = true;
      } else {
        const data = snap.data();
        const updates: Record<string, unknown> = {};

        if (!data?.isSystemPage) updates.isSystemPage = true;
        if (data?.systemKey !== sysDef.systemKey) updates.systemKey = sysDef.systemKey;
        if (data?.slug !== sysDef.slug) updates.slug = sysDef.slug;
        if (sysDef.id === 'sys_page_home' && preservedSections.length > 0 && (!data.sections || data.sections.length === 0)) {
          updates.sections = preservedSections;
        }

        if (Object.keys(updates).length > 0) {
          batch.set(
            doc(db, COLLECTION_NAME, sysDef.id),
            sanitizeForFirestore(updates),
            { merge: true }
          );
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      await batch.commit();
    }
  } catch (err) {
    console.warn('ensureSystemPages warning:', err);
  }
}

import { cache } from 'react';

export const pagesService = {
  /** Ensure default system pages exist in Firestore */
  async initSystemPages(): Promise<void> {
    await ensureSystemPages();
  },

  async getAllPages(): Promise<Page[]> {
    try {
      await ensureSystemPages();
      const q = query(collection(db, COLLECTION_NAME), orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((docSnap) => {
        const page = { id: docSnap.id, ...docSnap.data() } as Page;
        if (isSystemPageCheck(page)) {
          page.isSystemPage = true;
        }
        return page;
      });
      return items;
    } catch (err) {
      console.warn('Firestore pages fetch warning:', err);
      return [];
    }
  },

  getPublishedPages: cache(async (): Promise<Page[]> => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'published')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => {
        const page = { id: docSnap.id, ...docSnap.data() } as Page;
        if (isSystemPageCheck(page)) page.isSystemPage = true;
        return page;
      });
    } catch (err) {
      console.warn('Firestore published pages fetch warning:', err);
      return [];
    }
  }),

  getPageBySlug: cache(async (slug: string): Promise<Page | null> => {
    try {
      const cleanSlug = slug.toLowerCase().replace(/^\//, '');

      // Special handling for canonical Home page route
      if (cleanSlug === '' || cleanSlug === 'home') {
        const sysSnap = await getDoc(doc(db, COLLECTION_NAME, 'sys_page_home'));
        if (sysSnap.exists()) {
          const pageData = { id: sysSnap.id, ...sysSnap.data() } as Page;
          if (pageData.status === 'published') return pageData;
        }
        if (cleanSlug === 'home') return null;
      }

      const q = query(
        collection(db, COLLECTION_NAME),
        where('slug', '==', cleanSlug),
        where('status', '==', 'published')
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        const sysMatch = SYSTEM_PAGES_CONFIG.find((p) => p.slug.toLowerCase() === cleanSlug && p.slug !== '');
        if (sysMatch) {
          const sysSnap = await getDoc(doc(db, COLLECTION_NAME, sysMatch.id));
          if (sysSnap.exists()) {
            const pageData = { id: sysSnap.id, ...sysSnap.data() } as Page;
            if (pageData.status === 'published') return pageData;
          }
        }
        return null;
      }
      const docSnap = snapshot.docs[0];
      const pageData = { id: docSnap.id, ...docSnap.data() } as Page;
      if (isSystemPageCheck(pageData)) pageData.isSystemPage = true;
      return pageData;
    } catch (err) {
      console.warn(`Firestore getPageBySlug error for slug ${slug}:`, err);
      return null;
    }
  }),

  getPageById: cache(async (id: string): Promise<Page | null> => {
    try {
      const ref = doc(db, COLLECTION_NAME, id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      const pageData = { id: snap.id, ...snap.data() } as Page;
      if (isSystemPageCheck(pageData)) pageData.isSystemPage = true;
      return pageData;
    } catch (err) {
      console.warn(`Firestore getPageById error for id ${id}:`, err);
      return null;
    }
  }),

  async savePage(pageData: Partial<Page> & { title: string; slug: string }): Promise<string> {
    const pageId = pageData.id || doc(collection(db, COLLECTION_NAME)).id;
    const now = new Date().toISOString();
    
    const sysDef = SYSTEM_PAGES_CONFIG.find((p) => p.id === pageId || (pageData.systemKey && p.systemKey === pageData.systemKey));
    const isSys = Boolean(sysDef);
    
    const rawPayload: Record<string, unknown> = {
      id: pageId,
      title: pageData.title,
      slug: isSys && sysDef?.systemKey === 'home' ? '' : pageData.slug.toLowerCase().replace(/^\//, ''),
      status: pageData.status || 'draft',
      showInNavigation: pageData.showInNavigation ?? false,
      navigationOrder: pageData.navigationOrder ?? 0,
      sections: pageData.sections || [],
      featuredImage: pageData.featuredImage || '',
      seo: {
        metaTitle: pageData.seo?.metaTitle || pageData.title,
        metaDescription: pageData.seo?.metaDescription || '',
        ogImageUrl: pageData.seo?.ogImageUrl || '',
        keywords: pageData.seo?.keywords || [],
      },
      createdAt: pageData.createdAt || now,
      updatedAt: now,
      createdBy: pageData.createdBy || 'Admin',
      updatedBy: pageData.updatedBy || 'Admin',
    };

    if (pageData.navigationParentId) {
      rawPayload.navigationParentId = pageData.navigationParentId;
    }

    if (isSys && sysDef) {
      rawPayload.isSystemPage = true;
      rawPayload.systemKey = sysDef.systemKey;
    }

    const cleanPayload = sanitizeForFirestore(rawPayload);
    await setDoc(doc(db, COLLECTION_NAME, pageId), cleanPayload, { merge: true });
    return pageId;
  },

  async updatePageStatus(id: string, status: PageStatus): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, id);
    await updateDoc(ref, { status, updatedAt: new Date().toISOString() });
  },

  async deletePage(id: string): Promise<void> {
    const page = await this.getPageById(id);
    if (page && isSystemPageCheck(page)) {
      throw new Error('System pages are mandatory for the institution and cannot be permanently deleted.');
    }
    const ref = doc(db, COLLECTION_NAME, id);
    await deleteDoc(ref);

    // Clean up targeted Footer references pointing to this deleted pageId
    try {
      const settings = await siteSettingsService.getSettings();
      if (settings.footerConfig?.columns && settings.footerConfig.columns.length > 0) {
        let hasChanges = false;
        const updatedColumns = settings.footerConfig.columns.map((col) => {
          const filteredLinks = col.links.filter((link) => link.pageId !== id);
          if (filteredLinks.length !== col.links.length) {
            hasChanges = true;
            return {
              ...col,
              links: filteredLinks.map((link, idx) => ({ ...link, order: idx })),
            };
          }
          return col;
        });

        if (hasChanges) {
          await siteSettingsService.updateSettings({
            footerConfig: {
              ...settings.footerConfig,
              columns: updatedColumns,
            },
          });
        }
      }
    } catch (err) {
      console.warn('Page deletion footer reference cleanup warning:', err);
    }
  },
};
