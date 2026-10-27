'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Camera, ZoomIn, Loader2 } from 'lucide-react';
import { GalleryLightbox } from '@/components/layout/GalleryLightbox';
import { galleryService } from '@/services/cms-modules.service';
import styles from './GalleryClient.module.css';

export interface GalleryAlbum {
  id: string;
  title: string;
  slug: string;
  coverImageUrl?: string | null;
  category?: string | null;
  description?: string | null;
  status?: string;
  images?: { id: string; url: string; caption?: string; altText?: string }[];
}

interface GalleryClientProps {
  initialAlbums: GalleryAlbum[];
  collegeName: string;
}

interface FlatPhotoItem {
  id: string;
  url: string;
  caption?: string;
  altText?: string;
  albumTitle: string;
  category: string;
  spanClass: string;
}

// Curated high-resolution campus photo fallbacks for a rich photo collage wall
const curatedCampusPhotos = [
  {
    id: 'cur-1',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop',
    albumTitle: 'Annual Convocation Ceremony',
    category: 'ACADEMICS & CONVOCATIONS',
    caption: 'Graduating batch celebrating their academic success on campus main grounds.',
  },
  {
    id: 'cur-2',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop',
    albumTitle: 'Historic Main Heritage Building',
    category: 'CAMPUS INFRASTRUCTURE',
    caption: 'Iconic stone architecture surrounded by lush green lawns.',
  },
  {
    id: 'cur-3',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
    albumTitle: 'Youth Cultural Music & Dance Fest',
    category: 'EVENTS & CULTURAL FESTS',
    caption: 'Students performing energetic classical and contemporary dance routines.',
  },
  {
    id: 'cur-4',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
    albumTitle: 'Inter-College Athletics Championship',
    category: 'SPORTS & ATHLETICS',
    caption: 'Athletes competing in 400m relay track events.',
  },
  {
    id: 'cur-5',
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200&auto=format&fit=crop',
    albumTitle: 'Modern Science & Biotech Research Labs',
    category: 'CAMPUS INFRASTRUCTURE',
    caption: 'Advanced research equipment in modern chemistry and biotechnology laboratories.',
  },
  {
    id: 'cur-6',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop',
    albumTitle: 'Degree Distribution Convocation Day',
    category: 'ACADEMICS & CONVOCATIONS',
    caption: 'Gold medalists receiving awards from honored guest dignitaries.',
  },
  {
    id: 'cur-7',
    url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1200&auto=format&fit=crop',
    albumTitle: 'National Seminar & Guest Lecture',
    category: 'ACADEMICS & CONVOCATIONS',
    caption: 'Industry leaders sharing insights at the main auditorium conference.',
  },
  {
    id: 'cur-8',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop',
    albumTitle: 'Smart Digital Classroom Interactive Session',
    category: 'ACADEMICS & CONVOCATIONS',
    caption: 'Students collaborating using interactive digital boards.',
  },
  {
    id: 'cur-9',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
    albumTitle: 'Inter-College Cricket Tournament Finals',
    category: 'SPORTS & ATHLETICS',
    caption: 'Championship trophy presentation on the main sports ground.',
  },
  {
    id: 'cur-10',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1200&auto=format&fit=crop',
    albumTitle: 'Central Knowledge Resource Library',
    category: 'CAMPUS INFRASTRUCTURE',
    caption: 'Peaceful reading hall with over 50,000 reference books and digital journals.',
  },
  {
    id: 'cur-11',
    url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1200&auto=format&fit=crop',
    albumTitle: 'Youth Fest Drama & Theatre Play',
    category: 'EVENTS & CULTURAL FESTS',
    caption: 'Award-winning theatrical drama performance during the inter-college fest.',
  },
  {
    id: 'cur-12',
    url: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?q=80&w=1200&auto=format&fit=crop',
    albumTitle: 'Independence Day Flag Hoisting',
    category: 'EVENTS & CULTURAL FESTS',
    caption: 'NCC cadets parade and tricolor flag hoisting ceremony on Republic Day.',
  },
];

const spanPatterns = [
  styles.tileBig,      // 2x2
  styles.tileNormal,   // 1x1
  styles.tileTall,     // 1x2
  styles.tileWide,     // 2x1
  styles.tileNormal,   // 1x1
  styles.tileNormal,   // 1x1
  styles.tileWide,     // 2x1
  styles.tileTall,     // 1x2
  styles.tileNormal,   // 1x1
  styles.tileBig,      // 2x2
  styles.tileNormal,   // 1x1
  styles.tileWide,     // 2x1
];

