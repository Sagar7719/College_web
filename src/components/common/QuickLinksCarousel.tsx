'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Pin,
  FolderDown,
  GraduationCap,
  Users,
  Calendar,
  Camera,
  Mail,
  ArrowUpRight,
} from 'lucide-react';
import styles from '@/app/(public)/home.module.css';

const QUICK_LINKS = [
  { href: '/courses', icon: <BookOpen size={20} />, label: 'Academic Programmes' },
  { href: '/notices', icon: <Pin size={20} />, label: 'Notices & Circulars' },
  { href: '/downloads', icon: <FolderDown size={20} />, label: 'Downloads Center' },
  { href: '/admissions', icon: <GraduationCap size={20} />, label: 'Admissions 2026' },
  { href: '/faculty', icon: <Users size={20} />, label: 'Faculty Directory' },
  { href: '/events', icon: <Calendar size={20} />, label: 'Events & Seminars' },
  { href: '/gallery', icon: <Camera size={20} />, label: 'Campus Gallery' },
  { href: '/contact', icon: <Mail size={20} />, label: 'Contact & Helpline' },
];

export function QuickLinksCarousel() {
  // Duplicate array for seamless infinite looping animation
  const duplicatedLinks = [...QUICK_LINKS, ...QUICK_LINKS];

  return (
    <section className={styles.sec} aria-label="Quick Access Links">
      <div className="container" style={{ overflow: 'hidden' }}>
        <div className={styles.secHead}>
          <span className={styles.eyebrow}>Quick Access</span>
          <h2 className={styles.secTitle}>Important Links & Portals</h2>
        </div>

        <div className={styles.marqueeOuterWrapper}>
          <div className={styles.marqueeTrack}>
            {duplicatedLinks.map((lk, idx) => (
              <Link key={`${lk.href}-${idx}`} href={lk.href} className={styles.linkCardMarquee}>
                <div className={styles.linkLeftGroup}>
                  <div className={styles.linkIcon}>{lk.icon}</div>
                  <span className={styles.linkLabel}>{lk.label}</span>
                </div>
                <ArrowUpRight size={16} className={styles.linkCardArrow} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
