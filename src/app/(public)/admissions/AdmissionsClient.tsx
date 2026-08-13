'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  FileText,
  CheckCircle2,
  UserCheck,
  Award,
  ArrowRight,
  GraduationCap,
  Calendar,
  Clock,
  HelpCircle,
  PhoneCall,
  Download,
  BookOpen,
  ChevronDown,
  ShieldCheck,
  MapPin,
  Mail,
  FileCheck,
} from 'lucide-react';
import { InteractiveDotGrid } from '@/components/common/InteractiveDotGrid';
import styles from '../inner.module.css';
import homeStyles from '../home.module.css';

interface FAQItem {
  question: string;
  answer: string;
}

const ADMISSION_FAQS: FAQItem[] = [
  {
    question: 'How do I submit my online application form for 2026-27?',
    answer: 'Click on the "Apply Online Now" button on this page to register on our admission portal. Fill in your personal and academic details, upload required marksheets, and submit the online application fee.',
  },
  {
    question: 'What are the minimum eligibility criteria for Undergraduate (BCA/B.Sc/B.Com/B.A) courses?',
    answer: 'Candidates must have passed 10+2 (Higher Secondary Certificate) or equivalent examination from a recognized board with minimum 45% aggregate marks (40% for reserved category candidates).',
  },
  {
    question: 'Can I apply for more than one degree programme?',
    answer: 'Yes, prospective students can select up to 3 preferred degree specializations in a single application registration form.',
  },
  {
    question: 'When will the merit list be published?',
    answer: 'The first merit list for the 2026–27 session will be published on August 05, 2026 on our official portal and campus bulletin board.',
  },
  {
    question: 'Is hostel accommodation and bus transportation available for outstation students?',
    answer: 'Yes, Jaysingpur College provides dedicated boys & girls hostel facilities, sports complex, central library, and bus transportation routes across neighboring districts.',
  },
];

