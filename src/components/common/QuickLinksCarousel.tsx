'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { resolveIcon } from '@/lib/icon-resolver';
import { QuickLinkItem } from '@/types';
import styles from '@/app/(public)/home.module.css';

interface QuickLinksCarouselProps {
  quickLinks?: QuickLinkItem[];
}

export function QuickLinksCarousel({ quickLinks }: QuickLinksCarouselProps) {
  // Use provided links or empty array (defaults come from settings)
  const links = quickLinks && quickLinks.length > 0 ? quickLinks : [];

  if (links.length === 0) return null;

  // Duplicate array for seamless infinite looping animation
  const duplicatedLinks = [...links, ...links];

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
              <Link key={`${lk.href}-${idx}`} href={lk.href} className={`${styles.linkCardMarquee} ${(styles as Record<string, string>)[lk.colorClass] || ''}`}>
                <div className={styles.linkLeftGroup}>
                  <div className={styles.linkIcon}>{resolveIcon(lk.iconKey, 20)}</div>
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
