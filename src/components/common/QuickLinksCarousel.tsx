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
  { href: '/courses', icon: <BookOpen size={20} />, label: 'Academic Programmes', theme: styles.qlTerracotta },
  { href: '/notices', icon: <Pin size={20} />, label: 'Notices & Circulars', theme: styles.qlEmerald },
  { href: '/downloads', icon: <FolderDown size={20} />, label: 'Downloads Center', theme: styles.qlSapphire },
  { href: '/admissions', icon: <GraduationCap size={20} />, label: 'Admissions 2026', theme: styles.qlGold },
  { href: '/faculty', icon: <Users size={20} />, label: 'Faculty Directory', theme: styles.qlPurple },
  { href: '/events', icon: <Calendar size={20} />, label: 'Events & Seminars', theme: styles.qlCrimson },
  { href: '/gallery', icon: <Camera size={20} />, label: 'Campus Gallery', theme: styles.qlTeal },
  { href: '/contact', icon: <Mail size={20} />, label: 'Contact & Helpline', theme: styles.qlIndigo },
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
              <Link key={`${lk.href}-${idx}`} href={lk.href} className={`${styles.linkCardMarquee} ${lk.theme}`}>
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
