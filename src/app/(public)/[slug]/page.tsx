import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { pagesService } from '@/services/pages.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { PageSectionRenderer } from '@/components/page-builder';


interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await pagesService.getPageBySlug(slug);

  if (!page || page.status !== 'published') {
    return {
      title: 'Page Not Found',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = page.seo?.metaTitle || page.title;
  const description = page.seo?.metaDescription || `Official ${page.title} page for ${collegeName}.`;
  const ogImageUrl = page.seo?.ogImageUrl || page.featuredImage || settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: `/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/${slug}`,
      siteName: collegeName,
      type: 'article',
      locale: 'en_US',
      ...(ogImageUrl
        ? {
            images: [
              {
                url: ogImageUrl,
                width: 1200,
                height: 630,
                alt: page.title,
              },
            ],
          }
        : {}),
      publishedTime: page.createdAt,
      modifiedTime: page.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}


export default async function DynamicCMSPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await pagesService.getPageBySlug(slug);

  if (!page || page.status !== 'published') {
    notFound();
  }

  return (
    <article className="cms-page-wrapper">
      {/* Featured Header if featured image exists */}
      {page.featuredImage && (
        <div style={{ marginBottom: '2.5rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <img
            src={page.featuredImage}
            alt={page.title}
            style={{ width: '100%', maxHeight: '380px', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Render 14 modular sections */}
      <PageSectionRenderer sections={page.sections || []} />
    </article>
  );
}
