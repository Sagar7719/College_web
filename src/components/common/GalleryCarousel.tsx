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

  const getCardStep = useCallback(() => {
    if (!scrollRef.current) return 384;
    const firstCard = scrollRef.current.firstElementChild as HTMLElement;
    if (!firstCard) return 384;
    const gap = typeof window !== 'undefined' && window.innerWidth < 640 ? 16 : 24;
    return firstCard.offsetWidth + gap;
  }, []);

  // Sync scroll position with active index dot
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft } = scrollRef.current;
    const step = getCardStep();
    const index = Math.round(scrollLeft / step);
    setActiveIndex(Math.min(Math.max(index, 0), albums.length - 1));
  }, [albums.length, getCardStep]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const scrollToCard = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const targetCard = scrollRef.current.children[index] as HTMLElement;
    if (targetCard) {
      const targetLeft =
        targetCard.offsetParent === scrollRef.current
          ? targetCard.offsetLeft
          : targetCard.offsetLeft - scrollRef.current.offsetLeft;
      scrollRef.current.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: 'smooth',
      });
    } else {
      const step = getCardStep();
      scrollRef.current.scrollTo({
        left: index * step,
        behavior: 'smooth',
      });
    }
    setActiveIndex(index);
  }, [getCardStep]);

  // Industry Standard Auto-Play Carousel (Pauses when off-screen or on Hover)
  useEffect(() => {
    if (isHovered || albums.length <= 1) return;

    let isVisible = true;
    let observer: IntersectionObserver | null = null;

    if (typeof IntersectionObserver !== 'undefined' && scrollRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
        },
        { threshold: 0.1 }
      );
      observer.observe(scrollRef.current);
    }

    const timer = setInterval(() => {
      if (!scrollRef.current || !isVisible) return;
      const nextIndex = (activeIndex + 1) % albums.length;
      scrollToCard(nextIndex);
    }, 4500);

    return () => {
      clearInterval(timer);
      if (observer) observer.disconnect();
    };
  }, [activeIndex, isHovered, albums.length, scrollToCard]);

  return (
    <section id="gallery" className={styles.sec} aria-label="Campus Gallery">
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
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
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
