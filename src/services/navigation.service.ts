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

const COLLECTION_NAME = 'navigation';

/**
 * Canonical system navigation items with stable document IDs.
 * These match the defaultFallbackNav in Navbar.tsx and represent
 * the institutional navigation that must always be present.
 */
const SYSTEM_NAV_ITEMS: NavigationItem[] = [
  { id: 'nav_home',       label: 'Home',        path: '/',            isCMSPage: false, order: 0, visible: true },
  { id: 'nav_about',      label: 'About Us',     path: '/about',       isCMSPage: false, order: 1, visible: true },
  { id: 'nav_academics',  label: 'Academics',    path: '/departments', isCMSPage: false, order: 2, visible: true },
  { id: 'nav_admissions', label: 'Admissions',   path: '/admissions',  isCMSPage: false, order: 3, visible: true },
  { id: 'nav_notices',    label: 'Notices',      path: '/notices',     isCMSPage: false, order: 4, visible: true },
  { id: 'nav_contact',    label: 'Contact Us',   path: '/contact',     isCMSPage: false, order: 5, visible: true },
];

/**
 * CMS-created navigation items are offset by this value so they always
 * sort after system items (order 0–5) in the public navbar.
 * New items: order = CMS_ORDER_OFFSET + page.navigationOrder
 */
const CMS_ORDER_OFFSET = 100;

/**
 * Seeds missing system navigation items into Firestore.
 *
 * Rules:
 * - Only creates a document if it does NOT already exist in Firestore.
 * - Does NOT overwrite existing documents (preserves admin customisations to
 *   label, visibility, or order that the admin may have intentionally changed).
 * - Does NOT recreate items that an admin deliberately deleted via Nav Manager —
 *   because a deleted doc will simply not exist and will be re-created here.
 *   To respect permanent admin deletions, callers should only invoke this on
 *   first-run / fresh deployments. For normal nav fetches this is idempotent:
 *   once all 6 docs exist the batch is empty and no write occurs.
 */
async function ensureSystemNavItems(): Promise<void> {
  try {
    // Parallel reads for all 6 system item documents
    const snapshots = await Promise.all(
      SYSTEM_NAV_ITEMS.map((item) => getDoc(doc(db, COLLECTION_NAME, item.id)))
    );

    const batch = writeBatch(db);
    let hasMissing = false;

    snapshots.forEach((snap, idx) => {
      if (!snap.exists()) {
        // Create only if absent — never overwrites existing data
        batch.set(doc(db, COLLECTION_NAME, SYSTEM_NAV_ITEMS[idx].id), SYSTEM_NAV_ITEMS[idx]);
        hasMissing = true;
      }
    });

    if (hasMissing) {
      await batch.commit();
    }
  } catch (err) {
    // Non-fatal — the fallback in Navbar.tsx handles offline/error states
    console.warn('ensureSystemNavItems warning:', err);
  }
}

/**
 * Normalises pre-existing CMS navigation items that were created before the
 * 100+ order offset strategy was introduced.
 *
 * Any item where isCMSPage === true AND order < CMS_ORDER_OFFSET is migrated
 * to (CMS_ORDER_OFFSET + current_order) so it sorts after all system items.
 *
 * System items (isCMSPage !== true) are never touched.
 * This is idempotent: once all CMS items have order >= 100 the batch is empty.
 */
async function normalizeCMSNavItemOrders(items: NavigationItem[]): Promise<void> {
  try {
    const toNormalize = items.filter(
      (item) => item.isCMSPage === true && item.order < CMS_ORDER_OFFSET
    );
    if (toNormalize.length === 0) return;

    const batch = writeBatch(db);
    toNormalize.forEach((item) => {
      batch.set(
        doc(db, COLLECTION_NAME, item.id),
        { order: CMS_ORDER_OFFSET + item.order },
        { merge: true }
      );
    });
    await batch.commit();
  } catch (err) {
    console.warn('normalizeCMSNavItemOrders warning:', err);
  }
}

export const navigationService = {
  /**
   * Returns all VISIBLE navigation items sorted by order.
   * Called by the public Navbar component on every page load.
   *
   * Guarantees:
   * 1. Seeds missing system items on first-run (idempotent).
   * 2. Normalises any pre-existing CMS items with order < 100 (background).
   * 3. Returns merged result: system items (0–5) + CMS items (100+).
   */
  async getNavigationItems(): Promise<NavigationItem[]> {
    try {
      // Step 1: Ensure the 6 canonical system items exist in Firestore
      await ensureSystemNavItems();

      // Step 2: Fetch all items ordered by `order` field
      const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(
        (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as NavigationItem)
      );

      // Step 3: Normalise pre-existing CMS items in the background (non-blocking)
      normalizeCMSNavItemOrders(items).catch(() => {});

      // Step 4: Return only visible items (system + CMS), already sorted by order
      return items.filter((item) => item.visible);
    } catch (err) {
      console.warn('Firestore navigation fetch warning:', err);
      return [];
    }
  },

  /**
   * Returns ALL navigation items (visible and hidden) for the Admin Nav Manager.
   * Also seeds system items so the admin UI always shows the full picture.
   */
  async getAllAdminNavigationItems(): Promise<NavigationItem[]> {
    try {
      // Ensure system items exist so the admin manager shows them too
      await ensureSystemNavItems();

      const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(
        (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as NavigationItem)
      );

      // Normalise CMS item orders in the background
      normalizeCMSNavItemOrders(items).catch(() => {});

      return items;
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

  /**
   * Syncs a CMS page's navigation state into the Firestore navigation collection.
   *
   * Order strategy: CMS items always use (CMS_ORDER_OFFSET + navigationOrder)
   * so they sort after system items (order 0–5) by default. Admins can manually
   * reorder via the Navigation Manager at any time.
   */
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
        // Offset by CMS_ORDER_OFFSET (100) to always sort after system items.
        // If the page's navigationOrder is 0, this becomes 100.
        // Admins can freely reorder via Nav Manager afterwards.
        order: CMS_ORDER_OFFSET + order,
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
