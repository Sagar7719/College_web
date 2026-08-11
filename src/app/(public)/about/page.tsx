import type { Metadata } from 'next';
import { pagesService } from '@/services/pages.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { PageSectionRenderer } from '@/components/page-builder';
import { Card, CardBody, Badge } from '@/components/ui';

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await pagesService.getPageBySlug('about');
  if (cmsPage && cmsPage.status === 'published' && (cmsPage.seo?.metaTitle || cmsPage.title)) {
    return {
      title: cmsPage.seo?.metaTitle || cmsPage.title,
      description: cmsPage.seo?.metaDescription,
      alternates: { canonical: '/about' },
      openGraph: cmsPage.seo?.ogImageUrl ? { images: [{ url: cmsPage.seo.ogImageUrl }] } : undefined,
    };
  }

  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = `About Us — ${collegeName}`;
  const description = `Learn more about ${collegeName}, our mission, vision, history, and leadership message.`;
  const ogImageUrl = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: '/about',
    },
    openGraph: {
      title,
      description,
      url: '/about',
      siteName: collegeName,
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, alt: title }] } : {}),
    },
  };
}

export default async function AboutPage() {
  // If published CMS page exists with custom Page Builder sections, render sections dynamically
  const cmsPage = await pagesService.getPageBySlug('about');
  if (cmsPage && cmsPage.status === 'published' && cmsPage.sections?.length > 0) {
    return <PageSectionRenderer sections={cmsPage.sections} />;
  }

  // Fallback to institutional default template when no custom sections added
  const settings = await siteSettingsService.getSettings();
  const info = settings.collegeInfo;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Badge variant="info" style={{ marginBottom: '0.5rem' }}>About Our Institution</Badge>
        <h1>About {info.name}</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {info.establishedYear ? `Established ${info.establishedYear} • ` : ''}{info.address}
        </p>
      </div>

      {info.description && (
        <Card variant="bordered" style={{ marginBottom: '2rem' }}>
          <CardBody>
            <h2>Institution Overview</h2>
            <p style={{ marginTop: '1rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
              {info.description}
            </p>
          </CardBody>
        </Card>
      )}

      <Card variant="bordered" style={{ marginBottom: '2rem' }}>
        <CardBody>
          <h2>Vision &amp; Mission</h2>
          <p style={{ marginTop: '1rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            Our vision is to remain a center of academic distinction, nurturing innovation, research excellence, and ethical leadership in every discipline. We strive to provide accessible, high-quality higher education tailored to modern societal demands.
          </p>
        </CardBody>
      </Card>

      {(info.principalMessage || info.principalName) && (
        <Card variant="bordered">
          <CardBody>
            <h2>Principal&apos;s Message</h2>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {info.principalPhotoUrl && (
                <img
                  src={info.principalPhotoUrl}
                  alt={info.principalName || 'Principal'}
                  style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)', flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h4 style={{ color: 'var(--primary)', margin: 0 }}>
                  {info.principalName || 'Principal'}
                </h4>
                {info.principalDesignation && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.125rem 0 0.75rem' }}>
                    {info.principalDesignation}
                  </p>
                )}
                {info.principalMessage && (
                  <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                    &ldquo;{info.principalMessage}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
