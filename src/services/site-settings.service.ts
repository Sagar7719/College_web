import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { SiteSettings } from '@/types';

const COLLECTION_NAME = 'siteSettings';
const SETTINGS_DOC_ID = 'general';

import { FooterColumn } from '@/types';

export const defaultFooterColumns: FooterColumn[] = [
  {
    id: 'col_quick_links',
    title: 'Quick Links',
    order: 0,
    visible: true,
    links: [
      { id: 'link_sys_about', label: 'About Us', type: 'system', path: '/about', pageId: 'sys_page_about', systemKey: 'about', isSystemPage: true, order: 0, visible: true },
      { id: 'link_sys_academics', label: 'Academics & Departments', type: 'system', path: '/departments', pageId: 'sys_page_academics', systemKey: 'academics', isSystemPage: true, order: 1, visible: true },
      { id: 'link_sys_admissions', label: 'Admissions Process', type: 'system', path: '/admissions', pageId: 'sys_page_admissions', systemKey: 'admissions', isSystemPage: true, order: 2, visible: true },
      { id: 'link_sys_notices', label: 'Latest Notices', type: 'system', path: '/notices', pageId: 'sys_page_notices', systemKey: 'notices', isSystemPage: true, order: 3, visible: true },
      { id: 'link_sys_contact', label: 'Contact Campus', type: 'system', path: '/contact', pageId: 'sys_page_contact', systemKey: 'contact', isSystemPage: true, order: 4, visible: true },
    ],
  },
  {
    id: 'col_resources',
    title: 'Resources',
    order: 1,
    visible: true,
    links: [
      { id: 'link_sys_courses', label: 'Courses Offered', type: 'system', path: '/courses', systemKey: 'courses', isSystemPage: true, order: 0, visible: true },
      { id: 'link_sys_faculty', label: 'Faculty Directory', type: 'system', path: '/faculty', systemKey: 'faculty', isSystemPage: true, order: 1, visible: true },
      { id: 'link_sys_downloads', label: 'Document Downloads', type: 'system', path: '/downloads', systemKey: 'downloads', isSystemPage: true, order: 2, visible: true },
      { id: 'link_sys_gallery', label: 'Photo Gallery', type: 'system', path: '/gallery', systemKey: 'gallery', isSystemPage: true, order: 3, visible: true },
      { id: 'link_sys_news', label: 'News & Updates', type: 'system', path: '/news', systemKey: 'news', isSystemPage: true, order: 4, visible: true },
    ],
  },
];

export const defaultSettings: SiteSettings = {
  id: SETTINGS_DOC_ID,
  collegeInfo: {
    name: 'College Name',
    shortName: 'College',
    tagline: 'Empowering Education & Innovation',
    description: 'Welcome to our official college portal providing quality higher education and holistic student development.',
    establishedYear: '',
    address: 'Campus Address, University District',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    alternatePhone: '',
    email: '',
    websiteUrl: '',
    principalName: '',
    principalDesignation: 'Principal',
    principalPhotoUrl: '',
    principalMessage: '',
  },
  socialLinks: {
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
    linkedin: '',
  },
  footerConfig: {
    aboutText: 'Dedicated to excellence in education, groundbreaking research, and holistic student development.',
    copyrightText: `© ${new Date().getFullYear()} College Name. All rights reserved.`,
    usefulLinksHeader: 'Quick Links',
    contactHeader: 'Contact Campus',
    columns: defaultFooterColumns,
  },
  seoConfig: {
    defaultMetaTitle: 'Official College Portal | Higher Education & Research',
    defaultMetaDescription: 'Official website of the college with courses, faculty directory, admissions information, and academic circulars.',
    defaultOgImageUrl: '',
  },
  maintenanceMode: false,
  maintenanceMessage: 'The website is currently undergoing scheduled maintenance. Please check back soon.',
  setupCompleted: false,
  updatedAt: new Date().toISOString(),
};

import { cache } from 'react';
import { sanitizeForFirestore } from '@/lib/firestore-utils';

export const siteSettingsService = {
  getSettings: cache(async (): Promise<SiteSettings> => {
    try {
      const ref = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        return defaultSettings;
      }
      const data = snap.data() as Partial<SiteSettings>;
      const existingColumns = data.footerConfig?.columns;
      const columnsToUse = existingColumns && Array.isArray(existingColumns) && existingColumns.length > 0
        ? existingColumns
        : defaultFooterColumns;

      return {
        ...defaultSettings,
        ...data,
        collegeInfo: {
          ...defaultSettings.collegeInfo,
          ...(data.collegeInfo || {}),
        },
        socialLinks: {
          ...defaultSettings.socialLinks,
          ...(data.socialLinks || {}),
        },
        footerConfig: {
          ...defaultSettings.footerConfig,
          ...(data.footerConfig || {}),
          columns: columnsToUse,
        },
        seoConfig: {
          ...defaultSettings.seoConfig,
          ...(data.seoConfig || {}),
        },
      };
    } catch (err) {
      console.warn('Firestore siteSettings fetch warning:', err);
      return defaultSettings;
    }
  }),

  async updateSettings(partialSettings: Partial<SiteSettings>): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
    const updated = sanitizeForFirestore({
      ...partialSettings,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(ref, updated, { merge: true });
  },

  async setMaintenanceMode(enabled: boolean, message?: string): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
    const payload: Partial<SiteSettings> = {
      maintenanceMode: enabled,
      updatedAt: new Date().toISOString(),
    };
    if (message !== undefined) {
      payload.maintenanceMessage = message;
    }
    const updated = sanitizeForFirestore(payload);
    await setDoc(ref, updated, { merge: true });
  },

  async isSetupCompleted(): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      return Boolean(settings.setupCompleted);
    } catch {
      return false;
    }
  },

  async completeSetup(settingsData: Partial<SiteSettings>): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
    const payload = sanitizeForFirestore({
      ...settingsData,
      setupCompleted: true,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(ref, payload, { merge: true });
  },
};

