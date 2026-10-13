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
 *
 * Performance note: Uses a single getDocs() collection scan for all lookups,
 * eliminating the 6 individual getDoc() calls for system items + 6 for legacy IDs
 * that were made previously (13+ round-trips reduced to 1).
 */
async function ensureSystemNavigationItems(): Promise<void> {
  try {
    // Single collection scan serves all purposes:
    // system item lookup, duplicate detection, and legacy ID cleanup.
    const allNavSnap = await getDocs(collection(db, COLLECTION_NAME));
    const allDocsById = new Map(
      allNavSnap.docs.map((d) => [d.id, d])
    );

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

    // Detect duplicate non-system navigation docs with same cmsPageId
    const seenCmsIds = new Set<string>();
    allNavSnap.docs.forEach((d) => {
      const data = d.data();
      if (data?.isSystemPage) return;
      if (data?.cmsPageId) {
        if (seenCmsIds.has(data.cmsPageId)) {
          batch.delete(d.ref);
          hasChanges = true;
        } else {
          seenCmsIds.add(data.cmsPageId);
        }
      }
    });

    // Ensure each system nav item exists (using the snapshot Map for O(1) lookup)
    CANONICAL_SYSTEM_NAV_ITEMS.forEach((canonical) => {
      const existingDoc = allDocsById.get(canonical.id);
      if (!existingDoc || !existingDoc.exists()) {
        batch.set(doc(db, COLLECTION_NAME, canonical.id), sanitizeForFirestore(canonical));
        hasChanges = true;
      } else {
        const data = existingDoc.data();
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

    // Delete legacy IDs if present (using snapshot Map for O(1) lookup — no extra round-trips)
    const legacyIds = ['nav_home', 'nav_about', 'nav_academics', 'nav_admissions', 'nav_notices', 'nav_contact'];
    legacyIds.forEach((legacyId) => {
      const legacyDoc = allDocsById.get(legacyId);
      if (legacyDoc && legacyDoc.exists()) {
        batch.delete(legacyDoc.ref);
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
      const q = query(collection(db, COLLECTION_NAME), where('visible', '==', true));
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
   * Performs deduplication on cmsPageId and purges stale duplicate docs from Firestore.
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

    // Deduplicate items in memory (1 entry per cmsPageId, 1 entry per ID)
    const seenCmsIds = new Set<string>();
    const seenIds = new Set<string>();
    const validItems: NavigationItem[] = [];

    items.forEach((item) => {
      if (!item.id || !item.label) return;
      if (seenIds.has(item.id)) return;
      seenIds.add(item.id);

      if (item.cmsPageId && !item.isSystemPage) {
        if (seenCmsIds.has(item.cmsPageId)) return;
        seenCmsIds.add(item.cmsPageId);
      }
      validItems.push(item);
    });

    const batch = writeBatch(db);

    // Query existing Firestore docs to delete stale duplicates not present in validItems
    try {
      const allExistingSnap = await getDocs(collection(db, COLLECTION_NAME));
      const validIdSet = new Set(validItems.map((v) => v.id));
      const validCmsIdSet = new Set(validItems.map((v) => v.cmsPageId).filter(Boolean));

      allExistingSnap.docs.forEach((docSnap) => {
        const data = docSnap.data();
        // If an existing doc has a cmsPageId that is in our valid set but doc ID is different, delete stale doc
        if (data?.cmsPageId && validCmsIdSet.has(data.cmsPageId) && !validIdSet.has(docSnap.id) && !data.isSystemPage) {
          batch.delete(docSnap.ref);
        }
      });
    } catch (err) {
      console.warn('Stale nav cleanup query warning:', err);
    }

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
   * Ensures exactly ONE navigation document exists per cmsPageId and removes stale duplicates.
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
      const canonicalDocId = isSys ? `nav_sys_${systemKey}` : `nav_cms_${cmsPageId}`;

      // Search for any existing nav document for this page
      const allNavSnap = await getDocs(collection(db, COLLECTION_NAME));
      const matchingDocs = allNavSnap.docs.filter((d) => {
        if (d.id === canonicalDocId) return true;
        const data = d.data();
        return data?.cmsPageId === cmsPageId || (isSys && data?.systemKey === systemKey);
      });

      let targetDocId = canonicalDocId;
      let currentOrder = order;

      if (matchingDocs.length > 0) {
        const primaryDoc = matchingDocs.find((d) => d.id === canonicalDocId) || matchingDocs[0];
        targetDocId = primaryDoc.id;
        const primaryData = primaryDoc.data();
        if (typeof primaryData?.order === 'number') {
          currentOrder = primaryData.order;
        }

        // Clean up any other duplicate documents for this page
        if (matchingDocs.length > 1) {
          const batch = writeBatch(db);
          matchingDocs.forEach((d) => {
            if (d.id !== targetDocId && !d.data()?.isSystemPage) {
              batch.delete(d.ref);
            }
          });
          await batch.commit();
        }
      } else if (!order) {
        currentOrder = allNavSnap.docs.length;
      }

      const cleanPath = isSys && systemKey === 'home' ? '/' : `/${slug.toLowerCase().replace(/^\//, '')}`;

      const navPayload: Record<string, unknown> = {
        id: targetDocId,
        label: title,
        path: cleanPath,
        isCMSPage: true,
        cmsPageId,
        order: currentOrder,
        visible: showInNavigation,
      };

      const effectiveParentId = parentId || (!isSys ? 'nav_sys_about' : undefined);
      if (effectiveParentId) {
        navPayload.parentId = effectiveParentId;
      }

      if (isSys && systemKey) {
        navPayload.isSystemPage = true;
        navPayload.systemKey = systemKey;
      }

      const sanitized = sanitizeForFirestore(navPayload);
      await setDoc(doc(db, COLLECTION_NAME, targetDocId), sanitized, { merge: true });
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
 * Builds a 2-level navigation tree from flat navigation items with strict deduplication.
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
  const seenCmsPageIds = new Set<string>();
  const seenItemIds = new Set<string>();

  sorted.forEach((item) => {
    if (seenItemIds.has(item.id)) return;
    seenItemIds.add(item.id);

    // Strict CMS page deduplication across the tree
    if (item.cmsPageId && !item.isSystemPage) {
      if (seenCmsPageIds.has(item.cmsPageId)) return;
      seenCmsPageIds.add(item.cmsPageId);
    }

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

  // Nest child items under their designated parents with deduplication
  const seenChildKeys = new Set<string>();
  orphanChildren.forEach((child) => {
    const parent = (child.parentId ? topLevelMap.get(child.parentId) : undefined) || canonicalMore;
    child.parentId = parent.id;
    parent.children = parent.children || [];

    const childIdentityKey = child.cmsPageId
      ? `cms_${child.cmsPageId}`
      : `${(child.path || '').toLowerCase()}_${(child.label || '').toLowerCase()}`;

    if (!seenChildKeys.has(childIdentityKey)) {
      seenChildKeys.add(childIdentityKey);
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
    const key = overflow.cmsPageId ? `cms_${overflow.cmsPageId}` : `${(overflow.path || '').toLowerCase()}_${(overflow.label || '').toLowerCase()}`;
    if (!seenChildKeys.has(key)) {
      seenChildKeys.add(key);
      overflow.parentId = canonicalMore.id;
      delete overflow.children;
      canonicalMore.children!.push(overflow);
    }
  });

  // Put More as the 6th item
  finalTopItems.push(canonicalMore);

  return finalTopItems;
}

/**
 * Deterministically flattens a 2-level navigation tree in topological order:
 * Parent 1 -> Parent 1's Children (in exact sibling order) -> Parent 2 -> Parent 2's Children...
 * Assigns sequential global order indexes: 0, 1, 2, 3... N.
 */
export function reorderTreeAndFlatten(tree: NavigationItem[]): NavigationItem[] {
  const result: NavigationItem[] = [];
  let currentOrder = 0;

  tree.forEach((parentItem) => {
    const parentCopy: NavigationItem = {
      ...parentItem,
      order: currentOrder++,
    };
    delete parentCopy.parentId;
    delete parentCopy.children;
    result.push(parentCopy);

    if (parentItem.children && parentItem.children.length > 0) {
      parentItem.children.forEach((childItem) => {
        const childCopy: NavigationItem = {
          ...childItem,
          parentId: parentItem.id,
          order: currentOrder++,
        };
        delete childCopy.children;
        result.push(childCopy);
      });
    }
  });

  return result;
}

/**
 * Flattens a 2-level navigation tree back into a linear sequence for indexing.
 */
export function flattenNavigationItems(items: NavigationItem[]): NavigationItem[] {
  return reorderTreeAndFlatten(items);
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
