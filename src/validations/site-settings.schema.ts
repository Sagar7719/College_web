import { z } from 'zod';

export const collegeInfoSchema = z.object({
  name: z.string().min(2, 'College name is required and must be at least 2 characters.'),
  shortName: z.string().min(1, 'Short name or abbreviation is required.'),
  tagline: z.string().optional(),
  description: z.string().optional(),
  establishedYear: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  address: z.string().optional().default(''),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional().default(''),
  alternatePhone: z.string().optional(),
  email: z.string().email('Please enter a valid email address.').or(z.literal('')),
  websiteUrl: z.string().url('Please enter a valid URL.').or(z.literal('')).optional(),
  principalName: z.string().optional(),
  principalDesignation: z.string().optional(),
  principalPhotoUrl: z.string().optional(),
  principalMessage: z.string().optional(),
});

export const socialLinksSchema = z.object({
  facebook: z.string().url('Invalid Facebook URL').or(z.literal('')).optional(),
  twitter: z.string().url('Invalid Twitter/X URL').or(z.literal('')).optional(),
  instagram: z.string().url('Invalid Instagram URL').or(z.literal('')).optional(),
  youtube: z.string().url('Invalid YouTube URL').or(z.literal('')).optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').or(z.literal('')).optional(),
});

export const footerConfigSchema = z.object({
  aboutText: z.string().optional(),
  copyrightText: z.string().optional(),
  usefulLinksHeader: z.string().optional(),
  contactHeader: z.string().optional(),
});

export const globalSeoConfigSchema = z.object({
  defaultMetaTitle: z.string().optional(),
  defaultMetaDescription: z.string().optional(),
  defaultOgImageUrl: z.string().optional(),
});

export const siteSettingsSchema = z.object({
  id: z.string().default('general'),
  collegeInfo: collegeInfoSchema,
  socialLinks: socialLinksSchema.optional(),
  footerConfig: footerConfigSchema.optional(),
  seoConfig: globalSeoConfigSchema.optional(),
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().optional(),
  setupCompleted: z.boolean().default(false),
});

export type SiteSettingsFormInput = z.infer<typeof siteSettingsSchema>;
