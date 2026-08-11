'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Building2, UserCheck, ArrowRight } from 'lucide-react';
import styles from '@/app/(public)/home.module.css';

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

export function DepartmentsCarousel({ departments }: DepartmentsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isCarousel = departments.length > 4;

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
  }, [departments]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 360;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className={styles.secAlt} aria-label="Academic Departments">
      <div className="container">
        <div className={styles.secHeadWithNav}>
          <div className={styles.secHeadText}>
            <span className={styles.eyebrow}>Departments</span>
            <h2 className={styles.secTitle}>Academic Departments</h2>
            <p className={styles.secSub}>Hubs of specialized study, interdisciplinary research, and academic leadership.</p>
          </div>
          {isCarousel && (
            <div className={styles.carouselNavControls}>
              <button
                type="button"
                className={`${styles.carouselArrowBtn} ${!canScrollLeft ? styles.carouselBtnDisabled : ''}`}
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                aria-label="Previous departments"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className={`${styles.carouselArrowBtn} ${!canScrollRight ? styles.carouselBtnDisabled : ''}`}
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                aria-label="Next departments"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        <div
          ref={scrollRef}
          className={isCarousel ? styles.progCarouselContainer : styles.deptGrid}
        >
          {departments.map((dept) => (
            <div key={dept.id} className={styles.deptCard}>
              <div className={styles.deptTop}>
                <span className={styles.deptBadge}>{dept.code}</span>
                <div className={styles.deptIconBadge}>
                  <Building2 size={18} />
                </div>
              </div>
              <h3 className={styles.deptName}>{dept.name}</h3>
              <p className={styles.deptDesc}>
                {dept.description || 'Advancing academic rigor, interdisciplinary studies, and research.'}
              </p>
              {dept.hodName && (
                <div className={styles.deptHodTag}>
                  <UserCheck size={14} className={styles.metaIcon} />
                  <span><strong>Head:</strong> {dept.hodName}</span>
                </div>
              )}
              <Link href={`/courses?dept=${dept.id}`} className={styles.deptLink}>
                <span>Explore Courses</span>
                <ArrowRight size={14} className={styles.progLinkArrow} />
              </Link>
            </div>
          ))}
        </div>

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
