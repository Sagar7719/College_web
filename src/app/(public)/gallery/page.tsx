import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { galleryService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { Card, CardBody, Badge, EmptyState } from '@/components/ui';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = `Photo Gallery & Media Albums — ${collegeName}`;
  const description = `Browse campus photo albums, annual fests, convocations, and infrastructure galleries at ${collegeName}.`;
  const ogImageUrl = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: '/gallery',
    },
    openGraph: {
      title,
      description,
      url: '/gallery',
      siteName: collegeName,
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, alt: title }] } : {}),
    },
  };
}


export default async function GalleryPage() {
  const albums = await galleryService.getPublished();

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Badge variant="info" style={{ marginBottom: '0.5rem' }}>Campus Life</Badge>
        <h1>Photo Gallery &amp; Media Albums</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Explore life at campus through our official event and infrastructure photo albums.
        </p>
      </div>

      {albums.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/gallery/${album.slug}`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <Card variant="bordered" hoverable style={{ height: '100%', cursor: 'pointer' }}>
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}>
                  {album.coverImageUrl ? (
                    <img
                      src={album.coverImageUrl}
                      alt={album.title}
                      style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '200px', backgroundColor: 'var(--bg-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem',
                    }}>
                      🖼️
                    </div>
                  )}
                  {album.category && (
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                      <Badge variant="info">{album.category}</Badge>
                    </div>
                  )}
                </div>
                <CardBody>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.375rem' }}>
                    {album.title}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                    {album.images?.length || 0} photo{(album.images?.length || 0) !== 1 ? 's' : ''} · View Album →
                  </p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Gallery Albums Coming Soon"
          description="Campus photo albums are currently being uploaded by the administrator. Please check back shortly."
        />
      )}
    </div>
  );
}
