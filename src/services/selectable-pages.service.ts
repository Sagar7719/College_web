import { pagesService } from '@/services/pages.service';
import { SYSTEM_PAGES_CONFIG, SYSTEM_SLUGS } from '@/constants/system-pages';
import { FooterLinkType } from '@/types';

export type PageOptionCategory = 'system_page' | 'system_module' | 'custom_page';

export interface SelectablePageOption {
  id: string; // Unique key for selector
  title: string;
  path: string;
  type: FooterLinkType; // 'system' | 'custom'
  category: PageOptionCategory;
  pageId?: string; // ID of custom page or sys_page_* if it exists in Firestore
  systemKey?: string;
  isSystemPage: boolean;
}

/** Built-in institutional system module routes (no fake pageId document ID in pages collection) */
const SYSTEM_MODULE_ROUTES: Omit<SelectablePageOption, 'id'>[] = [
  { title: 'Courses', path: '/courses', type: 'system', category: 'system_module', systemKey: 'courses', isSystemPage: true },
  { title: 'Faculty', path: '/faculty', type: 'system', category: 'system_module', systemKey: 'faculty', isSystemPage: true },
  { title: 'Gallery', path: '/gallery', type: 'system', category: 'system_module', systemKey: 'gallery', isSystemPage: true },
  { title: 'Downloads', path: '/downloads', type: 'system', category: 'system_module', systemKey: 'downloads', isSystemPage: true },
  { title: 'News', path: '/news', type: 'system', category: 'system_module', systemKey: 'news', isSystemPage: true },
  { title: 'Events', path: '/events', type: 'system', category: 'system_module', systemKey: 'events', isSystemPage: true },
  { title: 'Search', path: '/search', type: 'system', category: 'system_module', systemKey: 'search', isSystemPage: true },
];

export const selectablePagesService = {
  /**
   * Discovers and returns a unified list of all selectable existing pages/routes
   * for navigation and footer management selectors:
   * 1. Institutional Core System Pages (Home, About, Academics, Admissions, Notices, Contact)
   * 2. Institutional System Module Routes (/courses, /faculty, /downloads, /gallery, /news, /events, /search)
   * 3. Custom Published CMS Pages (created via Page Builder)
   */
  async getSelectablePages(): Promise<SelectablePageOption[]> {
    try {
      const publishedCmsPages = await pagesService.getPublishedPages();

      // 1. Core Institutional System Pages
      const coreSystemPages: SelectablePageOption[] = SYSTEM_PAGES_CONFIG.map((sys) => ({
        id: `sys_opt_${sys.systemKey}`,
        title: sys.title,
        path: sys.path,
        type: 'system',
        category: 'system_page',
        pageId: sys.id,
        systemKey: sys.systemKey,
        isSystemPage: true,
      }));

      // 2. Built-In System Module Routes (no fake pageId)
      const moduleSystemPages: SelectablePageOption[] = SYSTEM_MODULE_ROUTES.map((mod) => ({
        id: `sys_opt_${mod.systemKey}`,
        ...mod,
      }));

      // Combine system options (dedup by path if any overlap)
      const systemPaths = new Set(coreSystemPages.map((p) => p.path));
      const combinedSystem = [...coreSystemPages];
      moduleSystemPages.forEach((m) => {
        if (!systemPaths.has(m.path)) {
          combinedSystem.push(m);
        }
      });

      // 3. Custom Published CMS Pages
      const customPages: SelectablePageOption[] = publishedCmsPages
        .filter((page) => {
          if (page.isSystemPage) return false;
          const cleanSlug = (page.slug || '').toLowerCase().replace(/^\//, '');
          if (SYSTEM_SLUGS.has(cleanSlug) || cleanSlug === '' || cleanSlug === 'home') return false;
          return true;
        })
        .map((page) => ({
          id: `custom_opt_${page.id}`,
          title: page.title,
          path: `/${page.slug.toLowerCase().replace(/^\//, '')}`,
          type: 'custom',
          category: 'custom_page',
          pageId: page.id,
          isSystemPage: false,
        }));

      return [...combinedSystem, ...customPages];
    } catch (err) {
      console.warn('selectablePagesService getSelectablePages warning:', err);
      // Fallback to core system pages
      return SYSTEM_PAGES_CONFIG.map((sys) => ({
        id: `sys_opt_${sys.systemKey}`,
        title: sys.title,
        path: sys.path,
        type: 'system',
        category: 'system_page',
        pageId: sys.id,
        systemKey: sys.systemKey,
        isSystemPage: true,
      }));
    }
  },
};

/** Alias for backward compatibility */
export const footerPagesService = selectablePagesService;
