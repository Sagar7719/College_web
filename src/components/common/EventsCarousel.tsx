'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MapPin, Calendar, CalendarOff, ArrowRight } from 'lucide-react';
import styles from './EventsCarousel.module.css';

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

const colorVariants = [
  styles.variantTerracotta,
  styles.variantEmerald,
  styles.variantSapphire,
  styles.variantGold,
  styles.variantViolet,
  styles.variantRose,
];

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Sync scroll position with active index dot
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft } = scrollRef.current;
    const cardWidth = 360 + 24; // card width + gap
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), events.length - 1));
  }, [events.length]);

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
    if (isHovered || events.length <= 1) return;

    const timer = setInterval(() => {
      if (!scrollRef.current) return;
      const nextIndex = (activeIndex + 1) % events.length;
      const cardWidth = 360 + 24;
      scrollRef.current.scrollTo({
        left: nextIndex * cardWidth,
        behavior: 'smooth',
      });
      setActiveIndex(nextIndex);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeIndex, isHovered, events.length]);

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
    <section className={styles.sec} aria-label="Upcoming Events">
      <div className="container">
        {/* Centered Section Header */}
        <div className={styles.secHeadCenter}>
          <span className={styles.eyebrow}>Campus Life & Activities</span>
          <h2 className={styles.secTitle}>Upcoming Events</h2>
          <p className={styles.secSub}>
            Discover national conferences, cultural fests, recruitment drives, and student seminars.
          </p>
        </div>

        {events.length > 0 ? (
          <>
            {/* Carousel Viewport Canvas (No < > Arrow Buttons, Hidden Scrollbars) */}
            <div
              ref={scrollRef}
              className={styles.carouselViewport}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {events.map((evt, idx) => {
                const variantClass = colorVariants[idx % colorVariants.length];
                const { month, day } = getEventDateParts(evt.eventDate);

                return (
                  <article key={evt.id} className={`${styles.evCard} ${variantClass}`}>
                    {/* Banner Image & Floating Date Tag */}
                    <div className={styles.evBanner}>
                      {evt.bannerUrl ? (
                        <img src={evt.bannerUrl} alt={evt.title} className={styles.evImg} loading="lazy" />
                      ) : (
                        <div className={styles.evImgFallback}>
                          <Calendar size={40} />
                        </div>
                      )}
                      <div className={styles.evDateTag}>
                        <span className={styles.evDay}>{day}</span>
                        <span className={styles.evMon}>{month}</span>
                      </div>
                    </div>

                    {/* Event Details Body */}
                    <div className={styles.evBody}>
                      <div className={styles.evVenue}>
                        <MapPin size={14} className={styles.venueIcon} />
                        <span>{evt.venue || 'Main Auditorium'}</span>
                      </div>
                      <h3 className={styles.evTitle}>{evt.title}</h3>
                      <p className={styles.evDesc}>
                        {evt.description && evt.description.trim()
                          ? evt.description.length > 110
                            ? `${evt.description.slice(0, 110)}…`
                            : evt.description
                          : 'Official campus event featuring academic sessions, student activities, and networking opportunities.'}
                      </p>

                      {/* Footer Actions */}
                      <div className={styles.evFoot}>
                        {evt.registrationUrl ? (
                          <a href={evt.registrationUrl} target="_blank" rel="noopener noreferrer" className={styles.btnSmall}>
                            <span>Register Now</span>
                            <ArrowRight size={14} className={styles.arrowIcon} />
                          </a>
                        ) : (
                          <Link href="/events" className={styles.btnSmallOutline}>
                            <span>View Event Details</span>
                            <ArrowRight size={14} className={styles.arrowIcon} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Industry Standard Dot Pagination Bar */}
            {events.length > 1 && (
              <div className={styles.dotsContainer}>
                {events.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.dot} ${idx === activeIndex ? styles.activeDot : ''}`}
                    onClick={() => scrollToCard(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className={styles.evEmptyBox}>
            <div style={{ marginBottom: '12px', color: '#C85A32' }}>
              <CalendarOff size={36} />
            </div>
            <strong style={{ fontSize: '1.125rem', color: '#24221F', display: 'block', marginBottom: '4px' }}>
              No Upcoming Events Scheduled
            </strong>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>
              Check back soon for upcoming academic seminars, workshops, and campus festivals.
            </p>
          </div>
        )}

        {/* View All Events CTA */}
        <div className={styles.secAction}>
          <Link href="/events" className={styles.btnOutlineDark}>
            <span>View All Campus Events</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
