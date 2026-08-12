'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  MapPin,
  PhoneCall,
  Mail,
  Clock,
  Compass,
  Building2,
  ShieldCheck,
  Award,
  Globe,
  Share2,
  ExternalLink,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
  HeartHandshake,
} from 'lucide-react';
import { ContactForm } from '@/components/public/ContactForm';
import styles from '../inner.module.css';
import homeStyles from '../home.module.css';

interface ContactClientProps {
  collegeInfo: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    phone?: string;
    alternatePhone?: string;
    email?: string;
    websiteUrl?: string;
  };
  socialLinks: Record<string, any>;
}

export function ContactClient({ collegeInfo, socialLinks }: ContactClientProps) {
  const addressString = [
    collegeInfo.address || 'Campus Address, University District pune',
    collegeInfo.city || 'Pune',
    collegeInfo.state || 'MH',
    collegeInfo.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  const phoneDisplay = collegeInfo.phone || '+91 8669301878';
  const emailDisplay = collegeInfo.email || 'sagarulagadde1008@gmail.com';

  return (
    <div className={styles.pageContainer}>
      {/* 1. HERO BANNER */}
      <section className={styles.heroBanner}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <Sparkles size={16} />
              <span>Admissions & Helpdesk Office</span>
            </div>
            <h1 className={styles.heroTitle}>Contact Us & Campus Location</h1>
            <p className={styles.heroSubtitle}>
              Reach out to our administrative team, academic departments, or campus helpdesk. We are here to assist your educational journey.
            </p>
            <div className={styles.heroStatsRow}>
              <div className={styles.heroStatItem}>
                <MapPin size={20} className={styles.statIcon} />
                <div>
                  <strong>Pune, Maharashtra</strong>
                  <span>Main Campus Location</span>
                </div>
              </div>
              <div className={styles.heroStatItem}>
                <PhoneCall size={20} className={styles.statIcon} />
                <div>
                  <strong>{phoneDisplay}</strong>
                  <span>Admission Helpline</span>
                </div>
              </div>
              <div className={styles.heroStatItem}>
                <Mail size={20} className={styles.statIcon} />
                <div>
                  <strong>{emailDisplay}</strong>
                  <span>Official Inquiry Desk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONTACT DETAILS & FORM GRID */}
      <section className={styles.contentSection} style={{ paddingTop: '56px' }}>
        <div className="container">
          <div className={styles.contactSplitGrid}>
            {/* LEFT COLUMN: CAMPUS INFORMATION */}
            <div className={styles.contactInfoCard}>
              <div className={styles.cardHeaderBox}>
                <Building2 size={24} className={styles.cardHeaderIcon} />
                <div>
                  <h2>Campus Information</h2>
                  <p>Official administrative contact details & visiting hours</p>
                </div>
              </div>

              <div className={styles.contactDetailsList}>
                <div className={styles.contactDetailCard}>
                  <div className={styles.iconCircle}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span className={styles.detailLabel}>Campus Address</span>
                    <strong className={styles.detailValue}>{addressString}</strong>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(addressString)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.mapDirectionsLink}
                    >
                      <Compass size={14} />
                      <span>Get Directions on Google Maps</span>
                    </a>
                  </div>
                </div>

                <div className={styles.contactDetailCard}>
                  <div className={styles.iconCircle}>
                    <PhoneCall size={20} />
                  </div>
                  <div>
                    <span className={styles.detailLabel}>Phone & Helpline</span>
                    <strong className={styles.detailValue}>
                      <a href={`tel:${phoneDisplay}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {phoneDisplay}
                      </a>
                    </strong>
                    {collegeInfo.alternatePhone && (
                      <span className={styles.detailSub}>Alt: {collegeInfo.alternatePhone}</span>
                    )}
                  </div>
                </div>

                <div className={styles.contactDetailCard}>
                  <div className={styles.iconCircle}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <span className={styles.detailLabel}>Official Desk Email</span>
                    <strong className={styles.detailValue}>
                      <a href={`mailto:${emailDisplay}`} style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
                        {emailDisplay}
                      </a>
                    </strong>
                  </div>
                </div>

                <div className={styles.contactDetailCard}>
                  <div className={styles.iconCircle}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <span className={styles.detailLabel}>Office Working Hours</span>
                    <strong className={styles.detailValue}>Monday – Saturday: 9:00 AM – 5:00 PM</strong>
                    <span className={styles.detailSub}>Closed on Sundays and Official Public Holidays</span>
                  </div>
                </div>
              </div>

              {/* DEPARTMENTAL DIRECTORY DIRECT CONTACTS */}
              <div className={styles.deptDirectoryBox}>
                <h3>Departmental Helpdesks</h3>
                <div className={styles.deptRow}>
                  <span>Admissions & Counseling:</span>
                  <a href={`mailto:${emailDisplay}`}>admissions@college.edu</a>
                </div>
                <div className={styles.deptRow}>
                  <span>Examinations & Results:</span>
                  <a href={`mailto:${emailDisplay}`}>exams@college.edu</a>
                </div>
                <div className={styles.deptRow}>
                  <span>Placement & Career Cell:</span>
                  <a href={`mailto:${emailDisplay}`}>placement@college.edu</a>
                </div>
              </div>

              {/* SOCIAL LINKS */}
              {Object.values(socialLinks).some(Boolean) && (
                <div className={styles.socialBox}>
                  <span className={styles.detailLabel}>Follow Our Official Channels</span>
                  <div className={styles.socialRow}>
                    {socialLinks.facebook && (
                      <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" title="Facebook">
                        <Share2 size={18} />
                      </a>
                    )}
                    {socialLinks.instagram && (
                      <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" title="Instagram">
                        <Globe size={18} />
                      </a>
                    )}
                    {socialLinks.linkedin && (
                      <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                        <ExternalLink size={18} />
                      </a>
                    )}
                    {socialLinks.youtube && (
                      <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" title="YouTube">
                        <Globe size={18} />
                      </a>
                    )}
                    {socialLinks.twitter && (
                      <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" title="Twitter/X">
                        <Share2 size={18} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: EXECUTIVE CONTACT FORM */}
            <div className={styles.formColumn}>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAP LOCATION BANNER SECTION */}
      <section className={styles.mapSection}>
        <div className="container">
          <div className={styles.mapCard}>
            <div className={styles.mapHeader}>
              <div className={styles.mapHeaderLeft}>
                <MapPin size={22} className={styles.mapIcon} />
                <div>
                  <h2>Campus Address & Directions</h2>
                  <p>{addressString}</p>
                </div>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(addressString)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={homeStyles.btnPrimaryTerracotta}
              >
                <Compass size={18} />
                <span>Open Google Maps</span>
                <ArrowRight size={16} />
              </a>
            </div>

            <div className={styles.mapEmbedWrapper}>
              <iframe
                title="Campus Location Map"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(addressString)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="380"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. EMERGENCY & STUDENT HELPLINE STRIP */}
      <section className={styles.emergencySection}>
        <div className="container">
          <div className={styles.emergencyGrid}>
            <div className={styles.emergencyCard}>
              <div className={styles.emergencyIcon}>
                <ShieldCheck size={22} />
              </div>
              <h3>Anti-Ragging Helpline</h3>
              <p>24/7 National Anti-Ragging Cell helpline for zero-tolerance campus safety.</p>
              <strong>Toll-Free: 1800-180-5522</strong>
            </div>

            <div className={styles.emergencyCard}>
              <div className={styles.emergencyIcon}>
                <HeartHandshake size={22} />
              </div>
              <h3>Women Empowerment Cell</h3>
              <p>Dedicated grievance redressal cell for female students and staff.</p>
              <strong>Desk Email: women@college.edu</strong>
            </div>

            <div className={styles.emergencyCard}>
              <div className={styles.emergencyIcon}>
                <HelpCircle size={22} />
              </div>
              <h3>Student Grievance Officer</h3>
              <p>Direct assistance for academic evaluation & administrative queries.</p>
              <strong>Desk: Admin Block Room 104</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
