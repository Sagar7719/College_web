'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { siteSettingsService, defaultSettings } from '@/services/site-settings.service';
import { SiteSettings } from '@/types';
import styles from './layout.module.css';

export const Footer: React.FC = () => {
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
  const footerConfig = settings?.footerConfig || defaultSettings.footerConfig;
  const socialLinks = settings?.socialLinks || {};

  const hasAnySocial = Object.values(socialLinks).some((url) => Boolean(url && url.trim()));

  return (
    <footer className={styles.footer}>
      <div className={styles.footerMain}>
        <div className="container">
          <div className={styles.footerGrid}>
            {/* Col 1: About */}
            <div>
              <h3 className={styles.footerColTitle}>{collegeInfo.name}</h3>
              <p className={styles.footerText}>
                {footerConfig.aboutText || collegeInfo.description || defaultSettings.footerConfig.aboutText}
              </p>
            </div>

            {/* Col 2: Useful Links */}
            <div>
              <h3 className={styles.footerColTitle}>Quick Links</h3>
              <ul className={styles.footerList}>
                <li><Link href="/about" className={styles.footerLink}>About Us</Link></li>
                <li><Link href="/departments" className={styles.footerLink}>Academics &amp; Departments</Link></li>
                <li><Link href="/admissions" className={styles.footerLink}>Admissions Process</Link></li>
                <li><Link href="/notices" className={styles.footerLink}>Latest Notices</Link></li>
                <li><Link href="/contact" className={styles.footerLink}>Contact Campus</Link></li>
              </ul>
            </div>

            {/* Col 3: Academic Resources */}
            <div>
              <h3 className={styles.footerColTitle}>Resources</h3>
              <ul className={styles.footerList}>
                <li><Link href="/courses" className={styles.footerLink}>Courses Offered</Link></li>
                <li><Link href="/faculty" className={styles.footerLink}>Faculty Directory</Link></li>
                <li><Link href="/downloads" className={styles.footerLink}>Document Downloads</Link></li>
                <li><Link href="/gallery" className={styles.footerLink}>Photo Gallery</Link></li>
                <li><Link href="/news" className={styles.footerLink}>News &amp; Updates</Link></li>
              </ul>
            </div>

            {/* Col 4: Contact Info */}
            <div>
              <h3 className={styles.footerColTitle}>Contact Us</h3>
              <ul className={styles.footerList}>
                {collegeInfo.address && <li className={styles.footerText}>📍 {collegeInfo.address}</li>}
                {collegeInfo.phone && <li className={styles.footerText}>📞 {collegeInfo.phone}</li>}
                {collegeInfo.email && <li className={styles.footerText}>✉️ {collegeInfo.email}</li>}
                {hasAnySocial && (
                  <li style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {socialLinks.facebook && (
                      <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className={styles.footerLink} aria-label="Facebook">
                        FB
                      </a>
                    )}
                    {socialLinks.twitter && (
                      <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className={styles.footerLink} aria-label="Twitter">
                        TW
                      </a>
                    )}
                    {socialLinks.instagram && (
                      <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className={styles.footerLink} aria-label="Instagram">
                        IG
                      </a>
                    )}
                    {socialLinks.youtube && (
                      <a href={socialLinks.youtube} target="_blank" rel="noreferrer" className={styles.footerLink} aria-label="YouTube">
                        YT
                      </a>
                    )}
                    {socialLinks.linkedin && (
                      <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className={styles.footerLink} aria-label="LinkedIn">
                        IN
                      </a>
                    )}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className="container">
          <p>{footerConfig.copyrightText || `© ${new Date().getFullYear()} ${collegeInfo.name}. All rights reserved.`}</p>
        </div>
      </div>
    </footer>
  );
};
