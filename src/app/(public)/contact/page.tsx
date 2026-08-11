import React from 'react';
import type { Metadata } from 'next';
import { pagesService } from '@/services/pages.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { PageSectionRenderer } from '@/components/page-builder';
import { Badge } from '@/components/ui';
import { ContactForm } from '@/components/public/ContactForm';
import styles from '../inner.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await pagesService.getPageBySlug('contact');
  if (cmsPage && cmsPage.status === 'published' && (cmsPage.seo?.metaTitle || cmsPage.title)) {
    return {
      title: cmsPage.seo?.metaTitle || cmsPage.title,
      description: cmsPage.seo?.metaDescription,
      alternates: { canonical: '/contact' },
    };
  }

  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = `Contact Us — ${collegeName}`;
  const description = `Get in touch with ${collegeName}. Official campus address, admissions helpline, and department contact emails.`;
  const ogImageUrl = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: '/contact',
    },
    openGraph: {
      title,
      description,
      url: '/contact',
      siteName: collegeName,
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, alt: title }] } : {}),
    },
  };
}

export default async function ContactPage() {
  const cmsPage = await pagesService.getPageBySlug('contact');
  if (cmsPage && cmsPage.status === 'published' && cmsPage.sections?.length > 0) {
    return <PageSectionRenderer sections={cmsPage.sections} />;
  }

  const settings = await siteSettingsService.getSettings();
  const info = settings.collegeInfo;
  const social = settings.socialLinks || {};

  const fullAddress = [info.address, info.city, info.state, info.postalCode].filter(Boolean).join(', ');

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div className={styles.pageHeader}>
        <Badge variant="default" style={{ marginBottom: '0.75rem' }}>Reach Campus</Badge>
        <h1 className={styles.pageTitle}>Contact Us</h1>
        <p className={styles.pageSubtitle}>
          Have questions regarding admissions, academic programs, or campus visits? Connect with us.
        </p>
      </div>

      <div className={styles.contactGrid}>
        {/* Contact Details Card */}
        <div className={styles.contactInfoCard}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
            Campus Information
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {fullAddress && (
              <div className={styles.contactDetailItem}>
                <div className={styles.contactIconCircle}>📍</div>
                <div>
                  <div className={styles.contactLabel}>Campus Address</div>
                  <div className={styles.contactValue}>{fullAddress}</div>
                </div>
              </div>
            )}
            
            {info.phone && (
              <div className={styles.contactDetailItem}>
                <div className={styles.contactIconCircle}>📞</div>
                <div>
                  <div className={styles.contactLabel}>Phone &amp; Helpline</div>
                  <div className={styles.contactValue}>
                    {info.phone}
                    {info.alternatePhone && <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}> / {info.alternatePhone}</span>}
                  </div>
                </div>
              </div>
            )}

            {info.email && (
              <div className={styles.contactDetailItem}>
                <div className={styles.contactIconCircle}>✉️</div>
                <div>
                  <div className={styles.contactLabel}>Official Email</div>
                  <div className={styles.contactValue}>
                    <a href={`mailto:${info.email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                      {info.email}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {info.websiteUrl && (
              <div className={styles.contactDetailItem}>
                <div className={styles.contactIconCircle}>🌐</div>
                <div>
                  <div className={styles.contactLabel}>Official Website</div>
                  <div className={styles.contactValue}>
                    <a href={info.websiteUrl} target="_blank" rel="noreferrer noopener" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                      {info.websiteUrl}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Social Links on Contact Page */}
          {Object.values(social).some(Boolean) && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
              <div className={styles.contactLabel} style={{ marginBottom: '0.75rem' }}>Follow Our Official Channels</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {social.facebook && <a href={social.facebook} target="_blank" rel="noreferrer noopener" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 700 }}>Facebook</a>}
                {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer noopener" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 700 }}>Instagram</a>}
                {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer noopener" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 700 }}>LinkedIn</a>}
                {social.youtube && <a href={social.youtube} target="_blank" rel="noreferrer noopener" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 700 }}>YouTube</a>}
                {social.twitter && <a href={social.twitter} target="_blank" rel="noreferrer noopener" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 700 }}>Twitter/X</a>}
              </div>
            </div>
          )}
        </div>

        {/* Public Contact Form */}
        <ContactForm />
      </div>
    </div>
  );
}
