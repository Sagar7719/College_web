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
    setActiveIndex(Math.min(Math.max(index, 0), departments.length - 1));
  }, [departments.length, getCardStep]);

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
    if (isHovered || departments.length <= 1) return;

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
      const nextIndex = (activeIndex + 1) % departments.length;
      scrollToCard(nextIndex);
    }, 4500);

    return () => {
      clearInterval(timer);
      if (observer) observer.disconnect();
    };
  }, [activeIndex, isHovered, departments.length, scrollToCard]);

  return (
    <section id="departments" className={styles.sec} aria-label="Academic Departments">
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
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
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
