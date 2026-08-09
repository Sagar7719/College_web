import React from 'react';
import type { Metadata } from 'next';
import { newsService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { Card, CardBody, Badge, EmptyState } from '@/components/ui';

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
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Badge variant="info" style={{ marginBottom: '0.5rem' }}>Campus Press</Badge>
        <h1>News & Press Releases</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Read the latest stories, achievements, and updates from our campus community.
        </p>
      </div>

      {articles.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {articles.map((item) => (
            <Card key={item.id} variant="bordered" hoverable>
              <CardBody>
                {item.coverImageUrl && (
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
                  />
                )}
                <span className="tiny-text">{item.publishDate.slice(0, 10)}</span>
                <h3 style={{ margin: '0.375rem 0' }}>{item.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.summary}</p>
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
