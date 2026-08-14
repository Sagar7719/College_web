'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Building2, UserCheck, ArrowRight, BookOpen, Microscope, Sparkles, Binary, Cpu, Compass } from 'lucide-react';
import styles from './DepartmentsCarousel.module.css';

interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  hodName?: string | null;
}

interface DepartmentsCarouselProps {
  departments: DepartmentItem[];
}

const colorVariants = [
  styles.variantTerracotta,
  styles.variantEmerald,
  styles.variantSapphire,
  styles.variantGold,
  styles.variantViolet,
  styles.variantCyan,
];

const departmentIcons = [
  Cpu,
  Microscope,
  Binary,
  BookOpen,
  Sparkles,
  Compass,
  Building2,
];

export function DepartmentsCarousel({ departments }: DepartmentsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Sync scroll position with active index dot
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft } = scrollRef.current;
    const cardWidth = 360 + 24; // card width + gap
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), departments.length - 1));
  }, [departments.length]);

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
    if (isHovered || departments.length <= 1) return;

    const timer = setInterval(() => {
      if (!scrollRef.current) return;
      const nextIndex = (activeIndex + 1) % departments.length;
      const cardWidth = 360 + 24;
      scrollRef.current.scrollTo({
        left: nextIndex * cardWidth,
        behavior: 'smooth',
      });
      setActiveIndex(nextIndex);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeIndex, isHovered, departments.length]);

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
    <section className={styles.sec} aria-label="Academic Departments">
      <div className="container">
        {/* Centered Section Header */}
        <div className={styles.secHeadCenter}>
          <span className={styles.eyebrow}>Specialized Faculties</span>
          <h2 className={styles.secTitle}>Academic Departments</h2>
          <p className={styles.secSub}>
            Hubs of specialized study, pioneering interdisciplinary research, and academic excellence.
          </p>
        </div>

        {/* Carousel Viewport Canvas (No < > Arrow Buttons, Hidden Scrollbars) */}
        <div
          ref={scrollRef}
          className={styles.carouselViewport}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {departments.map((dept, idx) => {
            const variantClass = colorVariants[idx % colorVariants.length];
            const IconComponent = departmentIcons[idx % departmentIcons.length];

            return (
              <div key={dept.id} className={`${styles.deptCard} ${variantClass}`}>
                {/* Top Bar with Badge & Icon */}
                <div className={styles.deptTop}>
                  <span className={styles.deptBadge}>{dept.code || 'DEPT'}</span>
                  <div className={styles.deptIconBadge}>
                    <IconComponent size={24} />
                  </div>
                </div>

                {/* Department Name & Description */}
                <h3 className={styles.deptName}>{dept.name}</h3>
                <p className={styles.deptDesc}>
                  {dept.description ||
                    'Advancing academic rigor, innovative laboratory experimentation, and industry research collaborations.'}
                </p>

                {/* Head of Department Tag */}
                {dept.hodName && (
                  <div className={styles.deptHodTag}>
                    <UserCheck size={16} className={styles.hodIcon} />
                    <span>
                      <strong>Head:</strong> {dept.hodName}
                    </span>
                  </div>
                )}

                {/* Footer Action */}
                <div className={styles.deptFooter}>
                  <Link href={`/courses?dept=${dept.id}`} className={styles.deptLink}>
                    <span>Explore Courses</span>
                    <ArrowRight size={16} className={styles.arrowIcon} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Industry Standard Dot Pagination Bar */}
        {departments.length > 1 && (
          <div className={styles.dotsContainer}>
            {departments.map((_, idx) => (
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

        {/* View All Departments CTA */}
        <div className={styles.secAction}>
          <Link href="/departments" className={styles.btnOutlineDark}>
            <span>View All Departments</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
