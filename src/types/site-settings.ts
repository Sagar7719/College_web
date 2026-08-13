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
  // Extended fields for CMS dynamic pages
  vision?: string;
  mission?: string;
  naacGrade?: string;
  officeHours?: string;
  officeHoursClosed?: string;
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

// ── Homepage Dynamic Sections ──

export interface GatewayCard {
  title: string;
  subtitle: string;
  ctaLabel: string;
  href: string;
  iconKey: string; // lucide icon name
  colorVariant: string; // CSS class suffix: 'Terracotta', 'Emerald', 'Sapphire', 'Gold'
}

export interface FeaturePillar {
  title: string;
  subtitle: string;
  iconKey: string;
  colorClass: string;
}

export interface WhyChooseUsCard {
  title: string;
  description: string;
  iconKey: string;
  colorClass: string;
}

export interface StatItem {
  label: string;
  valueType: 'auto' | 'manual'; // 'auto' = calculated, 'manual' = fixed number
  manualValue?: number;
  suffix?: string;
}

export interface AccreditationItem {
  title: string;
  subtitle: string;
  iconKey: string;
}

export interface QuickLinkItem {
  label: string;
  href: string;
  iconKey: string;
  colorClass: string;
}

export interface HomepageConfig {
  heroCta1Label?: string;
  heroCta2Label?: string;
  gatewayCards?: GatewayCard[];
  stats?: StatItem[];
  featurePillars?: FeaturePillar[];
  whyChooseUs?: WhyChooseUsCard[];
  quickLinks?: QuickLinkItem[];
  accreditations?: AccreditationItem[];
  aboutCtaLabel?: string;
  contactSectionTitle?: string;
  contactSectionSubtitle?: string;
  mapCardTitle?: string;
  mapCardDesc?: string;
  admissionCtaBadge?: string;
  admissionCtaTitle?: string;
  admissionCtaDesc?: string;
}

// ── About Page Dynamic Sections ──

export interface HeroStatItem {
  label: string;
  sublabel: string;
  iconKey: string;
}

export interface AboutHighlightItem {
  text: string;
}

export interface AboutPillarCard {
  title: string;
  description: string;
  iconKey: string;
}

export interface AboutPageConfig {
  heroBadge?: string;
  heroSubtitle?: string;
  heroStats?: HeroStatItem[];
  legacyTitle?: string;
  highlights?: AboutHighlightItem[];
  pillarsTitle?: string;
  pillars?: AboutPillarCard[];
  ctaBannerTitle?: string;
  ctaBannerDesc?: string;
}

// ── Contact Page Dynamic Sections ──

export interface HelpdeskEntry {
  label: string;
  email: string;
}

export interface EmergencyCard {
  title: string;
  description: string;
  contactInfo: string;
  iconKey: string;
}

export interface ContactPageConfig {
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  helpdesks?: HelpdeskEntry[];
  emergencyCards?: EmergencyCard[];
}

// ── Admissions Config ──

export interface AdmissionStep {
  title: string;
  description: string;
  iconKey: string;
}

export interface EligibilityCard {
  tag: string;
  minMarks: string;
  title: string;
  description: string;
  criteria: string[];
}

export interface EligibilityTab {
  tabKey: string;
  tabLabel: string;
  cards: EligibilityCard[];
}

export interface AdmissionScheduleItem {
  title: string;
  subtitle: string;
  date: string;
  status?: 'active' | 'progress' | 'final' | '';
}

export interface AdmissionFAQ {
  question: string;
  answer: string;
}

export interface AdmissionsConfig {
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroStats?: HeroStatItem[];
  applicationDeadline?: string;
  stepsEyebrow?: string;
  stepsTitle?: string;
  stepsSubtitle?: string;
  admissionSteps?: AdmissionStep[];
  eligibilityTabs?: EligibilityTab[];
  requiredDocuments?: string[];
  admissionSchedule?: AdmissionScheduleItem[];
  faqs?: AdmissionFAQ[];
  helpdeskCtaTitle?: string;
  helpdeskCtaDesc?: string;
}

// ── Main Site Settings ──

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
  // Dynamic page configs
  homepage?: HomepageConfig;
  aboutPage?: AboutPageConfig;
  contactPage?: ContactPageConfig;
  admissions?: AdmissionsConfig;
}
