'use client';

import React from 'react';
import { Landmark, CheckCircle2, Award, GraduationCap } from 'lucide-react';
import styles from './AccreditationBar.module.css';

interface AccreditationBarProps {
  estYear?: string;
}

export function AccreditationBar({ estYear = '2001' }: AccreditationBarProps) {
  const items = [
    {
      title: 'Affiliated Institution',
      subtitle: 'University Recognition',
      icon: Landmark,
      variantClass: styles.variantSapphire,
    },
    {
      title: 'UGC Recognized',
      subtitle: 'Section 2(f) & 12(B)',
      icon: CheckCircle2,
      variantClass: styles.variantEmerald,
    },
    {
      title: 'NAAC Accredited',
      subtitle: 'Quality Benchmark',
      icon: Award,
      variantClass: styles.variantGold,
    },
    {
      title: `Established ${estYear || '2001'}`,
      subtitle: 'Legacy of Learning',
      icon: GraduationCap,
      variantClass: styles.variantTerracotta,
    },
  ];

  return (
    <section className={styles.sec} aria-label="Accreditation & Recognition">
      <div className="container">
        {/* Centered Section Header */}
        <div className={styles.secHeadCenter}>
          <span className={styles.eyebrow}>Institutional Recognition</span>
          <h2 className={styles.secTitle}>Accreditation & Affiliations</h2>
          <p className={styles.secSub}>
            Recognized by statutory government bodies and quality assurance councils for higher education.
          </p>
        </div>

        {/* 4 Multi-Color Executive Cards with Hover Background Dots */}
        <div className={styles.accredGrid}>
          {items.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className={`${styles.accredCard} ${item.variantClass}`}>
                <div className={styles.accredIconBox}>
                  <IconComponent size={24} />
                </div>
                <div className={styles.accredContent}>
                  <h3 className={styles.accredTitle}>{item.title}</h3>
                  <p className={styles.accredSub}>{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
