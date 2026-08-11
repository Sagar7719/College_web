import { PageSection } from './sections';

export type PageStatus = 'draft' | 'published' | 'hidden' | 'archived';

export interface SEOConfig {
  metaTitle: string;
  metaDescription?: string;
  ogImageUrl?: string;
  keywords?: string[];
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  showInNavigation: boolean;
  navigationOrder: number;
  navigationParentId?: string;
  sections: PageSection[];
  featuredImage?: string;
  seo: SEOConfig;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  createdBy?: string;
  updatedBy?: string;
  /** If true, this page is a system/core page and cannot be permanently deleted. */
  isSystemPage?: boolean;
  systemKey?: 'home' | 'about' | 'academics' | 'admissions' | 'notices' | 'contact';
}


