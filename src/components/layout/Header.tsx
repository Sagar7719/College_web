'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { siteSettingsService, defaultSettings } from '@/services/site-settings.service';
import { SiteSettings } from '@/types';
import styles from './layout.module.css';
import { Navbar } from './Navbar';

export const Header: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    let alive = true;
    siteSettingsService.getSettings()
      .then((data) => {
        if (alive) setSettings(data);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const collegeInfo = settings?.collegeInfo || defaultSettings.collegeInfo;

  return (
    <header>
      {/* Top Meta Bar */}
      <div className={styles.headerTop}>
        <div className="container">
          <div className={styles.headerTopInner}>
            <div className={styles.contactMeta}>
              {collegeInfo.phone && <span className={styles.contactItem}>📞 {collegeInfo.phone}</span>}
              {collegeInfo.email && <span className={styles.contactItem}>✉️ {collegeInfo.email}</span>}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/search" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                🔍 Search
              </Link>
              <Link href="/admin/login" style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                🔒 Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Branding Bar */}
      <div className={styles.brandBar}>
        <div className="container">
          <div className={styles.brandInner}>
            <Link href="/" className={styles.logoGroup}>
              {collegeInfo.logoUrl ? (
                <img
                  src={collegeInfo.logoUrl}
                  alt={collegeInfo.name ? `${collegeInfo.name} Official Logo` : 'College Official Emblem Logo'}
                  style={{ height: '48px', maxWidth: '160px', objectFit: 'contain', display: 'block' }}
                />
              ) : (
                <div className={styles.logoBadge}>
                  {(collegeInfo.shortName || 'COL').slice(0, 3)}
                </div>
              )}
              <div>
                <h1 className={styles.collegeTitle}>{collegeInfo.name}</h1>
                {collegeInfo.tagline && <p className={styles.collegeSubtitle}>{collegeInfo.tagline}</p>}
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic Navbar */}
      <Navbar />
    </header>
  );
};