export function GalleryClient({ initialAlbums, collegeName }: GalleryClientProps) {
  const [albums, setAlbums] = useState<GalleryAlbum[]>(initialAlbums);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Live dynamic database synchronization with Firestore
  useEffect(() => {
    let alive = true;
    const fetchLiveAlbums = async () => {
      try {
        const liveData = await galleryService.getPublished();
        if (alive && liveData && liveData.length > 0) {
          setAlbums(liveData);
        }
      } catch (err) {
        console.warn('Gallery live sync notice:', err);
      }
    };
    fetchLiveAlbums();
    return () => { alive = false; };
  }, []);

  // Flatten all photos from database albums + curated campus photos
  const allPhotos = useMemo(() => {
    const list: FlatPhotoItem[] = [];
    let counter = 0;

    const processItem = (item: { id: string; url: string; caption?: string; altText?: string; albumTitle: string; category: string }) => {
      list.push({
        ...item,
        spanClass: spanPatterns[counter % spanPatterns.length],
      });
      counter++;
    };

    // Extract photos from database albums
    albums.forEach((album) => {
      const category = album.category || 'CAMPUS LIFE';

      if (album.coverImageUrl && (album.coverImageUrl.startsWith('/') || album.coverImageUrl.startsWith('http'))) {
        processItem({
          id: `cover-${album.id}`,
          url: album.coverImageUrl,
          caption: album.description || album.title,
          altText: album.title,
          albumTitle: album.title,
          category,
        });
      }

      if (album.images && album.images.length > 0) {
        album.images.forEach((img, i) => {
          if (img.url && (img.url.startsWith('/') || img.url.startsWith('http'))) {
            processItem({
              id: img.id || `${album.id}-img-${i}`,
              url: img.url,
              caption: img.caption || album.title,
              altText: img.altText || album.title,
              albumTitle: album.title,
              category,
            });
          }
        });
      }
    });

    // Append curated high-res campus photos if list has fewer than 16 items
    if (list.length < 16) {
      curatedCampusPhotos.forEach((item) => {
        processItem(item);
      });
    }

    return list;
  }, [albums]);

  // Filter & Search Logic
  const filteredPhotos = useMemo(() => {
    return allPhotos.filter((item) => {
      const cat = item.category.toLowerCase();
      if (activeFilter === 'events' && !cat.includes('event') && !cat.includes('fest') && !cat.includes('cultural')) {
        return false;
      }
      if (activeFilter === 'infrastructure' && !cat.includes('infra') && !cat.includes('campus') && !cat.includes('building')) {
        return false;
      }
      if (activeFilter === 'academics' && !cat.includes('academic') && !cat.includes('convocation') && !cat.includes('seminar')) {
        return false;
      }
      if (activeFilter === 'sports' && !cat.includes('sport') && !cat.includes('athletic')) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.albumTitle.toLowerCase().includes(query);
        const matchesCat = cat.includes(query);
        const matchesCap = (item.caption || '').toLowerCase().includes(query);
        return matchesTitle || matchesCat || matchesCap;
      }

      return true;
    });
  }, [allPhotos, activeFilter, searchQuery]);

  return (
    <div className={styles.galleryPage}>
      {/* 1. EXECUTIVE HERO BANNER */}
      <section className={styles.heroBanner}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.innerHeroGlassCard}>
              <div className={styles.heroBadge}>
                <Camera size={16} />
                <span>Visual Institutional Archive</span>
              </div>
              <h1 className={styles.heroTitle}>Photo Gallery &amp; Media Albums</h1>
              <p className={styles.heroSubtitle}>
                Explore memorable campus moments, cultural celebrations, academic convocation ceremonies, sporting championships, and infrastructure at {collegeName}.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Compact Control Bar in Website Theme Color */}
        <div className={styles.controlsRow}>
          <div className={styles.filterTabs}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeFilter === 'all' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Photos ({allPhotos.length})
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeFilter === 'events' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveFilter('events')}
            >
              Events &amp; Cultural Fests
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeFilter === 'infrastructure' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveFilter('infrastructure')}
            >
              Campus Infrastructure
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeFilter === 'academics' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveFilter('academics')}
            >
              Academics &amp; Convocations
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeFilter === 'sports' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveFilter('sports')}
            >
              Sports &amp; Athletics
            </button>
          </div>

          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search photos by title, event, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {/* Full Viewport Photo Collage Grid (Dense Puzzle Packing, Zero Empty Gaps) */}
      {filteredPhotos.length > 0 ? (
        <div className={styles.fullViewportWall}>
          <div className={styles.collageGrid}>
            {filteredPhotos.map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                type="button"
                className={`${styles.tileItem} ${item.spanClass}`}
                onClick={() => setLightboxIndex(idx)}
                aria-label={`View photo ${item.albumTitle}`}
              >
                <img
                  src={item.url}
                  alt={item.altText || item.albumTitle}
                  className={styles.tileImg}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className={styles.tileHoverOverlay}>
                  <div className={styles.topBadgeRow}>
                    <span className={styles.tileCategory}>{item.category}</span>
                    <div className={styles.zoomBtnIcon}>
                      <ZoomIn size={16} />
                    </div>
                  </div>
                  <div className={styles.bottomInfo}>
                    <div className={styles.tileTitle}>{item.albumTitle}</div>
                    <p className={styles.tileCaption}>{item.caption}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="container">
          <div className={styles.emptyStateBox}>
            <Camera size={44} style={{ color: '#C85A32', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#24221F' }}>No Photos Found</h3>
            <p style={{ marginTop: '6px' }}>Try adjusting your search terms or choosing another category filter.</p>
          </div>
        </div>
      )}

      {/* In-Place Fullscreen Lightbox Modal (No Page Reload / No Navigation Away) */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          images={filteredPhotos.map((p) => ({
            url: p.url,
            altText: p.altText || p.albumTitle,
            caption: `${p.albumTitle} — ${p.caption}`,
          }))}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
