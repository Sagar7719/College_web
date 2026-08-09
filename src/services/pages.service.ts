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
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Page, PageStatus } from '@/types';
import { sanitizeForFirestore } from '@/lib/firestore-utils';

const COLLECTION_NAME = 'pages';

export const pagesService = {
  async getAllPages(): Promise<Page[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Page));
    } catch (err) {
      console.warn('Firestore pages fetch warning:', err);
      return [];
    }
  },

  async getPublishedPages(): Promise<Page[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'published')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Page));
    } catch (err) {
      console.warn('Firestore published pages fetch warning:', err);
      return [];
    }
  },

  async getPageBySlug(slug: string): Promise<Page | null> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('slug', '==', slug),
        where('status', '==', 'published')
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Page;
    } catch (err) {
      console.warn(`Firestore getPageBySlug error for slug ${slug}:`, err);
      return null;
    }
  },

  async getPageById(id: string): Promise<Page | null> {
    try {
      const ref = doc(db, COLLECTION_NAME, id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as Page;
    } catch (err) {
      console.warn(`Firestore getPageById error for id ${id}:`, err);
      return null;
    }
  },

  async savePage(pageData: Partial<Page> & { title: string; slug: string }): Promise<string> {
    const pageId = pageData.id || doc(collection(db, COLLECTION_NAME)).id;
    const now = new Date().toISOString();
    
    const rawPayload: Page = {
      id: pageId,
      title: pageData.title,
      slug: pageData.slug,
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

    const cleanPayload = sanitizeForFirestore(rawPayload);
    await setDoc(doc(db, COLLECTION_NAME, pageId), cleanPayload, { merge: true });
    return pageId;
  },

  async updatePageStatus(id: string, status: PageStatus): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, id);
    await updateDoc(ref, { status, updatedAt: new Date().toISOString() });
  },

  async deletePage(id: string): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, id);
    await deleteDoc(ref);
  },
};
