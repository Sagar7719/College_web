import type { Metadata } from 'next';
import { pagesService } from '@/services/pages.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { PageSectionRenderer } from '@/components/page-builder';
import { Card, CardBody, Badge } from '@/components/ui';
import styles from '../inner.module.css';

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
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div className={styles.pageHeader}>
        <Badge variant="default" style={{ marginBottom: '0.75rem' }}>About Our Institution</Badge>
        <h1 className={styles.pageTitle}>About {info.name}</h1>
        <p className={styles.pageSubtitle}>
          {info.establishedYear ? `Established ${info.establishedYear} • ` : ''}{info.address}
        </p>
      </div>

      <div className={styles.aboutSplitGrid}>
        {info.description && (
          <Card variant="bordered">
            <CardBody>
              <h2 className={styles.sectionTitle}>Institution Overview</h2>
              <p className={styles.bodyText}>
                {info.description}
              </p>
            </CardBody>
          </Card>
        )}

        <Card variant="bordered">
          <CardBody>
            <h2 className={styles.sectionTitle}>Vision &amp; Mission</h2>
            <p className={styles.bodyText}>
              Our vision is to remain a center of academic distinction, nurturing innovation, research excellence, and ethical leadership in every discipline. We strive to provide accessible, high-quality higher education tailored to modern societal demands and technological advancements.
            </p>
          </CardBody>
        </Card>
      </div>

      {(info.principalMessage || info.principalName) && (
        <Card variant="bordered" style={{ marginTop: '2rem' }}>
          <CardBody>
            <h2 className={styles.sectionTitle}>Principal&apos;s Message</h2>
            <div className={styles.principalMessageFlex}>
              {info.principalPhotoUrl && (
                <img
                  src={info.principalPhotoUrl}
                  alt={info.principalName || 'Principal'}
                  className={styles.principalPhoto}
                />
              )}
              <div style={{ flex: 1 }}>
                <h4 className={styles.principalName}>
                  {info.principalName || 'Principal'}
                </h4>
                {info.principalDesignation && (
                  <p className={styles.principalRole}>
                    {info.principalDesignation}
                  </p>
                )}
                {info.principalMessage && (
                  <p className={styles.principalQuote}>
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
