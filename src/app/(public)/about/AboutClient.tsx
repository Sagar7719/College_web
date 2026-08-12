'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Award,
  GraduationCap,
  Microscope,
  Building2,
  CheckCircle2,
  Target,
  Compass,
  UserCheck,
  Quote,
  ShieldCheck,
  Users,
  BookOpen,
  ArrowRight,
  Landmark,
} from 'lucide-react';
import styles from '../inner.module.css';
import homeStyles from '../home.module.css';

interface AboutClientProps {
  collegeInfo: {
    name?: string;
    establishedYear?: string | number;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    description?: string;
    principalName?: string;
    principalDesignation?: string;
    principalPhotoUrl?: string;
    principalMessage?: string;
    logoUrl?: string;
  };
}

export function AboutClient({ collegeInfo }: AboutClientProps) {
  const collegeName = collegeInfo.name || 'Jaysingpur College';
  const estYear = collegeInfo.establishedYear || '1972';
  const fullAddress = [collegeInfo.address || 'Campus Address, University District pune', collegeInfo.city || 'Pune', collegeInfo.state || 'MH']
    .filter(Boolean)
    .join(', ');

  const principalName = collegeInfo.principalName || 'Dr. Sagar Ulagadde';
  const principalRole = collegeInfo.principalDesignation || 'Principal & Administrative Officer';
  const principalMessage =
    collegeInfo.principalMessage ||
    'Welcome to our esteemed institution. We are committed to fostering academic rigor, ethical values, and research innovation to empower our students for a globally connected world.';

  return (
    <div className={styles.pageContainer}>
      {/* 1. HERO BANNER */}
      <section className={styles.heroBanner}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <Sparkles size={16} />
              <span>Established Institution of Academic Excellence</span>
            </div>
            <h1 className={styles.heroTitle}>About {collegeName}</h1>
            <p className={styles.heroSubtitle}>
              Established in {estYear}, our institution stands as a beacon of academic distinction, research innovation, and holistic student empowerment.
            </p>
            <div className={styles.heroStatsRow}>
              <div className={styles.heroStatItem}>
                <Award size={20} className={styles.statIcon} />
                <div>
                  <strong>NAAC Accredited</strong>
                  <span>UGC 2(f) & 12(B) Recognized</span>
                </div>
              </div>
              <div className={styles.heroStatItem}>
                <GraduationCap size={20} className={styles.statIcon} />
                <div>
                  <strong>50,000+ Alumni</strong>
                  <span>Global Professional Network</span>
                </div>
              </div>
              <div className={styles.heroStatItem}>
                <Landmark size={20} className={styles.statIcon} />
                <div>
                  <strong>Est. {estYear}</strong>
                  <span>50+ Years of Legacy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OVERVIEW & VISION MISSION GRID */}
      <section className={styles.contentSection} style={{ paddingTop: '56px' }}>
        <div className="container">
          <div className={styles.twoColGrid} style={{ gap: '36px' }}>
            {/* Left: Legacy & Overview Card */}
            <div className={styles.docBox} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className={styles.boxHeader}>
                <Building2 size={24} className={styles.boxIcon} />
                <h3>Institutional Legacy & Heritage</h3>
              </div>
              <p className={styles.boxDesc} style={{ fontSize: '0.96875rem', lineHeight: 1.7, color: '#24221F', fontWeight: 500 }}>
                {collegeInfo.description ||
                  `${collegeName} is a premier higher education institution dedicated to empowering students through multi-disciplinary academic programmes in Science, Technology, Commerce, and Humanities.`}
              </p>
              <ul className={styles.checklist} style={{ marginTop: 'auto', paddingTop: '20px' }}>
                <li>
                  <CheckCircle2 size={16} className={styles.checkIcon} />
                  <span>Affiliated to State Public University with UGC Accreditation.</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className={styles.checkIcon} />
                  <span>State-of-the-art computing laboratories and digital library archives.</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className={styles.checkIcon} />
                  <span>Proactive Industry Internship & Campus Placement Division.</span>
                </li>
              </ul>
            </div>

            {/* Right: Vision & Mission Card */}
            <div className={styles.scheduleBox} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className={styles.boxHeader}>
                <Target size={24} className={styles.boxIcon} />
                <h3>Vision & Mission Statement</h3>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <span className={styles.detailLabel} style={{ color: 'var(--color-accent)' }}>OUR VISION</span>
                <p style={{ fontSize: '0.9375rem', color: '#68705A', lineHeight: 1.65, marginTop: '4px' }}>
                  To be a center of academic distinction, nurturing scientific inquiry, technological innovation, research excellence, and ethical leadership in every discipline.
                </p>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <span className={styles.detailLabel} style={{ color: 'var(--color-accent)' }}>OUR MISSION</span>
                <p style={{ fontSize: '0.9375rem', color: '#68705A', lineHeight: 1.65, marginTop: '4px' }}>
                  Providing accessible, high-quality higher education tailored to modern societal demands, fostering critical thinking, character building, and career preparedness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRINCIPAL'S DESK & LEADERSHIP MESSAGE */}
      <section className={styles.highlightsSection}>
        <div className="container">
          <div className={styles.ctaBannerCard} style={{ maxWidth: '920px', textAlign: 'left', alignItems: 'stretch', padding: '44px 40px' }}>
            <div className={styles.boxHeader} style={{ marginBottom: '24px' }}>
              <Quote size={28} className={styles.boxIcon} />
              <div>
                <span className={styles.eyebrow}>Leadership Message</span>
                <h2 style={{ fontSize: '1.75rem', margin: 0 }}>From the Principal&apos;s Desk</h2>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div className={styles.hodAvatar} style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#F4EBE6', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {collegeInfo.principalPhotoUrl ? (
                  <img src={collegeInfo.principalPhotoUrl} alt={principalName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <UserCheck size={36} />
                )}
              </div>

              <div style={{ flex: 1, minWidth: '260px' }}>
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: '#24221F', margin: '0 0 4px 0' }}>
                  {principalName}
                </h3>
                <span style={{ fontSize: '0.84375rem', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {principalRole}
                </span>
                <blockquote style={{ fontSize: '1rem', fontStyle: 'italic', color: '#24221F', lineHeight: 1.7, marginTop: '16px', borderLeft: '3px solid var(--color-accent)', paddingLeft: '16px', margin: '16px 0 0 0' }}>
                  &ldquo;{principalMessage}&rdquo;
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PILLARS OF INSTITUTIONAL GOVERNANCE */}
      <section className={styles.highlightsSection} style={{ backgroundColor: '#FFFFFF', borderTop: 'none', borderBottom: '1px solid rgba(222, 212, 197, 0.6)' }}>
        <div className="container">
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.eyebrow}>Institutional Core</span>
            <h2 className={styles.sectionTitle}>Pillars of Academic Distinction</h2>
          </div>

          <div className={styles.highlightsGrid}>
            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}>
                <BookOpen size={24} />
              </div>
              <h3>NEP Aligned Syllabus</h3>
              <p>Choice-based credit systems and outcome-based curriculum designed for modern careers.</p>
            </div>

            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}>
                <Microscope size={24} />
              </div>
              <h3>Research & Innovation</h3>
              <p>Dedicated research labs, funded faculty projects, and national symposium publications.</p>
            </div>

            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}>
                <ShieldCheck size={24} />
              </div>
              <h3>Inclusive & Safe Campus</h3>
              <p>Zero-tolerance anti-ragging policy, women empowerment cell, and student counseling.</p>
            </div>

            <div className={styles.highlightCard}>
              <div className={styles.highlightIcon}>
                <Users size={24} />
              </div>
              <h3>Global Alumni Network</h3>
              <p>Active mentorship and campus recruitment by leading industrial and technology recruiters.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ADMISSIONS & CONTACT CTA BANNER */}
      <section className={styles.ctaBannerSection} style={{ marginTop: '56px' }}>
        <div className="container">
          <div className={styles.ctaBannerCard}>
            <div className={styles.ctaBadge}>
              <Sparkles size={16} />
              <span>Start Your Journey</span>
            </div>
            <h2>Become Part of Our Academic Heritage</h2>
            <p>Applications for the 2026–27 academic session are now open across all departments.</p>
            <div className={styles.ctaBtns}>
              <Link href="/admissions" className={homeStyles.btnPrimaryTerracotta}>
                <GraduationCap size={18} />
                <span>Apply Online Now</span>
                <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className={homeStyles.btnOutlineDark}>
                <Compass size={16} />
                <span>Contact Campus Helpdesk</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
