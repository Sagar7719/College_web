'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Camera, ArrowRight, Image as ImageIcon } from 'lucide-react';
import styles from './GalleryCarousel.module.css';

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

const colorVariants = [
  styles.variantTerracotta,
  styles.variantEmerald,
  styles.variantSapphire,
  styles.variantGold,
  styles.variantViolet,
  styles.variantRose,
];

export function GalleryCarousel({ albums, collegeName }: GalleryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Sync scroll position with active index dot
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft } = scrollRef.current;
    const cardWidth = 360 + 24; // card width + gap
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), albums.length - 1));
  }, [albums.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Industry Standard Auto-Play Carousel (Pauses on Hover)
  useEffect(() => {
    if (isHovered || albums.length <= 1) return;

    const timer = setInterval(() => {
      if (!scrollRef.current) return;
      const nextIndex = (activeIndex + 1) % albums.length;
      const cardWidth = 360 + 24;
      scrollRef.current.scrollTo({
        left: nextIndex * cardWidth,
        behavior: 'smooth',
      });
      setActiveIndex(nextIndex);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeIndex, isHovered, albums.length]);

  const scrollToCard = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = 360 + 24;
    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
    setActiveIndex(index);
  };

  return (
    <section className={styles.sec} aria-label="Campus Gallery">
      <div className="container">
        {/* Centered Section Header */}
        <div className={styles.secHeadCenter}>
          <span className={styles.eyebrow}>Campus Life & Moments</span>
          <h2 className={styles.secTitle}>Life at {collegeName}</h2>
          <p className={styles.secSub}>
            Snapshots of campus infrastructure, student festivals, athletic meets, and institutional events.
          </p>
        </div>

        {/* Carousel Viewport Canvas (No < > Arrow Buttons, Hidden Scrollbars) */}
        <div
          ref={scrollRef}
          className={styles.carouselViewport}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {albums.map((album, idx) => {
            const variantClass = colorVariants[idx % colorVariants.length];

            return (
              <Link
                key={album.id}
                href={`/gallery/${album.slug}`}
                className={`${styles.galCard} ${variantClass}`}
              >
                {/* Background Image / Fallback */}
                {album.coverImageUrl ? (
                  <img src={album.coverImageUrl} alt={album.title} className={styles.galImg} loading="lazy" />
                ) : (
                  <div className={styles.galFallback}>
                    <Camera size={44} />
                  </div>
                )}

                {/* Dark Gradient Overlay with Details */}
                <div className={styles.galOverlay}>
                  <div className={styles.galTopBadges}>
                    <span className={styles.galCat}>{album.category || 'CAMPUS GALLERY'}</span>
                    <div className={styles.galIconCircle}>
                      <ImageIcon size={18} />
                    </div>
                  </div>

                  <div className={styles.galBottomInfo}>
                    <h3 className={styles.galTitle}>{album.title}</h3>
                    <div className={styles.galCtaLink}>
                      <span>View Album</span>
                      <ArrowRight size={14} className={styles.arrowIcon} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Industry Standard Dot Pagination Bar */}
        {albums.length > 1 && (
          <div className={styles.dotsContainer}>
            {albums.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`${styles.dot} ${idx === activeIndex ? styles.activeDot : ''}`}
                onClick={() => scrollToCard(idx)}
                aria-label={`Go to album slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* View Full Gallery CTA */}
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
