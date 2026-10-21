import React from 'react';
import type { Metadata } from 'next';
import { eventsService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { Card, CardBody, Badge, EmptyState } from '@/components/ui';
import styles from '../inner.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = `Events & Academic Calendar — ${collegeName}`;
  const description = `Discover upcoming conferences, seminars, cultural fests, and sports tournaments at ${collegeName}.`;
  const ogImageUrl = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: '/events',
    },
    openGraph: {
      title,
      description,
      url: '/events',
      siteName: collegeName,
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, alt: title }] } : {}),
    },
  };
}


export default async function EventsPage() {
  const events = await eventsService.getUpcoming();

  return (
    <div className={styles.subpageWrapper}>
      <div className="container">
        <div className={styles.pageHeader}>
          <Badge variant="default" style={{ marginBottom: '0.75rem' }}>Campus Calendar</Badge>
          <h1 className={styles.pageTitle}>Upcoming Events</h1>
          <p className={styles.pageSubtitle}>
            Conferences, workshops, cultural meets, and sports tournaments.
          </p>
        </div>

        {events.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {events.map((evt) => (
              <Card key={evt.id} variant="bordered" hoverable>
                <CardBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <Badge variant="success">Upcoming</Badge>
                      <span className="tiny-text" style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>📅 {evt.eventDate.slice(0, 10)}</span>
                    </div>
                    <h3 className={styles.sectionTitle} style={{ color: 'var(--color-primary)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                      {evt.title}
                    </h3>
                    <p className="small-text" style={{ fontWeight: 700, margin: '0.5rem 0', color: 'var(--color-accent)' }}>📍 {evt.venue}</p>
                    <p className={styles.bodyText} style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{evt.description}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Upcoming Events"
            description="Check back soon for upcoming campus activities and academic conferences."
          />
        )}
      </div>
    </div>
  );
}
