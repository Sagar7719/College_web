'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';
import { siteSettingsService, defaultSettings } from '@/services/site-settings.service';
import { SiteSettings } from '@/types';
import styles from './layout.module.css';

// Fallback footer columns matching exact specified institutional structure
const FALLBACK_COLUMNS = [
  {
    title: 'Quick Links',
    links: [
      { label: 'About Us', path: '/about' },
      { label: 'Academics & Departments', path: '/departments' },
      { label: 'Admissions Process', path: '/admissions' },
      { label: 'Latest Notices', path: '/notices' },
      { label: 'Contact Campus', path: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Courses Offered', path: '/courses' },
      { label: 'Faculty Directory', path: '/faculty' },
      { label: 'Document Downloads', path: '/downloads' },
      { label: 'Photo Gallery', path: '/gallery' },
      { label: 'News & Updates', path: '/news' },
    ],
  },
];

export interface FooterProps {
  initialSettings?: SiteSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ initialSettings }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings ?? null);

  useEffect(() => {
    if (initialSettings) return;
    let alive = true;
    siteSettingsService
      .getSettings()
      .then((data) => {
        if (alive) setSettings(data);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [initialSettings]);

  const collegeInfo = settings?.collegeInfo || defaultSettings.collegeInfo;
  const footerConfig = settings?.footerConfig || defaultSettings.footerConfig;
  const socialLinks = settings?.socialLinks || {};

  const hasAnySocial = Object.values(socialLinks).some((url) => Boolean(url && url.trim()));

  const cmsColumns =
    footerConfig.columns
      ?.filter((col) => col.visible !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) || [];

  const hasCmsColumns = cmsColumns.length > 0;

  const address = collegeInfo.address || 'Campus Address, University District pune';
  const phone = collegeInfo.phone || '+918669301878';
  const email = collegeInfo.email || 'sagarulagadde1008@gmail.com';
  const description =
    footerConfig.aboutText ||
    collegeInfo.description ||
    'Dedicated to excellence in education, groundbreaking research, and holistic student development.';

  return (
    <footer className={styles.footer}>
      {/* Top Accent Line */}
      <div className={styles.footerAccentBar} />

      <div className={styles.footerMain}>
        <div className="container">
          <div className={styles.footerGrid}>
            {/* Column 1: Brand & About */}
            <div className={styles.footerBrandCol}>
              <h3 className={styles.footerBrandTitle}>{collegeInfo.name || 'Jaysingpur College, Jaysingpur'}</h3>
              <p className={styles.footerAboutText}>{description}</p>

              {hasAnySocial && (
                <div className={styles.footerSocials}>
                  {socialLinks.facebook && (
                    <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className={styles.footerSocialIcon} aria-label="Facebook">
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className={styles.footerSocialIcon} aria-label="Twitter">
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className={styles.footerSocialIcon} aria-label="Instagram">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </a>
                  )}
                  {socialLinks.youtube && (
                    <a href={socialLinks.youtube} target="_blank" rel="noreferrer" className={styles.footerSocialIcon} aria-label="YouTube">
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#1A1816"/></svg>
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className={styles.footerSocialIcon} aria-label="LinkedIn">
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Dynamic CMS Columns or Fallback Columns */}
            {hasCmsColumns
              ? cmsColumns.map((col) => {
                  const visibleLinks = (col.links || [])
                    .filter((link) => link.visible !== false)
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

                  return (
                    <div key={col.id} className={styles.footerNavCol}>
                      <h4 className={styles.footerColTitle}>{col.title}</h4>
                      <ul className={styles.footerList}>
                        {visibleLinks.map((link) => {
                          const isExt =
                            link.isExternal ||
                            link.type === 'external' ||
                            link.path.startsWith('http://') ||
                            link.path.startsWith('https://');

                          if (isExt) {
                            return (
                              <li key={link.id}>
                                <a
                                  href={link.path}
                                  className={styles.footerLink}
                                  target={link.targetBlank ? '_blank' : undefined}
                                  rel={link.targetBlank ? 'noreferrer' : undefined}
                                >
                                  <span>{link.label}</span>
                                  <ArrowUpRight size={14} className={styles.externalLinkIcon} />
                                </a>
                              </li>
                            );
                          }

                          return (
                            <li key={link.id}>
                              <Link href={link.path} className={styles.footerLink}>
                                {link.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })
              : FALLBACK_COLUMNS.map((col) => (
                  <div key={col.title} className={styles.footerNavCol}>
                    <h4 className={styles.footerColTitle}>{col.title}</h4>
                    <ul className={styles.footerList}>
                      {col.links.map((link) => (
                        <li key={link.path}>
                          <Link href={link.path} className={styles.footerLink}>
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

            {/* Column 4: Contact Us */}
            <div className={styles.footerNavCol}>
              <h4 className={styles.footerColTitle}>Contact Us</h4>
              <ul className={styles.footerContactList}>
                <li className={styles.footerContactItem}>
                  <MapPin size={18} className={styles.contactIcon} />
                  <span>{address}</span>
                </li>
                <li className={styles.footerContactItem}>
                  <Phone size={18} className={styles.contactIcon} />
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className={styles.footerContactLink}>
                    {phone}
                  </a>
                </li>
                <li className={styles.footerContactItem}>
                  <Mail size={18} className={styles.contactIcon} />
                  <a href={`mailto:${email}`} className={styles.footerContactLink}>
                    {email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.footerBottom}>
        <div className="container">
          <div className={styles.footerBottomInner}>
            <p className={styles.copyrightText}>
              {footerConfig.copyrightText || `© ${new Date().getFullYear()} ${collegeInfo.name || 'Jaysingpur College, Jaysingpur'}. All rights reserved.`}
            </p>
            <div className={styles.footerBottomLinks}>
              <Link href="/about" className={styles.footerBottomLink}>
                Privacy Policy
              </Link>
              <span className={styles.footerDivider}>|</span>
              <Link href="/about" className={styles.footerBottomLink}>
                Terms
              </Link>
              <span className={styles.footerDivider}>|</span>
              <Link href="/about" className={styles.footerBottomLink}>
                Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
