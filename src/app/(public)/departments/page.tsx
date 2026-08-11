import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { pagesService } from '@/services/pages.service';
import { departmentsService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { PageSectionRenderer } from '@/components/page-builder';
import { Card, CardBody, Badge, Button, EmptyState } from '@/components/ui';
import styles from '../inner.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await pagesService.getPageBySlug('departments');
  if (cmsPage && cmsPage.status === 'published' && (cmsPage.seo?.metaTitle || cmsPage.title)) {
    return {
      title: cmsPage.seo?.metaTitle || cmsPage.title,
      description: cmsPage.seo?.metaDescription,
      alternates: { canonical: '/departments' },
    };
  }

  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = `Academic Departments — ${collegeName}`;
  const description = `Discover state-of-the-art academic departments, research faculties, and laboratories at ${collegeName}.`;
  const ogImageUrl = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: '/departments',
    },
    openGraph: {
      title,
      description,
      url: '/departments',
      siteName: collegeName,
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, alt: title }] } : {}),
    },
  };
}

export default async function DepartmentsPage() {
  const cmsPage = await pagesService.getPageBySlug('departments');
  if (cmsPage && cmsPage.status === 'published' && cmsPage.sections?.length > 0) {
    return <PageSectionRenderer sections={cmsPage.sections} />;
  }

  const departments = await departmentsService.getPublished();

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div className={styles.pageHeader}>
        <Badge variant="default" style={{ marginBottom: '0.75rem' }}>Academic Departments</Badge>
        <h1 className={styles.pageTitle}>Our Departments</h1>
        <p className={styles.pageSubtitle}>
          Discover state-of-the-art faculties, laboratories, and specialized degree paths.
        </p>
      </div>

      {departments.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {departments.map((dept) => (
            <Card key={dept.id} variant="bordered" hoverable>
              <CardBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: 1 }}>
                  <Badge variant="info" style={{ marginBottom: '0.75rem' }}>{dept.code}</Badge>
                  <h3 className={styles.sectionTitle} style={{ color: 'var(--color-primary)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                    {dept.name}
                  </h3>
                  <p className={styles.bodyText} style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
                    {dept.description || 'Fostering academic excellence, innovation, and holistic student growth.'}
                  </p>
                  {dept.hodName && (
                    <p className="small-text" style={{ marginBottom: '1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      👤 Head: {dept.hodName}
                    </p>
                  )}
                </div>
                <div>
                  <Link href={`/courses?dept=${dept.id}`}>
                    <Button variant="outline" size="sm">View Courses ➔</Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Department Information Coming Soon"
          description="Department profiles and academic faculties are currently being updated by the college administrator."
        />
      )}
    </div>
  );
}