export function AdmissionsClient() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeProgTab, setActiveProgTab] = useState<'ug' | 'pg' | 'diploma'>('ug');

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

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
                <span>Admissions Session 2026 – 2027 Now Open</span>
              </div>
              <h1 className={styles.heroTitle}>Admission Process & Guidelines</h1>
              <p className={styles.heroSubtitle}>
                Step-by-step guidance, merit eligibility criteria, fee structures, and document submission portal for prospective students.
              </p>
              <div className={styles.heroStatsRow}>
                <div className={styles.heroStatItem}>
                  <GraduationCap size={20} className={styles.statIcon} />
                  <div>
                    <strong>43+ Accredited</strong>
                    <span>Degree Programmes</span>
                  </div>
                </div>
                <div className={styles.heroStatItem}>
                  <Award size={20} className={styles.statIcon} />
                  <div>
                    <strong>NAAC Accredited</strong>
                    <span>UGC 2(f) & 12(B) Recognized</span>
                  </div>
                </div>
                <div className={styles.heroStatItem}>
                  <Clock size={20} className={styles.statIcon} />
                  <div>
                    <strong>Deadline: Aug 31, 2026</strong>
                    <span>Application Window Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STEP-BY-STEP ADMISSION JOURNEY */}
      <section className={styles.journeySection}>
        <div className="container">
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.eyebrow}>Simple 4-Step Process</span>
            <h2 className={styles.sectionTitle}>Your Path to Academic Excellence</h2>
            <p className={styles.sectionSub}>Follow these simple steps to complete your admission for the 2026–27 academic year.</p>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumberBadge}>01</div>
              <div className={styles.stepIconCircle}>
                <FileText size={24} />
              </div>
              <h3>Online Registration</h3>
              <p>Register on the online portal, fill in candidate credentials, and select your preferred academic degree course.</p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumberBadge}>02</div>
              <div className={styles.stepIconCircle}>
                <CheckCircle2 size={24} />
              </div>
              <h3>Document Verification</h3>
              <p>Upload marksheets, certificates, and ID proofs. Submitted files are verified by the admissions evaluation committee.</p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumberBadge}>03</div>
              <div className={styles.stepIconCircle}>
                <UserCheck size={24} />
              </div>
              <h3>Merit List & Counseling</h3>
              <p>Check published merit lists, attend online or on-campus counseling sessions, and confirm your seat allocation.</p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumberBadge}>04</div>
              <div className={styles.stepIconCircle}>
                <Award size={24} />
              </div>
              <h3>Fee Payment & Roll Call</h3>
              <p>Complete course fee payment online or at bank counter, receive official admission letter, and collect your student badge.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROGRAMMES ELIGIBILITY TABBED OVERVIEW */}
      <section className={styles.eligibilitySection}>
        <div className="container">
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.eyebrow}>Academic Offerings</span>
            <h2 className={styles.sectionTitle}>Programme Eligibility & Overview</h2>
          </div>

          <div className={styles.tabContainerCenter}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeProgTab === 'ug' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveProgTab('ug')}
            >
              Undergraduate (UG)
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeProgTab === 'pg' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveProgTab('pg')}
            >
              Postgraduate (PG)
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeProgTab === 'diploma' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveProgTab('diploma')}
            >
              Diploma & Skill Courses
            </button>
          </div>

          <div className={styles.eligibilityGrid}>
            {activeProgTab === 'ug' && (
              <>
                <div className={styles.eligibilityCard}>
                  <div className={styles.eligibilityTop}>
                    <span className={styles.progTag}>BCA (3 Years)</span>
                    <span className={styles.minMarksBadge}>Min 45% Marks</span>
                  </div>
                  <h3>Bachelor of Computer Applications</h3>
                  <p>Software development, database design, web technologies, and AI fundamentals.</p>
                  <ul className={styles.eligList}>
                    <li><ShieldCheck size={14} /> 10+2 with Mathematics/Statistics/Information Tech preferred.</li>
                    <li><ShieldCheck size={14} /> Merit-based admission + CET counseling.</li>
                  </ul>
                  <Link href="/courses" className={homeStyles.btnPrimaryTerracotta} style={{ marginTop: 'auto' }}>
                    <span>View Programme Details</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className={styles.eligibilityCard}>
                  <div className={styles.eligibilityTop}>
                    <span className={styles.progTag}>B.Sc (3 Years)</span>
                    <span className={styles.minMarksBadge}>Min 45% Marks</span>
                  </div>
                  <h3>Bachelor of Science</h3>
                  <p>Physics, Chemistry, Computer Science, Biotechnology, and Mathematics.</p>
                  <ul className={styles.eligList}>
                    <li><ShieldCheck size={14} /> 10+2 Science stream from recognized board.</li>
                    <li><ShieldCheck size={14} /> Direct merit list seat allocation.</li>
                  </ul>
                  <Link href="/courses" className={homeStyles.btnPrimaryTerracotta} style={{ marginTop: 'auto' }}>
                    <span>View Programme Details</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className={styles.eligibilityCard}>
                  <div className={styles.eligibilityTop}>
                    <span className={styles.progTag}>B.Com (3 Years)</span>
                    <span className={styles.minMarksBadge}>Min 40% Marks</span>
                  </div>
                  <h3>Bachelor of Commerce</h3>
                  <p>Accounting, corporate law, banking, taxation, and business management.</p>
                  <ul className={styles.eligList}>
                    <li><ShieldCheck size={14} /> 10+2 Commerce / Arts / Science stream.</li>
                    <li><ShieldCheck size={14} /> Merit ranking by aggregate score.</li>
                  </ul>
                  <Link href="/courses" className={homeStyles.btnPrimaryTerracotta} style={{ marginTop: 'auto' }}>
                    <span>View Programme Details</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </>
            )}

            {activeProgTab === 'pg' && (
              <>
                <div className={styles.eligibilityCard}>
                  <div className={styles.eligibilityTop}>
                    <span className={styles.progTag}>M.Sc (2 Years)</span>
                    <span className={styles.minMarksBadge}>Min 50% Marks</span>
                  </div>
                  <h3>Master of Science (Computer / Chemistry)</h3>
                  <p>Advanced postgraduate research, algorithmic analysis, and laboratory thesis work.</p>
                  <ul className={styles.eligList}>
                    <li><ShieldCheck size={14} /> Bachelor degree in relevant discipline from recognized university.</li>
                    <li><ShieldCheck size={14} /> Entrance test + merit scorecard.</li>
                  </ul>
                  <Link href="/courses" className={homeStyles.btnPrimaryTerracotta} style={{ marginTop: 'auto' }}>
                    <span>View Programme Details</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className={styles.eligibilityCard}>
                  <div className={styles.eligibilityTop}>
                    <span className={styles.progTag}>M.Com (2 Years)</span>
                    <span className={styles.minMarksBadge}>Min 45% Marks</span>
                  </div>
                  <h3>Master of Commerce</h3>
                  <p>Advanced financial management, auditing, managerial economics, and research methodology.</p>
                  <ul className={styles.eligList}>
                    <li><ShieldCheck size={14} /> B.Com or BBA degree from accredited college.</li>
                    <li><ShieldCheck size={14} /> Merit ranking seat allotment.</li>
                  </ul>
                  <Link href="/courses" className={homeStyles.btnPrimaryTerracotta} style={{ marginTop: 'auto' }}>
                    <span>View Programme Details</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </>
            )}

            {activeProgTab === 'diploma' && (
              <>
                <div className={styles.eligibilityCard}>
                  <div className={styles.eligibilityTop}>
                    <span className={styles.progTag}>Diploma (1 Year)</span>
                    <span className={styles.minMarksBadge}>Pass 10+2</span>
                  </div>
                  <h3>Diploma in Web Development & Cloud</h3>
                  <p>Hands-on practical training in full-stack web engineering, AWS, and UI design.</p>
                  <ul className={styles.eligList}>
                    <li><ShieldCheck size={14} /> Open to all 10+2 / HSC graduates.</li>
                    <li><ShieldCheck size={14} /> Direct admission + certification.</li>
                  </ul>
                  <Link href="/courses" className={homeStyles.btnPrimaryTerracotta} style={{ marginTop: 'auto' }}>
                    <span>View Programme Details</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

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
                <li>
                  <CheckCircle2 size={16} className={styles.checkIcon} />
                  <span>10th (SSC) & 12th (HSC) Marksheets & Passing Certificates</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className={styles.checkIcon} />
                  <span>School / College Leaving Certificate (LC) & Transfer Certificate (TC)</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className={styles.checkIcon} />
                  <span>Caste Certificate & Non-Creamy Layer (where applicable)</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className={styles.checkIcon} />
                  <span>Nationalized Bank Passbook Copy & Aadhaar Card ID Proof</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className={styles.checkIcon} />
                  <span>Recent Passport Size Color Photographs (3 Copies)</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className={styles.checkIcon} />
                  <span>Migration Certificate (For candidates outside Maharashtra Board)</span>
                </li>
              </ul>
            </div>

            {/* Admission Schedule Calendar */}
            <div className={styles.scheduleBox}>
              <div className={styles.boxHeader}>
                <Calendar size={22} className={styles.boxIcon} />
                <h3>Important Dates & Admission Schedule</h3>
              </div>
              <div className={styles.scheduleTable}>
                <div className={styles.scheduleRow}>
                  <div>
                    <strong>Online Application Window Opens</strong>
                    <span>Registration & Form Submission</span>
                  </div>
                  <span className={`${styles.dateBadge} ${styles.badgeActive}`}>May 15, 2026</span>
                </div>

                <div className={styles.scheduleRow}>
                  <div>
                    <strong>Document Verification Window</strong>
                    <span>Admissions Scrutiny Committee</span>
                  </div>
                  <span className={`${styles.dateBadge} ${styles.badgeProgress}`}>June 01 – July 31</span>
                </div>

                <div className={styles.scheduleRow}>
                  <div>
                    <strong>First Merit List Publication</strong>
                    <span>Portal & Bulletin Board Release</span>
                  </div>
                  <span className={styles.dateBadge}>August 05, 2026</span>
                </div>

                <div className={styles.scheduleRow}>
                  <div>
                    <strong>Seat Allocation & Fee Payment</strong>
                    <span>Round 1 Enrollment</span>
                  </div>
                  <span className={styles.dateBadge}>August 06 – 12</span>
                </div>

                <div className={styles.scheduleRow}>
                  <div>
                    <strong>Commencement of Academic Classes</strong>
                    <span>Session 2026–27 Begins</span>
                  </div>
                  <span className={`${styles.dateBadge} ${styles.badgeFinal}`}>September 01, 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) */}
      <section className={styles.faqSection}>
        <div className="container">
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.eyebrow}>Got Questions?</span>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <p className={styles.sectionSub}>Find quick answers to common queries regarding registration, eligibility, and fee submission.</p>
          </div>

          <div className={styles.faqAccordionList}>
            {ADMISSION_FAQS.map((faq, idx) => {
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

      {/* 6. ADMISSIONS HELPDESK & CTA BANNER */}
      <section className={styles.ctaBannerSection}>
        <div className="container">
          <div className={styles.ctaBannerCard}>
            <div className={styles.ctaBadge}>
              <PhoneCall size={16} />
              <span>Admission Helpdesk & Counseling Office</span>
            </div>
            <h2>Need Assistance With Your Application?</h2>
            <p>Our dedicated admissions guidance team is available Monday through Saturday (9:00 AM – 5:00 PM) to assist you with registration queries.</p>
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
