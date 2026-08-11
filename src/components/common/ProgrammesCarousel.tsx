'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Building2, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Course } from '@/types';
import styles from '@/app/(public)/home.module.css';

interface ProgrammesCarouselProps {
  courses: Course[];
}

export const ProgrammesCarousel: React.FC<ProgrammesCarouselProps> = ({ courses }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isCarousel = courses.length > 4;

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [courses]);

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = 350;
    const amount = direction === 'left' ? -cardWidth : cardWidth;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <section className={styles.sec} aria-label="Explore Our Programmes">
      <div className="container">
        {/* Section Header with Optional Carousel Arrows */}
        <div className={styles.secHeadRow}>
          <div>
            <span className={styles.eyebrow}>Academics</span>
            <h2 className={styles.secTitle}>Explore Our Programmes</h2>
            <p className={styles.secSub}>Select from our accredited degree programs designed for career readiness.</p>
          </div>

          {/* Carousel Controls (Active when > 4 courses) */}
          {isCarousel && (
            <div className={styles.carouselNavControls}>
              <button
                type="button"
                onClick={() => scrollByAmount('left')}
                className={`${styles.carouselArrowBtn} ${!canScrollLeft ? styles.carouselBtnDisabled : ''}`}
                disabled={!canScrollLeft}
                aria-label="Previous Courses"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount('right')}
                className={`${styles.carouselArrowBtn} ${!canScrollRight ? styles.carouselBtnDisabled : ''}`}
                disabled={!canScrollRight}
                aria-label="Next Courses"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Courses Container: Grid when <= 4, Scroll Carousel when > 4 */}
        <div
          ref={scrollRef}
          className={isCarousel ? styles.progCarouselContainer : styles.progGrid}
        >
          {courses.map((c) => (
            <div key={c.id} className={styles.progCard}>
              <div className={styles.progTop}>
                <span className={styles.progCode}>{c.code || 'BCA'}</span>
                <span className={styles.progBadge}>{c.degreeType || 'UG'}</span>
              </div>
              <h3 className={styles.progName}>{c.title}</h3>
              <p className={styles.progDesc}>
                {c.description || 'Structured academic curriculum building foundational expertise and practical competencies.'}
              </p>
              <div className={styles.progMeta}>
                <span className={styles.progMetaTag}>
                  <Clock size={14} className={styles.metaIcon} />
                  <span>{c.durationYears} {c.durationYears === 1 ? 'Year' : 'Years'}</span>
                </span>
                {c.departmentName && (
                  <span className={styles.progMetaTag}>
                    <Building2 size={14} className={styles.metaIcon} />
                    <span>{c.departmentName}</span>
                  </span>
                )}
              </div>
              <Link href="/courses" className={styles.progLink}>
                <span>View Programme Details</span>
                <ArrowRight size={16} className={styles.progLinkArrow} />
              </Link>
            </div>
          ))}
        </div>

        <div className={styles.secAction}>
          <Link href="/courses" className={styles.btnOutlineDark}>
            <span>View All Programmes</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};
