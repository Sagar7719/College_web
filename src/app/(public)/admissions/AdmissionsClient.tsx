'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
  Download,
  ChevronDown,
  ShieldCheck,
  FileCheck,
  Calendar,
} from 'lucide-react';
import { resolveIcon } from '@/lib/icon-resolver';
import { AdmissionsConfigData } from '@/types/enterprise-cms';
import { InteractiveDotGrid } from '@/components/common/InteractiveDotGrid';
import styles from '../inner.module.css';
import homeStyles from '../home.module.css';

interface AdmissionsClientProps {
  admissionsData: AdmissionsConfigData;
}

export function AdmissionsClient({ admissionsData }: AdmissionsClientProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const heroStats = admissionsData.heroStats || [];
  const steps = admissionsData.steps || [];
  const eligibilityTabs = admissionsData.eligibilityTabs || [];
  const [activeProgTab, setActiveProgTab] = useState<string>(
    eligibilityTabs[0]?.tabKey || 'ug'
  );
  const requiredDocuments = admissionsData.requiredDocuments || [];
  const schedule = admissionsData.schedule || [];
  const faqs = admissionsData.faqs || [];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const currentTabObj = eligibilityTabs.find((t) => t.tabKey === activeProgTab) || eligibilityTabs[0];

  return (
    <div className={styles.pageContainer}>
      {/* 1. HERO BANNER */}
      <section className={styles.admissionsHeroBanner}>
        <InteractiveDotGrid />
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.innerHeroGlassCard}>
              <div className={styles.heroBadge}>
                <Sparkles size={16} />
                <span>{admissionsData.hero.badgeText}</span>
              </div>
              <h1 className={styles.heroTitle}>{admissionsData.hero.title}</h1>
              <p className={styles.heroSubtitle}>{admissionsData.hero.subtitle}</p>
              <div className={styles.heroStatsRow}>
                {heroStats.map((stat, idx) => (
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

      {/* 2. STEP-BY-STEP ADMISSION JOURNEY */}
      {steps.length > 0 && (
        <section className={styles.journeySection}>
          <div className="container">
            <div className={styles.sectionHeaderCenter}>
              <span className={styles.eyebrow}>{admissionsData.stepsEyebrow}</span>
              <h2 className={styles.sectionTitle}>{admissionsData.stepsTitle}</h2>
              <p className={styles.sectionSub}>{admissionsData.stepsSubtitle}</p>
            </div>

            <div className={styles.stepsGrid}>
              {steps.map((step, idx) => (
                <div key={idx} className={styles.stepCard}>
                  <div className={styles.stepNumberBadge}>{String(idx + 1).padStart(2, '0')}</div>
                  <div className={styles.stepIconCircle}>
                    {resolveIcon(step.iconKey, 24)}
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. PROGRAMMES ELIGIBILITY TABBED OVERVIEW */}
      {eligibilityTabs.length > 0 && (
        <section className={styles.eligibilitySection}>
          <div className="container">
            <div className={styles.sectionHeaderCenter}>
              <span className={styles.eyebrow}>Academic Offerings</span>
              <h2 className={styles.sectionTitle}>Programme Eligibility & Overview</h2>
            </div>

            <div className={styles.tabContainerCenter}>
              {eligibilityTabs.map((tab) => (
                <button
                  key={tab.tabKey}
                  type="button"
                  className={`${styles.tabBtn} ${activeProgTab === tab.tabKey ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveProgTab(tab.tabKey)}
                >
                  {tab.tabLabel}
                </button>
              ))}
            </div>

            <div className={styles.eligibilityGrid}>
              {currentTabObj?.cards.map((card, idx) => (
                <div key={idx} className={styles.eligibilityCard}>
                  <div className={styles.eligibilityTop}>
                    <span className={styles.progTag}>{card.tag}</span>
                    <span className={styles.minMarksBadge}>{card.minMarks}</span>
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <ul className={styles.eligList}>
                    {card.criteria.map((crit, cIdx) => (
                      <li key={cIdx}>
                        <ShieldCheck size={14} /> {crit}
                      </li>
                    ))}
                  </ul>
                  <Link href="/courses" className={homeStyles.btnPrimaryTerracotta} style={{ marginTop: 'auto' }}>
                    <span>View Programme Details</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. MANDATORY DOCUMENTS & SCHEDULE */}
      <section className={styles.docsAndScheduleSection}>
        <div className="container">
          <div className={styles.twoColGrid}>
            {/* Required Documents */}
            <div className={styles.docBox}>
              <div className={styles.boxHeader}>
                <FileCheck size={22} className={styles.boxIcon} />
                <h3>Mandatory Documents Checklist</h3>
              </div>
              <p className={styles.boxDesc}>Keep scanned digital copies (PDF/JPEG) ready before starting your online application form:</p>
              <ul className={styles.checklist}>
                {requiredDocuments.map((docItem, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} className={styles.checkIcon} />
                    <span>{docItem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Admission Schedule Calendar */}
            <div className={styles.scheduleBox}>
              <div className={styles.boxHeader}>
                <Calendar size={22} className={styles.boxIcon} />
                <h3>Important Dates & Admission Schedule</h3>
              </div>
              <div className={styles.scheduleTable}>
                {schedule.map((sch, idx) => {
                  let badgeClass = styles.dateBadge;
                  if (sch.status === 'active') badgeClass = `${styles.dateBadge} ${styles.badgeActive}`;
                  else if (sch.status === 'progress') badgeClass = `${styles.dateBadge} ${styles.badgeProgress}`;
                  else if (sch.status === 'final') badgeClass = `${styles.dateBadge} ${styles.badgeFinal}`;

                  return (
                    <div key={idx} className={styles.scheduleRow}>
                      <div>
                        <strong>{sch.title}</strong>
                        <span>{sch.subtitle}</span>
                      </div>
                      <span className={badgeClass}>{sch.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) */}
      {faqs.length > 0 && (
        <section className={styles.faqSection}>
          <div className="container">
            <div className={styles.sectionHeaderCenter}>
              <span className={styles.eyebrow}>Got Questions?</span>
              <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
              <p className={styles.sectionSub}>Find quick answers to common queries regarding registration, eligibility, and fee submission.</p>
            </div>

            <div className={styles.faqAccordionList}>
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}>
                    <button
                      type="button"
                      className={styles.faqQuestionBtn}
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown size={18} className={`${styles.faqChevron} ${isOpen ? styles.faqChevronRotate : ''}`} />
                    </button>
                    {isOpen && (
                      <div className={styles.faqAnswerBody}>
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 6. ADMISSIONS HELPDESK & CTA BANNER */}
      <section className={styles.ctaBannerSection}>
        <div className="container">
          <div className={styles.ctaBannerCard}>
            <div className={styles.ctaBadge}>
              <PhoneCall size={16} />
              <span>Admission Helpdesk & Counseling Office</span>
            </div>
            <h2>{admissionsData.helpdeskCtaTitle}</h2>
            <p>{admissionsData.helpdeskCtaDesc}</p>
            <div className={styles.ctaBtns}>
              <Link href="/contact" className={homeStyles.btnPrimaryTerracotta}>
                <PhoneCall size={18} />
                <span>Contact Admission Office</span>
                <ArrowRight size={16} />
              </Link>
              <Link href="/downloads" className={homeStyles.btnOutlineDark}>
                <Download size={16} />
                <span>Download College Prospectus</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
