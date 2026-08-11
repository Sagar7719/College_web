import { cache } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { NavigationItem } from '@/types';
import { SYSTEM_PAGES_CONFIG } from '@/constants/system-pages';
import { sanitizeForFirestore } from '@/lib/firestore-utils';

const COLLECTION_NAME = 'navigation';

/**
 * Initial system navigation definitions with stable IDs and canonical paths.
 */
const CANONICAL_SYSTEM_NAV_ITEMS: NavigationItem[] = SYSTEM_PAGES_CONFIG.map((p) => ({
  id: `nav_sys_${p.systemKey}`,
  label: p.title,
  path: p.path,
  isCMSPage: true,
  cmsPageId: p.id,
  isSystemPage: true,
  systemKey: p.systemKey,
  order: p.order,
  visible: true,
}));

/**
 * Ensures the 6 required institutional system navigation items exist in Firestore.
 * Idempotent: Only creates missing documents and cleans up legacy duplicate nav keys.
 */
async function ensureSystemNavigationItems(): Promise<void> {
  try {
    const snapshots = await Promise.all(
      CANONICAL_SYSTEM_NAV_ITEMS.map((item) => getDoc(doc(db, COLLECTION_NAME, item.id)))
    );

    // Query all nav items to find duplicate/legacy Home nav entries
    const allNavSnap = await getDocs(collection(db, COLLECTION_NAME));
    const duplicateHomeNavDocs = allNavSnap.docs.filter((d) => {
      if (d.id === 'nav_sys_home') return false;
      const data = d.data();
      const pathClean = (data.path || '').toLowerCase();
      return (
        data.systemKey === 'home' ||
        data.cmsPageId === 'sys_page_home' ||
        (pathClean === '/home' && data.isSystemPage === true)
      );
    });

    const batch = writeBatch(db);
    let hasChanges = false;

    // Delete duplicate Home navigation entries
    duplicateHomeNavDocs.forEach((dup) => {
      batch.delete(dup.ref);
      hasChanges = true;
    });

    snapshots.forEach((snap, idx) => {
      const canonical = CANONICAL_SYSTEM_NAV_ITEMS[idx];
      if (!snap.exists()) {
        batch.set(doc(db, COLLECTION_NAME, canonical.id), sanitizeForFirestore(canonical));
        hasChanges = true;
      } else {
        const data = snap.data();
        const updates: Record<string, unknown> = {};

        if (!data?.isSystemPage) updates.isSystemPage = true;
        if (data?.systemKey !== canonical.systemKey) updates.systemKey = canonical.systemKey;
        if (data?.path !== canonical.path) updates.path = canonical.path;

        if (Object.keys(updates).length > 0) {
          batch.set(
            doc(db, COLLECTION_NAME, canonical.id),
            sanitizeForFirestore(updates),
            { merge: true }
          );
          hasChanges = true;
        }
      }
    });

    // Migrate legacy IDs if present
    const legacyIds = ['nav_home', 'nav_about', 'nav_academics', 'nav_admissions', 'nav_notices', 'nav_contact'];
    const legacySnaps = await Promise.all(
      legacyIds.map((id) => getDoc(doc(db, COLLECTION_NAME, id)))
    );
    legacySnaps.forEach((snap) => {
      if (snap.exists()) {
        batch.delete(snap.ref);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      await batch.commit();
    }
  } catch (err) {
    console.warn('ensureSystemNavigationItems warning:', err);
  }
}

export const navigationService = {
  /**
   * Returns all VISIBLE navigation items as a 2-level hierarchy tree sorted by order.
   * Unified sequence: System pages + Custom pages in saved `order`.
   * Public request path: Zero system seeding writes, fast single query read.
   */
  getNavigationItems: cache(async (): Promise<NavigationItem[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(
        (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as NavigationItem)
      );

      const visible = items.filter((item) => item.visible);
      if (visible.length > 0) {
        return buildNavigationTree(visible);
      }
      return buildNavigationTree(CANONICAL_SYSTEM_NAV_ITEMS);
    } catch (err) {
      console.warn('Firestore navigation fetch warning:', err);
      return buildNavigationTree(CANONICAL_SYSTEM_NAV_ITEMS);
    }
  }),

  /**
   * Returns ALL navigation items (visible & hidden) for the Admin Navigation Manager.
   * Single unified list containing both System and Custom navigation items.
   */
  async getAllAdminNavigationItems(): Promise<NavigationItem[]> {
    try {
      await ensureSystemNavigationItems();

      const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as NavigationItem)
      );
    } catch (err) {
      console.warn('Firestore admin navigation fetch warning:', err);
      return [];
    }
  },

  async saveSingleNavigationItem(item: NavigationItem): Promise<string> {
    const itemId = item.id || doc(collection(db, COLLECTION_NAME)).id;
    const itemRef = doc(db, COLLECTION_NAME, itemId);
    const rawPayload: Record<string, unknown> = {
      ...item,
      id: itemId,
    };
    if (!item.parentId) {
      delete rawPayload.parentId;
    }
    delete rawPayload.children;
    const payload = sanitizeForFirestore(rawPayload);
    await setDoc(itemRef, payload, { merge: true });
    return itemId;
  },

  /**
   * Saves complete unified navigation sequence (reordering).
   * Writes sequential order values (0, 1, 2, 3... N) for all items.
   * Filters out any transient placeholder items.
   */
  async saveNavigationItems(items: NavigationItem[]): Promise<void> {
    const validItems = items.filter((item) => item.id && item.id !== 'current_page_target');
    if (validItems.length === 0) return;

    const batch = writeBatch(db);
    for (let i = 0; i < validItems.length; i++) {
      const item = { ...validItems[i], order: i };
      const rawPayload: Record<string, unknown> = { ...item };
      if (!item.parentId) delete rawPayload.parentId;
      delete rawPayload.children;
      const sanitized = sanitizeForFirestore(rawPayload);
      const ref = doc(db, COLLECTION_NAME, item.id);
      batch.set(ref, sanitized, { merge: true });
    }
    await batch.commit();
  },

  async deleteNavigationItem(id: string): Promise<void> {
    const itemRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(itemRef);
    if (snap.exists()) {
      const data = snap.data();
      const isCoreNav = CANONICAL_SYSTEM_NAV_ITEMS.some((c) => c.id === id);
      if (data?.isSystemPage && isCoreNav) {
        throw new Error('Mandatory institutional system page navigation items cannot be deleted.');
      }
    }
    await deleteDoc(itemRef);
  },

  /**
   * Syncs a CMS page's title, slug, and visibility to the navigation collection.
   */
  async syncPageToNavigation(
    cmsPageId: string,
    title: string,
    slug: string,
    showInNavigation: boolean,
    order: number,
    isSystemPage?: boolean,
    systemKey?: string,
    parentId?: string
  ): Promise<void> {
    try {
      const isSys = Boolean(isSystemPage && systemKey);
      const navItemId = isSys ? `nav_sys_${systemKey}` : `nav_cms_${cmsPageId}`;
      const navRef = doc(db, COLLECTION_NAME, navItemId);

      const navSnap = await getDoc(navRef);
      let currentOrder = order;
      if (navSnap.exists() && navSnap.data()?.order !== undefined) {
        currentOrder = navSnap.data().order;
      } else if (!order) {
        const allNavSnap = await getDocs(collection(db, COLLECTION_NAME));
        currentOrder = allNavSnap.docs.length;
      }

      const cleanPath = isSys && systemKey === 'home' ? '/' : `/${slug.toLowerCase().replace(/^\//, '')}`;

      const navPayload: Record<string, unknown> = {
        id: navItemId,
        label: title,
        path: cleanPath,
        isCMSPage: true,
        cmsPageId,
        order: currentOrder,
        visible: showInNavigation,
      };

      if (parentId) {
        navPayload.parentId = parentId;
      }

      if (isSys && systemKey) {
        navPayload.isSystemPage = true;
        navPayload.systemKey = systemKey;
      }

      const sanitized = sanitizeForFirestore(navPayload);
      await setDoc(navRef, sanitized, { merge: true });
    } catch (err) {
      console.warn('syncPageToNavigation warning:', err);
    }
  },

  async removePageFromNavigation(cmsPageId: string): Promise<void> {
    try {
      const q = query(collection(db, COLLECTION_NAME));
      const snapshot = await getDocs(q);
      const matched = snapshot.docs.find((d) => d.data()?.cmsPageId === cmsPageId || d.id === `nav_cms_${cmsPageId}`);
      if (matched) {
        await setDoc(matched.ref, { visible: false }, { merge: true });
      }
    } catch (err) {
      console.warn('removePageFromNavigation warning:', err);
    }
  },

  async removePageNavigationCompletely(cmsPageId: string): Promise<void> {
    try {
      const q = query(collection(db, COLLECTION_NAME));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      let count = 0;
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if ((data.cmsPageId === cmsPageId || docSnap.id === `nav_cms_${cmsPageId}`) && !data.isSystemPage) {
          batch.delete(docSnap.ref);
          count++;
        }
      });
      if (count > 0) {
        await batch.commit();
      }
    } catch (err) {
      console.warn('removePageNavigationCompletely warning:', err);
    }
  },
};

