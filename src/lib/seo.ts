import type { Metadata } from 'next';
import { siteSettingsService } from '@/services/site-settings.service';

/**
 * Returns the configured base URL for the production/staging site.
 * Prioritizes environment variables (NEXT_PUBLIC_SITE_URL, VERCEL_URL)
 * and falls back safely to localhost.
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  const vercelProjectUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProjectUrl && vercelProjectUrl.trim() !== '') {
    return `https://${vercelProjectUrl.trim().replace(/\/+$/, '')}`;
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl && vercelUrl.trim() !== '') {
    return `https://${vercelUrl.trim().replace(/\/+$/, '')}`;
  }

  return 'http://localhost:3000';
}

/**
 * Constructs a fully qualified canonical URL for a given relative path.
 */
export function getCanonicalUrl(path: string = '/'): string {
  const baseUrl = getSiteUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (normalizedPath === '/') {
    return baseUrl;
  }
  return `${baseUrl}${normalizedPath.replace(/\/+$/, '')}`;
}

export interface PageMetadataOptions {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImageUrl?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Helper to build rich, consistent Next.js App Router metadata with
 * canonical alternates, Open Graph, Twitter cards, and robots indexing controls.
 */
export async function constructMetadata(options: PageMetadataOptions = {}): Promise<Metadata> {
  const baseUrl = getSiteUrl();
  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const siteTagline = settings.collegeInfo?.tagline;

  const defaultTitle = settings.seoConfig?.defaultMetaTitle || (siteTagline ? `${collegeName} | ${siteTagline}` : `${collegeName} | Official Portal`);
  const defaultDesc = settings.seoConfig?.defaultMetaDescription || settings.collegeInfo?.description || `Official website of ${collegeName} providing higher education, academic programs, and student portals.`;
  const defaultOg = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  const title = options.title ? options.title : defaultTitle;
  const description = options.description ? options.description : defaultDesc;
  const canonicalUrl = options.canonicalPath ? getCanonicalUrl(options.canonicalPath) : baseUrl;
  const ogImageUrl = options.ogImageUrl || defaultOg;
  const ogType = options.ogType || 'website';

  const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: collegeName,
      type: ogType,
      locale: 'en_US',
      ...(ogImageUrl ? {
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: options.title || collegeName,
          },
        ],
      } : {}),
      ...(options.publishedTime ? { publishedTime: options.publishedTime } : {}),
      ...(options.modifiedTime ? { modifiedTime: options.modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
    robots: options.noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };

  if (settings.collegeInfo?.faviconUrl) {
    metadata.icons = {
      icon: settings.collegeInfo.faviconUrl,
      apple: settings.collegeInfo.logoUrl || settings.collegeInfo.faviconUrl,
    };
  }

  return metadata;
}
