import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { pagesService } from '@/services/pages.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { PageSectionRenderer } from '@/components/page-builder';
import { Card, CardBody, Badge, Button } from '@/components/ui';
import styles from '../inner.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await pagesService.getPageBySlug('admissions');
  if (cmsPage && cmsPage.status === 'published' && (cmsPage.seo?.metaTitle || cmsPage.title)) {
    return {
      title: cmsPage.seo?.metaTitle || cmsPage.title,
      description: cmsPage.seo?.metaDescription,
      alternates: { canonical: '/admissions' },
    };
  }

  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = `Admissions 2026-2027 — ${collegeName}`;
  const description = `Explore admissions criteria, eligibility, counseling dates, and online application guidelines for ${collegeName}.`;
  const ogImageUrl = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: '/admissions',
    },
    openGraph: {
      title,
      description,
      url: '/admissions',
      siteName: collegeName,
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, alt: title }] } : {}),
    },
  };
}

export default async function AdmissionsPage() {
  const cmsPage = await pagesService.getPageBySlug('admissions');
  if (cmsPage && cmsPage.status === 'published' && cmsPage.sections?.length > 0) {
    return <PageSectionRenderer sections={cmsPage.sections} />;
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div className={styles.pageHeader}>
        <Badge variant="success" style={{ marginBottom: '0.75rem' }}>Admissions 2026 - 2027</Badge>
        <h1 className={styles.pageTitle}>Admission Process &amp; Guidelines</h1>
        <p className={styles.pageSubtitle}>
          Find detailed information on application criteria, required documentation, and important dates.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <Card variant="bordered">
          <CardBody>
            <h3 className={styles.sectionTitle} style={{ color: 'var(--color-primary)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              1. Application Submission
            </h3>
            <p className={styles.bodyText} style={{ fontSize: '0.9375rem' }}>
              Complete the online registration form and upload required academic transcripts and documents.
            </p>
          </CardBody>
        </Card>
        
        <Card variant="bordered">
          <CardBody>
            <h3 className={styles.sectionTitle} style={{ color: 'var(--color-primary)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              2. Verification &amp; Merit List
            </h3>
            <p className={styles.bodyText} style={{ fontSize: '0.9375rem' }}>
              Submitted documents are verified by the admissions committee for eligibility ranking.
            </p>
          </CardBody>
        </Card>

        <Card variant="bordered">
          <CardBody>
            <h3 className={styles.sectionTitle} style={{ color: 'var(--color-primary)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              3. Counseling &amp; Enrollment
            </h3>
            <p className={styles.bodyText} style={{ fontSize: '0.9375rem' }}>
              Selected candidates finalize course seat selection and complete admission fee payment.
            </p>
          </CardBody>
        </Card>
      </div>

      <Card variant="flat">
        <CardBody style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: '0.75rem' }}>Need Assistance With Your Application?</h2>
          <p className={styles.bodyText} style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            Our admissions desk is available Monday through Saturday to resolve registration queries.
          </p>
          <Link href="/contact">
            <Button variant="primary">Contact Admission Office</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
