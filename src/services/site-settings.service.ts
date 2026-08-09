import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { SiteSettings } from '@/types';

const COLLECTION_NAME = 'siteSettings';
const SETTINGS_DOC_ID = 'general';

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

import { sanitizeForFirestore } from '@/lib/firestore-utils';

export const siteSettingsService = {
  async getSettings(): Promise<SiteSettings> {
    try {
      const ref = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        return defaultSettings;
      }
      const data = snap.data() as Partial<SiteSettings>;
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
  },

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

