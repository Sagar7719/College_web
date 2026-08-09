import React from 'react';
import type { Metadata } from 'next';
import { facultyService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { Card, CardBody, Badge, EmptyState } from '@/components/ui';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = `Faculty Directory — ${collegeName}`;
  const description = `Meet distinguished professors, researchers, and academic mentors at ${collegeName}.`;
  const ogImageUrl = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: '/faculty',
    },
    openGraph: {
      title,
      description,
      url: '/faculty',
      siteName: collegeName,
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, alt: title }] } : {}),
    },
  };
}


export default async function FacultyPage() {
  const members = await facultyService.getAll();

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Badge variant="info" style={{ marginBottom: '0.5rem' }}>Academic Staff</Badge>
        <h1>Faculty Directory</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Meet our distinguished professors, researchers, and academic mentors.
        </p>
      </div>

      {members.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {members.map((fac) => (
            <Card key={fac.id} variant="bordered" hoverable>
              <CardBody style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem',
                    margin: '0 auto 1rem',
                  }}
                >
                  🎓
                </div>
                <h3>{fac.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.25rem' }}>
                  {fac.designation}
                </p>
                <p className="small-text" style={{ marginTop: '0.5rem' }}>{fac.qualification}</p>
                {fac.email && <p className="tiny-text" style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>✉️ {fac.email}</p>}
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Faculty Directory Will Be Available Soon"
          description="Academic staff profiles will be updated shortly."
        />
      )}
    </div>
  );
}
