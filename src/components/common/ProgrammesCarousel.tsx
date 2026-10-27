'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Clock, Building2, ArrowRight, GraduationCap, Laptop, BookOpen, Microscope, BarChart3, Award } from 'lucide-react';
import { Course } from '@/types';
import styles from './ProgrammesCarousel.module.css';

interface ProgrammesCarouselProps {
  courses: Course[];
}

const colorVariants = [
  styles.variantTerracotta,
  styles.variantEmerald,
  styles.variantSapphire,
  styles.variantGold,
  styles.variantViolet,
  styles.variantRose,
];

const programIcons = [
  GraduationCap,
  Laptop,
  BarChart3,
  Microscope,
  BookOpen,
  Award,
];

export const ProgrammesCarousel: React.FC<ProgrammesCarouselProps> = ({ courses }) => {
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
    setActiveIndex(Math.min(Math.max(index, 0), courses.length - 1));
  }, [courses.length, getCardStep]);

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
    if (isHovered || courses.length <= 1) return;

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
      const nextIndex = (activeIndex + 1) % courses.length;
      scrollToCard(nextIndex);
    }, 4500);

    return () => {
      clearInterval(timer);
      if (observer) observer.disconnect();
    };
  }, [activeIndex, isHovered, courses.length, scrollToCard]);

  return (
    <section id="programmes" className={styles.sec} aria-label="Explore Our Programmes">
      <div className="container">
        {/* Centered Section Header */}
        <div className={styles.secHeadCenter}>
          <span className={styles.eyebrow}>Academic Excellence</span>
          <h2 className={styles.secTitle}>Explore Our Programmes</h2>
          <p className={styles.secSub}>
            Industry-aligned degree programmes designed for innovation, leadership, and lifelong career growth.
          </p>
        </div>

        {/* Carousel Viewport Canvas (No < > Arrow Buttons) */}
        <div
          ref={scrollRef}
          className={styles.carouselViewport}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          {courses.map((course, idx) => {
            const variantClass = colorVariants[idx % colorVariants.length];
            const IconComponent = programIcons[idx % programIcons.length];

            return (
              <div key={course.id} className={`${styles.progCard} ${variantClass}`}>
                {/* Top Bar with Dynamic Icon & Badges */}
                <div className={styles.progTop}>
                  <div className={styles.progIconBadge}>
                    <IconComponent size={24} />
                  </div>
                  <div className={styles.progBadgeGroup}>
                    <span className={styles.progCode}>{course.code || 'DEG'}</span>
                    <span className={styles.progDegreeType}>{course.degreeType || 'UG'}</span>
                  </div>
                </div>

                {/* Course Details */}
                <h3 className={styles.progName}>{course.title}</h3>
                <p className={styles.progDesc}>
                  {course.description ||
                    'Comprehensive degree curriculum delivering advanced domain knowledge, practical lab training, and industry project experience.'}
                </p>

                {/* Metadata Tags */}
                <div className={styles.progMeta}>
                  <span className={styles.progMetaTag}>
                    <Clock size={14} className={styles.metaIcon} />
                    <span>{course.durationYears} {course.durationYears === 1 ? 'Year' : 'Years'}</span>
                  </span>
                  {course.departmentName && (
                    <span className={styles.progMetaTag}>
                      <Building2 size={14} className={styles.metaIcon} />
                      <span>{course.departmentName}</span>
                    </span>
                  )}
                </div>

                {/* Footer Action */}
                <div className={styles.progFooter}>
                  <Link href="/courses" className={styles.progLink}>
                    <span>View Programme</span>
                    <ArrowRight size={16} className={styles.progArrowIcon} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Industry Standard Dot Pagination Bar */}
        {courses.length > 1 && (
          <div className={styles.dotsContainer}>
            {courses.map((_, idx) => (
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

        {/* View All Programmes CTA */}
        <div className={styles.secAction}>
          <Link href="/courses" className={styles.btnOutlineDark}>
            <span>View All Programmes & Syllabi</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};
