import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { galleryService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import Link from 'next/link';
import { ArrowLeft, Camera } from 'lucide-react';
import { GalleryAlbumClient } from './GalleryAlbumClient';
import styles from './AlbumDetail.module.css';

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
      robots: { index: false, follow: false },
    };
  }

  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'Jaysingpur College, Jaysingpur';
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
    <div className={styles.albumDetailPage}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link href="/gallery" className={styles.breadcrumbLink}>
            Photo Gallery
          </Link>
          <span>›</span>
          <span style={{ color: '#24221F' }}>{album.title}</span>
        </nav>

        {/* Executive Album Header */}
        <div className={styles.albumHeader}>
          {album.category && <span className={styles.albumBadge}>{album.category}</span>}
          <h1 className={styles.albumTitle}>{album.title}</h1>
          <div className={styles.albumMetaRow}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Camera size={16} />
              <span>{album.images?.length || 0} High-Res Photos</span>
            </span>
          </div>
        </div>

        {/* Masonry Image Grid */}
        {album.images && album.images.length > 0 ? (
          <GalleryAlbumClient images={album.images} />
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 24px', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px dashed #DED4C5' }}>
            <Camera size={44} style={{ color: '#C85A32', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#24221F' }}>No Photos Uploaded Yet</h3>
            <p style={{ color: '#68705A', marginTop: '6px' }}>The administrator is currently uploading photos to this album.</p>
          </div>
        )}

        {/* Back Link CTA */}
        <div className={styles.backRow}>
          <Link href="/gallery" className={styles.btnBack}>
            <ArrowLeft size={16} />
            <span>Back to All Albums</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
