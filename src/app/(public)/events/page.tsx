import React from 'react';
import type { Metadata } from 'next';
import { eventsService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { Card, CardBody, Badge, EmptyState } from '@/components/ui';

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
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Badge variant="info" style={{ marginBottom: '0.5rem' }}>Campus Calendar</Badge>
        <h1>Upcoming Events</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Conferences, workshops, cultural meets, and sports tournaments.
        </p>
      </div>

      {events.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {events.map((evt) => (
            <Card key={evt.id} variant="bordered" hoverable>
              <CardBody>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Badge variant="success">Upcoming</Badge>
                  <span className="tiny-text">📅 {evt.eventDate.slice(0, 10)}</span>
                </div>
                <h3>{evt.title}</h3>
                <p className="small-text" style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>📍 {evt.venue}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{evt.description}</p>
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
  );
}
