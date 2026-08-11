import React from 'react';
import type { Metadata } from 'next';
import { facultyService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { Card, CardBody, Badge, EmptyState } from '@/components/ui';
import styles from '../inner.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = `Faculty Directory — ${collegeName}`;
  const description = `Meet distinguished professors, researchers, and academic mentors at ${collegeName}.`;
  const ogImageUrl = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: '/faculty',
    },
    openGraph: {
      title,
      description,
      url: '/faculty',
      siteName: collegeName,
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, alt: title }] } : {}),
    },
  };
}


export default async function FacultyPage() {
  const members = await facultyService.getAll();

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div className={styles.pageHeader}>
        <Badge variant="default" style={{ marginBottom: '0.75rem' }}>Academic Staff</Badge>
        <h1 className={styles.pageTitle}>Faculty Directory</h1>
        <p className={styles.pageSubtitle}>
          Meet our distinguished professors, researchers, and academic mentors.
        </p>
      </div>

      {members.length > 0 ? (
        <div className={styles.facultyGrid}>
          {members.map((fac) => (
            <div key={fac.id} className={styles.facultyCard}>
              <div className={styles.facultyPhotoWrapper}>
                {fac.photoUrl ? (
                  <img
                    src={fac.photoUrl}
                    alt={fac.name}
                    className={styles.facultyPhoto}
                  />
                ) : (
                  <div className={styles.facultyPhotoFallback}>🎓</div>
                )}
              </div>
              <h3 className={styles.facultyName}>{fac.name}</h3>
              <p className={styles.facultyDesignation}>{fac.designation}</p>
              {fac.departmentName && <p className={styles.facultyDept}>{fac.departmentName}</p>}
              <p className="small-text" style={{ fontStyle: 'italic', marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
                {fac.qualification}
              </p>
              {fac.email && (
                <div className={styles.facultyContact}>
                  <span>✉️ {fac.email}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Faculty Directory Will Be Available Soon"
          description="Academic staff profiles will be updated shortly."
        />
      )}
    </div>
  );
}
