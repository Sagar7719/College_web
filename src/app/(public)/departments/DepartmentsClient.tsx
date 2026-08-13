'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  UserCheck,
  BookOpen,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Microscope,
  Award,
  Mail,
  Compass,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Department } from '@/types';
import { InteractiveDotGrid } from '@/components/common/InteractiveDotGrid';
import styles from '../inner.module.css';
import homeStyles from '../home.module.css';

interface DepartmentsClientProps {
  initialDepartments: Department[];
}

export function DepartmentsClient({ initialDepartments }: DepartmentsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'tech' | 'commerce' | 'sciences'>('all');

  const departmentsList = initialDepartments || [];

  const filteredDepartments = useMemo(() => {
    return departmentsList.filter((dept) => {
      const matchesSearch =
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dept.description && dept.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (dept.hodName && dept.hodName.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeTab === 'tech') {
        return dept.code.includes('CS') || dept.code.includes('IT') || dept.name.toLowerCase().includes('computer');
      }
      if (activeTab === 'commerce') {
        return dept.code.includes('COMM') || dept.name.toLowerCase().includes('commerce') || dept.name.toLowerCase().includes('management');
      }
      if (activeTab === 'sciences') {
        return dept.code.includes('SCI') || dept.name.toLowerCase().includes('science') || dept.name.toLowerCase().includes('physics');
      }

      return true;
    });
  }, [departmentsList, searchQuery, activeTab]);

  return (
    <div className={styles.pageContainer}>
      {/* 1. EXECUTIVE HERO BANNER */}
      <section className={styles.heroBanner}>
        <InteractiveDotGrid />
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.innerHeroGlassCard}>
              <div className={styles.heroBadge}>
                <Sparkles size={16} />
                <span>Academic Divisions & Faculties</span>
              </div>
              <h1 className={styles.heroTitle}>Our Academic Departments</h1>
              <p className={styles.heroSubtitle}>
                Discover state-of-the-art faculties, research laboratories, distinguished mentors, and specialized degree paths designed for industry excellence.
              </p>
              <div className={styles.heroStatsRow}>
                <div className={styles.heroStatItem}>
                  <Building2 size={20} className={styles.statIcon} />
                  <div>
                    <strong>{departmentsList.length}+ Accredited</strong>
                    <span>Academic Departments</span>
                  </div>
                </div>
                <div className={styles.heroStatItem}>
                  <Microscope size={20} className={styles.statIcon} />
                  <div>
                    <strong>Modern Labs</strong>
                    <span>Tech & Research Centers</span>
                  </div>
                </div>
                <div className={styles.heroStatItem}>
                  <GraduationCap size={20} className={styles.statIcon} />
                  <div>
                    <strong>UG & PG Degrees</strong>
                    <span>Industry Aligned</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <section className={styles.filterSection}>
        <div className="container">
          <div className={styles.toolbarBox}>
            <div className={styles.searchWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search department by name, code, or HOD..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => setSearchQuery('')}
                >
                  Clear
                </button>
              )}
            </div>

            <div className={styles.categoryTabs}>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Faculties ({departmentsList.length})
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'tech' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('tech')}
              >
                Computer & Tech
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'commerce' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('commerce')}
              >
                Commerce & Business
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'sciences' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('sciences')}
              >
                Physical Sciences
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DEPARTMENTS GRID */}
      <section className={styles.contentSection}>
        <div className="container">
          {filteredDepartments.length > 0 ? (
            <div className={styles.deptCardGrid}>
              {filteredDepartments.map((dept) => (
                <article key={dept.id} className={styles.deptExecutiveCard}>
                  <div className={styles.deptCardHeader}>
                    <div className={styles.deptCodeBadge}>
                      <Building2 size={16} />
                      <span>{dept.code}</span>
                    </div>
                    <div className={styles.deptIconCircle}>
                      <Layers size={20} />
                    </div>
                  </div>

                  <h2 className={styles.deptCardTitle}>{dept.name}</h2>
                  <p className={styles.deptCardDesc}>
                    {dept.description || 'Fostering academic rigor, research innovation, and specialized practical skills.'}
                  </p>

                  {/* HOD INFORMATION CARD BLOCK */}
                  <div className={styles.hodBlock}>
                    <div className={styles.hodAvatar}>
                      <UserCheck size={18} />
                    </div>
                    <div className={styles.hodDetails}>
                      <span className={styles.hodLabel}>Head of Department</span>
                      <strong className={styles.hodName}>{dept.hodName || 'Mr. Sagar Ulagadde'}</strong>
                      {dept.hodEmail && (
                        <a href={`mailto:${dept.hodEmail}`} className={styles.hodEmailLink}>
                          <Mail size={12} />
                          <span>{dept.hodEmail}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* ACTION LINKS */}
                  <div className={styles.deptCardFooter}>
                    <Link href={`/courses?dept=${dept.id}`} className={homeStyles.btnPrimaryTerracotta} style={{ flex: 1, justifyContent: 'center' }}>
                      <BookOpen size={16} />
                      <span>Explore Courses</span>
                      <ArrowRight size={14} />
                    </Link>
                    <Link href={`/faculty?dept=${dept.id}`} className={homeStyles.btnOutlineDark} title="View Faculty Directory">
                      <Users size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyResultsBox}>
              <Building2 size={44} className={styles.emptyIcon} />
              <h3>No Departments Found</h3>
              <p>No academic department matches your search filter "{searchQuery}".</p>
              <button
                type="button"
                className={homeStyles.btnOutlineDark}
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                }}
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. ACADEMIC HIGHLIGHTS STRIP */}
      <section className={styles.highlightsSection}>
        <div className="container">
          <div className={styles.highlightsHead}>
            <span className={styles.eyebrow}>Academic Leadership</span>
            <h2 className={styles.sectionTitle}>Pillars of Departmental Excellence</h2>
          </div>
          <div className={styles.highlightsGrid}>
            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}>
                <BookOpen size={24} />
              </div>
              <h3>Rigorous Curriculum</h3>
              <p>Comprehensive undergraduate & postgraduate degree paths aligned with UGC and industry standards.</p>
            </div>
            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}>
                <Microscope size={24} />
              </div>
              <h3>Advanced Laboratories</h3>
              <p>State-of-the-art computer science labs, chemical research suites, and high-performance computing.</p>
            </div>
            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}>
                <Award size={24} />
              </div>
              <h3>Distinguished Faculty</h3>
              <p>Accomplished educators, active researchers, and Ph.D. scholars fostering critical inquiry.</p>
            </div>
            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}>
                <GraduationCap size={24} />
              </div>
              <h3>Career & Placement Support</h3>
              <p>Dedicated career guidance cell driving campus recruitment drives with leading recruiters.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ADMISSIONS CTA BANNER */}
      <section className={styles.ctaBannerSection}>
        <div className="container">
          <div className={styles.ctaBannerCard}>
            <div className={styles.ctaBadge}>
              <Sparkles size={16} />
              <span>Admissions 2026–27 Session</span>
            </div>
            <h2>Ready to Join an Academic Department?</h2>
            <p>Applications are now open for all undergraduate and postgraduate degree programmes.</p>
            <div className={styles.ctaBtns}>
              <Link href="/admissions" className={homeStyles.btnPrimaryTerracotta}>
                <GraduationCap size={18} />
                <span>Apply Online Now</span>
                <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className={homeStyles.btnOutlineDark}>
                <Compass size={16} />
                <span>Contact Helpdesk</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
