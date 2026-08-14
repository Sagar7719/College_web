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

  // Sync scroll position with active index dot
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const cardWidth = 360 + 24; // card width + gap
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), courses.length - 1));
  }, [courses.length]);

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
    if (isHovered || courses.length <= 1) return;

    const timer = setInterval(() => {
      if (!scrollRef.current) return;
      const nextIndex = (activeIndex + 1) % courses.length;
      const cardWidth = 360 + 24;
      scrollRef.current.scrollTo({
        left: nextIndex * cardWidth,
        behavior: 'smooth',
      });
      setActiveIndex(nextIndex);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeIndex, isHovered, courses.length]);

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
    <section className={styles.sec} aria-label="Explore Our Programmes">
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
