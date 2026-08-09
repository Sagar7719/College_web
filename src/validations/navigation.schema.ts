import { z } from 'zod';

export const navigationFormSchema = z.object({
  label: z.string().min(1, 'Menu label is required').max(60, 'Label too long'),
  linkType: z.enum(['system', 'cms', 'external']),
  path: z.string().min(1, 'Destination path or URL is required'),
  cmsPageId: z.string().optional(),
  visible: z.boolean(),
  order: z.number().int().min(0),
  openInNewTab: z.boolean().optional(),
});

export type NavigationFormValues = z.infer<typeof navigationFormSchema>;

export const SYSTEM_ROUTE_OPTIONS = [
  { label: 'Home Page (/)', value: '/' },
  { label: 'About Us (/about)', value: '/about' },
  { label: 'Admissions (/admissions)', value: '/admissions' },
  { label: 'Departments (/departments)', value: '/departments' },
  { label: 'Courses & Programs (/courses)', value: '/courses' },
  { label: 'Faculty Directory (/faculty)', value: '/faculty' },
  { label: 'Notices & Circulars (/notices)', value: '/notices' },
  { label: 'News & Press (/news)', value: '/news' },
  { label: 'Campus Events (/events)', value: '/events' },
  { label: 'Photo Gallery (/gallery)', value: '/gallery' },
  { label: 'Document Downloads (/downloads)', value: '/downloads' },
  { label: 'Contact Us (/contact)', value: '/contact' },
  { label: 'Search (/search)', value: '/search' },
];

export function isValidExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
