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
  where,
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
      const items: NavigationItem[] = [];

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const isSys = Boolean(data.isSystemPage);
        const navItem: NavigationItem = {
          id: docSnap.id,
          label: data.label || '',
          path: data.path || '/',
          isCMSPage: Boolean(data.isCMSPage),
          cmsPageId: data.cmsPageId || undefined,
          isSystemPage: isSys,
          systemKey: data.systemKey || undefined,
          order: typeof data.order === 'number' ? data.order : 99,
          visible: data.visible !== false,
          isExternal: Boolean(data.isExternal),
          externalUrl: data.externalUrl || undefined,
          targetBlank: Boolean(data.targetBlank),
          parentId: data.parentId || undefined,
        };
        items.push(navItem);
      });

      return buildNavigationTree(items.filter((i) => i.visible));
    } catch (err) {
      console.warn('Firestore getNavigationItems error:', err);
      return CANONICAL_SYSTEM_NAV_ITEMS;
    }
  }),

  getAllAdminNavigationItems: async (): Promise<NavigationItem[]> => {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/navigation?scope=admin');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) return json.data;
      } catch (err) {
        console.warn('Pattern B API /api/navigation fallback:', err);
      }
    }
    await ensureSystemNavigationItems();
    const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    const items: NavigationItem[] = [];

    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const isSys = Boolean(data.isSystemPage);
      const navItem: NavigationItem = {
        id: docSnap.id,
        label: data.label || '',
        path: data.path || '/',
        isCMSPage: Boolean(data.isCMSPage),
        cmsPageId: data.cmsPageId || undefined,
        isSystemPage: isSys,
        systemKey: data.systemKey || undefined,
        order: typeof data.order === 'number' ? data.order : 99,
        visible: data.visible !== false,
        isExternal: Boolean(data.isExternal),
        externalUrl: data.externalUrl || undefined,
        targetBlank: Boolean(data.targetBlank),
        parentId: data.parentId || undefined,
      };
      items.push(navItem);
    });

    return items;
  },

  async saveSingleNavigationItem(item: NavigationItem): Promise<void> {
    const isCoreNav = CANONICAL_SYSTEM_NAV_ITEMS.some((c) => c.id === item.id);
    const rawPayload: Record<string, unknown> = { ...item };
    if (!item.parentId) delete rawPayload.parentId;
    delete rawPayload.children;

    if (isCoreNav) {
      const canonical = CANONICAL_SYSTEM_NAV_ITEMS.find((c) => c.id === item.id);
      if (canonical) {
        rawPayload.path = canonical.path;
        rawPayload.isSystemPage = true;
        rawPayload.systemKey = canonical.systemKey;
      }
    }

    const sanitized = sanitizeForFirestore(rawPayload);
    const ref = doc(db, COLLECTION_NAME, item.id);
    await setDoc(ref, sanitized, { merge: true });
  },

  /**
   * Saves complete unified navigation sequence (reordering).
   * Writes sequential order values (0, 1, 2, 3... N) for all items.
   * Filters out any transient placeholder items.
   */
  async saveNavigationItems(items: NavigationItem[]): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/navigation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(items),
        });
        const json = await res.json();
        if (json.success) return;
      } catch (err) {
        console.warn('Pattern B API /api/navigation save fallback:', err);
      }
    }

    const validItems = items.filter((item) => {
      if (!item.id || !item.label) return false;
      return true;
    });

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
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/navigation?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        const json = await res.json();
        if (json.success) return;
      } catch (err) {
        console.warn('Pattern B API /api/navigation delete fallback:', err);
      }
    }
    const itemRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(itemRef);
    if (snap.exists()) {
      const data = snap.data();
      const isCoreNav = CANONICAL_SYSTEM_NAV_ITEMS.some((c) => c.id === id);
      if (data?.isSystemPage && isCoreNav) {
        throw new Error('Mandatory institutional system page navigation items cannot be deleted.');
      }

      // Hard Delete: Delete corresponding CMS page document from Firestore pages collection
      if (data?.cmsPageId && !data?.isSystemPage) {
        try {
          await deleteDoc(doc(db, 'pages', data.cmsPageId));
        } catch (err) {
          console.warn('Could not hard-delete pages document:', err);
        }
      }

      // Hard Delete: If parent item has child items, hard delete child pages and navigation items
      const childrenSnap = await getDocs(query(collection(db, COLLECTION_NAME), where('parentId', '==', id)));
      if (childrenSnap.docs.length > 0) {
        const batch = writeBatch(db);
        for (const cSnap of childrenSnap.docs) {
          const cData = cSnap.data();
          if (cData.cmsPageId && !cData.isSystemPage) {
            batch.delete(doc(db, 'pages', cData.cmsPageId));
          }
          batch.delete(cSnap.ref);
        }
        await batch.commit();
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

      // Custom pages default to being nested inside a dropdown menu (e.g. About Us) so they only show in dropdown menus, not top-level main nav
      const effectiveParentId = parentId || (!isSys ? 'nav_sys_about' : undefined);
      if (effectiveParentId) {
        navPayload.parentId = effectiveParentId;
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
 * Level 1: Core 5 System Tabs + More (Total 6 items max)
 * Level 2: All other pages/links nested as dropdown sub-items
 * Enforces that only 6 items max sit on the top-level main bar.
 */
export function buildNavigationTree(flatItems: NavigationItem[]): NavigationItem[] {
  const sorted = [...flatItems].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  
  const topLevelMap = new Map<string, NavigationItem>();
  const topLevelItems: NavigationItem[] = [];
  const orphanChildren: NavigationItem[] = [];
  const seenTopLevelKeys = new Set<string>();

  sorted.forEach((item) => {
    const itemCopy: NavigationItem = { ...item };
    delete itemCopy.children;

    if (!item.parentId) {
      const topKey = `${(item.path || '').toLowerCase()}_${(item.label || '').toLowerCase()}`;
      if (!seenTopLevelKeys.has(topKey)) {
        seenTopLevelKeys.add(topKey);
        topLevelMap.set(item.id, itemCopy);
        topLevelItems.push(itemCopy);
      }
    } else {
      orphanChildren.push(itemCopy);
    }
  });

  // Ensure canonical "More" tab exists in topLevelItems as the 6th item container
  let canonicalMore: NavigationItem = topLevelItems.find((i) => i.id === 'nav_sys_more' || i.label?.toLowerCase() === 'more') || {
    id: 'nav_sys_more',
    label: 'More',
    path: '#',
    isSystemPage: true,
    systemKey: 'more',
    order: 99,
    visible: true,
    children: [],
  };
  if (!topLevelMap.has(canonicalMore.id)) {
    topLevelMap.set(canonicalMore.id, canonicalMore);
  }

  // Nest child items under their designated parents
  orphanChildren.forEach((child) => {
    const parent = (child.parentId ? topLevelMap.get(child.parentId) : undefined) || canonicalMore;
    child.parentId = parent.id;
    parent.children = parent.children || [];
    const childKey = `${(child.path || '').toLowerCase()}_${(child.label || '').toLowerCase()}`;
    const isAlreadyAdded = parent.children.some(
      (c) => `${(c.path || '').toLowerCase()}_${(c.label || '').toLowerCase()}` === childKey
    );
    if (!isAlreadyAdded) {
      delete child.children;
      parent.children.push(child);
    }
  });

  // Enforce Max 6 Top-Level Navbar Tabs (5 Core + More)
  const coreTopKeys = new Set(['home', 'about', 'academics', 'admissions', 'contact']);
  const finalTopItems: NavigationItem[] = [];
  const overflowItems: NavigationItem[] = [];

  topLevelItems.forEach((topItem) => {
    if (topItem.isSystemPage && topItem.systemKey && coreTopKeys.has(topItem.systemKey)) {
      finalTopItems.push(topItem);
    } else if (topItem.id === canonicalMore.id || topItem.label?.toLowerCase() === 'more') {
      // Saved for 6th tab position
    } else {
      // Extra custom top tab -> auto-move into More dropdown!
      overflowItems.push(topItem);
    }
  });

  // Add overflow items into More dropdown
  canonicalMore.children = canonicalMore.children || [];
  overflowItems.forEach((overflow) => {
    const key = `${(overflow.path || '').toLowerCase()}_${(overflow.label || '').toLowerCase()}`;
    if (!canonicalMore.children!.some((c) => `${(c.path || '').toLowerCase()}_${(c.label || '').toLowerCase()}` === key)) {
      overflow.parentId = canonicalMore.id;
      canonicalMore.children!.push(overflow);
    }
  });

  // Put More as the 6th item
  finalTopItems.push(canonicalMore);

  return finalTopItems;
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
