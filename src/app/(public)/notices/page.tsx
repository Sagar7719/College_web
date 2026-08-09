import React from 'react';
import type { Metadata } from 'next';
import { noticesService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { Card, CardBody, Badge, EmptyState } from '@/components/ui';

export async function generateMetadata(): Promise<Metadata> {
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
  const notices = await noticesService.getPublished(20);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Badge variant="info" style={{ marginBottom: '0.5rem' }}>Official Circulars</Badge>
        <h1>College Notices & Circulars</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Stay updated with official academic announcements and administrative notices.
        </p>
      </div>

      {notices.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notices.map((notice) => (
            <Card key={notice.id} variant="bordered" hoverable>
              <CardBody style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <Badge variant={notice.isUrgent ? 'danger' : 'info'}>{notice.category}</Badge>
                    <span className="tiny-text">{notice.publishDate.slice(0, 10)}</span>
                  </div>
                  <h3>{notice.title}</h3>
                </div>
                {notice.attachmentUrl && (
                  <a href={notice.attachmentUrl} target="_blank" rel="noreferrer" className="small-text" style={{ fontWeight: 600 }}>
                    📥 Attachment ({notice.attachmentName || 'PDF'})
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
