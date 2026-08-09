import React from 'react';
import type { Metadata } from 'next';
import { siteSettingsService } from '@/services/site-settings.service';
import { Card, CardBody, Badge, Button } from '@/components/ui';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
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


export default function AdmissionsPage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Badge variant="success" style={{ marginBottom: '0.5rem' }}>Admissions 2026 - 2027</Badge>
        <h1>Admission Process & Guidelines</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Find detailed information on application criteria, required documentation, and important dates.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <Card variant="bordered">
          <CardBody>
            <h3>1. Application Submission</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
              Complete the online registration form and upload required academic transcripts.
            </p>
          </CardBody>
        </Card>
        <Card variant="bordered">
          <CardBody>
            <h3>2. Verification & Merit List</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
              Submitted documents are verified by the admissions committee for eligibility ranking.
            </p>
          </CardBody>
        </Card>
        <Card variant="bordered">
          <CardBody>
            <h3>3. Counseling & Enrollment</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
              Selected candidates finalize course seat selection and fee payment.
            </p>
          </CardBody>
        </Card>
      </div>

      <Card variant="flat">
        <CardBody style={{ textAlign: 'center', padding: '2.5rem' }}>
          <h2>Need Assistance With Your Application?</h2>
          <p style={{ margin: '1rem 0 1.5rem', color: 'var(--text-muted)' }}>
            Our admissions desk is available Monday through Saturday.
          </p>
          <Link href="/contact">
            <Button variant="primary" size="md">Contact Admission Office</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
