import React from 'react';
import type { Metadata } from 'next';
import { eventsService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { Badge, EmptyState } from '@/components/ui';
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
          <div className={styles.eventsGrid}>
            {events.map((evt) => (
              <div key={evt.id} className={styles.eventCard}>
                <div className={styles.eventMetaRow}>
                  <Badge variant="success">Upcoming</Badge>
                  <span className={styles.eventDateBadge}>
                    📅 {evt.eventDate.slice(0, 10)}
                  </span>
                </div>
                <h3 className={styles.eventTitle}>
                  {evt.title}
                </h3>
                <div className={styles.eventVenue}>
                  <span>📍</span>
                  <span>{evt.venue}</span>
                </div>
                {evt.description && (
                  <p className={styles.eventDesc}>{evt.description}</p>
                )}
              </div>
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
