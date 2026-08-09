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
  sections: PageSection[];
  featuredImage?: string;
  seo: SEOConfig;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  createdBy?: string;
  updatedBy?: string;
}
