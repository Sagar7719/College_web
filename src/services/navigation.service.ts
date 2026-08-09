import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { NavigationItem } from '@/types';

const COLLECTION_NAME = 'navigation';

export const navigationService = {
  async getNavigationItems(): Promise<NavigationItem[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as NavigationItem));
      return items.filter((item) => item.visible);
    } catch (err) {
      console.warn('Firestore navigation fetch warning:', err);
      return [];
    }
  },

  async getAllAdminNavigationItems(): Promise<NavigationItem[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as NavigationItem));
    } catch (err) {
      console.warn('Firestore admin navigation fetch warning:', err);
      return [];
    }
  },

  async saveSingleNavigationItem(item: NavigationItem): Promise<string> {
    const itemId = item.id || doc(collection(db, COLLECTION_NAME)).id;
    const itemRef = doc(db, COLLECTION_NAME, itemId);
    const payload = { ...item, id: itemId };
    await setDoc(itemRef, payload, { merge: true });
    return itemId;
  },

  async saveNavigationItems(items: NavigationItem[]): Promise<void> {
    for (let i = 0; i < items.length; i++) {
      const item = { ...items[i], order: i };
      const ref = doc(db, COLLECTION_NAME, item.id);
      await setDoc(ref, item, { merge: true });
    }
  },

  async deleteNavigationItem(id: string): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, id);
    await deleteDoc(ref);
  },

  async syncPageToNavigation(
    cmsPageId: string,
    title: string,
    slug: string,
    showInNavigation: boolean,
    order: number
  ): Promise<void> {
    const navItemId = `nav_cms_${cmsPageId}`;
    const navRef = doc(db, COLLECTION_NAME, navItemId);

    if (showInNavigation) {
      const navPayload: NavigationItem = {
        id: navItemId,
        label: title,
        path: `/${slug.replace(/^\//, '')}`,
        isCMSPage: true,
        cmsPageId,
        order,
        visible: true,
      };
      await setDoc(navRef, navPayload, { merge: true });
    } else {
      await setDoc(navRef, { visible: false }, { merge: true });
    }
  },

  async removePageFromNavigation(cmsPageId: string): Promise<void> {
    const navItemId = `nav_cms_${cmsPageId}`;
    const navRef = doc(db, COLLECTION_NAME, navItemId);
    await setDoc(navRef, { visible: false }, { merge: true });
  },
};
