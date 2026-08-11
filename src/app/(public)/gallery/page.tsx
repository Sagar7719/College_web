import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { galleryService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { Card, CardBody, Badge, EmptyState } from '@/components/ui';
import styles from '../inner.module.css';

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
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div className={styles.pageHeader}>
        <Badge variant="default" style={{ marginBottom: '0.75rem' }}>Campus Life</Badge>
        <h1 className={styles.pageTitle}>Photo Gallery &amp; Media Albums</h1>
        <p className={styles.pageSubtitle}>
          Explore life at campus through our official event and infrastructure photo albums.
        </p>
      </div>

      {albums.length > 0 ? (
        <div className={styles.galleryGrid}>
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/gallery/${album.slug}`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div className={styles.albumCard}>
                <div className={styles.albumCardImageWrapper}>
                  {album.coverImageUrl ? (
                    <img
                      src={album.coverImageUrl}
                      alt={album.title}
                      className={styles.albumCardImage}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
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
                <CardBody style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem', flex: 1 }}>
                    {album.title}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-accent)', fontWeight: 600, margin: 0 }}>
                    📂 {album.images?.length || 0} photo{(album.images?.length || 0) !== 1 ? 's' : ''} · View Album →
                  </p>
                </CardBody>
              </div>
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
