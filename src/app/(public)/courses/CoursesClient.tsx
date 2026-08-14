'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, LayoutGrid, Table as TableIcon, Clock, GraduationCap, Users, ArrowRight, Sparkles, BookOpen, CheckCircle2, Award } from 'lucide-react';
import styles from './CoursesClient.module.css';

export interface CourseData {
  id: string;
  code: string;
  title: string;
  degreeType?: string | null;
  durationYears?: number | null;
  eligibility?: string | null;
  description?: string | null;
  departmentId?: string | null;
  intakeSeats?: number | null;
}

interface CoursesClientProps {
  initialCourses: CourseData[];
  collegeName: string;
}

const colorVariants = [
  styles.variantTerracotta,
  styles.variantEmerald,
  styles.variantSapphire,
  styles.variantGold,
  styles.variantViolet,
  styles.variantCyan,
];

export function CoursesClient({ initialCourses, collegeName }: CoursesClientProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter & Search Logic
  const filteredCourses = useMemo(() => {
    return initialCourses.filter((course) => {
      // Degree type level filter
      const type = (course.degreeType || '').toLowerCase();
      if (activeFilter === 'ug' && !type.includes('undergraduate') && !type.includes('bachelor') && !type.includes('b.')) {
        if (!type.includes('ug')) return false;
      }
      if (activeFilter === 'pg' && !type.includes('postgraduate') && !type.includes('master') && !type.includes('m.')) {
        if (!type.includes('pg')) return false;
      }
      if (activeFilter === 'phd' && !type.includes('doctoral') && !type.includes('phd') && !type.includes('doctor')) {
        return false;
      }
      if (activeFilter === 'diploma' && !type.includes('diploma') && !type.includes('certificate')) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(query);
        const matchesCode = course.code.toLowerCase().includes(query);
        const matchesEligibility = (course.eligibility || '').toLowerCase().includes(query);
        return matchesTitle || matchesCode || matchesEligibility;
      }

      return true;
    });
  }, [initialCourses, activeFilter, searchQuery]);

  return (
    <div className={styles.coursesPage}>
      <div className="container">
        {/* Executive Hero Banner */}
        <section className={styles.heroSec}>
          <div className={styles.heroBadge}>
            <Sparkles size={16} />
            <span>Academic Programmes Session 2026–27</span>
          </div>
          <h1 className={styles.heroTitle}>Courses &amp; Degree Programmes</h1>
          <p className={styles.heroSub}>
            Discover multi-disciplinary degree courses at {collegeName}. Aligned with the Choice-Based Credit System (NEP) for academic excellence and industry readiness.
          </p>

          <div className={styles.heroStatsGrid}>
            <div className={styles.heroStatCard}>
              <div className={styles.heroStatNum}>{initialCourses.length}+</div>
              <div className={styles.heroStatLabel}>Accredited Degree Courses</div>
            </div>
            <div className={styles.heroStatCard}>
              <div className={styles.heroStatNum}>100%</div>
              <div className={styles.heroStatLabel}>NEP Aligned Syllabus</div>
            </div>
            <div className={styles.heroStatCard}>
              <div className={styles.heroStatNum}>UG &amp; PG</div>
              <div className={styles.heroStatLabel}>Multi-Faculty Streams</div>
            </div>
            <div className={styles.heroStatCard}>
              <div className={styles.heroStatNum}>Direct</div>
              <div className={styles.heroStatLabel}>Placement Assistance</div>
            </div>
          </div>
        </section>

        {/* Filter & View Controls */}
        <div className={styles.controlsRow}>
          {/* Level Filter Tabs */}
          <div className={styles.filterTabs}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeFilter === 'all' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Programmes ({initialCourses.length})
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeFilter === 'ug' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveFilter('ug')}
            >
              Undergraduate (UG)
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeFilter === 'pg' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveFilter('pg')}
            >
              Postgraduate (PG)
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeFilter === 'phd' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveFilter('phd')}
            >
              Doctoral (PhD)
            </button>
          </div>

          {/* Search Box & Grid/Table View Switcher */}
          <div className={styles.searchAndViewGroup}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by program, code, or eligibility..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.viewToggleGroup}>
              <button
                type="button"
                className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                type="button"
                className={`${styles.viewBtn} ${viewMode === 'table' ? styles.viewBtnActive : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
                aria-label="Table View"
              >
                <TableIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Display */}
        {filteredCourses.length > 0 ? (
          viewMode === 'grid' ? (
            /* Multi-Color Grid View */
            <div className={styles.coursesGrid}>
              {filteredCourses.map((course, idx) => {
                const variantClass = colorVariants[idx % colorVariants.length];

                return (
                  <div key={course.id} className={`${styles.courseCard} ${variantClass}`}>
                    <div className={styles.cardHeader}>
                      <span className={styles.codeBadge}>{course.code || 'DEGREE'}</span>
                      <span className={styles.degreePill}>{course.degreeType || 'Undergraduate'}</span>
                    </div>

                    <h3 className={styles.courseTitle}>{course.title}</h3>
                    <div className={styles.departmentTag}>
                      <BookOpen size={14} style={{ display: 'inline', marginRight: '6px' }} />
                      <span>{collegeName}</span>
                    </div>

                    <div className={styles.specsGrid}>
                      <div className={styles.specItem}>
                        <Clock size={16} className={styles.specIcon} />
                        <span><strong>Duration:</strong> {course.durationYears || 3} Yrs</span>
                      </div>
                      <div className={styles.specItem}>
                        <Users size={16} className={styles.specIcon} />
                        <span><strong>Seats:</strong> {course.intakeSeats || 60}+</span>
                      </div>
                    </div>

                    <div className={styles.eligibilityBox}>
                      <strong>Eligibility Criteria:</strong>
                      <p style={{ marginTop: '4px', margin: 0 }}>
                        {course.eligibility || 'Passed 10+2 / Higher Secondary Examination from a recognized Board.'}
                      </p>
                    </div>

                    <div className={styles.cardFooter}>
                      <Link href="/admissions" className={styles.btnApply}>
                        <span>Apply Now</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Clean Data Table View */
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Program Title</th>
                    <th>Degree Level</th>
                    <th>Duration</th>
                    <th>Eligibility Criteria</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course.id}>
                      <td><span className={styles.codeBadge}>{course.code}</span></td>
                      <td style={{ fontWeight: 700, color: '#24221F' }}>{course.title}</td>
                      <td>{course.degreeType || 'UG'}</td>
                      <td>{course.durationYears || 3} Years</td>
                      <td>{course.eligibility || 'Passed 10+2 or Equivalent'}</td>
                      <td>
                        <Link href="/admissions" className={styles.btnApply} style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
                          <span>Apply</span>
                          <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 24px', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px dashed #DED4C5' }}>
            <GraduationCap size={44} style={{ color: '#C85A32', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#24221F' }}>No Courses Found</h3>
            <p style={{ color: '#68705A', marginTop: '6px' }}>Try adjusting your search criteria or switching degree level filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
