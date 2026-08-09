import { z } from 'zod';

export const RESERVED_SLUGS = [
  'admin',
  'login',
  'setup',
  'about',
  'admissions',
  'departments',
  'courses',
  'faculty',
  'notices',
  'news',
  'events',
  'gallery',
  'downloads',
  'contact',
  'search',
  'maintenance',
  'api',
];

export function isReservedSlug(slug: string): boolean {
  const normalized = slug.toLowerCase().replace(/^\//, '').trim();
  return RESERVED_SLUGS.includes(normalized);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export const pageFormSchema = z.object({
  title: z.string().min(2, 'Page title must be at least 2 characters').max(120, 'Title too long'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain lowercase letters, numbers, and hyphens only')
    .refine((slug) => !isReservedSlug(slug), {
      message: 'This URL slug is reserved by the system. Please choose another slug.',
    }),
  status: z.enum(['draft', 'published', 'hidden', 'archived']),
  showInNavigation: z.boolean(),
  navigationOrder: z.number().int().min(0),
  featuredImage: z.string().optional(),
  seo: z.object({
    metaTitle: z.string().min(2, 'Meta title required').max(70, 'Meta title should be under 70 chars'),
    metaDescription: z.string().max(160, 'Meta description should be under 160 chars').optional(),
    ogImageUrl: z.string().optional(),
  }),
});

export type PageFormValues = z.infer<typeof pageFormSchema>;
