'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Camera, ArrowRight } from 'lucide-react';
import styles from '@/app/(public)/home.module.css';

interface GalleryAlbumItem {
  id: string;
  title: string;
  slug: string;
  coverImageUrl?: string | null;
  category?: string | null;
}

interface GalleryCarouselProps {
  albums: GalleryAlbumItem[];
  collegeName: string;
}

export function GalleryCarousel({ albums, collegeName }: GalleryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isCarousel = albums.length > 4;

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [albums]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 360;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className={styles.secAlt} aria-label="Campus Gallery">
      <div className="container">
        <div className={styles.secHeadWithNav}>
          <div className={styles.secHeadText}>
            <span className={styles.eyebrow}>Campus Gallery</span>
            <h2 className={styles.secTitle}>Life at {collegeName}</h2>
            <p className={styles.secSub}>Snapshots of campus life, annual cultural festivals, and achievements.</p>
          </div>
          {isCarousel && (
            <div className={styles.carouselNavControls}>
              <button
                type="button"
                className={`${styles.carouselArrowBtn} ${!canScrollLeft ? styles.carouselBtnDisabled : ''}`}
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                aria-label="Previous gallery albums"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className={`${styles.carouselArrowBtn} ${!canScrollRight ? styles.carouselBtnDisabled : ''}`}
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                aria-label="Next gallery albums"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        <div
          ref={scrollRef}
          className={isCarousel ? styles.galCarouselContainer : styles.galGrid}
        >
          {albums.map((album) => (
            <Link key={album.id} href={`/gallery/${album.slug}`} className={styles.galCard}>
              {album.coverImageUrl ? (
                <img src={album.coverImageUrl} alt={album.title} className={styles.galImg} loading="lazy" />
              ) : (
                <div className={styles.galFallback}>
                  <Camera size={36} />
                </div>
              )}
              <div className={styles.galOverlay}>
                <span className={styles.galLabel}>{album.title}</span>
                {album.category && <span className={styles.galCat}>{album.category}</span>}
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.secAction}>
          <Link href="/gallery" className={styles.btnOutlineDark}>
            <span>View Full Gallery</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
