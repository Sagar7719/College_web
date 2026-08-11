import React from 'react';
import type { Metadata } from 'next';
import { newsService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { Card, CardBody, Badge, EmptyState } from '@/components/ui';
import styles from '../inner.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = `News & Press Releases — ${collegeName}`;
  const description = `Read latest stories, research achievements, campus highlights, and press releases from ${collegeName}.`;
  const ogImageUrl = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: '/news',
    },
    openGraph: {
      title,
      description,
      url: '/news',
      siteName: collegeName,
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, alt: title }] } : {}),
    },
  };
}


export default async function NewsPage() {
  const articles = await newsService.getPublished();

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div className={styles.pageHeader}>
        <Badge variant="default" style={{ marginBottom: '0.75rem' }}>Campus Press</Badge>
        <h1 className={styles.pageTitle}>News &amp; Press Releases</h1>
        <p className={styles.pageSubtitle}>
          Read the latest stories, achievements, and updates from our campus community.
        </p>
      </div>

      {articles.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {articles.map((item) => (
            <Card key={item.id} variant="bordered" hoverable>
              <CardBody style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0 }}>
                {item.coverImageUrl && (
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)', display: 'block' }}
                  />
                )}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span className="tiny-text" style={{ fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                    📅 {item.publishDate.slice(0, 10)}
                  </span>
                  <h3 className={styles.sectionTitle} style={{ color: 'var(--color-primary)', fontSize: '1.25rem', marginBottom: '0.5rem', flexShrink: 0 }}>
                    {item.title}
                  </h3>
                  <p className={styles.bodyText} style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', flex: 1 }}>
                    {item.summary}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No News Stories Available"
          description="Campus news articles will be published shortly."
        />
      )}
    </div>
  );
}