/**
 * Builds a 2-level navigation tree from flat navigation items.
 * Level 1: Top-level items (no parentId)
 * Level 2: Child items nested in parent's `children` array
 * Enforces a strict maximum depth of 2.
 */
export function buildNavigationTree(flatItems: NavigationItem[]): NavigationItem[] {
  const sorted = [...flatItems].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  
  const topLevelMap = new Map<string, NavigationItem>();
  const topLevelItems: NavigationItem[] = [];
  const orphanChildren: NavigationItem[] = [];

  sorted.forEach((item) => {
    const itemCopy: NavigationItem = { ...item };
    delete itemCopy.children;

    if (!item.parentId) {
      topLevelMap.set(item.id, itemCopy);
      topLevelItems.push(itemCopy);
    } else {
      orphanChildren.push(itemCopy);
    }
  });

  orphanChildren.forEach((child) => {
    const parent = child.parentId ? topLevelMap.get(child.parentId) : undefined;
    if (parent) {
      parent.children = parent.children || [];
      delete child.children;
      parent.children.push(child);
    } else {
      delete child.parentId;
      delete child.children;
      topLevelItems.push(child);
    }
  });

  return topLevelItems;
}

/**
 * Flattens a 2-level navigation tree back into a linear sequence for indexing.
 */
