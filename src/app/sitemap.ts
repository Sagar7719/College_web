import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';
import { pagesService } from '@/services/pages.service';
import { galleryService } from '@/services/cms-modules.service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  // 1. Core Public Static Routes
  const staticRoutes = [
    '',
    '/about',
    '/admissions',
    '/departments',
    '/courses',
    '/faculty',
    '/notices',
    '/news',
    '/events',
    '/gallery',
    '/downloads',
    '/contact',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1.0 : 0.8,
  }));

  // 2. Dynamic Published CMS Pages (Strictly exclude drafts, archived, hidden)
  let pageEntries: MetadataRoute.Sitemap = [];
  try {
    const publishedPages = await pagesService.getPublishedPages();
    pageEntries = publishedPages
      .filter((p) => p && p.slug && p.status === 'published')
      .map((p) => ({
        url: `${baseUrl}/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
  } catch (err) {
    console.warn('Sitemap dynamic pages warning:', err);
  }

  // 3. Dynamic Published Gallery Albums (Strictly exclude drafts, archived)
  let albumEntries: MetadataRoute.Sitemap = [];
  try {
    const publishedAlbums = await galleryService.getPublished();
    albumEntries = publishedAlbums
      .filter((a) => a && a.slug && a.status === 'published')
      .map((a) => ({
        url: `${baseUrl}/gallery/${a.slug}`,
        lastModified: a.createdAt ? new Date(a.createdAt) : now,
        changeFrequency: 'monthly',
        priority: 0.6,
      }));
  } catch (err) {
    console.warn('Sitemap gallery albums warning:', err);
  }

  return [...staticEntries, ...pageEntries, ...albumEntries];
}
