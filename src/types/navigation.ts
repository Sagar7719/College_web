export interface NavigationItem {
  id: string;
  label: string;
  path: string; // e.g. '/about', '/scholarship-information', or 'https://...'
  isCMSPage?: boolean;
  cmsPageId?: string;
  isSystemPage?: boolean;
  systemKey?: 'home' | 'about' | 'academics' | 'admissions' | 'contact' | 'notices' | 'more' | string;
  order: number;
  visible: boolean;
  isExternal?: boolean;
  externalUrl?: string;
  targetBlank?: boolean;
  parentId?: string; // For optional nested dropdown menus
  children?: NavigationItem[];
}