export function flattenNavigationItems(items: NavigationItem[]): NavigationItem[] {
  const result: NavigationItem[] = [];
  items.forEach((item) => {
    result.push(item);
    if (item.children && item.children.length > 0) {
      item.children.forEach((child) => result.push(child));
    }
  });
  return result;
}

export interface NavPagePositionInfo {
  isTopLevel: boolean;
  position: number;
  parentLabel?: string;
  displayText: string;
}

/**
 * Calculates the hierarchical live public navbar position for a given page
 * based on the canonical ordered list of navigation items.
 *
 * Top-level items return global 1-based position (e.g. "In Navbar (#4)")
 * Child items return relative 1-based position inside parent (e.g. "Inside Academics · #2")
 * Returns null if the page is hidden or not present in the visible navbar sequence.
 */
export function getNavPositionForPage(
  page: { id: string; slug: string; status: string; showInNavigation: boolean; isSystemPage?: boolean; systemKey?: string },
  allNavItems: NavigationItem[]
): NavPagePositionInfo | null {
  if (!page.showInNavigation || page.status !== 'published') {
    return null;
  }

  const visibleItems = allNavItems.filter((item) => item.visible);

  // Find matching navigation item
  const matchedItem = visibleItems.find((item) => {
    if (page.isSystemPage && page.systemKey) {
      return (
        item.systemKey === page.systemKey ||
        item.cmsPageId === page.id ||
        item.id === `nav_sys_${page.systemKey}`
      );
    }
    const cleanSlug = (page.slug || '').toLowerCase().replace(/^\//, '');
    return (
      item.cmsPageId === page.id ||
      item.id === `nav_cms_${page.id}` ||
      item.path === `/${cleanSlug}`
    );
  });

  if (!matchedItem) {
    return null;
  }

  // Case 1: Top-level navigation item
  if (!matchedItem.parentId) {
    const topLevelVisible = visibleItems.filter((item) => !item.parentId);
    const topIdx = topLevelVisible.findIndex((item) => item.id === matchedItem.id);
    if (topIdx === -1) return null;
    const pos = topIdx + 1;
    return {
      isTopLevel: true,
      position: pos,
      displayText: `In Navbar (#${pos})`,
    };
  }

  // Case 2: Child item inside a dropdown menu
  const parentItem = allNavItems.find((item) => item.id === matchedItem.parentId);
  const parentLabel = parentItem ? parentItem.label : 'Parent';
  const siblingsVisible = visibleItems.filter((item) => item.parentId === matchedItem.parentId);
  const childIdx = siblingsVisible.findIndex((item) => item.id === matchedItem.id);
  if (childIdx === -1) return null;

  const childPos = childIdx + 1;
  return {
    isTopLevel: false,
    position: childPos,
    parentLabel,
    displayText: `Inside ${parentLabel} · #${childPos}`,
  };
}
