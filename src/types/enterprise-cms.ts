// Enterprise Decoupled Firestore Data Models

export interface HeroConfig {
  badgeText: string;
  headline: string;
  subtitle: string;
  cta1Label: string;
  cta1Href: string;
  cta2Label: string;
  cta2Href: string;
}

export interface GatewayCard {
  title: string;
  subtitle: string;
  ctaLabel: string;
  href: string;
  iconKey: string;
  colorVariant: 'Terracotta' | 'Emerald' | 'Sapphire' | 'Gold' | string;
}

export interface StatItem {
  label: string;
  valueType: 'auto' | 'manual';
  manualValue?: number;
  suffix?: string;
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

export interface QuickLinkItem {
  label: string;
  href: string;
  iconKey: string;
  colorClass: string;
}

export interface AccreditationItem {
  title: string;
  subtitle: string;
  iconKey: string;
}

export interface HomepageConfigData {
  id: string; // 'main'
  hero: HeroConfig;
  gatewayCards: GatewayCard[];
  stats: StatItem[];
  featurePillars: FeaturePillar[];
  whyChooseUs: WhyChooseUsCard[];
  quickLinks: QuickLinkItem[];
  accreditations: AccreditationItem[];
  aboutCtaLabel: string;
  contactSectionTitle: string;
  contactSectionSubtitle: string;
  mapCardTitle: string;
  mapCardDesc: string;
  admissionCtaBadge: string;
  admissionCtaTitle: string;
  admissionCtaDesc: string;
  updatedAt: string;
}

// ── About Page Enterprise Schema ──

export interface AboutHeroConfig {
  badgeText: string;
  title: string;
  subtitle: string;
}

export interface AboutHeroStat {
  label: string;
  sublabel: string;
  iconKey: string;
}

export interface LegacyOverview {
  title: string;
  description: string;
  highlights: string[];
}

export interface VisionMissionConfig {
  title?: string;
  visionLabel?: string;
  vision: string;
  missionLabel?: string;
  mission: string;
}

export interface PrincipalDeskConfig {
  badge?: string;
  title?: string;
  name: string;
  designation: string;
  photoUrl?: string;
  message: string;
}

export interface AboutPillarCard {
  title: string;
  description: string;
  iconKey: string;
}

export interface AboutPageConfigData {
  id: string; // 'main'
  hero: AboutHeroConfig;
  heroStats: AboutHeroStat[];
  legacyOverview: LegacyOverview;
  visionMission: VisionMissionConfig;
  principalDesk: PrincipalDeskConfig;
  pillarsEyebrow?: string;
  pillarsTitle: string;
  pillars: AboutPillarCard[];
  ctaBadge?: string;
  ctaBannerTitle: string;
  ctaBannerDesc: string;
  ctaPrimaryBtnText?: string;
  ctaPrimaryBtnLink?: string;
  ctaSecondaryBtnText?: string;
  ctaSecondaryBtnLink?: string;
  updatedAt: string;
}

// ── Admissions Enterprise Schema ──

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

export interface AdmissionsConfigData {
  id: string; // 'main'
  hero: AboutHeroConfig;
  heroStats: AboutHeroStat[];
  applicationDeadline: string;
  stepsEyebrow: string;
  stepsTitle: string;
  stepsSubtitle: string;
  steps: AdmissionStep[];
  eligibilityTabs: EligibilityTab[];
  requiredDocuments: string[];
  schedule: AdmissionScheduleItem[];
  faqs: AdmissionFAQ[];
  helpdeskCtaTitle: string;
  helpdeskCtaDesc: string;
  updatedAt: string;
}

// ── Contact Page Enterprise Schema ──

export interface ContactInfoConfig {
  officeHours: string;
  officeHoursClosed: string;
  campusAddress: string;
  helplinePhone: string;
  officialEmail: string;
}

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

export interface ContactPageConfigData {
  id: string; // 'main'
  hero: AboutHeroConfig;
  info: ContactInfoConfig;
  helpdesks: HelpdeskEntry[];
  emergencyCards: EmergencyCard[];
  updatedAt: string;
}
