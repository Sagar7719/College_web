import type { Metadata } from 'next';
import { siteSettingsService } from '@/services/site-settings.service';
import { getSiteUrl } from '@/lib/seo';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteUrl = getSiteUrl();
    const settings = await siteSettingsService.getSettings();
    const collegeName = settings.collegeInfo?.name || 'College Portal';
    const siteTagline = settings.collegeInfo?.tagline;

    const defaultTitle = settings.seoConfig?.defaultMetaTitle || (siteTagline ? `${collegeName} | ${siteTagline}` : `${collegeName} | Higher Education & Research`);
    const description = settings.seoConfig?.defaultMetaDescription || settings.collegeInfo?.description || 'Official College Portal providing academic programs, admissions, faculty directory, and campus circulars.';
    const ogImageUrl = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

    const metadata: Metadata = {
      metadataBase: new URL(siteUrl),
      title: {
        default: defaultTitle,
        template: `%s | ${collegeName}`,
      },
      description,
      alternates: {
        canonical: siteUrl,
      },
      openGraph: {
        title: defaultTitle,
        description,
        url: siteUrl,
        siteName: collegeName,
        type: 'website',
        locale: 'en_US',
        ...(ogImageUrl
          ? {
              images: [
                {
                  url: ogImageUrl,
                  width: 1200,
                  height: 630,
                  alt: collegeName,
                },
              ],
            }
          : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: defaultTitle,
        description,
        ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
      },
      robots: {
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
  } catch {
    const siteUrl = getSiteUrl();
    return {
      metadataBase: new URL(siteUrl),
      title: 'College Portal | Higher Education & Research',
      description: 'Official College Website & Dynamic Content Management System',
      alternates: {
        canonical: siteUrl,
      },
    };
  }
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
