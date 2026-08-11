import { Page, NavigationItem } from '@/types';

export interface SystemPageDef {
  systemKey: 'home' | 'about' | 'academics' | 'admissions' | 'notices' | 'contact';
  id: string;
  title: string;
  slug: string;
  path: string;
  order: number;
}

export const SYSTEM_PAGES_CONFIG: SystemPageDef[] = [
  {
    systemKey: 'home',
    id: 'sys_page_home',
    title: 'Home',
    slug: '',
    path: '/',
    order: 0,
  },
  {
    systemKey: 'about',
    id: 'sys_page_about',
    title: 'About Us',
    slug: 'about',
    path: '/about',
    order: 1,
  },
  {
    systemKey: 'academics',
    id: 'sys_page_academics',
    title: 'Academics',
    slug: 'departments',
    path: '/departments',
    order: 2,
  },
  {
    systemKey: 'admissions',
    id: 'sys_page_admissions',
    title: 'Admissions',
    slug: 'admissions',
    path: '/admissions',
    order: 3,
  },
  {
    systemKey: 'notices',
    id: 'sys_page_notices',
    title: 'Notices',
    slug: 'notices',
    path: '/notices',
    order: 4,
  },
  {
    systemKey: 'contact',
    id: 'sys_page_contact',
    title: 'Contact Us',
    slug: 'contact',
    path: '/contact',
    order: 5,
  },
];

export const SYSTEM_SLUGS = new Set(SYSTEM_PAGES_CONFIG.map((p) => p.slug.toLowerCase()).filter(Boolean));
export const SYSTEM_KEYS = new Set<string>(SYSTEM_PAGES_CONFIG.map((p) => p.systemKey));
export const SYSTEM_PAGE_IDS = new Set<string>(SYSTEM_PAGES_CONFIG.map((p) => p.id));

export function isSystemPageCheck(page: { id?: string; isSystemPage?: boolean; systemKey?: string }): boolean {
  if (page.id && SYSTEM_PAGE_IDS.has(page.id)) return true;
  if (page.isSystemPage === true && page.systemKey && SYSTEM_KEYS.has(page.systemKey)) return true;
  return false;
}
