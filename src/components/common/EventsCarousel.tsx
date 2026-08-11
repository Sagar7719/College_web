'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MapPin, Calendar, CalendarOff, ArrowRight } from 'lucide-react';
import styles from '@/app/(public)/home.module.css';

interface EventItem {
  id: string;
  title: string;
  eventDate: string;
  venue?: string | null;
  description?: string | null;
  bannerUrl?: string | null;
  registrationUrl?: string | null;
}

interface EventsCarouselProps {
  events: EventItem[];
}

function getEventDateParts(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate().toString().padStart(2, '0');
    return { month, day };
  } catch {
    return { month: 'AUG', day: '10' };
  }
}

export function EventsCarousel({ events }: EventsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isCarousel = events.length > 3;

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
  }, [events]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 380;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className={styles.sec} aria-label="Upcoming Events">
      <div className="container">
        <div className={styles.secHeadWithNav}>
          <div className={styles.secHeadText}>
            <span className={styles.eyebrow}>Campus Life</span>
            <h2 className={styles.secTitle}>Upcoming Events</h2>
          </div>
          <div className={styles.secHeadActions}>
            {isCarousel && (
              <div className={styles.carouselNavControls}>
                <button
                  type="button"
                  className={`${styles.carouselArrowBtn} ${!canScrollLeft ? styles.carouselBtnDisabled : ''}`}
                  onClick={() => handleScroll('left')}
                  disabled={!canScrollLeft}
                  aria-label="Previous events"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  className={`${styles.carouselArrowBtn} ${!canScrollRight ? styles.carouselBtnDisabled : ''}`}
                  onClick={() => handleScroll('right')}
                  disabled={!canScrollRight}
                  aria-label="Next events"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
            <Link href="/events" className={styles.btnOutlineDark}>
              <span>View All Events</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {events.length > 0 ? (
          <div
            ref={scrollRef}
            className={isCarousel ? styles.evCarouselContainer : styles.evGrid}
          >
            {events.map((evt) => {
              const { month, day } = getEventDateParts(evt.eventDate);
              return (
                <article key={evt.id} className={styles.evCard}>
                  <div className={styles.evBanner}>
                    {evt.bannerUrl ? (
                      <img src={evt.bannerUrl} alt={evt.title} className={styles.evImg} loading="lazy" />
                    ) : (
                      <div className={styles.evImgFallback}>
                        <Calendar size={32} />
                      </div>
                    )}
                    <div className={styles.evDateTag}>
                      <span className={styles.evDay}>{day}</span>
                      <span className={styles.evMon}>{month}</span>
                    </div>
                  </div>
                  <div className={styles.evBody}>
                    <p className={styles.evVenue}>
                      <MapPin size={14} className={styles.venueIcon} />
                      <span>{evt.venue || 'Main Auditorium'}</span>
                    </p>
                    <h3 className={styles.evTitle}>{evt.title}</h3>
                    {evt.description && (
                      <p className={styles.evDesc}>
                        {evt.description.slice(0, 100)}{evt.description.length > 100 ? '…' : ''}
                      </p>
                    )}
                    <div className={styles.evFoot}>
                      {evt.registrationUrl ? (
                        <a href={evt.registrationUrl} target="_blank" rel="noopener noreferrer" className={styles.btnSmall}>
                          <span>Register</span>
                          <ArrowRight size={14} />
                        </a>
                      ) : (
                        <Link href="/events" className={styles.btnSmallOutline}>
                          <span>Details</span>
                          <ArrowRight size={14} className={styles.progLinkArrow} />
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.evEmptyBox}>
            <div className={styles.ndEmptyIconBadge}>
              <CalendarOff size={28} />
            </div>
            <strong className={styles.ndEmptyTitle}>No Upcoming Events</strong>
            <p className={styles.ndEmptyDesc}>Check back soon for upcoming academic seminars, workshops, and cultural fests.</p>
          </div>
        )}
      </div>
    </section>
  );
}
