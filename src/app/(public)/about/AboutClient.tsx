'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  UserCheck,
  Quote,
  ArrowRight,
  GraduationCap,
  Compass,
  Building2,
  Target,
} from 'lucide-react';
import { resolveIcon } from '@/lib/icon-resolver';
import { AboutPageConfigData } from '@/types/enterprise-cms';
import { CollegeInfo } from '@/types';
import { InteractiveDotGrid } from '@/components/common/InteractiveDotGrid';
import styles from '../inner.module.css';
import homeStyles from '../home.module.css';

interface AboutClientProps {
  collegeInfo: Partial<CollegeInfo>;
  aboutData: AboutPageConfigData;
}

export function AboutClient({ collegeInfo, aboutData }: AboutClientProps) {
  const collegeName = collegeInfo.name || 'Jaysingpur College';
  const estYear = collegeInfo.establishedYear || '1972';

  const principalName = collegeInfo.principalName || aboutData.principalDesk.name;
  const principalRole = collegeInfo.principalDesignation || aboutData.principalDesk.designation;
  const principalPhoto = collegeInfo.principalPhotoUrl || aboutData.principalDesk.photoUrl;
  const principalMessage = collegeInfo.principalMessage || aboutData.principalDesk.message;

  const vision = collegeInfo.vision || aboutData.visionMission.vision;
  const mission = collegeInfo.mission || aboutData.visionMission.mission;

  return (
    <div className={styles.pageContainer}>
      {/* 1. HERO BANNER */}
      <section className={styles.heroBanner}>
        <InteractiveDotGrid />
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.innerHeroGlassCard}>
              <div className={styles.heroBadge}>
                <Sparkles size={16} />
                <span>{aboutData.hero.badgeText}</span>
              </div>
              <h1 className={styles.heroTitle}>{aboutData.hero.title}</h1>
              <p className={styles.heroSubtitle}>{aboutData.hero.subtitle}</p>
              <div className={styles.heroStatsRow}>
                {aboutData.heroStats.map((stat, idx) => (
                  <div key={idx} className={styles.heroStatItem}>
                    {resolveIcon(stat.iconKey, 20, 1.8, styles.statIcon)}
                    <div>
                      <strong>{stat.label}</strong>
                      {stat.sublabel && <span>{stat.sublabel}</span>}
                    </div>
                  </div>
                ))}
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
                <h3>{aboutData.legacyOverview.title}</h3>
              </div>
              <p className={styles.boxDesc} style={{ fontSize: '0.96875rem', lineHeight: 1.7, color: '#24221F', fontWeight: 500 }}>
                {collegeInfo.description || aboutData.legacyOverview.description}
              </p>
              <ul className={styles.checklist} style={{ marginTop: 'auto', paddingTop: '20px' }}>
                {aboutData.legacyOverview.highlights.map((item, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} className={styles.checkIcon} />
                    <span>{item}</span>
                  </li>
                ))}
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
                  {vision}
                </p>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <span className={styles.detailLabel} style={{ color: 'var(--color-accent)' }}>OUR MISSION</span>
                <p style={{ fontSize: '0.9375rem', color: '#68705A', lineHeight: 1.65, marginTop: '4px' }}>
                  {mission}
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
                {principalPhoto ? (
                  <img src={principalPhoto} alt={principalName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <UserCheck size={36} />
                )}
              </div>

              <div style={{ flex: 1, minWidth: '260px' }}>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.3rem', fontWeight: 800, color: '#24221F', margin: '0 0 4px 0' }}>
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
            <h2 className={styles.sectionTitle}>{aboutData.pillarsTitle}</h2>
          </div>

          <div className={styles.highlightsGrid}>
            {aboutData.pillars.map((pillar, idx) => (
              <div key={idx} className={styles.highlightCard}>
                <div className={styles.highlightIcon}>
                  {resolveIcon(pillar.iconKey, 24)}
                </div>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </div>
            ))}
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
            <h2>{aboutData.ctaBannerTitle}</h2>
            <p>{aboutData.ctaBannerDesc}</p>
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
