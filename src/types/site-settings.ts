export interface CollegeInfo {
  name: string;
  shortName: string;
  tagline?: string;
  description?: string;
  establishedYear?: string;
  logoUrl?: string;
  faviconUrl?: string;
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  websiteUrl?: string;
  principalName?: string;
  principalDesignation?: string;
  principalPhotoUrl?: string;
  principalMessage?: string;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
}

export type FooterLinkType = 'system' | 'custom' | 'external';

export interface FooterLink {
  id: string;
  label: string;
  type: FooterLinkType;
  path: string;
  pageId?: string;
  systemKey?: string;
  isSystemPage?: boolean;
  isExternal?: boolean;
  targetBlank?: boolean;
  order: number;
  visible: boolean;
}

export interface FooterColumn {
  id: string;
  title: string;
  order: number;
  visible: boolean;
  links: FooterLink[];
}

export interface FooterConfig {
  aboutText: string;
  copyrightText: string;
  usefulLinksHeader?: string;
  contactHeader?: string;
  columns?: FooterColumn[];
}

export interface GlobalSeoConfig {
  defaultMetaTitle?: string;
  defaultMetaDescription?: string;
  defaultOgImageUrl?: string;
}

export interface SiteSettings {
  id: string; // 'general'
  collegeInfo: CollegeInfo;
  socialLinks: SocialLinks;
  footerConfig: FooterConfig;
  seoConfig?: GlobalSeoConfig;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  setupCompleted?: boolean;
  updatedAt: string;
}
