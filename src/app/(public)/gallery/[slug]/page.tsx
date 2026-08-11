import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { galleryService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { Badge, EmptyState } from '@/components/ui';
import Link from 'next/link';
import { GalleryAlbumClient } from './GalleryAlbumClient';
import styles from '../../inner.module.css';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const albums = await galleryService.getPublished();
  const album = albums.find((a) => a.slug === slug && a.status === 'published');

  if (!album) {
    return {
      title: 'Album Not Found',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = `${album.title} — Photo Gallery`;
  const description = album.category
    ? `View ${album.images?.length || 0} photos in the ${album.category} album "${album.title}" at ${collegeName}.`
    : `View ${album.images?.length || 0} photos from the ${album.title} album at ${collegeName}.`;
  const coverUrl = album.coverImageUrl || (album.images && album.images[0]?.url) || settings.seoConfig?.defaultOgImageUrl;


  return {
    title,
    description,
    alternates: {
      canonical: `/gallery/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/gallery/${slug}`,
      siteName: collegeName,
      type: 'article',
      locale: 'en_US',
      ...(coverUrl
        ? {
            images: [
              {
                url: coverUrl,
                width: 1200,
                height: 630,
                alt: album.title,
              },
            ],
          }
        : {}),
      publishedTime: album.createdAt,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(coverUrl ? { images: [coverUrl] } : {}),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}


export default async function GalleryAlbumPage({ params }: Props) {
  const { slug } = await params;
  const albums = await galleryService.getPublished();
  const album = albums.find((a) => a.slug === slug);

  if (!album) notFound();

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
        <Link href="/gallery" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Photo Gallery</Link>
        {' › '}
        <span style={{ color: 'var(--color-text-secondary)' }}>{album.title}</span>
      </nav>

      {/* Album header */}
      <div className={styles.pageHeader}>
        {album.category && <Badge variant="default" style={{ marginBottom: '0.75rem' }}>{album.category}</Badge>}
        <h1 className={styles.pageTitle}>{album.title}</h1>
        <p className={styles.pageSubtitle}>
          📂 {album.images?.length || 0} photo{(album.images?.length || 0) !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Image grid — client component for lightbox interaction */}
      {album.images && album.images.length > 0 ? (
        <GalleryAlbumClient images={album.images} />
      ) : (
        <EmptyState
          title="No Photos in This Album Yet"
          description="The administrator is uploading photos to this album. Please check back soon."
        />
      )}

      {/* Back link */}
      <div style={{ marginTop: '4rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
        <Link href="/gallery" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 700 }}>
          ← Back to Gallery
        </Link>
      </div>
    </div>
  );
}
