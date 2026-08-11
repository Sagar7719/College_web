import React from 'react';
import type { Metadata } from 'next';
import { pagesService } from '@/services/pages.service';
import { noticesService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { PageSectionRenderer } from '@/components/page-builder';
import { Card, CardBody, Badge, EmptyState } from '@/components/ui';
import styles from '../inner.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await pagesService.getPageBySlug('notices');
  if (cmsPage && cmsPage.status === 'published' && (cmsPage.seo?.metaTitle || cmsPage.title)) {
    return {
      title: cmsPage.seo?.metaTitle || cmsPage.title,
      description: cmsPage.seo?.metaDescription,
      alternates: { canonical: '/notices' },
    };
  }

  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = `Official Notices & Circulars — ${collegeName}`;
  const description = `Stay updated with official academic circulars, exam schedules, and administrative announcements from ${collegeName}.`;
  const ogImageUrl = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: '/notices',
    },
    openGraph: {
      title,
      description,
      url: '/notices',
      siteName: collegeName,
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, alt: title }] } : {}),
    },
  };
}

export default async function NoticesPage() {
  const cmsPage = await pagesService.getPageBySlug('notices');
  if (cmsPage && cmsPage.status === 'published' && cmsPage.sections?.length > 0) {
    return <PageSectionRenderer sections={cmsPage.sections} />;
  }

  const notices = await noticesService.getPublished(20);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div className={styles.pageHeader}>
        <Badge variant="default" style={{ marginBottom: '0.75rem' }}>Official Circulars</Badge>
        <h1 className={styles.pageTitle}>College Notices &amp; Circulars</h1>
        <p className={styles.pageSubtitle}>
          Stay updated with official academic announcements and administrative notices.
        </p>
      </div>

      {notices.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notices.map((notice) => (
            <Card key={notice.id} variant="bordered" hoverable>
              <CardBody style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <Badge variant={notice.isUrgent ? 'danger' : 'info'}>{notice.category}</Badge>
                    <span className="tiny-text" style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>📅 {notice.publishDate.slice(0, 10)}</span>
                  </div>
                  <h3 className={styles.sectionTitle} style={{ color: 'var(--color-primary)', fontSize: '1.1875rem', marginBottom: '0.25rem' }}>
                    {notice.title}
                  </h3>
                  {notice.content && (
                    <p className={styles.bodyText} style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                      {notice.content}
                    </p>
                  )}
                </div>
                {notice.attachmentUrl && (
                  <a
                    href={notice.attachmentUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="small-text"
                    style={{ fontWeight: 700, color: 'var(--color-accent)', textDecoration: 'none', flexShrink: 0 }}
                  >
                    📥 {notice.attachmentName || 'Download File'}
                  </a>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Notices Available"
          description="There are currently no active official notices posted."
        />
      )}
    </div>
  );
}
